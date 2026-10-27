import { HiOutlineSparkles } from 'react-icons/hi2';

export default function TypingIndicator() {
  return (
    <div className="flex animate-fade-in-up justify-start">
      <div className="flex gap-3">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-600 text-white">
          <HiOutlineSparkles className="h-4 w-4" />
        </div>
        <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border-l-2 border-gold-400 bg-surface px-4 py-3.5 shadow-soft">
          <span className="thread-dot h-1.5 w-1.5 rounded-full bg-navy-600" />
          <span className="thread-dot h-1.5 w-1.5 rounded-full bg-navy-600" />
          <span className="thread-dot h-1.5 w-1.5 rounded-full bg-navy-600" />
        </div>
      </div>
    </div>
  );
}
