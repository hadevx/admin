import { useDispatch, useSelector } from "react-redux";
import { Check, Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { SKINS } from "@/lib/themes";
import { setSkin, setTheme } from "@/redux/slices/themeSlice";
import type { RootState } from "@/redux/store";

type Lang = "en" | "ar";

/**
 * Colour-scheme picker for Settings.
 *
 * Each card previews the skin in the mode the user is currently in, so what
 * they see on the card is what the app becomes when they pick it.
 */
function ThemePicker({ language }: { language: Lang }) {
  const dispatch = useDispatch();
  const { theme, skin } = useSelector((state: RootState) => state.theme);
  const isDark = theme === "dark";
  const isRTL = language === "ar";

  const t = {
    modeTitle: isRTL ? "الوضع" : "Mode",
    modeHint: isRTL
      ? "فاتح أو داكن — كل ثيم يدعم الاثنين."
      : "Light or dark — every theme supports both.",
    light: isRTL ? "فاتح" : "Light",
    dark: isRTL ? "داكن" : "Dark",
    schemeTitle: isRTL ? "نظام الألوان" : "Colour scheme",
    schemeHint: isRTL
      ? "المعاينة تعرض الثيم بالوضع الحالي."
      : "Previews are shown in your current mode.",
    selected: isRTL ? "محدد" : "Selected",
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Mode */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">{t.modeTitle}</h3>
          <p className="text-xs text-muted-foreground">{t.modeHint}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => dispatch(setTheme("light"))}
            aria-pressed={!isDark}
            className={clsx("ws-chip", !isDark && "ws-chip-active")}>
            <Sun className="size-3.5" />
            {t.light}
          </button>
          <button
            type="button"
            onClick={() => dispatch(setTheme("dark"))}
            aria-pressed={isDark}
            className={clsx("ws-chip", isDark && "ws-chip-active")}>
            <Moon className="size-3.5" />
            {t.dark}
          </button>
        </div>
      </div>

      {/* Colour scheme */}
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-bold text-foreground">{t.schemeTitle}</h3>
          <p className="text-xs text-muted-foreground">{t.schemeHint}</p>
        </div>

        <div
          role="radiogroup"
          aria-label={t.schemeTitle}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SKINS.map((option) => {
            const swatch = isDark ? option.preview.dark : option.preview.light;
            const isActive = option.id === skin;

            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => dispatch(setSkin(option.id))}
                className={clsx(
                  "group relative overflow-hidden rounded-xl border p-3 text-start transition-all duration-200",
                  "hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
                  isActive
                    ? "border-emphasis ring-2 ring-foreground/15"
                    : "border-border hover:border-foreground/25",
                )}>
                {/* Miniature of the shell: sidebar rail, page background, card */}
                <span
                  aria-hidden
                  className="flex h-20 w-full overflow-hidden rounded-lg border border-black/10 dark:border-white/10"
                  style={{ backgroundColor: swatch.bg }}>
                  <span
                    className="h-full w-1/4 border-e border-black/10 dark:border-white/10"
                    style={{ backgroundColor: swatch.sidebar }}>
                    <span
                      className="mx-1.5 mt-2 block h-1.5 rounded-full"
                      style={{ backgroundColor: swatch.accent, opacity: 0.9 }}
                    />
                    <span
                      className="mx-1.5 mt-1.5 block h-1.5 rounded-full"
                      style={{ backgroundColor: swatch.accent, opacity: 0.25 }}
                    />
                    <span
                      className="mx-1.5 mt-1.5 block h-1.5 rounded-full"
                      style={{ backgroundColor: swatch.accent, opacity: 0.25 }}
                    />
                  </span>

                  <span className="flex flex-1 flex-col gap-1.5 p-2">
                    <span
                      className="block h-2 w-1/2 rounded-full"
                      style={{ backgroundColor: swatch.accent, opacity: 0.75 }}
                    />
                    <span
                      className="block flex-1 rounded-md border border-black/5 dark:border-white/10"
                      style={{ backgroundColor: swatch.card }}
                    />
                  </span>
                </span>

                <span className="mt-3 flex items-center justify-between gap-2">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-bold text-foreground">
                      {option.label[language]}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {option.description[language]}
                    </span>
                  </span>

                  <span
                    className={clsx(
                      "grid size-6 shrink-0 place-items-center rounded-full border transition-all",
                      isActive
                        ? "border-transparent bg-emphasis text-emphasis-foreground"
                        : "border-border text-transparent group-hover:border-foreground/30",
                    )}>
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                </span>

                {isActive ? <span className="sr-only">{t.selected}</span> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ThemePicker;
