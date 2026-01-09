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
  const [useCameraMode, setUseCameraMode] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod/.test(navigator.userAgent);

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

  const openCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <label htmlFor="bottle-photo-input" className="sr-only">Take or upload bottle photo</label>
      <input
        id="bottle-photo-input"
        ref={fileInputRef}
        type="file"
        accept="image/*"
        {...(useCameraMode && isMobile ? { capture: "environment" as const } : {})}
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
          onClick={openCamera}
          disabled={uploading}
          className="w-full rounded-lg border-2 border-dashed border-slate-600 bg-slate-800/40 px-4 py-8 sm:py-6 text-center hover:border-emerald-500 hover:bg-slate-800/60 transition-all disabled:opacity-50 touch-manipulation active:scale-95"
        >
          {uploading ? (
            <span className="text-slate-300">Uploading...</span>
          ) : (
            <div className="space-y-2">
              <div className="text-4xl sm:text-3xl">{useCameraMode && isMobile ? '📷' : '📸'}</div>
              <p className="text-base sm:text-sm font-semibold text-white">
                {useCameraMode && isMobile ? 'Take photo with camera' : 'Take or upload photo'}
              </p>
              <p className="text-sm sm:text-xs text-slate-400">AI will estimate fill level</p>
            </div>
          )}
        </button>
      )}
      
      {preview && !uploading && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            openCamera();
          }}
          className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600"
        >
          {useCameraMode && isMobile ? 'Retake photo' : 'Retake or upload'}
        </button>
      )}

      {isMobile && !preview && (
        <button
          type="button"
          onClick={() => setUseCameraMode(!useCameraMode)}
          className="w-full rounded-lg bg-slate-800/50 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          {useCameraMode ? 'Or upload from gallery' : 'Or take with camera'}
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

