"use client";
import React, { useState } from 'react';
import EditorPanel from '@/components/EditorPanel';
import PreviewPage from '@/components/PreviewPage';
import CropModal from '@/components/CropModal';
import { QuoteState } from '@/types/quote';
import { PARTS_TEMPLATE } from '@/lib/utils';

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
    const el = document.getElementById('quoteRoot');
    if (!el) return;

    try {
      // --- IMAGE TO BASE64 CONVERSION START ---
      // Puppeteer local images nahi dekh pata, isliye hum unhe Base64 mein badal rahe hain
      const images = el.getElementsByTagName('img');
      for (let img of Array.from(images)) {
        if (img.src && !img.src.startsWith('data:')) {
          try {
            const response = await fetch(img.src);
            const blob = await response.blob();
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            img.src = base64 as string;
          } catch (imgErr) {
            console.warn("Could not convert image to base64:", img.src);
          }
        }
      }
      // --- IMAGE TO BASE64 CONVERSION END ---

      const styles = Array.from(document.styleSheets)
        .map((styleSheet) => {
          try {
            return Array.from(styleSheet.cssRules)
              .map((rule) => rule.cssText)
              .join('');
          } catch (e) {
            return '';
          }
        })
        .join('');

      const htmlContent = `
        <!DOCTYPE html>
        <html data-theme="${document.documentElement.getAttribute('data-theme') || 'dark'}">
          <head>
            <meta charset="utf-8">
            <style>${styles}</style>
            <style>
              body { 
                background: transparent !important; 
                margin: 0 !important; 
                padding: 0 !important;
                -webkit-print-color-adjust: exact;
              }
              #quoteRoot { 
                margin: 0 !important; 
                box-shadow: none !important; 
                width: 210mm; 
                min-height: 297mm;
                height: auto;
                overflow: visible;
              }
            </style>
          </head>
          <body>
            ${el.outerHTML}
          </body>
        </html>
      `;

      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          html: htmlContent, 
          theme: document.documentElement.getAttribute('data-theme') || 'dark' 
        }),
      });

      if (!response.ok) throw new Error('PDF conversion failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `XO-RIG-${state.quoteNo || 'Quote'}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("Puppeteer Client Error:", err);
      alert("Direct download failed. Opening print preview instead.");
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
        <CropModal 
          src={pendingCrop} 
          onClose={() => setPendingCrop(null)} 
          onApply={(url) => {
            setState(s => ({ ...s, imageUrl: url }));
            setPendingCrop(null);
          }} 
        />
      )}
    </main>
  );
}