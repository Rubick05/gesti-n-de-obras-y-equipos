import React, { useRef, useState, useCallback } from 'react';
import { Upload, X, ImageIcon, Eye, ZoomIn, Loader2 } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────
export interface UploadedImage {
  id: string;
  url: string;         // object URL (local preview) or remote URL
  file?: File;         // present when just uploaded
  uploading?: boolean;
  error?: string;
}

interface ImageUploaderProps {
  /** Current list of image URLs already saved */
  existingUrls?: string[];
  /** Max number of images allowed */
  maxImages?: number;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Label text */
  label?: string;
  /** Called when images list changes (returns final URL array) */
  onChange: (urls: string[]) => void;
  /** If true, renders compact single-image mode */
  single?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

let imgCounter = 0;

// ── Lightbox ──────────────────────────────────────────────────────────────
function Lightbox({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/90 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition"
      >
        <X className="h-5 w-5" />
      </button>
      <img
        src={url}
        alt="Vista completa"
        className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

// ── ImageUploader ─────────────────────────────────────────────────────────
export default function ImageUploader({
  existingUrls = [],
  maxImages = 5,
  maxSizeMB = 5,
  label = 'Fotos',
  onChange,
  single = false,
  placeholder = 'Arrastra imágenes aquí o haz clic para seleccionar',
}: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>(() =>
    existingUrls.map(url => ({ id: `existing-${++imgCounter}`, url }))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limit = single ? 1 : maxImages;
  const canAdd = images.length < limit;

  const processFiles = useCallback(async (files: File[]) => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    const valid = files.filter(f => f.type.startsWith('image/') && f.size <= maxBytes);
    const toAdd = valid.slice(0, limit - images.length);

    if (toAdd.length === 0) return;

    // Create local previews immediately
    const newImages: UploadedImage[] = toAdd.map(file => ({
      id: `img-${++imgCounter}`,
      url: URL.createObjectURL(file),
      file,
      uploading: false,
    }));

    setImages(prev => {
      const updated = [...prev, ...newImages];
      // Notify parent with all current URLs
      const urls = updated.map(img => img.url);
      onChange(urls);
      return updated;
    });
  }, [images.length, limit, maxSizeMB, onChange]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processFiles(files);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(img => img.id !== id);
      // Revoke object URL to free memory
      const removed = prev.find(img => img.id === id);
      if (removed?.file) URL.revokeObjectURL(removed.url);
      onChange(updated.map(img => img.url));
      return updated;
    });
  };

  // ── Single image mode ──────────────────────────────────────────────────
  if (single) {
    const img = images[0];
    return (
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
        {img ? (
          <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video">
            <img src={img.url} alt="Imagen" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxUrl(img.url)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                className="p-2 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
              isDragging
                ? 'border-orange-400 bg-orange-50'
                : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
              <ImageIcon className="h-5 w-5 text-slate-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-600">Añadir foto de referencia</p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG hasta {maxSizeMB}MB</p>
            </div>
          </button>
        )}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
      </div>
    );
  }

  // ── Multi-image mode ───────────────────────────────────────────────────
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
        <span className="text-[10px] font-mono text-slate-400">{images.length}/{limit} fotos</span>
      </div>

      {/* Thumbnails grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {images.map(img => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer"
              onClick={() => setLightboxUrl(img.url)}
            >
              {img.uploading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
                </div>
              ) : (
                <img src={img.url} alt="" className="w-full h-full object-cover transition group-hover:scale-105" />
              )}
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5">
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); setLightboxUrl(img.url); }}
                  className="p-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
                >
                  <Eye className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeImage(img.id); }}
                  className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-full text-white transition"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more button */}
          {canAdd && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 hover:bg-orange-50 flex flex-col items-center justify-center gap-1 transition cursor-pointer"
            >
              <Upload className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] text-slate-400 font-semibold">Agregar</span>
            </button>
          )}
        </div>
      )}

      {/* Drop zone when no images */}
      {images.length === 0 && (
        <div
          className={`w-full rounded-xl border-2 border-dashed p-5 flex flex-col items-center gap-2 transition cursor-pointer ${
            isDragging
              ? 'border-orange-400 bg-orange-50'
              : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/50'
          }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
            <Upload className="h-5 w-5 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-600">{placeholder}</p>
            <p className="text-xs text-slate-400 mt-0.5">PNG, JPG hasta {maxSizeMB}MB · máx {limit} fotos</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={handleFileInput}
      />

      {lightboxUrl && <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />}
    </div>
  );
}
