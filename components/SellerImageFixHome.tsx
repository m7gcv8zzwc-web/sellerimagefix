"use client";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";

// SellerImageFix – Clean professional landing page (Mint + Navy)
// This file now includes a functional client‑side MVP for image resizing + ZIP download,
// along with responsive mobile nav and subtle animations.
// Tech: React + Tailwind + Framer Motion + JSZip. All processing happens in the browser.

/* =================== PRESETS =================== */
// Simple initial presets. You can add more anytime.
// Strategy: cover crop to fill target WxH while keeping subject centered (middle crop).
const PRESETS: Record<string, any> = {
  etsy_square: { label: "Etsy – Square (2000×2000)", width: 2000, height: 2000, format: "image/jpeg", quality: 0.92 },
  etsy_zoom: { label: "Etsy – Zoom Friendly (3000 longest)", longest: 3000, format: "image/jpeg", quality: 0.92 },
  fb_marketplace: { label: "Facebook Marketplace – Square (1200×1200)", width: 1200, height: 1200, format: "image/jpeg", quality: 0.9 },
};

/* =================== MAIN APP =================== */
export default function SellerImageFixHome() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [presetKey, setPresetKey] = useState<keyof typeof PRESETS>("etsy_square");
  const [exportPNG, setExportPNG] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState<{ name: string; url: string; sizeKB: number }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const onBrowse = useCallback(() => fileInputRef.current?.click(), []);

 const [supported, setSupported] = useState({ canvas: false, fileReader: false });

useEffect(() => {
  const hasWindow = typeof window !== "undefined";
  setSupported({
    canvas: hasWindow ? !!document.createElement("canvas") : false,
    fileReader: hasWindow ? "FileReader" in window : false,
  });
}, []);


  const onFiles = useCallback((list: FileList | null) => {
    if (!list) return;
    const incoming = Array.from(list).filter(f => /image\/(png|jpeg|jpg)/i.test(f.type));
    setFiles(prev => [...prev, ...incoming]);
  }, []);

  const clearAll = () => { setFiles([]); setResults([]); };

  async function processAll() {
    if (!supported.canvas || !supported.fileReader || files.length === 0) return;
    setProcessing(true);
    setResults([]);

    const preset = PRESETS[presetKey];
    const out: { name: string; url: string; sizeKB: number }[] = [];

    for (const f of files) {
      try {
        const { blob, filename } = await resizeOne(f, preset, exportPNG);
        const url = URL.createObjectURL(blob);
        out.push({ name: filename, url, sizeKB: Math.round(blob.size / 1024) });
      } catch (e) {
        console.error("Failed to process", f.name, e);
      }
    }
    setResults(out);
    setProcessing(false);
  }

  async function downloadZip() {
    if (results.length === 0) return;
    const zip = new JSZip();
    for (const r of results) {
      const res = await fetch(r.url);
      const blob = await res.blob();
      zip.file(r.name, blob);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `sellerimagefix_${presetKey}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <div className="min-h-screen bg-white text-[#0F1F3E] antialiased">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#how" className="hover:opacity-80">How it Works</a>
            <a href="#help" className="hover:opacity-80">Help</a>
            <button
              className="rounded-full px-4 py-2 bg-[#73E3C0] text-[#0F1F3E] font-medium hover:shadow-md transition"
              onClick={() => {
                const el = document.getElementById("upload");
                el?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              aria-label="Fix my photos"
            >
              Fix My Photos
            </button>
          </nav>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 rounded-lg border border-slate-200" onClick={() => setMobileOpen(v => !v)} aria-label="Toggle menu">
            <span className="block h-0.5 w-6 bg-[#0F1F3E] mb-1"/>
            <span className="block h-0.5 w-6 bg-[#0F1F3E] mb-1"/>
            <span className="block h-0.5 w-6 bg-[#0F1F3E]"/>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-100">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3 text-sm">
              <a href="#how" onClick={() => setMobileOpen(false)} className="py-1">How it Works</a>
              <a href="#help" onClick={() => setMobileOpen(false)} className="py-1">Help</a>
              <button
                className="rounded-full px-4 py-2 bg-[#73E3C0] text-[#0F1F3E] font-medium w-max"
                onClick={() => { setMobileOpen(false); document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" }); }}
              >Fix My Photos</button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Better Listing Photos. <br className="hidden sm:block" /> Higher Sales.
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }} className="mt-4 text-slate-600 text-lg">
              Upload your images and get instant marketplace-ready results. We handle sizing, cropping, and polish.
            </motion.p>

            <div className="mt-6 flex items-center gap-4">
              <button
                className="rounded-full px-6 py-3 bg-[#73E3C0] text-[#0F1F3E] font-semibold hover:shadow-lg active:scale-[0.99] transition"
                onClick={() => { document.getElementById("upload")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}
              >
                Fix My Photos
              </button>
              <span className="text-sm text-[#0F1F3E]">Always Free. Always seller friendly.</span>
            </div>

            {/* Platform chips */}
            <div className="mt-6 flex flex-wrap items-center gap-2" aria-label="Supported platforms">
              <Chip>Built for Etsy</Chip>
              <Chip>Facebook Marketplace</Chip>
              <Chip variant="ghost">Shopify (soon)</Chip>
              <Chip variant="ghost">Amazon (soon)</Chip>
            </div>
          </div>

          {/* Hero visual: soft studio backdrop + framed art */}
          <div className="relative">
            {/* Mobile: single polished AFTER frame */}
            <div className="lg:hidden relative p-4">
              <div className="absolute inset-0 -right-3 -top-2 rounded-3xl bg-slate-50" aria-hidden />
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="relative p-2">
                <Frame label="Optimized for marketplace" tone="after" />
              </motion.div>
            </div>
            {/* Desktop */}
            <div className="hidden lg:block relative">
              <div className="absolute inset-0 -right-6 -top-4 rounded-3xl bg-slate-50" aria-hidden />
              <div className="relative p-6 sm:p-8">
                <div className="grid grid-cols-3 gap-6 items-center">
                  <Frame label="Original upload" tone="before" />
                  <div className="hidden lg:flex items-center justify-center text-3xl text-slate-400">&rarr;</div>
                  <Frame label="Optimized for marketplace" tone="after" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upload zone (functional MVP) */}
      <section id="upload" className="py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold">Make your photos marketplace‑ready in seconds</h2>
          <p className="mt-2 text-slate-600">Drag and drop your images below, choose a preset, and download a tidy bundle.</p>

          {/* Preset selector */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {Object.keys(PRESETS).map((key) => (
              <PresetButton key={key} active={presetKey === key} onClick={() => setPresetKey(key as any)}>
                {PRESETS[key].label}
              </PresetButton>
            ))}
            <label className="ml-1 flex items-center gap-2 text-sm text-slate-700 select-none">
              <input type="checkbox" className="h-4 w-4" checked={exportPNG} onChange={(e) => setExportPNG(e.target.checked)} />
              Export PNG instead of JPG
            </label>
          </div>

          <div
            onDragEnter={() => setHovering(true)}
            onDragLeave={() => setHovering(false)}
            onDragOver={(e) => { e.preventDefault(); setHovering(true); }}
            onDrop={(e) => { e.preventDefault(); setHovering(false); onFiles(e.dataTransfer.files); }}
            className={`mt-6 rounded-2xl border-2 border-dashed ${hovering ? "border-[#73E3C0] bg-teal-50" : "border-slate-200"} p-10 flex flex-col items-center justify-center text-center`}
            role="region"
            aria-label="Upload images dropzone"
          >
            <CameraIcon className="h-12 w-12 text-[#73E3C0]" />
            <p className="mt-3 font-medium">Drag & drop your images here</p>
            <p className="text-slate-500 text-sm">or</p>
            <button onClick={onBrowse} className="mt-3 rounded-full px-5 py-2 bg-[#73E3C0] text-[#0F1F3E] font-semibold hover:shadow">
              Browse files
            </button>
            <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg" className="hidden" onChange={(e) => onFiles(e.target.files)} aria-hidden />
          </div>

          {/* Queue */}
          {files.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600">{files.length} image(s) ready</div>
                <div className="flex gap-2">
                  <button onClick={clearAll} className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600">Clear</button>
                  <button onClick={processAll} disabled={processing} className="px-4 py-2 rounded-lg bg-[#73E3C0] text-[#0F1F3E] font-semibold disabled:opacity-50">
                    {processing ? "Processing…" : "Process"}
                  </button>
                </div>
              </div>
              {/* Thumbs */}
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {files.map((f, idx) => (
                  <Thumb key={idx} file={f} />
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold">Processed images</h3>
              <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((r, i) => (
                  <a key={i} href={r.url} download={r.name} className="group block rounded-xl border border-slate-200 overflow-hidden hover:shadow">
                    <img src={r.url} alt={r.name} className="w-full h-48 object-cover" />
                    <div className="px-3 py-2 text-sm flex items-center justify-between">
                      <span className="truncate" title={r.name}>{r.name}</span>
                      <span className="text-slate-500">{r.sizeKB} KB</span>
                    </div>
                  </a>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={downloadZip} className="px-4 py-2 rounded-lg bg-[#73E3C0] text-[#0F1F3E] font-semibold">Download ZIP</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold">Why sellers love SellerImageFix</h3>
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Benefit title="Perfect sizes">One-click presets. No more guesswork.</Benefit>
            <Benefit title="Smart crop">Subject-centered cover crop. Clean thumbnails.</Benefit>
            <Benefit title="Clean compression">Crisp detail with fast-loading files.</Benefit>
            <Benefit title="No sign-up">Open, upload, done. It’s that simple.</Benefit>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold">How it works</h3>
          <ol className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-700">
            <Step n={1} title="Upload your images" />
            <Step n={2} title="Pick a preset" />
            <Step n={3} title="Preview & polish" />
            <Step n={4} title="Download your bundle" />
          </ol>
        </div>
      </section>

      {/* Help / FAQ */}
      <section id="help" className="py-12 border-t border-slate-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-bold">Quick answers</h3>
          <div className="mt-6 space-y-4">
            <FAQ q="Is SellerImageFix really free?" a="Yes. Always free and supported by lightweight ads that never get in your way." />
            <FAQ q="What image formats can I upload?" a="JPG and PNG to start. More coming soon." />
            <FAQ q="What presets are included?" a="Etsy square, Etsy zoom-friendly, and Facebook Marketplace square at launch." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <small>&copy; {new Date().getFullYear()} SellerImageFix</small>
            <span className="hidden sm:inline">•</span>
            <small>Always Free. Always seller friendly.</small>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="hover:opacity-80">How it Works</a>
            <a href="#help" className="hover:opacity-80">Help</a>
            <a href="#" className="hover:opacity-80">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* =================== Helper Functions =================== */
async function resizeOne(file: File, preset: any, forcePNG: boolean): Promise<{ blob: Blob; filename: string }> {
  const img = await readImage(file);

  let targetW: number, targetH: number;
  if (preset.width && preset.height) {
    targetW = preset.width; targetH = preset.height;
  } else if (preset.longest) {
    const ratio = img.width / img.height;
    if (img.width >= img.height) { targetW = preset.longest; targetH = Math.round(targetW / ratio); }
    else { targetH = preset.longest; targetW = Math.round(targetH * ratio); }
  } else {
    targetW = img.width; targetH = img.height;
  }

  // cover crop from center
  const srcRatio = img.width / img.height;
  const dstRatio = targetW / targetH;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (srcRatio > dstRatio) {
    sw = Math.round(img.height * dstRatio);
    sx = Math.round((img.width - sw) / 2);
  } else if (srcRatio < dstRatio) {
    sh = Math.round(img.width / dstRatio);
    sy = Math.round((img.height - sh) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW; canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high" as any;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);

  const mime = forcePNG ? "image/png" : (preset.format || "image/jpeg");
  const quality = mime === "image/png" ? undefined : (typeof preset.quality === "number" ? preset.quality : 0.92);
  const blob = await new Promise<Blob>((resolve) => canvas.toBlob(b => resolve(b as Blob), mime, quality as any));
  const ext = mime === "image/png" ? "png" : "jpg";
  const base = file.name.replace(/\.[^.]+$/, "");
  const filename = `${base}_${targetW}x${targetH}.${ext}`;
  return { blob, filename };
}

function readImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* =================== UI Bits =================== */
function Logo() {
  return (
    <div className="flex items-center gap-3 select-none">
      <div className="relative h-8 w-12 flex items-center justify-center">
        <svg viewBox="0 0 120 80" className="h-8 w-12">
          <rect x="6" y="8" width="108" height="64" rx="14" ry="14" stroke="#73E3C0" strokeWidth="8" fill="none"/>
          <circle cx="60" cy="40" r="18" stroke="#73E3C0" strokeWidth="8" fill="none"/>
        </svg>
      </div>
      <div className="leading-none">
        <div className="font-extrabold tracking-wide text-xl">SELLERIMAGEFIX</div>
        <div className="text-xs text-slate-600 -mt-0.5">Better Listing Photos. Higher Sales.</div>
      </div>
    </div>
  );
}

function CameraIcon({ className = "h-6 w-6 text-[#73E3C0]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6" width="18" height="14" rx="3"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  );
}

function Chip({ children, variant = "solid" }: { children: React.ReactNode; variant?: "solid" | "ghost"; }) {
  const base = "px-3 py-1.5 rounded-full text-sm";
  const styles = variant === "solid"
    ? "bg-slate-100 text-slate-700 border border-slate-200"
    : "bg-transparent text-slate-500 border border-slate-200";
  return <span className={`${base} ${styles}`}>{children}</span>;
}

function PresetButton({ children, active, disabled, onClick }: { children: React.ReactNode; active?: boolean; disabled?: boolean; onClick?: () => void; }) {
  const base = "px-3 py-1.5 rounded-full text-sm border transition";
  const state = disabled
    ? "opacity-50 cursor-not-allowed"
    : active
      ? "bg-[#73E3C0] text-[#0F1F3E] border-[#73E3C0] hover:shadow"
      : "bg-white text-slate-700 border-slate-200 hover:border-slate-300";
  return <button onClick={onClick} className={`${base} ${state}`}>{children}</button>;
}

function Benefit({ title, children }: { title: string; children: React.ReactNode; }) {
  return (
    <div className="rounded-2xl border border-slate-100 p-5 hover:shadow-sm transition">
      <div className="font-semibold">{title}</div>
      <p className="mt-1 text-sm text-slate-600">{children}</p>
    </div>
  );
}

function Step({ n, title }: { n: number; title: string; }) {
  return (
    <li className="rounded-2xl border border-slate-100 p-5">
      <div className="flex items-center gap-3">
        <span className="h-7 w-7 rounded-full bg-[#73E3C0] text-[#0F1F3E] grid place-items-center font-bold">{n}</span>
        <span className="font-medium">{title}</span>
      </div>
      <div className="mt-3 h-1 w-20 bg-slate-100 rounded-full" />
    </li>
  );
}

function FAQ({ q, a }: { q: string; a: string; }) {
  return (
    <details className="group rounded-2xl border border-slate-100 p-5">
      <summary className="marker:content-none flex items-center justify-between cursor-pointer select-none">
        <span className="font-medium text-[#0F1F3E]">{q}</span>
        <span className="shrink-0 h-6 w-6 grid place-items-center rounded-full border border-slate-200 text-slate-500 group-open:rotate-45 transition">+</span>
      </summary>
      <p className="mt-3 text-sm text-slate-600">{a}</p>
    </details>
  );
}

function Thumb({ file }: { file: File }) {
  const [src, setSrc] = useState<string | null>(null);
  React.useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {src ? <img src={src} alt={file.name} className="w-full h-40 object-cover" /> : <div className="w-full h-40 bg-slate-100"/>}
      <div className="px-3 py-2 text-sm truncate" title={file.name}>{file.name}</div>
    </div>
  );
}

/* =================== Before/After Frames =================== */
function Frame({ label, tone }: { label: string; tone: "before" | "after" }) {
  const beforeFilters = "filter grayscale contrast-90 brightness-95";
  const afterFilters = "filter contrast-110";
  return (
    <figure className="relative">
      <div className="rounded-2xl border-[12px] [border-color:#E0C8A0] overflow-hidden shadow-sm bg-white">
        <div className={`aspect-[3/4] grid place-items-center relative ${tone === "before" ? beforeFilters : afterFilters}`}>
          {tone === "before" ? (
            <AbstractArt className="opacity-90 scale-[0.97] translate-x-0.5 -translate-y-0.5" lowQuality />
          ) : (
            <AbstractArt className="contrast-110" />
          )}
        </div>
      </div>
      <figcaption className="mt-2 text-xs text-slate-500">{label}</figcaption>
    </figure>
  );
}

function AbstractArt({ className = "", lowQuality = false }: { className?: string; lowQuality?: boolean; }) {
  return (
    <svg viewBox="0 0 300 400" className={`h-full w-full ${className}`} aria-hidden>
      <rect x="24" y="70" width="252" height="110" rx="8" fill="#E6EEF2" />
      <line x1="0" y1="200" x2="300" y2="200" stroke="#73E3C0" strokeWidth="6" />
      <ellipse cx="150" cy="220" rx="90" ry="120" fill="none" stroke="#0F1F3E" strokeWidth="8" opacity={lowQuality ? 0.75 : 1} />
    </svg>
  );
}

/* =================== Mobile & Favicon =================== */
// Use this SVG as your favicon source. In Next.js add to /public/favicon.svg and reference in <Head>.
// <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
export function FaviconSvg() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="22" width="100" height="76" rx="16" ry="16" stroke="#73E3C0" strokeWidth="10" fill="none"/>
      <circle cx="60" cy="60" r="20" stroke="#73E3C0" strokeWidth="10" fill="none"/>
    </svg>
  );
}

/* =================== Feedback Widget =================== */
function FeedbackWidget() {
  const subject = encodeURIComponent("SellerImageFix feedback");
  const body = encodeURIComponent(
    `Hi SellerImageFix team,%0D%0A%0D%0AHere is my feedback:%0D%0A%0D%0A- What I tried:%0D%0A- What I expected:%0D%0A- What happened:%0D%0A%0D%0AMy browser/device (optional): %0D%0AURL: ${typeof window !== 'undefined' ? window.location.href : ''}`
  );
  const href = `mailto:hello@sellerimagefix.com?subject=${subject}&body=${body}`;
  return (
    <a
      href={href}
      className="fixed bottom-6 right-6 rounded-full bg-[#73E3C0] text-[#0F1F3E] shadow-lg px-4 py-3 font-semibold hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-[#73E3C0]/40"
      aria-label="Give feedback about SellerImageFix"
    >
      Give Feedback
    </a>
  );
}
