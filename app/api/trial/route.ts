import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({error:'Сначала войди в аккаунт.'},{status:401});
    const { data, error } = await supabase.rpc('claim_three_day_trial');
    if (error) return NextResponse.json({error:'Пробный период пока не подключён. Выполни SQL-настройку из папки supabase.'},{status:503});
    if (!data?.success) return NextResponse.json({error:data?.message || 'Пробный период уже использован.'},{status:409});
    return NextResponse.json({success:true,expires_at:data.expires_at});
  } catch { return NextResponse.json({error:'Сервис временно недоступен.'},{status:500}); }
}
