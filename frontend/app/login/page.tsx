'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { apiErrorMessage } from '@/lib/api';
import { setSession, getToken } from '@/lib/auth';

interface GoogleAccounts {
  id?: {
    initialize: (options: {
      client_id: string;
      callback: (resp: { credential: string }) => void;
    }) => void;
    renderButton: (
      el: HTMLElement,
      options: Record<string, string | number>,
    ) => void;
  };
}
import { motion } from 'framer-motion';
import { ShieldCheck, LogIn, UserPlus, Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [needsBootstrap, setNeedsBootstrap] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const googleBtn = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (getToken()) {
      router.replace('/coach');
      return;
    }
    api
      .get('/auth/status')
      .then((res) => {
        setNeedsBootstrap(res.data.needsBootstrap);
        setGoogleEnabled(res.data.googleEnabled);
        if (res.data.needsBootstrap) setMode('register');
      })
      .catch(() => {});
  }, [router]);

  const handleCredential = useCallback(
    async (credential: string) => {
      setError(null);
      try {
        const res = await api.post('/auth/google', { credential });
        setSession(res.data.token, res.data.coach);
        router.replace('/coach');
      } catch (e) {
        setError(
          apiErrorMessage(e) || 'No se pudo iniciar sesión con Google',
        );
      }
    },
    [router],
  );

  // Google Identity Services (solo si hay client id en el frontend y el backend lo soporta).
  useEffect(() => {
    if (!googleEnabled || !GOOGLE_CLIENT_ID || !googleBtn.current) return;
    const id = 'google-gsi-script';
    const render = () => {
      const g = (window as unknown as { google?: { accounts?: GoogleAccounts } })
        .google;
      if (!g?.accounts?.id || !googleBtn.current) return;
      g.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (resp: { credential: string }) =>
          handleCredential(resp.credential),
      });
      g.accounts.id.renderButton(googleBtn.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
        text: 'continue_with',
      });
    };
    if (document.getElementById(id)) {
      render();
    } else {
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      s.id = id;
      s.onload = render;
      document.body.appendChild(s);
    }
  }, [googleEnabled, handleCredential]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const path = mode === 'register' ? '/auth/register' : '/auth/login';
      const body =
        mode === 'register' ? { name, email, password } : { email, password };
      const res = await api.post(path, body);
      setSession(res.data.token, res.data.coach);
      router.replace('/coach');
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
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
              {needsBootstrap
                ? 'Crear super administrador'
                : mode === 'register'
                  ? 'Nuevo coach'
                  : 'Área del coach'}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">
              CIEP · Petanca
            </p>
          </div>
        </div>

        {needsBootstrap && (
          <p className="text-sm text-indigo-900/60 font-semibold bg-indigo-50/60 rounded-2xl p-4 my-4">
            Es la primera cuenta del sistema: se creará como super administrador
            y podrá gestionar el resto de coaches y jugadores.
          </p>
        )}

        <form onSubmit={submit} className="space-y-4 mt-6">
          {mode === 'register' && (
            <Field
              label="Nombre"
              value={name}
              onChange={setName}
              placeholder="Nombre del coach"
              type="text"
            />
          )}
          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="coach@ciep.com"
            type="email"
          />
          <Field
            label="Contraseña"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            type="password"
          />

          {error && (
            <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-100 disabled:opacity-60"
          >
            {submitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : mode === 'register' ? (
              <UserPlus size={20} />
            ) : (
              <LogIn size={20} />
            )}
            {mode === 'register' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>

        {googleEnabled && GOOGLE_CLIENT_ID && (
          <div className="mt-6">
            <div className="flex items-center gap-3 my-4">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                o
              </span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>
            <div ref={googleBtn} className="flex justify-center" />
          </div>
        )}

        {!needsBootstrap && (
          <button
            onClick={() => {
              setError(null);
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="w-full text-center text-sm font-bold text-slate-500 hover:text-indigo-600 mt-6 transition-colors"
          >
            {mode === 'login'
              ? '¿Un super admin te dio de alta? Crear cuenta de coach'
              : 'Ya tengo cuenta · Entrar'}
          </button>
        )}
      </motion.div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
    </label>
  );
}
