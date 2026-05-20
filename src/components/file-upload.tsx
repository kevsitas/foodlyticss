"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface FileUploadProps {
  bucket?: string;
  folderPrefix?: string;
  accept?: string;
  maxSizeMB?: number;
  onUpload: (url: string) => void;
  onRemove?: () => void;
  uploadedUrl?: string;
  label?: string;
  hint?: string;
}

export function FileUpload({
  bucket = "verification-documents",
  folderPrefix,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMB = 5,
  onUpload,
  onRemove,
  uploadedUrl,
  label = "Subir Documento",
  hint = "PDF, JPG o PNG. Maximo 5MB",
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`El archivo no debe superar ${maxSizeMB}MB`);
      return;
    }

    const allowedTypes = accept.split(",").map((t) => t.trim().toLowerCase());
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!allowedTypes.includes(ext) && !allowedTypes.includes(file.type)) {
      setError(`Tipo de archivo no permitido. Usa: ${accept}`);
      return;
    }

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = folderPrefix ? `${folderPrefix}/${fileName}` : fileName;

      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      onUpload(urlData.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {uploadedUrl ? (
        <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
          <span className="flex-1 text-sm text-emerald-500">Documento subido</span>
          <button
            type="button"
            onClick={() => {
              onRemove?.();
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {preview && (
            <div className="relative overflow-hidden rounded-lg border border-border">
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 w-full object-contain bg-muted"
              />
            </div>
          )}
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary">
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Subiendo..." : label}
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              disabled={uploading}
              onChange={handleFile}
            />
          </label>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}