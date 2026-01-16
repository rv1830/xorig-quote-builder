"use client";
import React from 'react';
import { QuoteState } from '@/types/quote';
import { safeNum } from '@/lib/utils';
import { FileText, Calendar, User, Phone, Image as ImageIcon, Percent, Hash, Printer, Download, Cpu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface Props {
  state: QuoteState;
  setState: React.Dispatch<React.SetStateAction<QuoteState>>;
  onPdf: () => void;
  onImageFile: (file: File) => void;
}

export default function EditorPanel({ state, setState, onPdf, onImageFile }: Props) {
  const { theme, setTheme } = useTheme();

  const updateCustomer = (k: string, v: string) => {
    setState(s => ({ ...s, customer: { ...s.customer, [k]: v } }));
  };

  const updatePart = (idx: number, k: string, v: any) => {
    const newParts = [...state.parts];
    (newParts[idx] as any)[k] = k === 'model' ? v : safeNum(v);
    setState(s => ({ ...s, parts: newParts }));
  };

  const inputClass = "w-full bg-[var(--input-bg)] border border-[var(--card-border)] rounded-xl p-2.5 text-xs text-[var(--foreground)] placeholder:text-[var(--foreground)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all";
  const labelClass = "text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1 flex items-center gap-1.5";

  return (
    <aside className="backdrop-blur-xl bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 lg:sticky lg:top-8 h-fit shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--accent)] rounded-lg">
            <Cpu className="text-black w-5 h-5" />
          </div>
          <h2 className="text-xl font-black italic tracking-tighter uppercase">QUOTE BUILDER</h2>
        </div>
        
        {/* Theme Toggle Button */}
        <button 
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-full bg-[var(--input-bg)] hover:scale-110 transition-all border border-[var(--card-border)]"
        >
          {theme === 'dark' ? <Sun size={18} className="text-[var(--accent)]" /> : <Moon size={18} className="text-[var(--foreground)]" />}
        </button>
      </div>
      
      {/* Meta Section */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><Hash size={12}/> Quote #</label>
            <input className={inputClass} value={state.quoteNo} onChange={e => setState(s => ({...s, quoteNo: e.target.value}))} placeholder="XR-2026" />
          </div>
          <div>
            <label className={labelClass}><Calendar size={12}/> Date</label>
            <input type="date" className={inputClass} value={state.quoteDate} onChange={e => setState(s => ({...s, quoteDate: e.target.value}))} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><Calendar size={12}/> Valid Till</label>
            <input type="date" className={inputClass} value={state.validTill} onChange={e => setState(s => ({...s, validTill: e.target.value}))} />
          </div>
          <div>
            <label className={labelClass}><FileText size={12}/> Build Name</label>
            <input className={inputClass} value={state.buildName} onChange={e => setState(s => ({...s, buildName: e.target.value}))} placeholder="Supernova V2" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}><User size={12}/> Customer</label>
            <input className={inputClass} value={state.customer.name} onChange={e => updateCustomer('name', e.target.value)} placeholder="Full Name" />
          </div>
          <div>
            <label className={labelClass}><Phone size={12}/> Phone</label>
            <input className={inputClass} value={state.customer.phone} onChange={e => updateCustomer('phone', e.target.value)} placeholder="+91..." />
          </div>
        </div>

        <div className="relative group">
          <label className={labelClass}><ImageIcon size={12}/> Build Image</label>
          <div className="relative border-2 border-dashed border-[var(--card-border)] rounded-xl p-4 hover:border-[var(--accent)] transition-colors group">
            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => e.target.files?.[0] && onImageFile(e.target.files[0])} />
            <div className="text-center text-[10px] text-[var(--foreground)]/50 uppercase font-bold tracking-widest">Click to upload build pic</div>
          </div>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[var(--card-border)] to-transparent my-8" />

      {/* Parts Table Editor */}
      <div className="rounded-2xl overflow-hidden border border-[var(--card-border)] bg-[var(--input-bg)] mb-6">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[var(--accent)] text-black text-[9px] font-black uppercase tracking-tighter">
            <tr>
              <th className="p-3">Category</th>
              <th className="p-3">Model</th>
              <th className="p-3 text-right">Qty/Price</th>
            </tr>
          </thead>
          <tbody>
            {state.parts.map((p, i) => (
              <tr key={i} className="border-b border-[var(--card-border)] hover:bg-[var(--card-bg)] transition-colors">
                <td className="p-3 text-[10px] font-bold text-[var(--foreground)]/70 whitespace-nowrap uppercase">{p.category}</td>
                <td className="p-2"><input className="w-full bg-transparent border border-[var(--card-border)] rounded-lg p-1.5 text-[10px] text-[var(--foreground)]" value={p.model} onChange={e => updatePart(i, 'model', e.target.value)} /></td>
                <td className="p-2">
                  <div className="flex gap-1.5">
                    <input type="number" className="w-10 bg-transparent border border-[var(--card-border)] rounded-lg p-1.5 text-[10px] text-right" value={p.qty} onChange={e => updatePart(i, 'qty', e.target.value)} />
                    <input type="number" className="w-full bg-transparent border border-[var(--card-border)] rounded-lg p-1.5 text-[10px] text-right" value={p.rate} onChange={e => updatePart(i, 'rate', e.target.value)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Discount & GST */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="p-3 bg-[var(--input-bg)] rounded-2xl border border-[var(--card-border)]">
          <label className={labelClass}><Percent size={12}/> Discount</label>
          <select className="w-full bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-xs text-[var(--foreground)] mb-2" value={state.discountType} onChange={e => setState(s => ({...s, discountType: e.target.value as any}))}>
            <option value="">None</option><option value="amount">Fixed ₹</option><option value="percent">Percent %</option>
          </select>
          <input type="number" className={inputClass} value={state.discountValue} onChange={e => setState(s => ({...s, discountValue: safeNum(e.target.value)}))} />
        </div>
        <div className="p-3 bg-[var(--input-bg)] rounded-2xl border border-[var(--card-border)]">
          <label className={labelClass}><Percent size={12}/> GST Tax</label>
          <select className="w-full bg-transparent border border-[var(--card-border)] rounded-lg p-2 text-xs text-[var(--foreground)] mb-2" value={state.gstType} onChange={e => setState(s => ({...s, gstType: e.target.value as any}))}>
            <option value="">None</option><option value="percent">Percent %</option><option value="amount">Fixed ₹</option>
          </select>
          <input type="number" className={inputClass} value={state.gstValue} onChange={e => setState(s => ({...s, gstValue: safeNum(e.target.value)}))} />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onPdf} className="flex-1 bg-[var(--accent)] text-black p-4 rounded-2xl text-[11px] font-black uppercase tracking-tighter hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg">
          <Download size={14}/> Generate PDF
        </button>
        <button onClick={() => window.print()} className="bg-[var(--input-bg)] text-[var(--foreground)] p-4 rounded-2xl hover:bg-[var(--card-border)] transition-all active:scale-95 border border-[var(--card-border)]">
          <Printer size={16}/>
        </button>
      </div>
    </aside>
  );
}