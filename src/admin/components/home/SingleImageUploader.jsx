import React, { useRef, useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';

/**
 * Single image uploader — shows current image, allows replace/delete.
 * @param {string} value — current image URL
 * @param {function} onUpload — async (file) => newUrl
 * @param {function} onDelete — async () => void
 * @param {string} label — optional label
 * @param {string} hint — optional hint text
 */
export default function SingleImageUploader({ value, onUpload, onDelete, label, hint }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file) {
    if (!file || !onUpload) return;
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div>
      {label && (
        <label className="block font-heading font-semibold text-sm text-primary mb-2">{label}</label>
      )}

      {value ? (
        /* Current image preview */
        <div className="relative group w-full max-w-xs rounded-2xl overflow-hidden border border-primary/10 bg-primary/5">
          <img src={value} alt="" className="w-full h-48 object-cover" />
          <div className="absolute inset-0 bg-primary/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white rounded-full hover:bg-accent/10 transition-colors"
              title="Reemplazar imagen"
            >
              <Upload size={16} className="text-primary" />
            </button>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Eliminar imagen"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors max-w-xs ${
            dragOver ? 'border-accent bg-accent/5' : 'border-primary/20 hover:border-primary/40'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
              <span className="font-body text-xs text-primary/50">Subiendo...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <ImageIcon className="w-8 h-8 text-primary/25" />
              <span className="font-body text-xs text-primary/50">Arrastrá imagen o hacé click</span>
            </div>
          )}
        </div>
      )}

      {hint && (
        <p className="font-body text-xs text-primary/40 mt-1.5">{hint}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
