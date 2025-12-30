import React, { useState, useEffect, useRef } from 'react';
import { TripRequest, UserContext, AnalyzedTrip, CostBreakdown } from './types';
import { TripForm } from './components/TripForm';
import { PlanDashboard } from './components/PlanDashboard';
import { VisionBoard } from './components/VisionBoard';
import { analyzeTrips, generateDestinationImage } from './services/geminiService';
import { Loader2, ChevronRight, Landmark, Map, LayoutDashboard, Eye, Sparkles, ShieldCheck, Stars } from 'lucide-react';

const LOADING_MESSAGES = [
  "Alineando las estrellas con tu presupuesto...",
  "Calculando rutas de máxima expansión...",
  "Diseñando tu mapa de posibilidades...",
  "Materializando tus próximos recuerdos...",
  "Sincronizando sueños y realidad financiera...",
  "Consultando al oráculo de las mareas viajeras...",
  "Codificando la abundancia en cada coordenada...",
  "Aperturando portales hacia nuevas culturas...",
  "Equilibrando el deseo con la disciplina del ahorro...",
  "Escaneando horizontes de merecimiento total...",
  "Tejiendo la red de tus próximas aventuras...",
  "Preparando el terreno para lo extraordinario...",
  "Desbloqueando destinos que vibran contigo...",
  "Calculando el coeficiente de asombro...",
  "Sintonizando la frecuencia de la libertad..."
];

const LogoSymbol = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 6L12 18L20 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const App: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  const [userContext, setUserContext] = useState<UserContext>(() => {
    const saved = localStorage.getItem('dt_context');
    return saved ? JSON.parse(saved) : { originCountry: '', monthlySavings: 500, initialSavings: 1000, currency: '$' };
  });

  const [trips, setTrips] = useState<TripRequest[]>(() => {
    const saved = localStorage.getItem('dt_trips_raw');
    return saved ? JSON.parse(saved) : [];
  });

  const [plan, setPlan] = useState<AnalyzedTrip[]>(() => {
    const saved = localStorage.getItem('dt_plan');
    return saved ? JSON.parse(saved) : [];
  });

  const [error, setError] = useState<string | null>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let interval: number;
    if (isAnalyzing) {
      interval = window.setInterval(() => {
        setLoadingMsgIdx(prev => (prev + 1) % LOADING_MESSAGES.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  useEffect(() => {
    if (plan.length > 0) {
      const tripsMissingImages = plan.filter(t => !t.imageUrl);
      if (tripsMissingImages.length > 0) {
        tripsMissingImages.forEach(async (trip) => {
          try {
            const imageUrl = await generateDestinationImage(trip.name);
            if (imageUrl) {
              setPlan(prev => prev.map(p => p.id === trip.id ? { ...p, imageUrl } : p));
            }
          } catch (err) {
            console.error("Failed to re-generate image on load", err);
          }
        });
      }
    }
  }, []);

  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      try {
        localStorage.setItem('dt_context', JSON.stringify(userContext));
        localStorage.setItem('dt_trips_raw', JSON.stringify(trips));
        const lightPlan = plan.map(({ imageUrl, ...rest }) => rest);
        localStorage.setItem('dt_plan', JSON.stringify(lightPlan));
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          localStorage.removeItem('dt_plan');
        }
      }
    }, 1000);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [userContext, trips, plan]);

  const startAnalysis = async () => {
    if (trips.length === 0) {
      setError("Danos una señal de tus sueños. Añade un destino.");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      const analyzedPlan = await analyzeTrips(userContext, trips);
      if (!analyzedPlan || analyzedPlan.length === 0) throw new Error("Fallo en la manifestación.");
      setPlan(analyzedPlan);
      setStepIndex(2);
      
      analyzedPlan.forEach(async (trip) => {
        try {
          const imageUrl = await generateDestinationImage(trip.name);
          if (imageUrl) setPlan(prev => prev.map(p => p.id === trip.id ? { ...p, imageUrl } : p));
        } catch (err) {}
      });
    } catch (err: any) {
      setError("Estamos ajustando las estrellas. Intenta de nuevo.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const stepStyles = [
    { bg: 'bg-[#F0F9FF]', glow: 'before:bg-sky-200/50', accent: 'text-sky-700', btn: 'bg-sky-600 hover:bg-sky-700', label: 'Claridad Inicial' },
    { bg: 'bg-[#F5F3FF]', glow: 'before:bg-violet-200/50', accent: 'text-violet-700', btn: 'bg-violet-600 hover:bg-violet-700', label: 'Decreta Sueños' },
    { bg: 'bg-[#FDF2F8]', glow: 'before:bg-pink-200/50', accent: 'text-pink-700', btn: 'bg-pink-600 hover:bg-pink-700', label: 'Construye Puentes' },
    { bg: 'bg-white', glow: 'before:bg-indigo-100/50', accent: 'text-indigo-700', btn: 'bg-indigo-600 hover:bg-indigo-700', label: 'Vision Board' }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-1000 relative overflow-hidden ${stepStyles[stepIndex].bg}`}>
      <div className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000 ${stepStyles[stepIndex].glow.replace('before:', '')}`} />
      <div className={`absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-[120px] transition-all duration-1000 ${stepStyles[stepIndex].glow.replace('before:', '')}`} />

      <nav className="bg-white/60 backdrop-blur-xl border-b border-slate-200/50 h-16 shrink-0 z-50 flex items-center no-print sticky top-0">
        <div className="max-w-7xl mx-auto w-full px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl transition-colors duration-500 ${stepStyles[stepIndex].btn}`}>
              <LogoSymbol className="text-white" size={18} />
            </div>
            <span className="text-lg font-black tracking-tight text-slate-800">VOTUM</span>
          </div>
          <div className="flex items-center gap-6 md:gap-10">
            {[
              { icon: Landmark, color: 'text-sky-500' },
              { icon: Map, color: 'text-violet-500' },
              { icon: LayoutDashboard, color: 'text-pink-500' },
              { icon: Eye, color: 'text-indigo-500' }
            ].map((step, i) => (
              <button
                key={i}
                onClick={() => i <= (plan.length > 0 ? 3 : 1) && setStepIndex(i)}
                className={`flex flex-col items-center gap-1.5 transition-all duration-500 ${stepIndex === i ? 'scale-110 opacity-100' : 'opacity-20'}`}
              >
                <step.icon size={20} className={stepIndex === i ? step.color : 'text-slate-400'} />
                <div className={`h-1.5 w-1.5 rounded-full ${stepIndex === i ? 'bg-slate-800' : 'bg-transparent'}`} />
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="flex-1 relative overflow-hidden z-10">
        <div 
          className="absolute inset-0 flex transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ transform: `translateX(-${stepIndex * 100}%)` }}
        >
          <div className="w-full h-full shrink-0 overflow-y-auto px-6 py-12 md:py-20 flex flex-col items-center">
            <div className="w-full max-w-4xl space-y-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-100 text-sky-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Stars size={14} /> Tu Viaje Empieza Aquí
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                  Todo gran plan empieza <br/><span className="text-sky-600 italic">con la verdad.</span>
                </h1>
                <p className="text-sky-900/60 font-medium text-xl max-w-xl mx-auto leading-relaxed">
                  Honrar tu realidad financiera hoy es el primer paso para expandirla mañana.
                </p>
              </div>

              <div className="bg-white/70 backdrop-blur-md p-10 md:p-14 rounded-[3rem] shadow-xl border border-white grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                   <h3 className="text-xs font-black text-sky-700 uppercase tracking-widest border-b border-sky-50 pb-4">Claridad Actual</h3>
                   <div className="space-y-6">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">País de origen</label>
                       <input type="text" value={userContext.originCountry} onChange={e => setUserContext({...userContext, originCountry: e.target.value})} className="w-full p-4 rounded-2xl bg-sky-50/50 border-2 border-transparent focus:border-sky-200 outline-none font-bold text-slate-800 text-lg transition-all" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Símbolo de moneda</label>
                       <input type="text" value={userContext.currency} onChange={e => setUserContext({...userContext, currency: e.target.value})} className="w-full p-4 rounded-2xl bg-sky-50/50 border-2 border-transparent focus:border-sky-200 outline-none font-black text-center text-slate-800 text-3xl transition-all" />
                     </div>
                   </div>
                </div>
                <div className="space-y-8">
                   <h3 className="text-xs font-black text-sky-700 uppercase tracking-widest border-b border-sky-50 pb-4">Poder de Ahorro</h3>
                   <div className="space-y-6">
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Capacidad Mensual</label>
                       <input type="number" value={userContext.monthlySavings} onChange={e => setUserContext({...userContext, monthlySavings: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-sky-50/50 border-2 border-transparent focus:border-sky-200 outline-none font-black text-slate-900 text-3xl transition-all" />
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Capital Inicial</label>
                       <input type="number" value={userContext.initialSavings} onChange={e => setUserContext({...userContext, initialSavings: Number(e.target.value)})} className="w-full p-4 rounded-2xl bg-sky-50/50 border-2 border-transparent focus:border-sky-200 outline-none font-black text-slate-900 text-3xl transition-all" />
                     </div>
                   </div>
                </div>
              </div>

              <div className="flex justify-center pb-12">
                <button onClick={() => setStepIndex(1)} disabled={!userContext.originCountry} className="px-16 py-6 bg-sky-600 text-white rounded-full font-black uppercase tracking-widest hover:bg-sky-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 shadow-xl flex items-center gap-4 text-xs">
                  Siguiente Paso <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-full shrink-0 overflow-y-auto px-6 py-12 md:py-20 flex flex-col items-center">
            <div className="w-full max-w-5xl space-y-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-100 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={14} /> Espacio de Posibilidad
                </div>
                <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
                  Elige los sueños que <br/><span className="text-violet-600">decides materializar.</span>
                </h2>
                <p className="text-violet-900/50 font-medium text-xl max-w-xl mx-auto leading-relaxed">
                  No pienses en el "cómo", concéntrate en el "qué". Lo que nombras empieza a existir.
                </p>
              </div>

              <div className="bg-white/40 backdrop-blur-md p-2 rounded-[3.5rem] border border-white shadow-2xl">
                 <TripForm onAdd={t => setTrips(prev => [...prev, t])} onRemove={id => setTrips(prev => prev.filter(t => t.id !== id))} trips={trips} />
              </div>

              <div className="flex justify-center pt-10 pb-32">
                <button 
                  onClick={startAnalysis} 
                  disabled={isAnalyzing || trips.length === 0} 
                  className="px-20 py-8 bg-violet-600 text-white rounded-full font-black uppercase tracking-widest shadow-2xl hover:bg-violet-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-5 text-sm min-w-[280px]"
                >
                  {isAnalyzing ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3">
                        <Loader2 className="animate-spin" size={24} />
                        <span>Procesando...</span>
                      </div>
                      <span className="text-[10px] opacity-70 animate-pulse lowercase font-normal text-center max-w-[200px] leading-tight">{LOADING_MESSAGES[loadingMsgIdx]}</span>
                    </div>
                  ) : (
                    <>Manifestar mi Plan <Sparkles size={18} /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-full shrink-0 overflow-y-auto px-6 py-12 md:py-20 flex flex-col items-center">
            <div className="w-full max-w-6xl space-y-12">
              <div className="text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-pink-100 text-pink-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={14} /> Ingeniería de Realidad
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
                  La estructura que hace <br/><span className="text-pink-600">posible tu visión.</span>
                </h2>
                <p className="text-pink-900/40 font-medium text-lg max-w-xl mx-auto">Aquí es donde los números se alinean con tus deseos. Confía en el proceso.</p>
              </div>
              
              <PlanDashboard 
                plan={plan} 
                context={userContext} 
                onBack={() => setStepIndex(1)} 
                onUpdateTripMonth={(id, m) => setPlan(p => p.map(t => t.id === id ? {...t, plannedMonth: m} : t))}
                onUpdateTripCostBreakdown={(id, k, v) => setPlan(p => p.map(t => {
                  if (t.id === id) {
                    const nb = {...t.breakdown!, [k]: v};
                    const nt = Object.values(nb).reduce((a, b) => (a as number) + (b as number), 0) as number;
                    return {...t, breakdown: nb, manualCost: nt};
                  }
                  return t;
                }))}
              />

              <div className="flex justify-center pb-32">
                <button onClick={() => setStepIndex(3)} className="px-16 py-7 bg-pink-600 text-white rounded-full font-black uppercase tracking-widest shadow-2xl flex items-center gap-4 hover:bg-pink-700 hover:scale-105 active:scale-95 transition-all">
                  Consolidar mi Vision Board <Eye size={20} />
                </button>
              </div>
            </div>
          </div>

          <div className="w-full h-full shrink-0 overflow-y-auto">
            <VisionBoard 
              plan={plan} 
              context={userContext} 
              onBack={() => setStepIndex(2)}
              onUpdateTrip={(id, u) => setPlan(p => p.map(t => t.id === id ? {...t, ...u} : t))}
            />
          </div>
        </div>
      </main>
      
      <footer className="h-2 bg-slate-100 shrink-0 no-print overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ease-in-out ${
            stepIndex === 0 ? 'bg-sky-500' : 
            stepIndex === 1 ? 'bg-violet-500' : 
            stepIndex === 2 ? 'bg-pink-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${((stepIndex + 1) / 4) * 100}%` }}
        />
      </footer>
    </div>
  );
};

export default App;
