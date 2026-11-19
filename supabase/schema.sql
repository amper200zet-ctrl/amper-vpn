-- AMPER VPN: базовая схема личного кабинета и однократного 3-дневного trial.
-- Выполнять в Supabase SQL Editor после создания проекта.
create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null default 'inactive' check (status in ('active','inactive','expired')),
  plan_name text not null default 'AMPER VPN · Trial',
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.trial_claims (
  user_id uuid primary key references auth.users(id) on delete cascade,
  claimed_at timestamptz not null default now()
);
alter table public.subscriptions enable row level security;
alter table public.trial_claims enable row level security;
drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription" on public.subscriptions for select to authenticated using (auth.uid() = user_id);
-- Запретить прямое изменение подписок и trial со стороны клиента.
revoke insert, update, delete on public.subscriptions from anon, authenticated;
revoke all on public.trial_claims from anon, authenticated;
create or replace function public.claim_three_day_trial()
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare uid uuid := auth.uid(); exp timestamptz;
begin
  if uid is null then return jsonb_build_object('success',false,'message','Требуется авторизация.'); end if;
  if exists (select 1 from public.subscriptions where user_id=uid and status='active' and expires_at > now() and plan_name <> 'AMPER VPN · Trial') then
    return jsonb_build_object('success',false,'message','У тебя уже есть активная подписка.');
  end if;
  begin
    insert into public.trial_claims(user_id) values(uid);
  exception when unique_violation then
    return jsonb_build_object('success',false,'message','Пробный период уже использован для этого аккаунта.');
  end;
  exp := now() + interval '3 days';
  insert into public.subscriptions(user_id,status,plan_name,expires_at,updated_at)
  values(uid,'active','AMPER VPN · Trial',exp,now())
  on conflict(user_id) do update set status='active', plan_name='AMPER VPN · Trial', expires_at=excluded.expires_at, updated_at=now();
  return jsonb_build_object('success',true,'expires_at',exp);
end; $$;
revoke all on function public.claim_three_day_trial() from public;
grant execute on function public.claim_three_day_trial() to authenticated;
