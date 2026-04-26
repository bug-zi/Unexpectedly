import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRinging, DotsThree } from '@phosphor-icons/react';
import { Sun, Moon, Monitor, ChevronLeft, Palette } from 'lucide-react';
import { useThemeStore, type ThemeMode } from '@/stores/themeStore';

const themeOptions: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: 'light', label: '浅色', icon: Sun },
  { mode: 'dark', label: '深色', icon: Moon },
  { mode: 'system', label: '跟随系统', icon: Monitor },
];

interface MoreMenuProps {
  navigate: (path: string) => void;
}

export function MoreMenu({ navigate }: MoreMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAppearance, setShowAppearance] = useState(false);
  const themeMode = useThemeStore((s) => s.themeMode);
  const setThemeMode = useThemeStore((s) => s.setThemeMode);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowAppearance(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => { setIsOpen(!isOpen); setShowAppearance(false); }}
        className="flex items-center gap-2 px-2 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        <DotsThree size={18} weight="duotone" />
        <span>更多</span>
      </motion.button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            key={showAppearance ? 'appearance' : 'main'}
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-40 py-1 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 z-50"
          >
            {showAppearance ? (
              <>
                <button
                  onClick={() => setShowAppearance(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <ChevronLeft size={16} />
                  <span>外观</span>
                </button>
                <div className="border-t border-gray-200/50 dark:border-gray-700/50" />
                {themeOptions.map(({ mode, label, icon: Icon }) => (
                  <button
                    key={mode}
                    onClick={() => setThemeMode(mode)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                      themeMode === mode
                        ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{label}</span>
                    {themeMode === mode && (
                      <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                    )}
                  </button>
                ))}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <BellRinging size={16} />
                  <span>提醒</span>
                </button>
                <button
                  onClick={() => setShowAppearance(true)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <Palette size={16} />
                  <span>外观</span>
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
