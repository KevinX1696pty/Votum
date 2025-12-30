import React, { useState, useRef } from 'react';
import { AnalyzedTrip, UserContext } from '../types';
import { Sparkles, Loader2, ChevronLeft, Download, ShieldCheck, Stars } from 'lucide-react';
import html2canvas from 'html2canvas';

type ThemeId = 'vmap' | 'luxury' | 'manifesto' | 'votum';

interface VisionBoardProps {
  plan: AnalyzedTrip[];
  context: UserContext;
  onBack: () => void;
  onUpdateTrip: (tripId: string, updates: Partial<AnalyzedTrip>) => void;
}

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const THEMES: Record<ThemeId, { name: string; emotion: string }> = {
  votum: { name: 'VOTUM', emotion: 'Donde la intención se vuelve destino' },
  vmap: { name: 'Mapa', emotion: 'El diseño consciente de tu futuro' },
  luxury: { name: 'Abundancia', emotion: 'El viaje como derecho de nacimiento' },
  manifesto: { name: 'Manifiesto', emotion: 'Escribiendo la historia de tu vida' }
};

/**
 * LAYOUTS TÉCNICOS VOTUM (2550x3300 px)
 * Alturas de imagen y tarjetas optimizadas para permitir mayor espacio de texto.
 */
const getExportLayout = (count: number) => {
  // LAYOUT_1
  if (count <= 1) return { cols: 1, rows: 1, headerH: 420, footerH: 280, gridH: 2200, cardW: 1600, cardH: 1400, imgH: 800, gap: 0, padding: '150px 120px' };
  
  // LAYOUT_2
  if (count <= 2) return { cols: 2, rows: 1, headerH: 380, footerH: 260, gridH: 2200, cardW: 1050, cardH: 1250, imgH: 700, gap: 100, padding: '150px 120px' };
  
  // LAYOUT_4
  if (count <= 4) return { cols: 2, rows: 2, headerH: 300, footerH: 200, gridH: 2500, cardW: 1000, cardH: 1150, imgH: 600, gap: 100, padding: '120px 120px' };
  
  // LAYOUT_STANDARD_6 (Hero Layout)
  if (count <= 6) return { cols: 3, rows: 2, headerH: 240, footerH: 160, gridH: 2500, cardW: 720, cardH: 1120, imgH: 500, gap: 100, padding: '120px 100px' };
  
  // LAYOUT_9
  if (count <= 9) return { cols: 3, rows: 3, headerH: 200, footerH: 140, gridH: 2650, cardW: 720, cardH: 850, imgH: 350, gap: 60, padding: '100px 100px' };
  
  // MAX DENSITY
  return { cols: 3, rows: 4, headerH: 180, footerH: 140, gridH: 2750, cardW: 720, cardH: 650, imgH: 260, gap: 40, padding: '80px 100px' };
};

export const VisionBoard: React.FC<VisionBoardProps> = ({ plan, context, onBack, onUpdateTrip }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>('votum');
  const [boardTitle, setBoardTitle] = useState(`MI MAPA DE POSIBILIDADES 2026`);
  const [isDownloading, setIsDownloading] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!exportRef.current) return;
    setIsDownloading(true);
    
    try {
      await new Promise(r => setTimeout(r, 1500));
      
      const canvas = await html2canvas(exportRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: currentTheme === 'votum' || currentTheme === 'luxury' ? '#0a0f1a' : '#ffffff',
        logging: false,
        width: 2550,
        height: 3300
      });
      
      const image = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement('a');
      link.href = image;
      link.download = `VOTUM_Vision_Board_2026.jpg`;
      link.click();
    } catch (err) {
      console.error("Export Error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const sortedTrips = [...plan].sort((a, b) => (a.plannedMonth ?? 0) - (b.plannedMonth ?? 0)).slice(0, 12);
  const layout = getExportLayout(sortedTrips.length);

  const getExportStyles = () => {
    switch (currentTheme) {
      case 'votum': return { bg: '#0a0f1a', text: '#ffffff', accent: 'rgba(255,255,255,0.1)', gold: '#C6A15B', cardBg: '#111827', radius: '8px', font: "'Plus Jakarta Sans', sans-serif" };
      case 'luxury': return { bg: '#0f172a', text: '#ffffff', accent: '#334155', gold: '#C6A15B', cardBg: '#1e293b', radius: '40px', font: "'Lora', serif" };
      case 'manifesto': return { bg: '#fefce8', text: '#854d0e', accent: '#fef9c3', gold: '#C6A15B', cardBg: '#ffffff', radius: '60px', font: "'Lora', serif" };
      default: return { bg: '#ffffff', text: '#1e293b', accent: '#f1f5f9', gold: '#6366f1', cardBg: '#f8fafc', radius: '20px', font: "'Plus Jakarta Sans', sans-serif" };
    }
  };

  const ex = getExportStyles();

  return (
    <div className={`w-full min-h-screen transition-all duration-1000 flex flex-col items-center pb-40 relative ${
      currentTheme === 'luxury' || currentTheme === 'votum' ? 'bg-[#0a0f1a] text-white' : 'bg-[#F5F2ED] text-slate-900'
    }`}>
      
      {/* EXPORT HD (2550x3300 px) - HIDDEN OFF SCREEN */}
      <div 
        ref={exportRef}
        style={{ 
          position: 'fixed', left: '-10000px', top: '0', 
          width: '2550px', height: '3300px', 
          background: ex.bg, display: 'flex', flexDirection: 'column',
          padding: layout.padding, 
          boxSizing: 'border-box', fontFamily: ex.font
        }}
      >
        <header style={{ 
          textAlign: 'center', 
          height: `${layout.headerH}px`, 
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          width: '100%',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '100px', fontWeight: '900', textTransform: 'uppercase', color: ex.text, lineHeight: '0.9', letterSpacing: '-0.04em', marginBottom: '10px' }}>
            {boardTitle}
          </div>
          <div style={{ height: '3px', width: '180px', background: ex.gold, marginBottom: '20px', opacity: 0.3 }} />
          <div style={{ fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.5em', color: ex.gold, opacity: 0.7 }}>
            {THEMES[currentTheme].emotion}
          </div>
        </header>

        <div style={{ 
          display: 'grid', 
          height: `${layout.gridH}px`,
          gridTemplateColumns: `repeat(${layout.cols}, ${layout.cardW}px)`,
          gap: `${layout.gap}px`,
          justifyContent: 'center', 
          alignContent: 'center', 
          flex: 1
        }}>
          {sortedTrips.map((trip, idx) => (
            <div key={trip.id} style={{ 
              width: `${layout.cardW}px`,
              height: `${layout.cardH}px`,
              background: ex.cardBg, borderRadius: ex.radius, 
              padding: sortedTrips.length > 4 ? '40px' : '55px', 
              boxSizing: 'border-box',
              display: 'flex', flexDirection: 'column', 
              border: `1px solid ${ex.accent}`,
              overflow: 'hidden',
              boxShadow: currentTheme === 'luxury' || currentTheme === 'votum' ? '0 30px 60px rgba(0,0,0,0.5)' : 'none',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${ex.accent}`, paddingBottom: '12px', flexShrink: 0, marginBottom: '12px' }}>
                <span style={{ fontSize: '20px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.4em', color: ex.gold }}>
                  {MONTHS[trip.plannedMonth ?? 0]}
                </span>
                <span style={{ color: ex.gold, fontSize: '24px', fontWeight: '900', opacity: 0.15 }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
              </div>
              
              <div style={{ 
                fontSize: '26px', 
                fontWeight: '900', 
                color: ex.text, 
                lineHeight: '1.2', 
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                opacity: 1,
                padding: '12px 0',
                height: '2.4em', 
                overflow: 'visible',
                whiteSpace: 'normal',
                width: '100%',
                flexShrink: 0,
                display: 'block'
              }}>
                {trip.name}
              </div>

              <div style={{ 
                height: `${layout.imgH}px`,
                borderRadius: '2px', 
                overflow: 'hidden', 
                border: `1px solid ${ex.accent}`,
                width: '100%',
                background: '#000000',
                marginBottom: '20px',
                flexShrink: 0
              }}>
                {trip.imageUrl && <img src={trip.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />}
              </div>

              <div style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: ex.text, 
                lineHeight: '1.5', 
                fontStyle: 'italic', 
                opacity: currentTheme === 'votum' ? 1 : 0.8,
                display: '-webkit-box',
                WebkitLineClamp: 4,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                height: '6.2em', 
                flexShrink: 0,
                marginTop: '10px'
              }}>
                "{trip.experienceDescription}"
              </div>
              <div style={{ flexGrow: 1 }} />
            </div>
          ))}
        </div>

        <footer style={{ 
          marginTop: 'auto', 
          textAlign: 'center', 
          height: `${layout.footerH}px`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          paddingBottom: '20px'
        }}>
          <div style={{ color: ex.text, fontSize: '18px', fontWeight: '900', letterSpacing: '0.6em', opacity: 0.2 }}>
            VOTUM — LO QUE ELIGES, TOMA FORMA
          </div>
        </footer>
      </div>

      {/* WEB UI NAVIGATION */}
      <div className="w-full max-w-7xl px-4 md:px-8 py-6 md:py-10 flex flex-col md:flex-row justify-between items-center sticky top-16 bg-inherit/90 backdrop-blur-3xl z-40 no-print gap-6 border-b border-white/5">
        <button onClick={onBack} className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-slate-400 hover:text-indigo-400 transition-all flex items-center gap-2">
          <ChevronLeft size={16} /> Volver
        </button>
        <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
          <div className="flex bg-white/5 p-1 rounded-2xl gap-1 overflow-x-auto max-w-full">
            {Object.entries(THEMES).map(([id, t]) => (
              <button key={id} onClick={() => setCurrentTheme(id as ThemeId)} className={`whitespace-nowrap px-3 md:px-5 py-2 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${currentTheme === id ? 'bg-white text-slate-900 shadow-lg' : 'text-slate-400 hover:text-white'}`}>{t.name}</button>
            ))}
          </div>
          <button onClick={handleExport} disabled={isDownloading} className="px-10 py-3.5 bg-white text-slate-900 rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 shadow-xl">
            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={16} />} Descargar JPG
          </button>
        </div>
      </div>

      {/* WEB UI BOARD */}
      <div className={`w-full max-w-6xl px-6 md:px-8 flex flex-col items-center mt-10 md:mt-20 ${currentTheme === 'luxury' || currentTheme === 'manifesto' || currentTheme === 'votum' ? 'font-serif' : 'font-sans'}`}>
        <header className="text-center mb-12 md:mb-28 w-full animate-in fade-in duration-1000">
          <div className="flex justify-center gap-3 mb-6">
            <Stars className="opacity-40" style={{ color: ex.gold }} size={20} />
            <Sparkles className="opacity-40" style={{ color: ex.gold }} size={20} />
          </div>
          <h2 className="text-3xl md:text-5xl lg:text-7xl font-black tracking-tighter uppercase mb-6 leading-tight px-4" style={{ color: ex.text }}>
            El año en que <br/><span className={`italic font-light ${currentTheme === 'votum' ? 'opacity-100' : 'opacity-70'}`}>tus sueños ocurren.</span>
          </h2>
          <div className="h-0.5 w-16 md:w-24 mx-auto mb-8 opacity-30" style={{ background: ex.gold }} />
          <input 
            type="text" value={boardTitle} onChange={(e) => setBoardTitle(e.target.value.toUpperCase())} 
            className="text-xl md:text-4xl lg:text-5xl font-black tracking-tighter uppercase text-center w-full bg-transparent border-none outline-none mb-4 px-4 placeholder:opacity-10" 
            style={{ color: ex.text }} spellCheck={false} 
          />
          <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[1em] mt-4" style={{ color: ex.gold }}>{THEMES[currentTheme].emotion}</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-14 w-full pb-40">
          {sortedTrips.map((trip, idx) => (
            <div 
              key={trip.id} 
              className="flex flex-col gap-4 p-8 md:p-10 transition-all duration-700 shadow-2xl hover:-translate-y-2 group"
              style={{ background: ex.cardBg, borderRadius: ex.radius, border: `1px solid ${ex.accent}` }}
            >
              <div className="flex justify-between items-center border-b pb-6" style={{ borderColor: ex.accent }}>
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em]" style={{ color: ex.gold }}>{MONTHS[trip.plannedMonth ?? 0]}</span>
                <div className="text-xs font-black opacity-20" style={{ color: ex.gold }}>{String(idx + 1).padStart(2, '0')}</div>
              </div>
              
              <h3 className="text-xl md:text-2xl font-black tracking-tighter leading-tight min-h-[3rem] md:min-h-[4rem] flex items-center transition-colors uppercase break-words" style={{ color: ex.text }}>
                {trip.name}
              </h3>

              <div className="aspect-[4/5] bg-black overflow-hidden relative rounded-sm shadow-inner border" style={{ borderColor: ex.accent }}>
                {trip.imageUrl ? (
                  <img src={trip.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10" style={{ color: ex.gold }}>
                    <Sparkles size={40} className="animate-pulse" />
                  </div>
                )}
              </div>

              <p className="text-sm md:text-base leading-relaxed font-bold italic" style={{ color: currentTheme === 'votum' ? '#ffffff' : (currentTheme === 'luxury' ? 'rgba(255,255,255,0.7)' : '#64748b') }}>"{trip.experienceDescription}"</p>
            </div>
          ))}
        </div>
        
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 no-print hidden md:flex">
          <div className="px-10 py-5 bg-white/10 backdrop-blur-2xl border border-white/10 shadow-sm rounded-full flex items-center gap-6">
            <ShieldCheck size={20} className="text-white/40" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">VOTUM — Lo que eliges, toma forma</p>
          </div>
        </div>
      </div>
    </div>
  );
};
