"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
  label?: string;
  hint?: string;
}

export function ImageUpload({
  value,
  onChange,
  bucket = "page-assets",
  folder = "uploads",
  label,
  hint,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5 MB");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "31536000", upsert: false });

    if (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. Make sure the storage bucket exists in Supabase.");
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
    onChange(urlData.publicUrl);
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-800">{label}</label>
      )}

      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt=""
            className="w-full h-32 object-cover rounded-xl border border-gray-200"
          />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            dragOver
              ? "border-purple-400 bg-purple-50/50"
              : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30"
          } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
        >
          {uploading ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              <span className="text-xs text-gray-500">Uploading…</span>
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-xs text-gray-500">
                Drop an image or click to upload
              </span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
        className="hidden"
      />

      {/* Fallback: still allow URL paste */}
      <div className="flex items-center gap-2">
        <ImageIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="or paste image URL"
          className="text-xs h-8 border-gray-200"
        />
      </div>

      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}
