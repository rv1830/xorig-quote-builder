"use client";
import React, { useState } from 'react';
import EditorPanel from '@/components/EditorPanel';
import PreviewPage from '@/components/PreviewPage';
import CropModal from '@/components/CropModal';
import { QuoteState } from '@/types/quote';
import { PARTS_TEMPLATE, fmtINR } from '@/lib/utils';

export default function Home() {
  const [state, setState] = useState<QuoteState>({
    quoteNo: "",
    quoteDate: new Date().toISOString().slice(0, 10),
    validTill: "",
    buildName: "",
    customer: { name: "", phone: "" },
    imageUrl: "",
    discountType: "",
    discountValue: 0,
    gstType: "",
    gstValue: 0,
    parts: PARTS_TEMPLATE.map(cat => ({ category: cat, model: "", qty: 1, rate: 0 }))
  });

  const [pendingCrop, setPendingCrop] = useState<string | null>(null);

  const handlePdf = async () => {
    const previewEl = document.getElementById('quoteRoot');
    if (!previewEl) return;

    // 🔥 Current theme detect karna (Dark or Light)
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
    const currentTheme = isDarkMode ? 'dark' : 'light';

    try {
      // 1. Image Conversion (Logo/Build Pic) to Base64
      const images = previewEl.getElementsByTagName('img');
      for (let img of Array.from(images)) {
        if (img.src && !img.src.startsWith('data:')) {
          try {
            const res = await fetch(img.src);
            const blob = await res.blob();
            const b64 = await new Promise((r) => {
              const reader = new FileReader();
              reader.onloadend = () => r(reader.result);
              reader.readAsDataURL(blob);
            });
            img.src = b64 as string;
          } catch (e) { console.warn("Img conversion failed", e); }
        }
      }

      // 2. Capture all CSS rules
      const styles = Array.from(document.styleSheets)
        .map(s => { 
          try { 
            return Array.from(s.cssRules).map(r => r.cssText).join(''); 
          } catch { 
            return ''; 
          }
        }).join('');

      // 3. Page 1: Quote Builder Data (Theme Aware)
      const editorDataHtml = `
        <div style="padding: 40px; font-family: sans-serif; color: var(--foreground); background: var(--background); min-height: 297mm;">
          <h2 style="border-bottom: 3px solid var(--accent); padding-bottom: 12px; color: var(--accent); text-transform: uppercase; font-weight: 900; letter-spacing: -0.05em;">Quote Builder</h2>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 30px; font-size: 14px;">
            <div style="border-left: 2px solid var(--accent); padding-left: 15px;">
              <p style="margin: 0; font-size: 10px; color: var(--muted); text-transform: uppercase; font-weight: bold;">Reference</p>
              <p style="margin: 5px 0 0 0; font-weight: 900;">#${state.quoteNo || '—'}</p>
              <p style="margin: 2px 0 0 0; color: var(--muted);">${state.quoteDate}</p>
            </div>
            <div style="border-left: 2px solid var(--muted); padding-left: 15px;">
              <p style="margin: 0; font-size: 10px; color: var(--muted); text-transform: uppercase; font-weight: bold;">Customer</p>
              <p style="margin: 5px 0 0 0; font-weight: 900;">${state.customer.name || 'Customer'}</p>
              <p style="margin: 2px 0 0 0; color: var(--muted);">${state.customer.phone || '—'}</p>
            </div>
          </div>

          <table style="width: 100%; margin-top: 40px; border-collapse: collapse; background: var(--input-bg); border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <thead>
              <tr style="background: var(--accent); color: var(--accent-foreground);">
                <th style="padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase;">Category</th>
                <th style="padding: 15px; text-align: left; font-size: 11px; text-transform: uppercase;">Specifications</th>
                <th style="padding: 15px; text-align: right; font-size: 11px; text-transform: uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${state.parts.map(p => p.model ? `
                <tr style="border-bottom: 1px solid var(--card-border);">
                  <td style="padding: 12px 15px; font-size: 11px; font-weight: 900; color: var(--accent); text-transform: uppercase;">${p.category}</td>
                  <td style="padding: 12px 15px; font-size: 12px; font-weight: bold; color: var(--foreground);">${p.model}</td>
                  <td style="padding: 12px 15px; font-size: 12px; text-align: right; font-weight: 900;">${p.qty} x ${fmtINR(p.rate)}</td>
                </tr>
              ` : '').join('')}
            </tbody>
          </table>
        </div>
      `;

      // 4. Combine everything for Puppeteer
      const htmlContent = `
        <!DOCTYPE html>
        <html data-theme="${currentTheme}">
          <head>
            <meta charset="utf-8">
            <style>${styles}</style>
            <style>
              @page { size: A4 portrait; margin: 0; }
              body { 
                background: var(--background) !important; 
                margin: 0; 
                padding: 0; 
                -webkit-print-color-adjust: exact; 
              }
              .pdf-page { 
                width: 210mm; 
                min-height: 297mm; 
                display: block; 
                break-after: page; 
                position: relative;
                background: var(--background);
              }
              .last-page { break-after: auto; }
              #quoteRoot { width: 210mm; margin: 0 !important; box-shadow: none !important; transform: none !important; }
            </style>
          </head>
          <body>
            <div class="pdf-page">${editorDataHtml}</div>
            <div class="pdf-page last-page">${previewEl.outerHTML}</div>
          </body>
        </html>
      `;

      // 5. API Call to Puppeteer
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent, theme: currentTheme }),
      });

      if (!response.ok) throw new Error('PDF conversion failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `XO-RIG-Report-${state.quoteNo || 'Quote'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF Error:", err);
      window.print();
    }
  };

  const onImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => setPendingCrop(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <main className="min-h-screen p-4 lg:p-8 flex items-center justify-center relative">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[var(--background)] via-[var(--card-bg)] to-[var(--background)] opacity-50" />
      <div className="max-w-[1440px] w-full mx-auto grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-10">
        <EditorPanel 
          state={state} 
          setState={setState} 
          onPdf={handlePdf} 
          onImageFile={onImageFile} 
        />
        <div className="flex justify-center items-start overflow-auto py-4">
          <PreviewPage state={state} />
        </div>
      </div>
      {pendingCrop && (
        <CropModal src={pendingCrop} onClose={() => setPendingCrop(null)} onApply={(url) => {
          setState(s => ({ ...s, imageUrl: url }));
          setPendingCrop(null);
        }} />
      )}
    </main>
  );
}