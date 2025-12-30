
import React, { useState } from 'react';
import { TripRequest, TravelMethod, Importance } from '../types';
import { Plus, Trash2, Plane, Bus, Car, Package, Map, Calendar, Zap, Sparkles } from 'lucide-react';

interface TripFormProps {
  onAdd: (trip: TripRequest) => void;
  onRemove: (id: string) => void;
  trips: TripRequest[];
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const TripForm: React.FC<TripFormProps> = ({ onAdd, onRemove, trips }) => {
  const [name, setName] = useState('');
  const [days, setDays] = useState(3);
  const [method, setMethod] = useState<TravelMethod>(TravelMethod.FLIGHT);
  const [importance, setImportance] = useState<Importance>(Importance.MEDIUM);
  const [preferredMonth, setPreferredMonth] = useState<number | 'any'>('any');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: Math.random().toString(36).substr(2, 9),
      name,
      days,
      method,
      importance,
      preferredMonth: preferredMonth === 'any' ? undefined : preferredMonth
    });
    setName('');
    setPreferredMonth('any');
  };

  return (
    <div className="space-y-12">
      <div className="bg-white p-12 md:p-16 rounded-[3rem] shadow-2xl border border-white">
        <div className="flex items-center gap-5 mb-12">
          <div className="p-4 bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200">
            <Map size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Nueva Intención de Viaje</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-violet-500">Cada deseo escrito es un compromiso con tu felicidad</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Destino Soñado</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Auroras Boreales en Islandia"
              className="w-full px-8 py-5 rounded-2xl bg-violet-50/30 border-2 border-transparent focus:border-violet-200 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 text-lg shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Días de Goce</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={1}
              className="w-full px-8 py-5 rounded-2xl bg-violet-50/30 border-2 border-transparent focus:border-violet-200 outline-none font-black text-slate-900 text-center text-xl shadow-inner"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Mes Ideal</label>
            <select
              value={preferredMonth}
              onChange={(e) => setPreferredMonth(e.target.value === 'any' ? 'any' : Number(e.target.value))}
              className="w-full px-8 py-5 rounded-2xl bg-violet-50/30 border-2 border-transparent focus:border-violet-200 outline-none font-bold text-slate-800 text-center cursor-pointer hover:bg-violet-50 transition-colors shadow-inner"
            >
              <option value="any">Flexible</option>
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Importancia</label>
            <select
              value={importance}
              onChange={(e) => setImportance(e.target.value as Importance)}
              className="w-full px-8 py-5 rounded-2xl bg-violet-50/30 border-2 border-transparent focus:border-violet-200 outline-none font-bold text-slate-800 text-center cursor-pointer hover:bg-violet-50 transition-colors shadow-inner"
            >
              <option value={Importance.HIGH}>Innegociable</option>
              <option value={Importance.MEDIUM}>Deseado</option>
              <option value={Importance.LOW}>Opcional</option>
            </select>
          </div>
          
          <div className="col-span-1 md:col-span-5 flex flex-col lg:flex-row items-center justify-between gap-12 pt-10 border-t border-slate-50">
            <div className="flex-1 w-full">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Canal de Transporte</label>
              <div className="flex flex-wrap gap-4">
                {Object.values(TravelMethod).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                      method === m 
                        ? 'bg-violet-600 border-violet-600 text-white shadow-xl shadow-violet-200' 
                        : 'bg-white border-slate-100 text-slate-400 hover:border-violet-200 hover:text-violet-600'
                    }`}
                  >
                    {m === 'own_car' ? 'Mi Auto' : m === 'rental_car' ? 'Renta' : m === 'flight' ? 'Vuelo' : m === 'bus' ? 'Bus' : 'Pack'}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="submit"
              className="w-full lg:w-auto px-16 py-6 bg-violet-600 text-white rounded-full font-black hover:bg-violet-700 hover:scale-105 transition-all flex items-center justify-center gap-4 uppercase tracking-widest text-xs shadow-2xl shadow-violet-200 active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> Registrar Sueño
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {trips.map((trip) => (
          <div key={trip.id} className="bg-white/80 backdrop-blur-md p-10 rounded-[2.5rem] border border-white shadow-xl flex items-center justify-between group hover:border-violet-200 transition-all hover:-translate-y-1">
            <div className="flex items-center gap-6">
              <div className={`w-2 h-14 rounded-full shadow-lg ${
                trip.importance === Importance.HIGH ? 'bg-violet-600 shadow-violet-200' :
                trip.importance === Importance.MEDIUM ? 'bg-indigo-400' : 'bg-slate-200'
              }`} />
              <div>
                <h4 className="font-black text-slate-900 text-xl tracking-tight">{trip.name}</h4>
                <div className="flex items-center gap-4 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Calendar size={12} /> {trip.days} Días 
                   <div className="w-1.5 h-1.5 bg-violet-100 rounded-full" />
                   <Sparkles size={12} /> {trip.method}
                </div>
              </div>
            </div>
            <button
              onClick={() => onRemove(trip.id)}
              className="p-4 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
            >
              <Trash2 size={22} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
