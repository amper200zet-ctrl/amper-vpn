import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-server';
import TrialButton from './trial-button';
export default async function Dashboard({ searchParams }: { searchParams: Promise<{trial?: string}> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');
  const { data: sub } = await supabase.from('subscriptions').select('status,plan_name,expires_at').eq('user_id', user.id).maybeSingle();
  const params = await searchParams;
  const active = sub?.status === 'active' && sub.expires_at && new Date(sub.expires_at) > new Date();
  return <main className="shell"><header className="topbar"><Link className="brand" href="/"><span className="brand-mark">ϟ</span><span>AMPER<small>PRIVATE NETWORK</small></span></Link><div className="top-status"><i/> ЛИЧНЫЙ КАБИНЕТ</div></header><section className="dashboard"><Link className="back" href="/">← На главную</Link><div className="dash-head"><div><div className="eyebrow">AMPER VPN / ACCOUNT</div><h1>Личный кабинет</h1><p className="lead small-lead">Управление аккаунтом и подпиской</p></div><div className="profile-chip">{user.email}</div></div>{params.trial === '1' && <p className="notice">Чтобы активировать пробный период, нажми кнопку ниже. Доступ будет создан только после настройки базы данных.</p>}<div className="dash-grid"><article className="dash-card"><div className="card-top"><span className="card-kicker">ТВОЯ ПОДПИСКА</span><span className={active ? 'status good' : 'status'}>{active ? 'АКТИВНА' : 'НЕТ ПОДПИСКИ'}</span></div><h2>{sub?.plan_name ?? 'AMPER VPN'}</h2><p>{active ? `Действует до ${new Date(sub!.expires_at!).toLocaleString('ru-RU')}` : 'У тебя пока нет активной подписки.'}</p>{!active && <TrialButton/>}</article><article className="dash-card"><span className="card-kicker">ПОДКЛЮЧЕНИЕ</span><h2>VPN-конфигурация</h2><p>После подключения VPN-сервера здесь появится безопасная кнопка получения конфигурации для Happ.</p><span className="status">НЕ НАСТРОЕНО</span></article><article className="dash-card"><span className="card-kicker">ИСТОРИЯ</span><h2>Операции</h2><p>История пробных активаций и платежей появится после подключения соответствующих модулей.</p></article></div><form action="/auth/signout" method="post"><button className="signout">Выйти из аккаунта</button></form></section><footer className="bottom"><b>ϟ AMPER VPN</b><span>© 2026 AMPER VPN</span></footer></main>;
}
