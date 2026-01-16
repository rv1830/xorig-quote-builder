"use client";
import React from 'react';
import { QuoteState } from '@/types/quote';
import { fmtINR, safeNum } from '@/lib/utils';
import { CheckCircle, ShieldCheck, Truck, ImageIcon, Cpu, Zap } from 'lucide-react';

export default function PreviewPage({ state }: { state: QuoteState }) {
  const visibleParts = state.parts.filter(p => p.model.trim() !== "" || p.qty > 0 || p.rate > 0);
  const subtotal = state.parts.reduce((acc, p) => acc + (safeNum(p.qty) * safeNum(p.rate)), 0);
  
  let discountAmt = state.discountType === "amount" ? state.discountValue : (subtotal * (state.discountValue / 100));
  discountAmt = Math.max(0, Math.min(discountAmt, subtotal));
  
  const taxable = subtotal - discountAmt;
  const gstAmt = state.gstType === "percent" ? (taxable * (state.gstValue / 100)) : state.gstValue;
  const grandTotal = taxable + gstAmt;

  return (
    <section id="quoteRoot" className="w-[210mm] min-h-[297mm] bg-white text-[#10002B] shadow-[0_40px_80px_-15px_rgba(16,0,43,0.2)] overflow-hidden print:shadow-none font-sans relative flex flex-col">
      <div className="h-3 w-full bg-gradient-to-r from-[#240046] via-[#FDC500] to-[#240046]" />
      
      <div className="p-[12mm_15mm] flex-grow">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#10002B] rounded-xl flex items-center justify-center text-[#FDC500] shadow-lg">
                <Cpu size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-3xl font-[900] italic tracking-tighter text-[#10002B] leading-none">XO RIG</h1>
                <p className="text-[9px] font-black tracking-[0.4em] text-[#FDC500] uppercase mt-1">Next-Gen Ecosystem</p>
              </div>
            </div>
            
            <div className="mt-10 grid grid-cols-2 gap-10">
               <div className="border-l-2 border-[#FDC500] pl-4">
                  <p className="text-[8px] uppercase font-black text-gray-400 mb-1 tracking-widest">Client Details</p>
                  <p className="text-[13px] font-black text-[#10002B] uppercase">{state.customer.name || "Customer"}</p>
                  <p className="text-[11px] text-gray-500 font-bold">{state.customer.phone || "+91 ————————"}</p>
               </div>
               <div className="border-l-2 border-[#240046] pl-4">
                  <p className="text-[8px] uppercase font-black text-gray-400 mb-1 tracking-widest">Reference</p>
                  <p className="text-[13px] font-black text-[#10002B]">#{state.quoteNo || "—"}</p>
                  <p className="text-[11px] text-gray-500 font-bold uppercase">{state.quoteDate}</p>
               </div>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-[#10002B] text-[#FDC500] px-6 py-3 rounded-bl-[2rem] font-black italic text-sm shadow-xl flex items-center gap-2">
               <Zap size={16} fill="#FDC500" /> {state.buildName || "CUSTOM PERFORMANCE RIG"}
            </div>
            <div className="mt-12 pr-4">
               <p className="text-[8px] uppercase font-black text-gray-400 mb-1 tracking-widest">Valid Until</p>
               <p className="text-xs font-black text-[#240046] uppercase bg-[#FDC500]/10 px-2 py-1 rounded inline-block">{state.validTill || "7 Days from issue"}</p>
            </div>
          </div>
        </div>

        {/* Content Container (Table + Totals) */}
        <div className="relative border border-gray-100 rounded-[2.5rem] p-8 bg-gray-50/30 shadow-inner">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#10002B] flex items-center gap-2">
                <CheckCircle size={14} className="text-[#FDC500]" /> Hardware Configuration
            </h3>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Pricing in INR</span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="text-[9px] uppercase font-black tracking-tighter text-gray-400">
                <th className="pb-4 w-[35mm]">Category</th>
                <th className="pb-4">Specifications</th>
                <th className="pb-4 text-center w-[15mm]">Qty</th>
                <th className="pb-4 text-right w-[35mm]">Total Price</th>
              </tr>
            </thead>
            <tbody className="text-[11px]">
              {(visibleParts.length ? visibleParts : [{category:'System', model:'No hardware selected', qty:0, rate:0}]).map((p, i) => (
                <tr key={i} className="group border-b border-gray-100/80">
                  <td className="py-4 font-black text-[#240046] uppercase text-[9px] tracking-tight">{p.category}</td>
                  <td className="py-4 font-bold text-gray-700">{p.model}</td>
                  <td className="py-4 text-center tabular-nums text-gray-500 font-black">{p.qty || "—"}</td>
                  <td className="py-4 text-right tabular-nums font-black text-[#10002B]">{p.qty ? fmtINR(p.qty * p.rate) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔥 FIXED TOTALS SECTION: Ab ye hamesha items ke niche aayega */}
          <div className="mt-8 ml-auto w-[85mm] space-y-3">
             <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">
                <span>Subtotal</span>
                <span className="text-[#10002B]">{fmtINR(subtotal)}</span>
             </div>
             
             {discountAmt > 0 && (
               <div className="flex justify-between text-[11px] font-black text-red-500 uppercase tracking-widest px-4">
                  <span>Discount</span>
                  <span>− {fmtINR(discountAmt)}</span>
               </div>
             )}
             
             {gstAmt > 0 && (
               <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-widest px-4">
                  <span>Taxes (GST)</span>
                  <span className="text-[#10002B]">{fmtINR(gstAmt)}</span>
               </div>
             )}

             <div className="bg-[#10002B] text-[#FDC500] p-5 rounded-[1.5rem] mt-4 shadow-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black italic uppercase tracking-[0.2em]">Grand Total</span>
                  <span className="text-xl font-black tracking-tighter tabular-nums">{fmtINR(grandTotal)}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Bottom Area: Image & Terms */}
        <div className="mt-10 grid grid-cols-[1fr_80mm] gap-10 items-end">
           <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 text-[#10002B]">
                    <div className="p-2 bg-[#FDC500] rounded-lg shadow-sm"><ShieldCheck size={14} /></div>
                    <span className="text-[9px] font-black uppercase italic tracking-tighter">Verified Assembly</span>
                 </div>
                 <div className="flex items-center gap-3 text-[#10002B]">
                    <div className="p-2 bg-[#FDC500]/20 rounded-lg shadow-sm"><Truck size={14} className="text-[#240046]" /></div>
                    <span className="text-[9px] font-black uppercase italic tracking-tighter">Insured Shipping</span>
                 </div>
              </div>
              
              <div className="p-5 bg-[#10002B]/[0.02] border border-[#10002B]/5 rounded-[1.5rem]">
                 <h4 className="text-[9px] font-black uppercase text-[#10002B] mb-3 tracking-[0.2em]">Terms of Sale</h4>
                 <ul className="text-[8.5px] space-y-1.5 text-gray-500 font-bold leading-tight uppercase">
                    <li>• All components carry official brand warranty.</li>
                    <li>• Prices include assembly and stress testing.</li>
                    <li>• Quote is subject to market price fluctuations.</li>
                 </ul>
              </div>
           </div>

           <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#240046] to-[#FDC500] rounded-[2rem] blur-md opacity-20"></div>
              <div className="relative aspect-[1.3] rounded-[1.5rem] overflow-hidden bg-white border border-gray-100 shadow-2xl">
                {state.imageUrl ? (
                  <img src={state.imageUrl} className="w-full h-full object-cover" alt="PC Build" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-gray-200">
                    <ImageIcon size={40} strokeWidth={1} />
                    <span className="text-[8px] font-black uppercase mt-2 italic tracking-widest text-gray-300">Spec Preview</span>
                  </div>
                )}
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-6 w-full flex justify-center">
        <div className="px-6 py-1 bg-gray-50 rounded-full">
           <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.6em] italic">
             XO Rig Ecosystem • Crafted for Performance
           </p>
        </div>
      </div>
    </section>
  );
}