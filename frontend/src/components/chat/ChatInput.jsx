import { useState, useRef } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi2';

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const autoGrow = (e) => {
    setValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-border bg-surface/95 px-4 py-4 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-end gap-2 rounded-3xl border border-border bg-paper px-4 py-2.5 shadow-soft transition focus-within:border-navy-600 focus-within:shadow-lifted focus-within:ring-2 focus-within:ring-navy-100">
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={autoGrow}
          onKeyDown={handleKeyDown}
          placeholder="Message PathGuider AI…"
          className="max-h-40 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-ink-soft/70"
          disabled={disabled}
        />
        <button
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-600 text-white transition hover:bg-navy-700 disabled:cursor-not-allowed disabled:bg-border-strong disabled:text-ink-soft"
          aria-label="Send message"
        >
          <HiOutlinePaperAirplane className="h-4 w-4" />
        </button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-ink-soft/70">
        PathGuider AI can make mistakes on policy details. Confirm deadlines and amounts with the relevant office.
      </p>
    </div>
  );
}
