import { useCallback, useEffect, useRef, useState } from 'react';

// Reusable photo editor — zero deps. Used for profile avatars, company
// logos and founder/team headshots (employer + employee).
// Features: drag-to-crop (pan), zoom slider + wheel, rotate (slider +
// 90° quick buttons), flip H/V, fill-crop helper, circle/square preview,
// brightness/contrast/saturate + B&W filters, canvas export (512px).
function filterString({ brightness, contrast, saturate, grayscale }) {
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) grayscale(${grayscale}%)`;
}

export default function ImageEditorModal({
  src,
  fileName = 'photo.jpg',
  shape = 'circle', // 'circle' for avatars/headshots, 'square' for logos
  outputSize = 512,
  title = 'Edit photo',
  onCancel,
  onSave,
}) {
  const containerRef = useRef(null);
  const [img, setImg] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturate, setSaturate] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [previewShape, setPreviewShape] = useState(shape);
  const [saving, setSaving] = useState(false);
  const [boxSize, setBoxSize] = useState(320);
  const drag = useRef(null);

  // Measure the square preview box (responsive <320px on mobile) so the
  // fitted image size + canvas export math stay exact.
  useEffect(() => {
    const measure = () => {
      const w = containerRef.current?.clientWidth;
      if (w) setBoxSize(w);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [img]);

  useEffect(() => {
    setPreviewShape(shape);
  }, [shape]);

  // Load the image once so we know natural size (for fit/fill + export).
  useEffect(() => {
    if (!src) return;
    setLoadError('');
    setImg(null);
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => setImg(el);
    el.onerror = () => setLoadError('Could not load that image. Try a different file.');
    el.src = src;
  }, [src]);

  // Escape closes, body scroll locks while open.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  const clampZoom = (z) => Math.min(3, Math.max(0.5, Number(z) || 1));

  const onPointerDown = (e) => {
    drag.current = { startX: e.clientX, startY: e.clientY, orig: { ...pos } };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    const dy = e.clientY - drag.current.startY;
    setPos({ x: drag.current.orig.x + dx, y: drag.current.orig.y + dy });
  };
  const endDrag = () => {
    drag.current = null;
  };

  const onWheel = (e) => {
    // Ctrl/pinch or plain wheel over the preview zooms.
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => clampZoom(z + delta));
  };

  const rotateBy = (deg) => {
    setRotation((r) => ((r + deg) % 360 + 360) % 360);
  };

  const fillCrop = () => {
    if (!img || !containerRef.current) return;
    const S = containerRef.current.clientWidth || 320;
    const fit = Math.min(S / img.naturalWidth, S / img.naturalHeight);
    const fill = Math.max(S / img.naturalWidth, S / img.naturalHeight);
    setZoom(clampZoom(fill / fit));
    setPos({ x: 0, y: 0 });
  };

  const resetAll = () => {
    setZoom(1);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setPos({ x: 0, y: 0 });
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setGrayscale(0);
  };

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setGrayscale(0);
  };

  const handleSave = useCallback(async () => {
    if (!img || !containerRef.current) return;
    setSaving(true);
    try {
      const S = containerRef.current?.clientWidth || boxSize || 320;
      const O = outputSize;
      const canvas = document.createElement('canvas');
      canvas.width = O;
      canvas.height = O;
      const ctx = canvas.getContext('2d');
      const lower = String(fileName || '').toLowerCase();
      const wantPng = lower.endsWith('.png');
      const wantWebp = lower.endsWith('.webp');
      const mime = wantPng ? 'image/png' : wantWebp ? 'image/webp' : 'image/jpeg';
      if (mime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, O, O);
      } else {
        ctx.clearRect(0, 0, O, O);
      }
      ctx.save();
      ctx.filter = filterString({ brightness, contrast, saturate, grayscale });
      ctx.translate(O / 2 + pos.x * (O / S), O / 2 + pos.y * (O / S));
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale((flipH ? -1 : 1) * zoom, (flipV ? -1 : 1) * zoom);
      const fitO = Math.min(O / img.naturalWidth, O / img.naturalHeight);
      const dw = img.naturalWidth * fitO;
      const dh = img.naturalHeight * fitO;
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error('Export failed — try again.'))),
          mime,
          0.92,
        );
      });
      // Canvas may refuse webp in some browsers → fall back to png.
      let outBlob = blob;
      let outName = fileName || 'photo.jpg';
      if (mime === 'image/webp' && blob.type !== 'image/webp') {
        outName = outName.replace(/\.\w+$/, '.png');
      }
      if (!/\.(jpe?g|png|webp)$/i.test(outName)) outName += mime === 'image/png' ? '.png' : '.jpg';
      const file = new File([outBlob], outName, { type: outBlob.type || mime });
      onSave?.(file);
    } catch (err) {
      setLoadError(err?.message || 'Export failed — try again.');
    } finally {
      setSaving(false);
    }
  }, [img, brightness, contrast, saturate, grayscale, pos, rotation, flipH, flipV, zoom, fileName, outputSize, boxSize, onSave]);

  const slider = 'w-full accent-[#6366F1]';
  const btn = 'rounded-md border border-white/15 px-2.5 py-1.5 text-xs text-white hover:border-accent disabled:opacity-50';
  const btnActive = 'rounded-md border border-accent bg-accent/15 px-2.5 py-1.5 text-xs font-semibold text-accent hover:opacity-90';

  // Fitted display size so export math matches the preview exactly.
  let dispW = boxSize;
  let dispH = boxSize;
  if (img) {
    const fit = Math.min(boxSize / img.naturalWidth, boxSize / img.naturalHeight);
    dispW = img.naturalWidth * fit;
    dispH = img.naturalHeight * fit;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-black/70 p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-panel p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white">{title}</h2>
            <p className="mt-0.5 text-xs text-neutral-500">Drag to crop · scroll or slide to zoom · rotate, flip & fix lighting</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Close editor" className="rounded-md border border-white/15 px-2 py-1 text-sm text-neutral-300 hover:border-accent hover:text-white">
            ✕
          </button>
        </div>

        {/* Preview */}
        <div className="mt-4 flex flex-col items-center gap-2">
          <div
            ref={containerRef}
            onWheel={onWheel}
            className={`relative aspect-square w-full max-w-[320px] select-none overflow-hidden border border-white/10 bg-panel2 ${
              previewShape === 'circle' ? 'rounded-full' : 'rounded-xl'
            }`}
            style={{ touchAction: 'none' }}
          >
            {!img && !loadError && (
              <p className="absolute inset-0 flex items-center justify-center text-xs text-neutral-500">Loading image…</p>
            )}
            {loadError && (
              <p className="absolute inset-0 flex items-center justify-center p-4 text-center text-xs text-red-400">{loadError}</p>
            )}
            {img && (
              <img
                src={src}
                alt="Edit preview"
                draggable={false}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                className="absolute left-1/2 top-1/2 max-w-none cursor-grab active:cursor-grabbing"
                style={{
                  width: `${dispW}px`,
                  height: `${dispH}px`,
                  transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) rotate(${rotation}deg) scale(${flipH ? -zoom : zoom}, ${flipV ? -zoom : zoom})`,
                  filter: filterString({ brightness, contrast, saturate, grayscale }),
                }}
              />
            )}
            {/* Crop guides */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/3 top-0 h-full w-px bg-white/15" />
              <div className="absolute left-2/3 top-0 h-full w-px bg-white/15" />
              <div className="absolute left-0 top-1/3 h-px w-full bg-white/15" />
              <div className="absolute left-0 top-2/3 h-px w-full bg-white/15" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPreviewShape('circle')} className={previewShape === 'circle' ? btnActive : btn}>
              ● Circle
            </button>
            <button type="button" onClick={() => setPreviewShape('square')} className={previewShape === 'square' ? btnActive : btn}>
              ■ Square
            </button>
            <span className="text-[11px] text-neutral-500">preview shape only — saved file stays square</span>
          </div>
        </div>

        {/* Crop / rotate */}
        <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-panel2 p-3">
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-semibold">Zoom · {zoom.toFixed(2)}×</span>
              <div className="flex gap-1.5">
                <button type="button" className={btn} onClick={() => setZoom((z) => clampZoom(z - 0.1))}>−</button>
                <button type="button" className={btn} onClick={() => setZoom((z) => clampZoom(z + 0.1))}>+</button>
                <button type="button" className={btn} onClick={fillCrop} disabled={!img} title="Zoom so the photo fills the crop with no gaps">
                  Fill crop
                </button>
              </div>
            </div>
            <input type="range" min="0.5" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(clampZoom(e.target.value))} className={slider} aria-label="Zoom" />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-neutral-300">
              <span className="font-semibold">Rotate · {Math.round(rotation)}°</span>
              <div className="flex gap-1.5">
                <button type="button" className={btn} onClick={() => rotateBy(-90)}>⟲ 90°</button>
                <button type="button" className={btn} onClick={() => rotateBy(90)}>⟳ 90°</button>
                <button type="button" className={btn} onClick={() => setRotation(0)}>Reset</button>
              </div>
            </div>
            <input type="range" min="0" max="360" step="1" value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className={slider} aria-label="Rotate" />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button type="button" onClick={() => setFlipH((v) => !v)} className={flipH ? btnActive : btn} aria-pressed={flipH}>
              {flipH ? '✓ ' : ''}Flip horizontal
            </button>
            <button type="button" onClick={() => setFlipV((v) => !v)} className={flipV ? btnActive : btn} aria-pressed={flipV}>
              {flipV ? '✓ ' : ''}Flip vertical
            </button>
            <button type="button" onClick={resetAll} className={`${btn} ml-auto`}>
              Reset all
            </button>
          </div>
        </div>

        {/* Lighting / filters */}
        <details className="mt-3 rounded-lg border border-white/10 bg-panel2 p-3" open>
          <summary className="cursor-pointer text-xs font-semibold text-neutral-300">Lighting & filters</summary>
          <div className="mt-3 space-y-2.5">
            <div>
              <div className="flex justify-between text-xs text-neutral-400"><span>Brightness</span><span>{brightness}%</span></div>
              <input type="range" min="50" max="200" step="1" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className={slider} aria-label="Brightness" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-400"><span>Contrast</span><span>{contrast}%</span></div>
              <input type="range" min="50" max="200" step="1" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} className={slider} aria-label="Contrast" />
            </div>
            <div>
              <div className="flex justify-between text-xs text-neutral-400"><span>Saturation</span><span>{saturate}%</span></div>
              <input type="range" min="0" max="200" step="1" value={saturate} onChange={(e) => setSaturate(Number(e.target.value))} className={slider} aria-label="Saturation" />
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setGrayscale((g) => (g ? 0 : 100))} className={grayscale ? btnActive : btn} aria-pressed={!!grayscale}>
                {grayscale ? '✓ ' : ''}Black & white
              </button>
              <button type="button" onClick={resetFilters} className={`${btn} ml-auto`}>Reset lighting</button>
            </div>
          </div>
        </details>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-md border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:border-accent hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!img || !!loadError || saving}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accentHover disabled:opacity-60"
          >
            {saving ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
