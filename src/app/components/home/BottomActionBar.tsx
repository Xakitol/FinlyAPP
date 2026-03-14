import { Plus } from 'lucide-react';

interface BottomActionBarProps {
  onPrimaryClick: () => void;
}

export function BottomActionBar({ onPrimaryClick }: BottomActionBarProps) {
  return (
    <div className="sticky bottom-4 z-20 pt-2">
      <button
        type="button"
        onClick={onPrimaryClick}
        className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-4 text-white shadow-[0_18px_40px_rgba(124,58,237,0.35)] transition-all active:scale-[0.99]"
      >
        <div className="flex items-center justify-center gap-2">
          <Plus className="h-5 w-5" />
          <span className="font-medium">בואו נעדכן</span>
        </div>
      </button>
    </div>
  );
}
