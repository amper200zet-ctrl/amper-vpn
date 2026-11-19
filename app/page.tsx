'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

export default function Home() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'login'|'register'>('register');
  const [intent, setIntent] = useState<'trial'|'account'>('account');
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const botUrl = process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || 'https://t.me/';
  function showAuth(next: 'trial'|'account') { setIntent(next); setMode(next === 'trial' ? 'register' : 'login'); setNotice(''); setOpen(true); }
  async function sendLink(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice('');
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: mode === 'register', emailRedirectTo: `${location.origin}/auth/callback?next=${intent === 'trial' ? '/dashboard?trial=1' : '/dashboard'}` } });
      if (error) throw error;
      setNotice('Письмо со ссылкой для входа отправлено. Открой почту на этом устройстве и перейди по ссылке.');
    } catch (err) { setNotice(err instanceof Error ? err.message : 'Не удалось отправить письмо. Проверь настройки Supabase.'); }
    finally { setBusy(false); }
  }
  return <main className="shell">
    <header className="topbar"><a className="brand" href="/"><span className="brand-mark">ϟ</span><span>AMPER<small>PRIVATE NETWORK</small></span></a><div className="top-status"><i/> ЛИЧНЫЙ ПОРТАЛ</div></header>
    <section className="hero"><div className="eyebrow">AMPER VPN / YOUR SPACE</div><h1>ТВОЙ VPN.<br/><span>ТВОИ ПРАВИЛА.</span></h1><p className="lead">Начни с пробного периода или открой личный кабинет. Подписка и управление подключением — в одном месте.</p>
      <div className="actions">
        <button className="action primary" onClick={() => showAuth('trial')}><span className="action-icon">ϟ</span><span className="action-label">ДЛЯ НОВЫХ ПОЛЬЗОВАТЕЛЕЙ</span><strong>Пробный период</strong><p>Попробуй AMPER VPN бесплатно в течение 3 дней.</p><span className="arrow">↗</span></button>
        <button className="action" onClick={() => showAuth('account')}><span className="action-icon">◉</span><span className="action-label">УПРАВЛЕНИЕ</span><strong>Личный кабинет</strong><p>Проверь статус подписки, срок действия и данные аккаунта.</p><span className="arrow">↗</span></button>
        <a className="action" href={botUrl} target="_blank" rel="noreferrer"><span className="action-icon">➤</span><span className="action-label">БЫСТРАЯ СВЯЗЬ</span><strong>Telegram-бот</strong><p>Новости, помощь и управление через Telegram.</p><span className="arrow">↗</span></a>
      </div><div className="under-note">✓ &nbsp; Один аккаунт — вся информация о подписке в одном месте</div>
    </section>
    <footer className="bottom"><b>ϟ AMPER VPN</b><span>© 2026 AMPER VPN · Личный портал</span><span>Поддержка — через Telegram</span></footer>
    {open && <div className="overlay" onMouseDown={e => { if (e.target === e.currentTarget) setOpen(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="close" onClick={() => setOpen(false)} aria-label="Закрыть">×</button><div className="modal-kicker">AMPER VPN / {intent === 'trial' ? 'ПРОБНЫЙ ПЕРИОД' : 'ЛИЧНЫЙ КАБИНЕТ'}</div><h2 id="modal-title">{mode === 'register' ? 'Создай аккаунт' : 'Войди в аккаунт'}</h2><p className="modal-sub">Укажи почту — отправим безопасную ссылку для подтверждения входа.</p><div className="tabs"><button className={mode === 'login' ? 'tab active' : 'tab'} onClick={() => {setMode('login');setNotice('');}}>Войти</button><button className={mode === 'register' ? 'tab active' : 'tab'} onClick={() => {setMode('register');setNotice('');}}>Регистрация</button></div><form onSubmit={sendLink}><label htmlFor="email">Электронная почта</label><input id="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={e => setEmail(e.target.value)} required/><button className="wide" disabled={busy}>{busy ? 'Отправляем…' : 'Получить ссылку на почту'} <span>→</span></button></form><div className="notice" aria-live="polite">{notice}</div><p className="fine">Пароль вводить не нужно. Вход заработает после подключения проекта к Supabase и настройки почтового шаблона.</p></section></div>}
  </main>;
}
