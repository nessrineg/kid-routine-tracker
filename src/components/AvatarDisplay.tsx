import { ALL_AVATARS, getAvatarMeta, getAvatarImageUrl } from "@/lib/avatar";
import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useRef, useState } from "react";

interface Props {
  avatar: string;
  name?: string;
  size?: number;
  className?: string;
  animate?: boolean;
}

function isCustomPhoto(avatar: string) {
  return avatar.startsWith('data:') || avatar.startsWith('blob:');
}

export function AvatarDisplay({ avatar, name, size = 64, className = "", animate = false }: Props) {
  const custom = isCustomPhoto(avatar);
  const meta = custom ? ALL_AVATARS[0] : getAvatarMeta(avatar);
  const imgUrl = custom ? avatar : getAvatarImageUrl(meta.key);
  const [imgError, setImgError] = useState(false);
  const fontSize = size * 0.52;

  const style: React.CSSProperties = {
    width: size,
    height: size,
    background: custom
      ? 'linear-gradient(135deg, #e0e7ff, #c7d2fe)'
      : `linear-gradient(135deg, ${meta.bg[0]}, ${meta.bg[1]})`,
    boxShadow: custom
      ? `0 4px 16px #818cf855`
      : `0 4px 16px ${meta.bg[1]}55`,
    flexShrink: 0,
  };

  const Wrapper = animate ? motion.div : 'div';
  const animProps = animate
    ? {
        animate: { y: [0, -9, 0] },
        transition: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' as const },
      }
    : {};

  return (
    <Wrapper
      {...animProps}
      title={name ?? meta.label}
      className={`rounded-full flex items-center justify-center select-none overflow-hidden ${className}`}
      style={style}
    >
      {!imgError ? (
        <img
          src={imgUrl}
          alt={name ?? meta.label}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
          draggable={false}
        />
      ) : (
        <span style={{ fontSize, lineHeight: 1 }} role="img" aria-label={meta.label}>
          {meta.emoji}
        </span>
      )}
    </Wrapper>
  );
}

interface PickerProps {
  value: string;
  onChange: (v: string) => void;
  defaultTab?: string;
}

async function compressImage(file: File, maxPx = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AvatarPicker({ value, onChange }: PickerProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const custom = isCustomPhoto(value);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      onChange(dataUrl);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Upload button */}
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className={clsx(
          "flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed transition-all font-semibold text-sm",
          custom
            ? "border-violet-400 bg-violet-50 text-violet-700"
            : "border-slate-300 bg-white text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50"
        )}
      >
        {uploading ? (
          <span className="animate-spin text-lg">⏳</span>
        ) : custom ? (
          <>
            <span className="text-lg">📷</span>
            <span>تغيير الصورة</span>
            <span className="text-xs font-normal opacity-60">✓ صورة مرفوعة</span>
          </>
        ) : (
          <>
            <span className="text-lg">📷</span>
            <span>رفع صورة من الجهاز</span>
          </>
        )}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {/* Preset avatars grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 max-h-64 overflow-y-auto">
        {ALL_AVATARS.map(({ key, emoji, label, bg }) => {
          const selected = !custom && value === key;
          const imgUrl = getAvatarImageUrl(key);
          return (
            <button
              key={key}
              type="button"
              title={label}
              onClick={() => onChange(key)}
              className={clsx(
                "relative rounded-2xl flex items-center justify-center aspect-square transition-all duration-200 hover:scale-110 overflow-hidden",
                selected && "ring-3 ring-offset-2 ring-violet-400 scale-110 shadow-lg"
              )}
              style={{
                background: `linear-gradient(135deg, ${bg[0]}, ${bg[1]})`,
                boxShadow: selected ? `0 0 0 3px ${bg[1]}88` : undefined,
              }}
            >
              <AvatarPickerImg src={imgUrl} alt={label} emoji={emoji} />
              {selected && (
                <span className="absolute -top-1.5 -right-1.5 bg-violet-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AvatarPickerImg({ src, alt, emoji }: { src: string; alt: string; emoji: string }) {
  const [err, setErr] = useState(false);
  if (err) return <span className="text-3xl" role="img" aria-label={alt}>{emoji}</span>;
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setErr(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
      draggable={false}
    />
  );
}
