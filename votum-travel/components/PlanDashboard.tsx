import React, { useMemo } from 'react';
import { AnalyzedTrip, UserContext, CostBreakdown } from '../types';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, ComposedChart, Area } from 'recharts';
import { FileSpreadsheet, TrendingUp, AlertCircle, CheckCircle2, Wallet, PiggyBank, Scale } from 'lucide-react';

interface PlanDashboardProps {
  plan: AnalyzedTrip[];
  context: UserContext;
  onBack: () => void;
  onUpdateTripMonth: (tripId: string, newMonth: number) => void;
  onUpdateTripCostBreakdown: (tripId: string, key: keyof CostBreakdown, value: number) => void;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export const PlanDashboard: React.FC<PlanDashboardProps> = ({ plan, context, onBack, onUpdateTripMonth, onUpdateTripCostBreakdown }) => {
  const { 
    financialData, 
    totalDreamCost, 
    totalProjectedSavings, 
    tripInsights 
  } = useMemo(() => {
    const allTrips = plan;
    const totalCost = allTrips.reduce((acc, t) => acc + (t.manualCost ?? (t.estimatedCostRange.min + t.estimatedCostRange.max) / 2), 0);
    const totalSavings = context.initialSavings + (context.monthlySavings * 12);

    let runningSavings = context.initialSavings;
    const tripInsightsMap: Record<string, { isAffordable: boolean; shortfall: number }> = {};

    const chartData = MONTHS.map((month, index) => {
      const tripsInMonth = allTrips.filter(t => t.plannedMonth === index);
      const costInMonth = tripsInMonth.reduce((acc, t) => acc + (t.manualCost ?? (t.estimatedCostRange.min + t.estimatedCostRange.max) / 2), 0);
      runningSavings += context.monthlySavings;
      const netAfterTrips = runningSavings - costInMonth;
      tripsInMonth.forEach(t => {
        tripInsightsMap[t.id] = { isAffordable: netAfterTrips >= 0, shortfall: netAfterTrips < 0 ? Math.abs(netAfterTrips) : 0 };
      });
      runningSavings = netAfterTrips;
      return { name: month, cost: costInMonth, balance: runningSavings };
    });

    return { financialData: chartData, totalDreamCost: totalCost, totalProjectedSavings: totalSavings, tripInsights: tripInsightsMap };
  }, [plan, context]);

  const exportToSheets = () => {
    const isViable = (context.initialSavings + (context.monthlySavings * 12)) >= totalDreamCost;
    const statusText = isViable ? "PLAN VIABLE" : "REQUIERE AJUSTES";
    const currency = context.currency;

    const headers = [
      "ID",
      "Destino",
      "Mes Planificado",
      "Importancia",
      "Transporte (" + currency + ")",
      "Hospedaje (" + currency + ")",
      "Comida (" + currency + ")",
      "Otros (" + currency + ")",
      "Costo Total (" + currency + ")",
      "Descripción de la Experiencia",
      "Viabilidad Individual"
    ];

    const rows = plan
      .sort((a, b) => (a.plannedMonth ?? 0) - (b.plannedMonth ?? 0))
      .map((t, idx) => {
        const total = t.manualCost ?? (t.estimatedCostRange.min + t.estimatedCostRange.max) / 2;
        const insight = tripInsights[t.id];
        return [
          idx + 1,
          `"${t.name.replace(/"/g, '""')}"`,
          MONTHS[t.plannedMonth ?? 0],
          t.importance.toUpperCase(),
          t.breakdown?.flight ?? 0,
          t.breakdown?.stay ?? 0,
          t.breakdown?.food ?? 0,
          t.breakdown?.attractions ?? 0,
          total,
          `"${t.experienceDescription.replace(/"/g, '""')}"`,
          insight.isAffordable ? "SI" : `NO (Faltan ${insight.shortfall})`
        ].join(",");
      });

    const csvContent = [
      `"VOTUM - MANIFIESTO DE VIAJES 2026"`,
      `"Estado del Plan:","${statusText}"`,
      `"País de Origen:","${context.originCountry}"`,
      `"Ahorro Inicial:","${context.initialSavings}"`,
      `"Ahorro Mensual:","${context.monthlySavings}"`,
      "",
      headers.join(","),
      ...rows,
      "",
      `"RESUMEN FINANCIERO"`,
      `"Total Inversión Sueños:","${totalDreamCost}"`,
      `"Total Fondos Proyectados:","${totalProjectedSavings}"`,
      `"Balance Final:","${totalProjectedSavings - totalDreamCost}"`
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VOTUM_Plan_Maestro_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isViableTotal = (context.initialSavings + (context.monthlySavings * 12)) >= totalDreamCost;
  const finalBalance = totalProjectedSavings - totalDreamCost;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 no-print bg-white p-6 md:p-8 rounded-3xl border border-sky-100 shadow-xl shadow-sky-900/5">
        <div className="flex items-center gap-5 w-full md:w-auto">
          <div className={`p-4 rounded-2xl shadow-lg shrink-0 ${isViableTotal ? 'bg-sky-600 text-white' : 'bg-pink-600 text-white'}`}>
            {isViableTotal ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
             <h3 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">Viabilidad del Plan</h3>
             <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest ${isViableTotal ? 'text-sky-600' : 'text-pink-600'}`}>
               {isViableTotal ? 'Felicidades, tu visión es posible' : 'Ajusta montos o elimina destinos'}
             </p>
          </div>
        </div>
        <button onClick={exportToSheets} className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-5 bg-sky-600 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-sky-700 hover:scale-105 active:scale-95 transition-all shadow-xl">
          <FileSpreadsheet size={18} /> Descargar Hoja de Cálculo
        </button>
      </div>

      {/* Totales Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 no-print">
        <div className="bg-white p-8 rounded-[2rem] border border-sky-100 shadow-xl flex items-center gap-6 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-slate-900 text-white rounded-2xl">
            <Wallet size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Inversión Total</span>
            <div className="text-2xl font-black text-slate-950">{context.currency}{totalDreamCost.toLocaleString()}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-sky-100 shadow-xl flex items-center gap-6 transition-transform hover:-translate-y-1">
          <div className="p-4 bg-sky-100 text-sky-600 rounded-2xl">
            <PiggyBank size={24} />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Fondos 2026</span>
            <div className="text-2xl font-black text-slate-950">{context.currency}{totalProjectedSavings.toLocaleString()}</div>
          </div>
        </div>
        <div className={`p-8 rounded-[2rem] border shadow-xl flex items-center gap-6 transition-transform hover:-translate-y-1 ${finalBalance >= 0 ? 'bg-sky-600 border-sky-500' : 'bg-slate-950 border-slate-900'}`}>
          <div className={`p-4 rounded-2xl ${finalBalance >= 0 ? 'bg-white/20 text-white' : 'bg-pink-600 text-white'}`}>
            <Scale size={24} />
          </div>
          <div>
            <span className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${finalBalance >= 0 ? 'text-sky-100' : 'text-slate-400'}`}>Balance Final</span>
            <div className={`text-2xl font-black text-white`}>
              {finalBalance < 0 && '-'} {context.currency}{Math.abs(finalBalance).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-sky-50 h-[350px] md:h-[480px] no-print relative shadow-2xl">
        <div className="absolute top-4 right-4 md:top-10 md:right-10 flex flex-col md:flex-row items-end md:items-center gap-4 md:gap-8 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sky-500" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-indigo-900" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Costo</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={financialData} margin={{ top: 40, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f9ff" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} tick={{dy: 10}} />
            <YAxis stroke="#64748b" fontSize={10} fontWeight={900} tickLine={false} axisLine={false} tickFormatter={(v) => `${context.currency}${v}`} />
            <Tooltip 
              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '15px' }}
              itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#0f172a' }}
            />
            <Area type="monotone" dataKey="balance" stroke="#0ea5e9" strokeWidth={4} fillOpacity={0.1} fill="#0ea5e9" />
            <Bar dataKey="cost" fill="#312e81" radius={[6, 6, 0, 0]} barSize={24} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-10">
        {MONTHS.map((month, idx) => {
          const trips = plan.filter(t => t.plannedMonth === idx);
          if (trips.length === 0) return null;
          return (
            <div key={month} className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-6 lg:gap-12 border-t border-sky-50 pt-12">
              <div className="h-fit lg:sticky lg:top-24">
                <div className="text-sky-600 font-black uppercase text-sm tracking-[0.4em] mb-4">{month}</div>
                <div className="h-1.5 w-12 bg-sky-500 rounded-full" />
              </div>
              <div className="space-y-10">
                {trips.map(trip => {
                  const insight = tripInsights[trip.id];
                  const total = trip.manualCost ?? (trip.estimatedCostRange.min + trip.estimatedCostRange.max) / 2;
                  return (
                    <div key={trip.id} className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 border border-sky-50 shadow-xl transition-all hover:border-sky-200 hover:-translate-y-1 group">
                      <div className="flex flex-col xl:flex-row gap-10 xl:gap-16">
                        <div className="flex-1 space-y-6 md:space-y-8">
                          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
                            <h4 className="text-2xl md:text-3xl font-black text-slate-950 tracking-tighter group-hover:text-sky-600 transition-colors">{trip.name}</h4>
                            <span className="w-fit px-5 py-2 bg-sky-50 text-sky-600 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border border-sky-100">{trip.seasonalLevel}</span>
                          </div>
                          <p className="text-base md:text-xl font-medium text-slate-500 italic leading-relaxed border-l-4 border-sky-50 pl-6 md:pl-8">"{trip.experienceDescription}"</p>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            {trip.touristPlaces.map(p => (
                              <span key={p} className="px-3 py-1.5 bg-slate-50 text-slate-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-lg">#{p}</span>
                            ))}
                          </div>
                        </div>
                        <div className="xl:w-80 shrink-0 bg-sky-50/30 p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] space-y-6 md:space-y-8 border border-sky-50">
                          <div className="flex justify-between items-center border-b border-sky-100 pb-4 md:pb-6">
                             <span className="text-[10px] md:text-[11px] font-black uppercase text-sky-600 tracking-widest">Inversión</span>
                             <span className="text-2xl md:text-3xl font-black text-slate-950">{context.currency}{total.toLocaleString()}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 md:gap-6">
                             {[
                               {k:'flight', l:'Vuelo'},
                               {k:'stay', l:'Hospedaje'},
                               {k:'food', l:'Comida'},
                               {k:'attractions', l:'Extras'}
                             ].map(item => (
                               <div key={item.k}>
                                 <label className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 block">{item.l}</label>
                                 <input 
                                   type="number" 
                                   value={trip.breakdown?.[item.k as keyof CostBreakdown] ?? 0} 
                                   onChange={e => onUpdateTripCostBreakdown(trip.id, item.k as keyof CostBreakdown, Number(e.target.value))} 
                                   className="w-full bg-white text-slate-950 text-xs font-black p-3 rounded-xl border border-sky-100 focus:ring-2 ring-sky-500/20 outline-none transition-all shadow-sm" 
                                 />
                               </div>
                             ))}
                          </div>
                          <div className="flex justify-between items-center pt-4 md:pt-6 border-t border-sky-100">
                             <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Ajustar Mes</span>
                             <select value={trip.plannedMonth} onChange={e => onUpdateTripMonth(trip.id, Number(e.target.value))} className="bg-white text-slate-950 text-[10px] md:text-[11px] font-black px-4 py-2 rounded-xl border border-sky-100 outline-none cursor-pointer hover:bg-sky-50 transition-colors">
                               {MONTHS.map((m,i) => <option key={i} value={i}>{m}</option>)}
                             </select>
                          </div>
                        </div>
                      </div>
                      {!insight.isAffordable && (
                        <div className="mt-8 md:mt-10 p-5 md:p-6 bg-slate-950 text-white rounded-2xl flex items-center gap-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-lg">
                          <TrendingUp size={18} className="text-sky-400 shrink-0" />
                          <span>Faltan {context.currency}{insight.shortfall.toLocaleString()} para este hito.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
