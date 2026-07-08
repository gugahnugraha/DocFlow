"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, X, AlertCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DropZoneProps {
  /** Called when valid file(s) are dropped or selected */
  onFiles: (files: File[]) => void;
  /** Accepted mime types, e.g. "application/pdf" or "image/*" */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Already-loaded file(s) to display */
  files?: File[];
  /** Remove a loaded file by index */
  onRemove?: (index: number) => void;
  /** Max file size in bytes (default 100 MB) */
  maxSize?: number;
  /** Custom label override */
  label?: string;
  /** Custom sub-label override */
  sublabel?: string;
  /** Extra className on the outer wrapper */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileChip({ file, onRemove, removeAriaLabel }: { file: File; onRemove?: () => void; removeAriaLabel: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl px-3 py-2 text-sm animate-fade-in">
      <div className="w-7 h-7 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
        <FileText className="w-3.5 h-3.5 text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[var(--text)] truncate text-xs">{file.name}</p>
        <p className="text-[var(--text-subtle)] text-[10px]">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="w-5 h-5 rounded-full bg-orange-200/60 hover:bg-orange-300 text-orange-700 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label={removeAriaLabel}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

export default function DropZone({
  onFiles,
  accept = "application/pdf",
  multiple = false,
  files = [],
  onRemove,
  maxSize = 100 * 1024 * 1024,
  label,
  sublabel,
  className = "",
  disabled = false,
}: DropZoneProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPdf = accept.includes("pdf");
  const isImage = accept.includes("image");

  const defaultLabel = isPdf
    ? t.components.dropzone.labelPdf
    : isImage
    ? t.components.dropzone.labelImage
    : t.components.dropzone.labelGeneric;

  const defaultSublabel = isPdf
    ? t.components.dropzone.sublabelPdf
    : isImage
    ? t.components.dropzone.sublabelImage
    : t.components.dropzone.sublabelGeneric;

  const validate = useCallback(
    (rawFiles: File[]): { valid: File[]; error: string | null } => {
      const valid: File[] = [];
      for (const f of rawFiles) {
        if (f.size > maxSize) {
          return {
            valid: [],
            error: t.common.errors.fileTooLarge
              .replace("{name}", f.name)
              .replace("{max}", formatBytes(maxSize)),
          };
        }
        valid.push(f);
      }
      return { valid, error: null };
    },
    [maxSize, t]
  );

  const handleFiles = useCallback(
    (rawFiles: File[]) => {
      setError(null);
      const { valid, error } = validate(rawFiles);
      if (error) { setError(error); return; }
      if (valid.length > 0) onFiles(valid);
    },
    [onFiles, validate]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    handleFiles(Array.from(e.dataTransfer.files));
  };
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  const hasFiles = files.length > 0;

  return (
    <div className={`w-full ${className}`}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label || defaultLabel}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" || e.key === " " ? inputRef.current?.click() : undefined}
        className={[
          "dropzone",
          isDragOver ? "dropzone-active" : "",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={onChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Icon ring */}
        <div className={`relative flex items-center justify-center w-16 h-16 rounded-2xl transition-all duration-300 ${
          isDragOver ? "bg-brand-500 scale-110 shadow-brand" : "bg-brand-50"
        }`}>
          {isDragOver ? (
            <Upload className="w-7 h-7 text-white animate-bounce" />
          ) : (
            <Upload className="w-7 h-7 text-brand-500" />
          )}
          {/* Animated ring when dragging */}
          {isDragOver && (
            <span className="absolute inset-0 rounded-2xl border-2 border-brand-400 animate-ping opacity-60" />
          )}
        </div>

        <div className="space-y-1 pointer-events-none">
          <p className="text-base font-semibold text-[var(--text)]">
            {isDragOver ? t.components.dropzone.releaseHere : (label || defaultLabel)}
          </p>
          <p className="text-sm text-[var(--text-subtle)]">
            {sublabel || defaultSublabel}
          </p>
        </div>

        {/* Accepted types + size hint */}
        <div className="flex items-center gap-2 pointer-events-none">
          {isPdf && <span className="badge badge-brand">PDF</span>}
          {isImage && (
            <>
              <span className="badge badge-brand">JPG</span>
              <span className="badge badge-brand">PNG</span>
              <span className="badge badge-brand">WebP</span>
            </>
          )}
          <span className="text-xs text-[var(--text-subtle)]">{t.components.dropzone.maxPrefix} {formatBytes(maxSize)}</span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 animate-fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* File chips */}
      {hasFiles && (
        <div className="mt-3 space-y-2 animate-slide-up">
          {files.map((f, i) => (
            <FileChip
              key={`${f.name}-${i}`}
              file={f}
              removeAriaLabel={t.common.aria.removeFile}
              onRemove={onRemove ? () => onRemove(i) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
