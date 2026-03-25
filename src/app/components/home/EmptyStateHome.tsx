import { type CSSProperties } from 'react';
import { Plus, Upload } from 'lucide-react';

interface EmptyStateHomeProps {
  darkMode: boolean;
  onAddClick: () => void;
  onOpenImport: () => void;
}

const KEYFRAMES = `
  @keyframes emptyFadeUp {
    0%  { opacity: 0; transform: translateY(20px); }
    100%{ opacity: 1; transform: translateY(0); }
  }
  @keyframes emptyFloat {
    0%,100%{ transform: translateY(0); }
    50%    { transform: translateY(-6px); }
  }
`;

function glassStyle(darkMode: boolean): CSSProperties {
  return darkMode
    ? {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(180,160,255,0.07) 60%, rgba(80,60,130,0.12) 100%)',
        border: '1px solid rgba(255,255,255,0.14)',
        backdropFilter: 'blur(12px)',
      }
    : {
        background:
          'linear-gradient(145deg, rgba(255,255,255,0.72) 0%, rgba(242,236,255,0.50) 50%, rgba(220,210,255,0.40) 100%)',
        border: '1.5px solid rgba(255,255,255,0.88)',
        backdropFilter: 'blur(14px)',
      };
}

export function EmptyStateHome({ darkMode, onAddClick, onOpenImport }: EmptyStateHomeProps) {
  const text = darkMode ? 'text-white' : 'text-gray-800';
  const muted = darkMode ? 'text-white/55' : 'text-gray-500';
  const glass = glassStyle(darkMode);

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div className="flex w-full flex-col items-center gap-5 pb-8">

        {/* ── Hero area ───────────────────────────────────────────── */}
        <div
          className="flex flex-col items-center pt-6 pb-2"
          style={{ animation: 'emptyFloat 6s ease-in-out infinite' }}
        >
          {/* Icon mark */}
          <div
            className="mb-5 flex items-center justify-center rounded-3xl"
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
              boxShadow: '0 12px 32px rgba(124,58,237,0.35), inset 0 1.5px 0 rgba(255,255,255,0.24)',
              animation: 'emptyFadeUp 0.5s 0.05s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            <span style={{ fontSize: 36 }}>₪</span>
          </div>

          <h2
            className={`text-[22px] font-bold text-center tracking-tight ${text}`}
            style={{ animation: 'emptyFadeUp 0.5s 0.12s cubic-bezier(0.22,1,0.36,1) both' }}
          >
            נתחיל ביחד
          </h2>
          <p
            className={`mt-2 text-[14px] text-center leading-relaxed ${muted}`}
            style={{
              maxWidth: 220,
              animation: 'emptyFadeUp 0.5s 0.2s cubic-bezier(0.22,1,0.36,1) both',
            }}
          >
            הוסף את התנועה הראשונה שלך, או ייבא קובץ קיים
          </p>
        </div>

        {/* ── Primary action — add transaction ────────────────────── */}
        <button
          type="button"
          onClick={onAddClick}
          className="w-full flex items-center gap-4 rounded-3xl px-5 py-5 text-right active:scale-[0.97] transition-transform"
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 50%, #0ea5e9 100%)',
            boxShadow: '0 8px 0 rgba(99,102,241,0.5), 0 16px 36px rgba(99,102,241,0.3), inset 0 1.5px 0 rgba(255,255,255,0.28)',
            animation: 'emptyFadeUp 0.5s 0.28s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <Plus className="h-6 w-6 text-white" strokeWidth={2.2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-[16px] leading-tight">הוסף תנועה ראשונה</p>
            <p className="text-white/70 text-[12px] mt-0.5">הכנסה, הוצאה, או תשלום עתידי</p>
          </div>
        </button>

        {/* ── Secondary action — import file ──────────────────────── */}
        <button
          type="button"
          onClick={onOpenImport}
          className={`w-full flex items-center gap-4 rounded-3xl px-5 py-4 text-right active:scale-[0.97] transition-transform`}
          style={{
            ...glass,
            boxShadow: darkMode
              ? '0 6px 0 rgba(0,0,0,0.4), 0 10px 24px rgba(0,0,0,0.25), inset 0 1.5px 0 rgba(255,255,255,0.18)'
              : '0 6px 0 rgba(109,40,217,0.18), 0 10px 24px rgba(139,92,246,0.10), inset 0 1.5px 0 rgba(255,255,255,0.95)',
            animation: 'emptyFadeUp 0.5s 0.36s cubic-bezier(0.22,1,0.36,1) both',
          }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: darkMode ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.12)',
              border: darkMode ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(99,102,241,0.18)',
            }}
          >
            <Upload className="h-5 w-5 text-indigo-500" strokeWidth={2} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-semibold text-[15px] leading-tight ${text}`}>ייבא קובץ</p>
            <p className={`text-[11px] mt-0.5 ${muted}`}>Excel ו-CSV · PDF פחות אמין</p>
          </div>
        </button>

      </div>
    </>
  );
}
