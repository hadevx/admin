// src/pages/products/components/CreateProductModal.tsx
import React, { useMemo, useState } from "react";
import clsx from "clsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  ImagePlus,
  Plus,
  Trash2,
  Package,
  Boxes,
  Palette,
  Ruler,
  X,
  ChevronRight,
} from "lucide-react";

import { texts } from "../pages/products/translation";
import { COLORS } from "../pages/products/constants";

type Variant = {
  color: string;
  images: File[];
  sizes: { size: string; price: string; stock: string }[];
};

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  language: "ar" | "en";

  tree: any;
  renderCategoryOptions: (nodes: any, level?: number) => any;

  // form state
  name: string;
  setName: (v: string) => void;

  price: number | undefined;
  setPrice: (v: number | undefined) => void;

  category: string;
  setCategory: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  countInStock: number | undefined;
  setCountInStock: (v: number | undefined) => void;

  imageFiles: File[];
  setImageFiles: (v: File[]) => void;

  // variants state
  variants: Variant[];
  setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;

  // actions
  onCreate: () => void;
  onReset: () => void;

  creating: boolean;
  uploading: boolean;
};

export default function CreateProductModal({
  open,
  onOpenChange,
  language,
  tree,
  renderCategoryOptions,
  name,
  setName,
  price,
  setPrice,
  category,
  setCategory,
  description,
  setDescription,
  countInStock,
  setCountInStock,
  imageFiles,
  setImageFiles,
  variants,
  setVariants,
  onCreate,
  onReset,
  creating,
  uploading,
}: Props) {
  const isRTL = language === "ar";
  const t = texts[language];

  const [isVariantsOpen, setIsVariantsOpen] = useState(false);

  // --- shared styles (minimal, modern) ---
  const card = "rounded-3xl border border-neutral-200 bg-white shadow-sm";
  const tile = "rounded-2xl border border-neutral-200 bg-white";
  const input =
    "w-full rounded-xl  border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10";
  const label = "text-xs font-semibold text-neutral-600";
  const hint = "text-[11px] text-neutral-500";

  // --- variants helpers ---
  const addColorVariant = () =>
    setVariants((prev) => [
      ...prev,
      { color: "", images: [], sizes: [{ size: "", price: "", stock: "" }] },
    ]);

  const updateColorVariant = (index: number, patch: Partial<Variant>) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...patch } : v)));
  };

  const handleColorImages = (index: number, files: File[]) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], images: files };
      return updated;
    });
  };

  const addSizeToVariant = (index: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        sizes: [...updated[index].sizes, { size: "", price: "", stock: "" }],
      };
      return updated;
    });
  };

  const updateSizeInVariant = (
    colorIndex: number,
    sizeIndex: number,
    patch: Partial<Variant["sizes"][number]>,
  ) => {
    setVariants((prev) => {
      const updated = [...prev];
      const sizes = updated[colorIndex].sizes.map((s, i) =>
        i === sizeIndex ? { ...s, ...patch } : s,
      );
      updated[colorIndex] = { ...updated[colorIndex], sizes };
      return updated;
    });
  };

  const removeColorVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const removeSizeFromVariant = (colorIndex: number, sizeIndex: number) => {
    setVariants((prev) => {
      const updated = [...prev];
      const sizes = updated[colorIndex].sizes.filter((_, i) => i !== sizeIndex);
      updated[colorIndex] = {
        ...updated[colorIndex],
        sizes: sizes.length ? sizes : [{ size: "", price: "", stock: "" }],
      };
      return updated;
    });
  };

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  // --- colors grouping (kept) ---
  const groupedColors = useMemo(() => {
    if (COLORS && typeof COLORS === "object" && !Array.isArray(COLORS)) {
      return Object.entries(COLORS as Record<string, string[]>).map(([label, colors]) => ({
        label,
        colors,
      }));
    }

    const groups: Record<string, string[]> = {
      Neutrals: [],
      Reds: [],
      Pinks: [],
      Oranges: [],
      Yellows: [],
      Browns: [],
      Greens: [],
      Cyans: [],
      Blues: [],
      Purples: [],
      Lights: [],
      Other: [],
    };

    const add = (g: keyof typeof groups, c: string) => groups[g].push(c);

    for (const c of COLORS as unknown as string[]) {
      const s = c.toLowerCase();
      if (
        s.includes("black") ||
        s.includes("white") ||
        s.includes("gray") ||
        s.includes("grey") ||
        s.includes("silver") ||
        s.includes("beige") ||
        s.includes("ivory") ||
        s.includes("snow") ||
        s.includes("linen")
      ) {
        add("Neutrals", c);
      } else if (
        s.includes("red") ||
        s.includes("crimson") ||
        s.includes("maroon") ||
        s.includes("burgundy") ||
        s.includes("firebrick") ||
        s.includes("tomato") ||
        s.includes("salmon") ||
        s.includes("coral")
      ) {
        add("Reds", c);
      } else if (s.includes("pink") || s.includes("rose") || s.includes("lavenderblush")) {
        add("Pinks", c);
      } else if (
        s.includes("orange") ||
        s.includes("peach") ||
        s.includes("papaya") ||
        s.includes("moccasin") ||
        s.includes("bisque")
      ) {
        add("Oranges", c);
      } else if (
        s.includes("yellow") ||
        s.includes("gold") ||
        s.includes("khaki") ||
        s.includes("lemon")
      ) {
        add("Yellows", c);
      } else if (
        s.includes("brown") ||
        s.includes("tan") ||
        s.includes("chocolate") ||
        s.includes("sienna") ||
        s.includes("peru") ||
        s.includes("saddle") ||
        s.includes("burlywood") ||
        s.includes("rosybrown")
      ) {
        add("Browns", c);
      } else if (
        s.includes("green") ||
        s.includes("olive") ||
        s.includes("lime") ||
        s.includes("chartreuse") ||
        s.includes("forest") ||
        s.includes("seagreen") ||
        s.includes("springgreen")
      ) {
        add("Greens", c);
      } else if (
        s.includes("cyan") ||
        s.includes("aqua") ||
        s.includes("turquoise") ||
        s.includes("teal") ||
        s.includes("aquamarine")
      ) {
        add("Cyans", c);
      } else if (
        s.includes("blue") ||
        s.includes("navy") ||
        s.includes("sky") ||
        s.includes("steel") ||
        s.includes("slate") ||
        s.includes("cornflower") ||
        s.includes("dodger")
      ) {
        add("Blues", c);
      } else if (
        s.includes("purple") ||
        s.includes("violet") ||
        s.includes("indigo") ||
        s.includes("magenta") ||
        s.includes("orchid") ||
        s.includes("fuchsia") ||
        s.includes("plum") ||
        s.includes("thistle")
      ) {
        add("Purples", c);
      } else if (
        s.startsWith("light") ||
        s.includes("aliceblue") ||
        s.includes("azure") ||
        s.includes("mintcream") ||
        s.includes("seashell") ||
        s.includes("blanchedalmond") ||
        s.includes("navajowhite")
      ) {
        add("Lights", c);
      } else {
        add("Other", c);
      }
    }

    return Object.entries(groups)
      .filter(([, arr]) => arr.length > 0)
      .map(([label, colors]) => ({ label, colors }));
  }, []);

  const totalVariantStock = useMemo(() => {
    return variants.reduce((acc, v) => {
      const sum = (v.sizes || []).reduce((s, row) => s + (Number(row.stock) || 0), 0);
      return acc + sum;
    }, 0);
  }, [variants]);

  const hasVariants = variants.length > 0;

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(v) => {
          onOpenChange(v);
          if (!v) onReset();
        }}>
        <DialogContent
          dir={isRTL ? "ltr" : "ltr"}
          className="
            w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)]
            max-w-[900px] xl:max-w-[900px]
            p-0 overflow-hidden
            max-h-[90vh] flex flex-col
            rounded-3xl
          ">
          {/* Top bar */}
          <div className="px-10 sm:px-10 py-4 border-b  flex justify-end shrink-0 ">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl text-right font-bold">
                {t.addProduct}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                {isRTL
                  ? "أدخل معلومات المنتج بسرعة، ثم أضف المتغيرات عند الحاجة."
                  : "Add product info fast, then add variants only if needed."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 px-4 sm:px-6 py-5 sm:py-6">
              {/* LEFT: Main form */}
              <div className="lg:col-span-7 space-y-4" dir="rtl">
                {/* Product images */}
                <div className={clsx(card, "p-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-950">
                        {isRTL ? "صور المنتج" : "Product images"}
                      </p>
                      <p className={hint}>
                        {isRTL
                          ? "PNG / JPG — يمكن اختيار عدة صور."
                          : "PNG / JPG — multiple allowed."}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-neutral-800">
                      <ImagePlus className="h-4 w-4" />
                      {imageFiles.length}
                    </span>
                  </div>

                  <label className="mt-3  block cursor-pointer" dir="rtl">
                    <div className="rounded-2xl border-2 border-dashed border-neutral-200 bg-white px-4 py-5 hover:bg-neutral-50 transition">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-neutral-900">
                            {isRTL ? "اضغط لاختيار الصور" : "Click to choose images"}
                          </p>
                          <p className={hint}>
                            {isRTL ? "اسحب وأفلت أيضًا" : "Drag & drop also works"}
                          </p>
                        </div>
                        <ChevronRight
                          className={clsx("h-4 w-4 text-neutral-400", isRTL && "rotate-180")}
                        />
                      </div>

                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                        className="hidden"
                      />
                    </div>
                  </label>

                  {imageFiles.length > 0 ? (
                    <div className="mt-4 grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {imageFiles.map((file, i) => (
                        <div
                          key={i}
                          className="relative rounded-2xl overflow-hidden border bg-white">
                          <img
                            src={URL.createObjectURL(file)}
                            className="h-20 w-full object-cover"
                            alt="preview"
                          />
                          <button
                            type="button"
                            onClick={() => setImageFiles(imageFiles.filter((_, idx) => idx !== i))}
                            className="absolute top-2 right-2 rounded-full bg-white/90 border border-neutral-200 p-1 hover:bg-white">
                            <X className="h-3 w-3 text-neutral-700" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                {/* Core fields */}
                <div className={clsx(card, "p-4")}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6" dir="rtl">
                      <label className={label}>{t.productName}</label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isRTL ? "مثال: هودي" : "e.g. Summer Dress"}
                        className={clsx(input, "mt-2")}
                      />
                    </div>

                    <div className="sm:col-span-6" dir="rtl">
                      <label className={label}>{t.productPrice}</label>
                      <div className="relative mt-2">
                        <input
                          type="number"
                          value={price ?? ""}
                          onChange={(e) =>
                            setPrice(e.target.value === "" ? undefined : Number(e.target.value))
                          }
                          placeholder="0.000"
                          className={clsx(input, isRTL ? "pr-12" : "pr-12")}
                        />
                        <span
                          className={clsx(
                            "absolute top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500",
                            isRTL ? "right-3" : "right-3",
                          )}>
                          KD
                        </span>
                      </div>
                    </div>

                    <div className="sm:col-span-6" dir="rtl">
                      <label className={label}>{t.selectCategory}</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={clsx(input, "mt-2")}>
                        <option value="" disabled>
                          {t.selectCategory}
                        </option>
                        {tree?.length > 0 && renderCategoryOptions(tree)}
                      </select>
                    </div>

                    <div className="sm:col-span-6" dir="rtl">
                      <label className={label}>{t.productStock}</label>
                      <div className="mt-2 relative">
                        <input
                          type="number"
                          value={countInStock ?? ""}
                          disabled={hasVariants}
                          onChange={(e) =>
                            setCountInStock(
                              e.target.value === "" ? undefined : Number(e.target.value),
                            )
                          }
                          placeholder="0"
                          className={clsx(input, hasVariants && "opacity-60  cursor-not-allowed")}
                        />
                        <span
                          className={clsx(
                            "absolute top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500",
                            isRTL ? "left-3" : "right-3",
                          )}>
                          <Package className="h-4 w-4 " />
                        </span>
                      </div>

                      {hasVariants ? (
                        <p className="mt-2 text-xs text-neutral-500">
                          {isRTL
                            ? `المخزون محسوب من المتغيرات: ${totalVariantStock}`
                            : `Stock is calculated from variants: ${totalVariantStock}`}
                        </p>
                      ) : null}
                    </div>

                    <div className="sm:col-span-12" dir="rtl">
                      <label className={label}>{t.productDescription}</label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={isRTL ? "وصف مختصر وواضح..." : "Short, clear description..."}
                        className={clsx(input, "mt-2")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Minimal Variants */}
              <div className="lg:col-span-5 space-y-4">
                <div className={clsx(card, "p-4")}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-950">
                        {isRTL ? "المتغيرات" : "Variants"}
                      </p>
                      <p className={hint}>
                        {isRTL
                          ? "اختياري — ألوان ومقاسات ومخزون لكل لون."
                          : "Optional — colors, sizes and stock per color."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="secondary"
                      className="rounded-xl"
                      onClick={() => setIsVariantsOpen(true)}>
                      {isRTL ? "إدارة" : "Manage"}
                    </Button>
                  </div>

                  <Separator className="my-4 bg-black/10" />

                  {variants.length ? (
                    <div className="space-y-3">
                      {variants.map((v, idx) => {
                        const vStock = (v.sizes || []).reduce(
                          (sum, s) => sum + (Number(s.stock) || 0),
                          0,
                        );
                        return (
                          <div key={idx} className={clsx(tile, "p-3")}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span
                                    className="h-3.5 w-3.5 rounded-full border border-neutral-200"
                                    style={{
                                      backgroundColor:
                                        v.color?.trim().toLowerCase() || "transparent",
                                    }}
                                  />
                                  <p className="text-sm font-semibold text-neutral-950 truncate">
                                    {v.color || (isRTL ? `لون ${idx + 1}` : `Color ${idx + 1}`)}
                                  </p>
                                </div>
                                <p className="mt-1 text-xs text-neutral-500">
                                  {(v.sizes?.length || 0) + " " + (isRTL ? "مقاسات" : "sizes")} •{" "}
                                  {vStock + " " + (isRTL ? "قطعة" : "items")}
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeColorVariant(idx)}
                                className="h-9 w-9 rounded-xl border border-neutral-200 bg-white grid place-items-center hover:bg-neutral-50">
                                <Trash2 className="h-4 w-4 text-rose-700" />
                              </button>
                            </div>

                            {v.images?.length ? (
                              <div className="mt-3 grid grid-cols-6 gap-2">
                                {v.images.slice(0, 6).map((file, i) => (
                                  <div
                                    key={i}
                                    className="h-10 w-10 rounded-xl overflow-hidden border bg-white">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      className="h-full w-full object-cover"
                                      alt="v"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}

                      <Button
                        type="button"
                        onClick={addColorVariant}
                        className="w-full rounded-xl bg-neutral-950 hover:bg-neutral-900">
                        <Plus className="h-4 w-4 mr-2" />
                        {isRTL ? "إضافة لون" : "Add color"}
                      </Button>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed bg-white p-5 text-center">
                      <p className="text-sm font-semibold text-neutral-900">
                        {isRTL ? "بدون متغيرات" : "No variants"}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {isRTL
                          ? "إذا كان المنتج له ألوان/مقاسات، أضفها هنا."
                          : "If your product has colors/sizes, add them here."}
                      </p>
                      <Button
                        type="button"
                        variant="secondary"
                        className="mt-3 rounded-xl"
                        onClick={() => {
                          addColorVariant();
                          setIsVariantsOpen(true);
                        }}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isRTL ? "إضافة متغيرات" : "Add variants"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Quick summary */}
                <div className={clsx(tile, "p-4 bg-white/70 backdrop-blur")}>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-2xl border border-neutral-200 bg-white grid place-items-center">
                      <Boxes className="h-4 w-4 text-neutral-900" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-neutral-500">{isRTL ? "ملخص" : "Summary"}</p>
                      <p className="text-sm font-semibold text-neutral-950">
                        {variants.length
                          ? `${variants.length} ${isRTL ? "ألوان" : "colors"} • ${totalVariantStock} ${
                              isRTL ? "قطعة" : "items"
                            }`
                          : isRTL
                            ? "منتج بسيط"
                            : "Simple product"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t bg-white shrink-0">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-xl w-full sm:w-auto"
                onClick={() => onOpenChange(false)}>
                {isRTL ? "إغلاق" : "Close"}
              </Button>

              <Button
                className="rounded-xl w-full sm:w-auto bg-neutral-950 hover:bg-neutral-900"
                disabled={creating || uploading}
                onClick={onCreate}>
                {uploading ? t.uploading : creating ? t.creating : t.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================= Variants Modal (Minimal + Fast) ======================= */}
      <Dialog open={isVariantsOpen} onOpenChange={setIsVariantsOpen}>
        <DialogContent
          dir={isRTL ? "rtl" : "ltr"}
          className="
      w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)]
      max-w-[1100px] xl:max-w-4xl
      p-0 overflow-hidden
      max-h-[90vh] flex flex-col
      rounded-3xl
    ">
          {/* header */}
          <div className="px-10 sm:px-10 py-4 border-b  shrink-0 flex justify-start ">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl text-right font-bold">
                {isRTL ? "إدارة المتغيرات" : "Manage variants"}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                {isRTL
                  ? "أضف لونًا، ثم المقاسات والسعر والمخزون. الصور اختيارية."
                  : "Add a color, then sizes with price and stock. Images are optional."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* body */}
          <div className="flex-1 min-h-0 overflow-y-auto bg-neutral-50 px-4 sm:px-6 py-5">
            <div className="space-y-4">
              {variants.map((variant, i) => {
                const variantStock = (variant.sizes || []).reduce(
                  (sum, s) => sum + (Number(s.stock) || 0),
                  0,
                );

                return (
                  <div key={i} className={clsx(card, "overflow-hidden")}>
                    {/* header row */}
                    <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-neutral-950">
                          {isRTL ? "متغير" : "Variant"} •{" "}
                          <span className="text-neutral-600">{variant.color || "—"}</span>
                        </p>
                        <p className="text-xs text-neutral-500">
                          {(variant.sizes?.length || 0) + " " + (isRTL ? "مقاسات" : "sizes")} •{" "}
                          {(variant.images?.length || 0) + " " + (isRTL ? "صور" : "images")} •{" "}
                          {variantStock + " " + (isRTL ? "قطعة" : "items")}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeColorVariant(i)}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* ✅ Layout change:
                  Top row: Color (left) + Sizes (right)
                  Bottom row: Images full width
              */}
                    <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
                      {/* ✅ COLOR (first) */}
                      <div className={clsx(tile, "p-4 lg:col-span-5")}>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-9 w-9 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center">
                            <Palette className="h-4 w-4 text-neutral-900" />
                          </div>

                          <div className="min-w-0">
                            <div className="text-xs text-neutral-500">
                              {isRTL ? "اللون" : "Color"}
                            </div>
                            <div className="text-sm font-semibold text-neutral-950 truncate">
                              {variant.color || "—"}
                            </div>
                          </div>

                          <span
                            className={clsx(
                              "ml-auto h-4 w-4 rounded-full border border-neutral-200",
                              isRTL && "ml-0 mr-auto",
                            )}
                            style={{
                              backgroundColor: variant.color?.trim().toLowerCase() || "transparent",
                            }}
                            title={variant.color || ""}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                          <input
                            value={variant.color}
                            onChange={(e) => updateColorVariant(i, { color: e.target.value })}
                            placeholder="Black / White / Red"
                            className={clsx(input)}
                          />

                          <select
                            value=""
                            onChange={(e) =>
                              e.target.value && updateColorVariant(i, { color: e.target.value })
                            }
                            className={clsx(input)}>
                            <option value="">{isRTL ? "اختر لون" : "Select color"}</option>
                            {groupedColors.map((g) => (
                              <optgroup key={g.label} label={g.label}>
                                {g.colors.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>

                          <p className="text-[11px] text-neutral-500">
                            {isRTL
                              ? "اكتب اللون أو اختره من القائمة."
                              : "Type or pick from the list."}
                          </p>
                        </div>
                      </div>

                      {/* ✅ SIZES (next to color) */}
                      <div className={clsx(tile, "p-4 lg:col-span-7")}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center">
                              <Ruler className="h-4 w-4 text-neutral-900" />
                            </div>
                            <div>
                              <div className="text-xs text-neutral-500">
                                {isRTL ? "المقاسات" : "Sizes"}
                              </div>
                              <div className="text-sm font-semibold text-neutral-950">
                                {variant.sizes?.length || "—"}
                              </div>
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            className="rounded-xl"
                            onClick={() => addSizeToVariant(i)}>
                            <Plus className="h-4 w-4 mr-2" />
                            {isRTL ? "إضافة مقاس" : "Add size"}
                          </Button>
                        </div>

                        <Separator className="my-4 bg-black/10" />

                        <div className="space-y-3">
                          {variant.sizes.map((row, j) => (
                            <div
                              key={j}
                              className="rounded-2xl border border-neutral-200 bg-white p-3">
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                                {/* size */}
                                <div className="sm:col-span-5">
                                  <label className={label}>{isRTL ? "المقاس" : "Size"}</label>
                                  <input
                                    value={row.size}
                                    onChange={(e) =>
                                      updateSizeInVariant(i, j, { size: e.target.value })
                                    }
                                    placeholder="XS / M / 42"
                                    className={clsx(input, "mt-2")}
                                  />
                                </div>

                                {/* quick select */}
                                <div className="sm:col-span-4">
                                  <label className={label}>
                                    {isRTL ? "اختيار سريع" : "Quick select"}
                                  </label>
                                  <select
                                    value=""
                                    onChange={(e) =>
                                      e.target.value &&
                                      updateSizeInVariant(i, j, { size: e.target.value })
                                    }
                                    className={clsx(input, "mt-2")}>
                                    <option value="">{isRTL ? "اختر" : "Select"}</option>
                                    {SIZES.map((s) => (
                                      <option key={s} value={s}>
                                        {s}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* stock */}
                                <div className="sm:col-span-2">
                                  <label className={label}>{isRTL ? "المخزون" : "Stock"}</label>
                                  <input
                                    type="number"
                                    min={0}
                                    value={row.stock}
                                    onChange={(e) =>
                                      updateSizeInVariant(i, j, { stock: e.target.value })
                                    }
                                    placeholder="0"
                                    className={clsx(input, "mt-2")}
                                  />
                                </div>

                                {/* remove */}
                                <div className="sm:col-span-1 ">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    className="rounded-xl w-full "
                                    onClick={() => removeSizeFromVariant(i, j)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}

                          {!variant.sizes.length ? (
                            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center">
                              <p className="text-xs font-semibold text-neutral-900">
                                {isRTL ? "لا توجد مقاسات" : "No sizes yet"}
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                {isRTL ? "أضف مقاسًا واحدًا على الأقل." : "Add at least one size."}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {/* ✅ IMAGES (bottom full width) */}
                      <div className={clsx(tile, "p-4 lg:col-span-12")}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center">
                              <ImagePlus className="h-4 w-4 text-neutral-900" />
                            </div>
                            <div>
                              <div className="text-xs text-neutral-500">
                                {isRTL ? "الصور" : "Images"}
                              </div>
                              <div className="text-sm font-semibold text-neutral-950">
                                {variant.images?.length || 0}
                              </div>
                            </div>
                          </div>

                          {/* small add-box input style */}
                          <label className="cursor-pointer">
                            <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
                              <Plus className="h-4 w-4" />
                              {isRTL ? "إضافة صور" : "Add images"}
                            </div>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                if (!files.length) return;
                                handleColorImages(i, [...(variant.images || []), ...files]);
                                e.currentTarget.value = "";
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>

                        <div className="mt-3">
                          {variant.images?.length ? (
                            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                              {variant.images.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="relative h-20 rounded-2xl overflow-hidden border bg-white">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    className="h-full w-full object-cover"
                                    alt="v"
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleColorImages(
                                        i,
                                        variant.images.filter((_, x) => x !== idx),
                                      )
                                    }
                                    className="absolute top-2 right-2 rounded-full bg-white/90 border border-neutral-200 p-1 hover:bg-white">
                                    <X className="h-3 w-3 text-neutral-700" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 p-4 text-center text-xs text-neutral-500">
                              {isRTL ? "لا توجد صور" : "No images"}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Button
                type="button"
                onClick={addColorVariant}
                className="w-full rounded-xl bg-neutral-950 hover:bg-neutral-900">
                <Plus className="h-4 w-4 mr-2" />
                {isRTL ? "إضافة لون" : "Add color"}
              </Button>
            </div>
          </div>

          {/* footer */}
          <div className="px-4 sm:px-6 py-4 border-t bg-white shrink-0 flex justify-end gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => setIsVariantsOpen(false)}>
              {isRTL ? "إغلاق" : "Close"}
            </Button>
            <Button
              className="rounded-xl bg-neutral-950 hover:bg-neutral-900"
              onClick={() => setIsVariantsOpen(false)}>
              {isRTL ? "تم" : "Done"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
