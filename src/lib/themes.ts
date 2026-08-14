/**
 * UI themes ("skins") the admin can choose from in Settings.
 *
 * A skin is an independent axis from light/dark mode: every skin defines both,
 * so switching skin keeps whichever mode the user is in. The palettes live in
 * `index.css` under `:root[data-skin="…"]`; this file is only the catalogue the
 * picker renders from, plus the swatches shown in its preview.
 */

export type Skin = "ivory" | "graphite" | "ocean" | "forest" | "bronze" | "pink";

export const DEFAULT_SKIN: Skin = "ivory";

export type SkinOption = {
  id: Skin;
  label: { en: string; ar: string };
  description: { en: string; ar: string };
  /** Preview swatches — must mirror the palette in index.css. */
  preview: {
    light: { bg: string; sidebar: string; card: string; accent: string };
    dark: { bg: string; sidebar: string; card: string; accent: string };
  };
};

export const SKINS: SkinOption[] = [
  {
    id: "ivory",
    label: { en: "Ivory", ar: "عاجي" },
    description: { en: "Warm off-white, black accents", ar: "أبيض دافئ بلمسات سوداء" },
    preview: {
      light: { bg: "#f7f4ec", sidebar: "#fffdf8", card: "#ffffff", accent: "#1c1a15" },
      dark: { bg: "#08090c", sidebar: "#0b0d12", card: "#101218", accent: "#fafafa" },
    },
  },
  {
    id: "graphite",
    label: { en: "Graphite", ar: "رمادي" },
    description: { en: "Cool neutral grey", ar: "رمادي محايد بارد" },
    preview: {
      light: { bg: "#f4f5f7", sidebar: "#ffffff", card: "#ffffff", accent: "#18181b" },
      dark: { bg: "#08090c", sidebar: "#0b0d12", card: "#101218", accent: "#fafafa" },
    },
  },
  {
    id: "ocean",
    label: { en: "Ocean", ar: "أزرق" },
    description: { en: "Cool blue, navy accents", ar: "أزرق هادئ بلمسات كحلية" },
    preview: {
      light: { bg: "#eef3f8", sidebar: "#ffffff", card: "#ffffff", accent: "#14384f" },
      dark: { bg: "#060d14", sidebar: "#08111a", card: "#0d1720", accent: "#dbeefb" },
    },
  },
  {
    id: "forest",
    label: { en: "Forest", ar: "أخضر" },
    description: { en: "Muted green, deep accents", ar: "أخضر هادئ بلمسات غامقة" },
    preview: {
      light: { bg: "#eef4ee", sidebar: "#ffffff", card: "#ffffff", accent: "#1f4230" },
      dark: { bg: "#060c08", sidebar: "#08110a", card: "#0d1610", accent: "#d9f0e0" },
    },
  },
  {
    id: "bronze",
    label: { en: "Bronze", ar: "برونزي" },
    description: { en: "Warm sand, bronze accents", ar: "رملي دافئ بلمسات برونزية" },
    preview: {
      light: { bg: "#f9f2e6", sidebar: "#fffdf8", card: "#ffffff", accent: "#4a3218" },
      dark: { bg: "#0b0803", sidebar: "#0f0b05", card: "#16110a", accent: "#f2e2c4" },
    },
  },
  {
    id: "pink",
    label: { en: "Pink", ar: "وردي" },
    description: { en: "Soft blush, deep rose accents", ar: "وردي ناعم بلمسات غامقة" },
    preview: {
      light: { bg: "#fbf0f3", sidebar: "#fffafb", card: "#ffffff", accent: "#7d2545" },
      dark: { bg: "#0d0509", sidebar: "#120709", card: "#1a0f14", accent: "#f7d8e3" },
    },
  },
];

const SKIN_IDS = SKINS.map((s) => s.id);

export const isSkin = (v: unknown): v is Skin =>
  typeof v === "string" && (SKIN_IDS as string[]).includes(v);
