 'use client';
 
 import { useEffect, useState, useCallback } from 'react';
 import { useParams, useRouter } from 'next/navigation';
 import api from '@/lib/api';
 import { Match } from '@/types';
 import {
   ChevronLeft,
   History,
   BarChart2,
   Save,
   Trash2,
   AlertCircle,
+  Undo2,
   Trophy,
   Target,
   Zap,
   RotateCcw
 } from 'lucide-react';
 import Link from 'next/link';
 import { clsx, type ClassValue } from 'clsx';
 import { twMerge } from 'tailwind-merge';
 import { motion, AnimatePresence } from 'framer-motion';
 
 function cn(...inputs: ClassValue[]) {
   return twMerge(clsx(inputs));
 }
 
 export default function LiveMatch() {
   const { id } = useParams();
   const router = useRouter();
 
   const [match, setMatch] = useState<Match | null>(null);
   const [loading, setLoading] = useState(true);
 
   // Throw form state
   const [selectedTeam, setSelectedTeam] = useState<'A' | 'B'>('A');
   const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
   const [throwType, setThrowType] = useState<'POINT' | 'TIR'>('POINT');
@@ -157,64 +158,79 @@ export default function LiveMatch() {
   const handleFinishMatch = async (reason: string) => {
     try {
       await api.post(`/matches/${id}/finish`, { endReason: reason });
       setFinishingMatch(false);
       fetchMatch();
       router.push(`/matches/${id}/performance`);
     } catch (err) {
       console.error(err);
     }
   };
 
   const handleDeleteThrow = async (throwId: string) => {
     if (!confirm('¿Eliminar lanzamiento?')) return;
     try {
       await api.delete(`/throws/${throwId}`);
       fetchMatch();
     } catch (err) {
       console.error(err);
     }
   };
 
   if (loading || !match) return <div className="p-10 text-center font-black text-slate-400 animate-pulse">Cargando partida...</div>;
 
   const currentHandNumber = match.hands.length + 1;
   const currentHandThrows = match.throws.filter(t => t.handNumber === currentHandNumber);
+  const orderedThrows = [...match.throws].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
+  const lastThrow = orderedThrows[0];
+  const lastHand = [...match.hands].sort((a, b) => b.handNumber - a.handNumber)[0];
 
   const scoreA = match.hands
     .filter(h => h.status === 'NORMAL' && h.pointsTeam === 'A')
     .reduce((acc, h) => acc + (h.pointsValue || 0), 0);
   const scoreB = match.hands
     .filter(h => h.status === 'NORMAL' && h.pointsTeam === 'B')
     .reduce((acc, h) => acc + (h.pointsValue || 0), 0);
 
   const ballsPerPlayer = match.modality === 'SINGLE' ? 3 : match.modality === 'DOUBLES' ? 3 : 2;
 
   const getBallsUsed = (playerId: string) => {
     return currentHandThrows.filter(t => t.playerId === playerId).length;
   };
 
+  const handleUndoLastThrow = async () => {
+    if (!lastThrow) return;
+    if (!confirm(`¿Deshacer la última bola de ${lastThrow.player?.name || 'jugador'}?`)) return;
+    try {
+      await api.delete(`/throws/${lastThrow.id}`);
+      fetchMatch();
+    } catch (err) {
+      console.error(err);
+      alert('No se pudo deshacer la última bola');
+    }
+  };
+
 
   return (
     <div className="flex flex-col gap-6 pb-40">
       {/* Header Info */}
       <motion.div
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         className="glass p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-white/50 flex flex-col gap-6"
       >
         <div className="flex justify-between items-center">
           <Link href="/" className="p-3 hover:bg-white/50 rounded-2xl transition-all active:scale-90"><ChevronLeft size={24} /></Link>
           <div className="text-[10px] font-black bg-indigo-600 px-5 py-2.5 rounded-full text-white tracking-[0.2em] uppercase">
             Mano {currentHandNumber}
           </div>
           <Link href={`/matches/${id}/performance`} className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl transition-all active:scale-90"><BarChart2 size={24} /></Link>
         </div>
 
         <div className="flex justify-between items-center gap-4">
           <div className="flex-1 text-center">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{match.teamAName}</div>
             <motion.div
               key={scoreA}
               initial={{ scale: 1.5, color: '#4f46e5' }}
               animate={{ scale: 1, color: '#4f46e5' }}
               className="text-6xl font-black tabular-nums"
@@ -264,94 +280,94 @@ export default function LiveMatch() {
               <Link
                 href={`/matches/${id}/performance`}
                 className="block w-full bg-white text-emerald-600 p-6 rounded-[2rem] font-black text-xl shadow-xl hover:bg-emerald-50 transition-all active:scale-95"
               >
                 VER REPORTE FINAL
               </Link>
               <button
                 onClick={() => {
                     if(confirm("¿Deseas reabrir la partida?")) {
                         api.post(`/matches/${id}/finish`, { status: 'IN_PROGRESS' }).then(() => fetchMatch());
                     }
                 }}
                 className="text-xs font-black text-white/60 hover:text-white underline uppercase tracking-widest transition-colors"
               >
                 Reabrir para correcciones
               </button>
             </div>
           </div>
         </motion.div>
       ) : (
         <>
           {/* Throw Registration Form */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
-            className="glass p-6 rounded-[3rem] shadow-2xl shadow-slate-200/30 border border-white/50 space-y-8"
+            className="glass p-6 rounded-[3rem] shadow-2xl shadow-slate-200/30 border border-white/50 space-y-6"
           >
             {/* Team & Player Selection */}
             <div className="space-y-4">
               <div className="flex p-1.5 bg-slate-100/50 rounded-[1.8rem] gap-1">
                 <button
                   onClick={() => handleTeamChange('A')}
                   className={cn(
                     "flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all",
                     selectedTeam === 'A' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400"
                   )}
                 >
                   {match.teamAName}
                 </button>
                 <button
                   onClick={() => handleTeamChange('B')}
                   className={cn(
                     "flex-1 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all",
                     selectedTeam === 'B' ? "bg-white text-rose-600 shadow-sm" : "text-slate-400"
                   )}
                 >
                   {match.teamBName}
                 </button>
               </div>
 
-              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-1">
+              <div className="grid grid-cols-2 gap-3">
                 {match.players
                   .filter(p => p.teamSide === selectedTeam)
                   .map(mp => {
                     const used = getBallsUsed(mp.playerId);
                     const isSelected = selectedPlayerId === mp.playerId;
                     return (
                       <motion.button
                         key={mp.playerId}
                         whileTap={{ scale: 0.95 }}
                         onClick={() => setSelectedPlayerId(mp.playerId)}
                         className={cn(
-                          "flex-shrink-0 px-6 py-5 rounded-[2.2rem] border-2 transition-all flex flex-col items-center min-w-[110px]",
+                          "px-4 py-4 rounded-[1.5rem] border-2 transition-all flex flex-col items-center",
                           isSelected
                             ? (selectedTeam === 'A' ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-lg shadow-indigo-100" : "border-rose-600 bg-rose-50 text-rose-700 shadow-lg shadow-rose-100")
                             : "border-transparent bg-slate-50 text-slate-400"
                         )}
                       >
-                        <span className="text-[10px] font-black truncate w-24 text-center uppercase tracking-tight mb-3">{mp.player.name}</span>
+                        <span className="text-[10px] font-black truncate w-full text-center uppercase tracking-tight mb-2">{mp.player.name}</span>
                         <div className="flex gap-1.5">
                             {[...Array(ballsPerPlayer)].map((_, i) => (
                                 <div key={i} className={cn(
                                     "w-2 h-2 rounded-full",
                                     i < used ? (selectedTeam === 'A' ? "bg-indigo-600" : "bg-rose-600") : "bg-slate-200"
                                 )} />
                             ))}
                         </div>
                       </motion.button>
                     );
                   })}
               </div>
             </div>
 
             {/* Type & Score */}
             <div className="grid grid-cols-2 gap-4">
               <button
                 onClick={() => setThrowType('POINT')}
                 className={cn(
                   "py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest border-2 transition-all flex items-center justify-center gap-2",
                   throwType === 'POINT' ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-slate-50 text-slate-400 border-transparent"
                 )}
               >
                 <Target size={16} /> Point
               </button>
@@ -373,103 +389,116 @@ export default function LiveMatch() {
                 const isNegative = score < 0;
 
                 return (
                   <motion.button
                     key={score}
                     whileTap={{ scale: 0.9 }}
                     onClick={() => setEffectiveness(score)}
                     className={cn(
                       "h-24 rounded-[1.8rem] text-3xl font-black transition-all flex flex-col items-center justify-center border-2",
                       isSelected
                         ? (isPositive ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200 scale-105 z-10" :
                            isNegative ? "bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200 scale-105 z-10" :
                            "bg-slate-800 text-white border-slate-800 shadow-lg scale-105 z-10")
                         : "bg-slate-50 text-slate-400 border-transparent"
                     )}
                   >
                     {score > 0 ? `+${score}` : score}
                     <span className="text-[7px] font-black opacity-60 mt-1 uppercase tracking-tighter">
                       {score === -2 ? 'Pésimo' : score === -1 ? 'Mal' : score === 0 ? 'Neutro' : score === 1 ? 'Bien' : 'Exc.'}
                     </span>
                   </motion.button>
                 );
               })}
             </div>
 
-            <div className="flex gap-3">
-                <div className="flex-1 bg-slate-50/50 rounded-2xl p-4 flex items-center gap-3 border-2 border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all">
-                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Dist</span>
-                    <input
-                        type="number"
-                        step="0.01"
-                        placeholder="0.00"
-                        value={distance}
-                        onChange={(e) => setDistance(e.target.value)}
-                        className="w-full bg-transparent border-0 focus:ring-0 outline-none font-bold text-slate-700"
-                    />
-                </div>
-                <div className="flex-[1.5] bg-slate-50/50 rounded-2xl p-4 flex items-center gap-3 border-2 border-transparent focus-within:border-indigo-400 focus-within:bg-white transition-all">
-                    <span className="text-[10px] font-black text-slate-300 uppercase italic">Nota</span>
-                    <input
-                        type="text"
-                        placeholder="..."
-                        value={note}
-                        onChange={(e) => setNote(e.target.value)}
-                        className="w-full bg-transparent border-0 focus:ring-0 outline-none font-bold text-slate-700"
-                    />
-                </div>
+            <details className="bg-slate-50/70 rounded-[1.5rem] p-4 border border-slate-100">
+              <summary className="cursor-pointer text-[10px] font-black uppercase tracking-widest text-slate-500">Opcionales (distancia / nota)</summary>
+              <div className="flex gap-3 mt-3">
+                  <div className="flex-1 bg-white rounded-2xl p-3 flex items-center gap-2 border border-transparent focus-within:border-indigo-300 transition-all">
+                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Dist</span>
+                      <input
+                          type="number"
+                          step="0.01"
+                          placeholder="0.00"
+                          value={distance}
+                          onChange={(e) => setDistance(e.target.value)}
+                          className="w-full bg-transparent border-0 focus:ring-0 outline-none font-bold text-slate-700"
+                      />
+                  </div>
+                  <div className="flex-[1.5] bg-white rounded-2xl p-3 flex items-center gap-2 border border-transparent focus-within:border-indigo-300 transition-all">
+                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Nota</span>
+                      <input
+                          type="text"
+                          placeholder="..."
+                          value={note}
+                          onChange={(e) => setNote(e.target.value)}
+                          className="w-full bg-transparent border-0 focus:ring-0 outline-none font-bold text-slate-700"
+                      />
+                  </div>
+              </div>
+            </details>
+
+            <div className="grid grid-cols-2 gap-3">
+              <button
+                onClick={handleUndoLastThrow}
+                disabled={!lastThrow}
+                className="bg-rose-50 text-rose-600 disabled:text-slate-300 disabled:bg-slate-100 rounded-[1.3rem] p-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
+              >
+                <Undo2 size={14} /> Deshacer última bola
+              </button>
+              <button
+                onClick={handleCancelHand}
+                disabled={!lastHand || lastHand.status === 'CANCELED'}
+                className="bg-amber-50 text-amber-700 disabled:text-slate-300 disabled:bg-slate-100 rounded-[1.3rem] p-3 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
+              >
+                <RotateCcw size={14} /> Rehacer último puntaje
+              </button>
             </div>
           </motion.div>
 
           {/* Floating Actions Container */}
           <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md glass rounded-[2.5rem] p-4 shadow-2xl z-40 flex gap-4 ring-1 ring-white/50 backdrop-blur-2xl">
             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={handleSaveThrow}
               disabled={effectiveness === null}
               className="flex-[2.5] bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-indigo-200 disabled:bg-slate-200 disabled:shadow-none transition-all flex items-center justify-center gap-3"
             >
               <Save size={24} />
               GUARDAR BOLA
             </motion.button>
             <motion.button
               whileTap={{ scale: 0.95 }}
               onClick={() => setClosingHand(true)}
               className="flex-1 bg-white border-2 border-slate-900 text-slate-900 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center text-center leading-tight"
             >
               FIN<br/>MANO
             </motion.button>
           </div>
 
-          <div className="grid grid-cols-2 gap-4">
-            <button
-              onClick={handleCancelHand}
-              className="glass border-white/50 text-slate-400 p-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-white hover:text-rose-500 transition-all shadow-sm"
-            >
-              <RotateCcw size={24} />
-              Anular Mano
-            </button>
+          <div className="grid grid-cols-1 gap-4">
             <button
               onClick={() => setFinishingMatch(true)}
               className="glass border-white/50 text-slate-400 p-6 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest flex flex-col items-center gap-3 hover:bg-white hover:text-indigo-500 transition-all shadow-sm"
             >
               <AlertCircle size={24} />
               Terminar
             </button>
           </div>
         </>
       )}
 
       {/* History Section */}
       <div className="space-y-4 pt-10">
           <div className="flex items-center justify-between px-4">
             <h3 className="font-black text-slate-400 uppercase tracking-widest text-[10px] flex items-center gap-2">
                 <History size={14} /> Historial
             </h3>
             <button
                 onClick={() => setShowHistory(!showHistory)}
                 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest"
             >
                 {showHistory ? 'Ocultar' : 'Ver todo'}
             </button>
           </div>
 
