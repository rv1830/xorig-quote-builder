"use client";
import React, { useEffect, useRef } from 'react';
import Cropper from 'cropperjs';
import 'cropperjs/dist/cropper.css';
import { X, Check, Crop as CropIcon } from 'lucide-react';

interface Props {
  src: string;
  onClose: () => void;
  onApply: (dataUrl: string) => void;
}

export default function CropModal({ src, onClose, onApply }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const cropperRef = useRef<Cropper | null>(null);

  useEffect(() => {
    if (imgRef.current) {
      cropperRef.current = new Cropper(imgRef.current, {
        aspectRatio: 70 / 56,
        viewMode: 1,
        dragMode: 'move',
        autoCropArea: 1,
        background: false,
      });
    }
    return () => {
      if (cropperRef.current) {
        cropperRef.current.destroy();
        cropperRef.current = null;
      }
    };
  }, [src]);

  const handleApply = () => {
    const cropper = cropperRef.current;
    if (!cropper) return;
    const anyCropper = cropper as any;
    const canvas = anyCropper.getCroppedCanvas 
      ? anyCropper.getCroppedCanvas({ width: 1400, height: 1120, imageSmoothingQuality: 'high' })
      : anyCropper.getCropperCanvas();

    if (canvas) onApply(canvas.toDataURL('image/jpeg', 0.92));
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-6 backdrop-blur-lg">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-[0_0_100px_rgba(147,51,234,0.3)] overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl"><CropIcon className="text-white w-4 h-4"/></div>
            <span className="font-black italic text-white uppercase tracking-tighter">Perfect Your Build Preview</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"><X size={20}/></button>
        </div>
        
        <div className="p-8 bg-black/40">
          <div className="max-h-[500px] w-full overflow-hidden rounded-3xl border border-white/10 shadow-inner">
            <img ref={imgRef} src={src} alt="To crop" className="block max-w-full" />
          </div>
        </div>

        <div className="p-6 border-t border-white/5 flex justify-end gap-4 bg-white/5">
          <button onClick={onClose} className="px-8 py-3 rounded-2xl text-xs font-bold text-white/50 hover:text-white transition-all">Cancel</button>
          <button onClick={handleApply} className="px-8 py-3 bg-yellow-400 text-black rounded-2xl text-xs font-black uppercase tracking-tighter hover:bg-yellow-300 transition-all flex items-center gap-2">
            <Check size={16}/> Apply Finish
          </button>
        </div>
      </div>
    </div>
  );
}