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
  try {
    // @ts-ignore - html2pdf.js has no types
    const html2pdf = (await import('html2pdf.js')).default;
    const el = document.getElementById('quoteRoot');
    
    if (!el) {
      console.error("Target element 'quoteRoot' not found!");
      return;
    }

    const opt = {
      margin: 0,
      filename: `XO-RIG-${state.quoteNo || 'Quote'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 }, 
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait' 
      }
    };
    
    // @ts-ignore
    await html2pdf().set(opt).from(el).save();
    
  } catch (err) {
    console.error("PDF Generation Error:", err);
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
      {/* Decorative Background using variables */}
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