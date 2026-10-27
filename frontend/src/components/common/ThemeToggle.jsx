import { HiOutlineSun, HiOutlineMoon } from 'react-icons/hi2';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-paper hover:text-ink ${className}`}
    >
      {theme === 'dark' ? <HiOutlineSun className="h-4.5 w-4.5" /> : <HiOutlineMoon className="h-4.5 w-4.5" />}
    </button>
  );
}
