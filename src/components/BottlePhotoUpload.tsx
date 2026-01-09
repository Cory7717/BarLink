"use client";

import { useState, useRef } from "react";

interface BottlePhotoUploadProps {
  barId: string;
  bottleSizeMl?: number;
  onUploadSuccess: (imageUrl: string) => void;
  onEstimateComplete?: (estimatedPct: number, estimatedMl: number) => void;
}

export default function BottlePhotoUpload({ barId, bottleSizeMl = 750, onUploadSuccess, onEstimateComplete }: BottlePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [estimatedPct, setEstimatedPct] = useState<number | null>(null);
  const [estimatedMl, setEstimatedMl] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to S3 and request estimation
    setUploading(true);
    setEstimating(true);
    setEstimatedPct(null);
    setEstimatedMl(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('barId', barId);
      formData.append('bottleSizeMl', String(bottleSizeMl));

      const response = await fetch('/api/inventory/upload-photo', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { imageUrl, estimatedPct: pct, estimatedMl: ml } = await response.json();
      onUploadSuccess(imageUrl);
      if (pct && ml) {
        setEstimating(false);
        setEstimatedPct(pct);
        setEstimatedMl(ml);
        onEstimateComplete?.(pct, ml);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
      setEstimating(false);
    }
  };

  return (
    <div className="space-y-3">
      <label htmlFor="bottle-photo-input" className="sr-only">Upload bottle photo</label>
      <input
        id="bottle-photo-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Bottle preview" className="w-full max-w-xs rounded-lg border border-slate-700" />
          {estimating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
              <span className="text-white text-sm">Estimating fill level...</span>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/40 px-4 py-6 text-center hover:border-emerald-500 hover:bg-slate-800/60 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-slate-300">Uploading...</span>
          ) : (
            <div className="space-y-2">
              <div className="text-3xl">📸</div>
              <p className="text-sm font-semibold text-white">Take photo of bottle</p>
              <p className="text-xs text-slate-400">AI will estimate fill level</p>
            </div>
          )}
        </button>
      )}
      
      {preview && !uploading && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            fileInputRef.current?.click();
          }}
          className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
        >
          Retake photo
        </button>
      )}

      {estimatedPct !== null && estimatedMl !== null && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-100 text-sm">
          Estimated remaining: <strong>{estimatedPct.toFixed(1)}%</strong> (~{estimatedMl} ml)
        </div>
      )}
    </div>
  );
}
