import React, { useMemo, useEffect } from "react";
import clsx from "clsx";
import { useSelector } from "react-redux";
import { Loader2Icon, Palette, Ruler, Package, X, ImagePlus, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { texts } from "@/pages/products/translation";
import { COLORS, SIZES } from "../pages/products/constants"; // ✅ add SIZES

type RootState = { language: { lang: "ar" | "en" } };

type VariantSizeInput = { size: string; stock: number | "" };

type Props = {
  isAddVariantOpen: boolean;
  setIsAddVariantOpen: (v: boolean) => void;

  tOverrides?: {
    colorPreview?: string;
    filesLabel?: (n: number) => string;
  };

  // form state
  variantColor: string;
  setVariantColor: (v: string) => void;

  variantSizes: VariantSizeInput[];
  setVariantSizes: React.Dispatch<React.SetStateAction<VariantSizeInput[]>>;

  variantFiles: File[];
  setVariantFiles: (v: File[]) => void;

  // actions
  resetVariantForm: () => void;
  handleAddVariant: () => void;

  // ui state
  busy: boolean;
};

const AddVariantModal = ({
  isAddVariantOpen,
  setIsAddVariantOpen,
  variantColor,
  setVariantColor,
  variantSizes,
  setVariantSizes,
  variantFiles,
  setVariantFiles,
  resetVariantForm,
  handleAddVariant,
  busy,
  tOverrides,
}: Props) => {
  const language = useSelector((state: RootState) => state.language.lang);
  const isRTL = language === "ar";
  const t = useMemo(() => texts[language], [language]);

  const addSizeRow = () => setVariantSizes((prev) => [...prev, { size: "", stock: "" }]);

  const removeSizeRow = (idx: number) =>
    setVariantSizes((prev) => prev.filter((_, i) => i !== idx));

  const updateSizeRow = (idx: number, patch: Partial<VariantSizeInput>) =>
    setVariantSizes((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  // reset on close
  useEffect(() => {
    if (!isAddVariantOpen) return;
    // optionally: do something on open
  }, [isAddVariantOpen]);

  const fileLabel =
    tOverrides?.filesLabel ?? ((n: number) => `${n} ${isRTL ? "ملف/ملفات" : "file(s)"}`);

  const colorPreviewLabel = tOverrides?.colorPreview ?? (isRTL ? "معاينة اللون" : "Color preview");

  return (
    <Dialog
      open={isAddVariantOpen}
      onOpenChange={(open) => {
        setIsAddVariantOpen(open);
        if (!open) resetVariantForm();
      }}>
      <DialogContent
        dir={isRTL ? "rtl" : "ltr"}
        className="sm:max-w-lg rounded-3xl border border-neutral-200 bg-white p-0 shadow-xl overflow-hidden">
        {/* header strip */}
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-bold text-neutral-950">
              {t.addVariantTitle}
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 leading-relaxed">
              {t.addVariantDesc}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* body */}
        <div className="px-5 py-4 space-y-4">
          {/* Color */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-2xl bg-neutral-950 flex items-center justify-center shrink-0">
                <Palette className="h-4 w-4 text-white" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-950">
                  {t.color} <span className="text-rose-500">*</span>
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">{t.enterColor}</p>
              </div>
            </div>

            {/* input + select side-by-side */}
            <div className="grid grid-cols-12 gap-2">
              <div className="col-span-7">
                <input
                  value={variantColor}
                  onChange={(e) => setVariantColor(e.target.value)}
                  placeholder={t.enterColor}
                  className={clsx(
                    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none",
                    "focus:ring-2 focus:ring-neutral-950/10",
                    isRTL ? "text-right" : "text-left",
                  )}
                />
              </div>

              <div className="col-span-5">
                <select
                  value={variantColor}
                  onChange={(e) => setVariantColor(e.target.value)}
                  className={clsx(
                    "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none",
                    "focus:ring-2 focus:ring-neutral-950/10",
                    isRTL ? "text-right" : "text-left",
                  )}>
                  <option value="">{isRTL ? "اختر لون" : "Select color"}</option>
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
              <span
                className="h-3.5 w-3.5 rounded-full border border-neutral-200"
                style={{
                  backgroundColor: variantColor.trim().toLowerCase() || "transparent",
                }}
              />
              <span>{colorPreviewLabel}</span>
            </div>
          </div>

          {/* Sizes */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-2xl bg-neutral-950 flex items-center justify-center shrink-0">
                  <Ruler className="h-4 w-4 text-white" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-neutral-950">{t.sizes}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {isRTL ? "أضف المقاسات مع المخزون لكل مقاس." : "Add sizes with stock per size."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addSizeRow}
                className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
                <Plus className="h-4 w-4" />
                {t.addSize}
              </button>
            </div>

            <div className="space-y-2">
              {variantSizes.map((row, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-12 gap-2 items-center rounded-2xl border border-neutral-200 bg-neutral-50/60 p-2">
                  {/* ✅ Size input */}
                  <div className="col-span-4">
                    <input
                      value={row.size}
                      onChange={(e) => updateSizeRow(idx, { size: e.target.value })}
                      placeholder={t.size}
                      className={clsx(
                        "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none",
                        "focus:ring-2 focus:ring-neutral-950/10",
                        isRTL ? "text-right" : "text-left",
                      )}
                    />
                  </div>

                  {/* ✅ Size select (next to input) */}
                  <div className="col-span-3">
                    <select
                      value={row.size}
                      onChange={(e) => updateSizeRow(idx, { size: e.target.value })}
                      className={clsx(
                        "w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none",
                        "focus:ring-2 focus:ring-neutral-950/10",
                        isRTL ? "text-right" : "text-left",
                      )}>
                      <option value="">{isRTL ? "اختر مقاس" : "Select size"}</option>
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Stock */}
                  <div className="col-span-3">
                    <div className="relative">
                      <Package
                        className={clsx(
                          "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400",
                          isRTL ? "right-3" : "left-3",
                        )}
                      />
                      <input
                        value={row.stock}
                        onChange={(e) =>
                          updateSizeRow(idx, {
                            stock: e.target.value === "" ? "" : Number(e.target.value),
                          })
                        }
                        inputMode="numeric"
                        placeholder={t.qty}
                        className={clsx(
                          "w-full rounded-xl border border-neutral-200 bg-white py-2 text-sm outline-none",
                          "focus:ring-2 focus:ring-neutral-950/10",
                          isRTL ? "pr-10 pl-3 text-right" : "pl-10 pr-3 text-left",
                        )}
                      />
                    </div>
                  </div>

                  {/* Remove */}
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeSizeRow(idx)}
                      disabled={variantSizes.length === 1}
                      className={clsx(
                        "h-10 w-10 rounded-xl border border-neutral-200 bg-white grid place-items-center hover:bg-neutral-50 transition",
                        variantSizes.length === 1 && "opacity-50 cursor-not-allowed",
                      )}
                      aria-label="Remove size">
                      <X className="h-4 w-4 text-neutral-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Variant Images */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 rounded-2xl bg-neutral-950 flex items-center justify-center shrink-0">
                <ImagePlus className="h-4 w-4 text-white" />
              </div>

              <div>
                <p className="text-sm font-semibold text-neutral-950">{t.variantImages}</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {isRTL
                    ? "اختياري — صور خاصة بهذا الخيار."
                    : "Optional — images for this variant."}
                </p>
              </div>
            </div>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setVariantFiles(e.target.files ? Array.from(e.target.files) : [])}
              className={clsx(
                "block w-full text-sm text-neutral-700",
                "file:mr-4 file:rounded-xl file:border-0",
                "file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white",
                "hover:file:bg-neutral-900",
              )}
            />

            {variantFiles.length > 0 ? (
              <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="text-xs font-semibold text-neutral-900">
                  {fileLabel(variantFiles.length)}
                </p>
                <p className="mt-1 text-xs text-neutral-600 break-words">
                  <span className="font-semibold">
                    {variantFiles.map((f) => f.name).join(", ")}
                  </span>
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* footer */}
        <DialogFooter className="px-5 py-4 border-t border-neutral-200 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => {
              setIsAddVariantOpen(false);
              resetVariantForm();
            }}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleAddVariant}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {busy ? <Loader2Icon className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {t.saveVariant}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddVariantModal;
