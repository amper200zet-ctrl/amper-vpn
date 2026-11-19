'use client';
import { useState } from 'react';
export default function TrialButton() {
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState('');
  async function activate() { setBusy(true); setMessage(''); try { const r = await fetch('/api/trial',{method:'POST'}); const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Не удалось активировать пробный период'); setMessage('Пробный период активирован до ' + new Date(j.expires_at).toLocaleString('ru-RU')); location.reload(); } catch(e) { setMessage(e instanceof Error ? e.message : 'Ошибка'); } finally { setBusy(false); } }
  return <><button className="wide trial-button" onClick={activate} disabled={busy}>{busy ? 'Проверяем…' : 'Активировать пробный период · 3 дня'}</button>{message && <p className="notice">{message}</p>}</>;
}
