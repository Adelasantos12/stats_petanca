'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { apiErrorMessage } from '@/lib/api';
import { setPlayerSession, getToken, getPlayer } from '@/lib/auth';
import { motion } from 'framer-motion';
import { Target, LogIn, UserPlus, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

interface GoogleAccounts {
  id?: {
    initialize: (o: { client_id: string; callback: (r: { credential: string }) => void }) => void;
    renderButton: (el: HTMLElement, o: Record<string, string | number>) => void;
  };
}

export default function PlayerLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const googleBtn = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getToken() && getPlayer()) {
      router.replace('/player');
      return;
    }
    api.get('/auth/status').then((r) => setGoogleEnabled(r.data.googleEnabled)).catch(() => {});
  }, [router]);

  const handleCredential = useCallback(
    async (credential: string) => {
      setError(null);
      try {
        const res = await api.post('/player-auth/google', { credential });
        setPlayerSession(res.data.token, res.data.player);
        router.replace('/player');
      } catch (e) {
        setError(apiErrorMessage(e) || 'No se pudo iniciar sesión con Google');
      }
    },
    [router],
  );

  useEffect(() => {
    if (!googleEnabled || !GOOGLE_CLIENT_ID || !googleBtn.current) return;
    const id = 'google-gsi-script';
    const render = () => {
      const g = (window as unknown as { google?: { accounts?: GoogleAccounts } }).google;
      if (!g?.accounts?.id || !googleBtn.current) return;
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (r: { credential: string }) => handleCredential(r.credential),
      });
      g.accounts.id.renderButton(googleBtn.current, { theme: 'outline', size: 'large', width: 320, text: 'continue_with' });
    };
    if (document.getElementById(id)) render();
    else {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true; s.id = id; s.onload = render;
      document.body.appendChild(s);
    }
  }, [googleEnabled, handleCredential]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const path = mode === 'register' ? '/player-auth/register' : '/player-auth/login';
      const body = mode === 'register' ? { name, email, password } : { email, password };
      const res = await api.post(path, body);
      setPlayerSession(res.data.token, res.data.player);
      router.replace('/player');
    } catch (e) {
      setError(apiErrorMessage(e) || 'Error al iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 border border-white/50"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
            <Target size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              {mode === 'register' ? 'Crea tu cuenta' : 'Área del jugador'}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Tu desarrollo</p>
          </div>
        </div>

        <p className="text-sm text-amber-900/60 font-semibold bg-amber-50/70 rounded-2xl p-4 my-4">
          Entra para ver tu nivel, tu rendimiento y qué te falta para subir. Usa el
          mismo correo que te dio tu entrenador para conservar tu historial.
        </p>

        <form onSubmit={submit} className="space-y-4 mt-4">
          {mode === 'register' && (
            <Field label="Nombre" value={name} onChange={setName} placeholder="Tu nombre" type="text" required={false} />
          )}
          <Field label="Email" value={email} onChange={setEmail} placeholder="tu@email.com" type="email" required />
          <Field label="Contraseña" value={password} onChange={setPassword} placeholder="••••••••" type="password" required />

          {error && <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-all active:scale-95 shadow-xl shadow-amber-100 disabled:opacity-60"
          >
            {submitting ? <Loader2 size={20} className="animate-spin" /> : mode === 'register' ? <UserPlus size={20} /> : <LogIn size={20} />}
            {mode === 'register' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        {googleEnabled && GOOGLE_CLIENT_ID && (
          <div className="mt-6">
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">o</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <div ref={googleBtn} className="flex justify-center" />
          </div>
        )}

        <button
          onClick={() => { setError(null); setMode(mode === 'login' ? 'register' : 'login'); }}
          className="w-full text-center text-sm font-bold text-slate-500 hover:text-amber-600 mt-6 transition-colors"
        >
          {mode === 'login' ? '¿Primera vez? Crea tu cuenta' : 'Ya tengo cuenta · Entrar'}
        </button>
      </motion.div>
    </div>
  );
}

function Field({
  label, value, onChange, placeholder, type, required,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string; type: string; required: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
    </label>
  );
}
