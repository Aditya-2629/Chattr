import { PaletteIcon } from "lucide-react";
import { useThemeStore } from "../store/useThemeStore";
import { THEMES } from "../constants";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

const ThemeSelector = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleThemeChange = async (themeName) => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for UX
      setTheme(themeName);
      setIsOpen(false);
      toast.success(`Theme changed to ${THEMES.find(t => t.name === themeName)?.label}`);
    } catch (error) {
      console.error('Error changing theme:', error);
      toast.error('Failed to change theme');
    } finally {
      setLoading(false);
    }
  };

  // Apply theme to document
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return (
    <div className="dropdown dropdown-end">
      {/* DROPDOWN TRIGGER */}
      <button 
        tabIndex={0} 
        className="btn btn-ghost btn-circle btn-sm sm:btn-md hover:bg-base-300/50 active:bg-base-300/70 transition-all"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        aria-label="Change theme"
        title="Change theme"
      >
        {loading ? (
          <div className="loading loading-spinner loading-sm"></div>
        ) : (
          <PaletteIcon className="size-5 sm:size-6" />
        )}
      </button>

      {isOpen && (
        <div
          tabIndex={0}
          className="dropdown-content mt-2 p-1 shadow-2xl bg-base-200 backdrop-blur-lg rounded-2xl
          w-56 border border-base-content/10 max-h-80 overflow-y-auto z-50"
        >
          <div className="space-y-1">
            {THEMES.map((themeOption) => (
              <button
                key={themeOption.name}
                className={`
                w-full px-4 py-3 rounded-xl flex items-center gap-3 transition-all duration-200
                hover:scale-[0.98] active:scale-95
                ${
                  theme === themeOption.name
                    ? "bg-primary/20 text-primary border-l-4 border-primary shadow-lg"
                    : "hover:bg-base-content/10 active:bg-base-content/15"
                }
              `}
                onClick={() => handleThemeChange(themeOption.name)}
                disabled={loading}
              >
                <PaletteIcon className="size-4 flex-shrink-0" />
                <span className="text-sm font-medium flex-1 text-left">{themeOption.label}</span>
                {/* THEME PREVIEW COLORS */}
                <div className="ml-auto flex gap-1">
                  {themeOption.colors.map((color, i) => (
                    <span
                      key={i}
                      className="size-2 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                {theme === themeOption.name && (
                  <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default ThemeSelector;
