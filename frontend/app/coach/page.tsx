'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api, { apiErrorMessage } from '@/lib/api';
import { getToken, getCoach, clearSession, Coach } from '@/lib/auth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Users,
  LogOut,
  Trash2,
  Pencil,
  X,
  Loader2,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface RosterPlayer {
  id: string;
  name: string;
  email: string | null;
  category: string | null;
  level: string | null;
  notes: string | null;
  coachId: string | null;
  coach?: { id: string; name: string } | null;
  _count?: { matches: number; throws: number };
}

const LEVELS = ['Iniciación', 'Bronce', 'Plata', 'Oro', 'Élite'];
const CATEGORIES = ['BENJAMÍN', 'MINIME', 'CADETE', 'JUNIOR', 'SENIOR', 'VETERANO'];

const empty = { name: '', email: '', category: '', level: '', notes: '' };

export default function CoachPage() {
  const router = useRouter();
  const [coach, setCoach] = useState<Coach | null>(null);
  const [players, setPlayers] = useState<RosterPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...empty });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/players');
      setPlayers(res.data);
    } catch {
      /* el interceptor maneja el 401 */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      router.replace('/login');
      return;
    }
    setCoach(getCoach());
    load();
  }, [router, load]);

  const resetForm = () => {
    setForm({ ...empty });
    setEditingId(null);
    setError(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      category: form.category || undefined,
      level: form.level || undefined,
      notes: form.notes.trim() || undefined,
    };
    try {
      if (editingId) {
        await api.patch(`/players/${editingId}`, payload);
      } else {
        await api.post('/players', payload);
      }
      resetForm();
      await load();
    } catch (e) {
      setError(apiErrorMessage(e) || 'No se pudo guardar el jugador');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p: RosterPlayer) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      email: p.email ?? '',
      category: p.category ?? '',
      level: p.level ?? '',
      notes: p.notes ?? '',
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (p: RosterPlayer) => {
    const hasHistory = (p._count?.matches ?? 0) + (p._count?.throws ?? 0) > 0;
    const msg = hasHistory
      ? `¿Eliminar a ${p.name}? Se borrará también su historial (lanzamientos, evaluaciones y planes). Esta acción no se puede deshacer.`
      : `¿Eliminar a ${p.name}?`;
    if (!window.confirm(msg)) return;
    try {
      await api.delete(`/players/${p.id}`);
      await load();
    } catch (e) {
      alert(apiErrorMessage(e) || 'No se pudo eliminar');
    }
  };

  const logout = () => {
    clearSession();
    router.replace('/login');
  };

  return (
    <div className="space-y-8">
      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-200">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
              Mi Roster
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1 flex items-center gap-1">
              {coach?.role === 'SUPER_ADMIN' && <ShieldCheck size={12} />}
              {coach?.name}
              {coach?.role === 'SUPER_ADMIN' ? ' · Super admin' : ' · Coach'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="glass p-3 rounded-2xl text-slate-500 hover:text-rose-600 transition-all active:scale-90"
          title="Cerrar sesión"
        >
          <LogOut size={20} />
        </button>
      </div>

      {/* Formulario alta / edición */}
      <motion.form
        onSubmit={submit}
        layout
        className="glass rounded-[2rem] p-6 shadow-xl shadow-slate-200/30 border border-white/50 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-700 flex items-center gap-2">
            {editingId ? <Pencil size={18} /> : <UserPlus size={18} />}
            {editingId ? 'Editar jugador' : 'Añadir jugador'}
          </h3>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-slate-400 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input
            label="Nombre *"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
            placeholder="Nombre y apellido"
          />
          <Input
            label="Email (opcional)"
            value={form.email}
            onChange={(v) => setForm({ ...form, email: v })}
            placeholder="jugador@email.com"
            type="email"
          />
          <Select
            label="Categoría"
            value={form.category}
            onChange={(v) => setForm({ ...form, category: v })}
            options={CATEGORIES}
          />
          <Select
            label="Nivel"
            value={form.level}
            onChange={(v) => setForm({ ...form, level: v })}
            options={LEVELS}
          />
        </div>
        <Input
          label="Notas (opcional)"
          value={form.notes}
          onChange={(v) => setForm({ ...form, notes: v })}
          placeholder="Observaciones del coach"
        />

        {error && (
          <p className="text-sm font-bold text-rose-600 bg-rose-50 rounded-xl px-4 py-3">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || !form.name.trim()}
          className="w-full sm:w-auto bg-brand-600 text-white font-black px-8 py-3 rounded-2xl inline-flex items-center justify-center gap-2 hover:bg-brand-700 transition-all active:scale-95 shadow-lg shadow-brand-100 disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : editingId ? (
            <Pencil size={18} />
          ) : (
            <UserPlus size={18} />
          )}
          {editingId ? 'Guardar cambios' : 'Añadir al roster'}
        </button>
      </motion.form>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Users size={32} />
          </div>
          <p className="text-slate-500 font-semibold">
            Aún no tienes jugadores. Añade el primero arriba.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {players.map((p) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex items-center justify-between gap-4"
              >
                <Link href={`/coach/players/${p.id}`} className="min-w-0 group/link">
                  <div className="font-black text-slate-800 text-lg truncate group-hover/link:text-brand-600 transition-colors">
                    {p.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {p.level && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-600 uppercase tracking-wide">
                        {p.level}
                      </span>
                    )}
                    {p.category && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                        {p.category}
                      </span>
                    )}
                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <Activity size={11} />
                      {p._count?.matches ?? 0} partidas
                    </span>
                    {coach?.role === 'SUPER_ADMIN' && p.coach && (
                      <span className="text-[10px] font-bold text-slate-300">
                        · {p.coach.name}
                      </span>
                    )}
                  </div>
                  {p.notes && (
                    <p className="text-xs text-slate-400 font-medium mt-1 truncate">
                      {p.notes}
                    </p>
                  )}
                </Link>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-all active:scale-90"
                    title="Editar"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => remove(p)}
                    className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all active:scale-90"
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
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
        className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white/70 font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
      >
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
