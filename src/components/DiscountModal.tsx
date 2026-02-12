import { useMemo } from "react";
import { useSelector } from "react-redux";
import { Loader2Icon, Tag } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { texts } from "@/pages/products/translation";
import clsx from "clsx";

type RootState = { language: { lang: "ar" | "en" } };

type Props = {
  isDiscountModalOpen: boolean;
  setIsDiscountModalOpen: (v: boolean) => void;

  hasDiscount: boolean;
  setHasDiscount: (v: boolean) => void;

  discountBy: number;
  setDiscountBy: (v: number) => void;

  discountedPrice: number;
  busy: boolean;
  handleUpdateProduct: () => void;

  PERCENTAGE: number[];
};

/** ✅ NEW: Settings-style switch (same UI as your Settings page) */
function SettingsStyleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className={clsx(
          "w-12 h-7 rounded-full transition border",
          checked ? "bg-emerald-600 border-emerald-600" : "bg-zinc-200 border-zinc-200",
        )}
      />
      <span
        className={clsx(
          "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </label>
  );
}

const DiscountModal = ({
  isDiscountModalOpen,
  setIsDiscountModalOpen,
  hasDiscount,
  setHasDiscount,
  discountBy,
  setDiscountBy,
  discountedPrice,
  busy,
  handleUpdateProduct,
  PERCENTAGE,
}: Props) => {
  const language = useSelector((state: RootState) => state.language.lang);
  const isRTL = language === "ar";
  const t = useMemo(() => texts[language], [language]);

  return (
    <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
      <DialogContent
        dir={isRTL ? "rtl" : "ltr"}
        className="sm:max-w-md rounded-3xl border border-neutral-200 bg-white p-0 shadow-xl overflow-hidden">
        {/* header strip */}
        <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-2xl bg-neutral-900 flex items-center justify-center shrink-0">
              <Tag className="h-5 w-5 text-white" />
            </div>

            <DialogHeader className="space-y-1">
              <DialogTitle className="text-base font-bold text-neutral-950">
                {t.discountTitle}
              </DialogTitle>

              <DialogDescription className="text-sm text-neutral-600 leading-relaxed">
                {isRTL
                  ? "تطبيق خصم على المنتج وحساب السعر النهائي تلقائيًا."
                  : "Enable a discount and auto-calculate the final price."}
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* body */}
        <div className="px-5 py-4 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-neutral-950">{t.enableDiscount}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {isRTL ? "فعّل أو عطّل الخصم." : "Toggle discount on/off."}
                </p>
              </div>

              {/* ✅ ONLY CHANGED PART: switch */}
              <SettingsStyleSwitch checked={hasDiscount} onChange={setHasDiscount} />
            </div>
          </div>

          {hasDiscount ? (
            <>
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <label className="text-sm font-semibold text-neutral-900">
                  {t.discountPercentage}
                </label>

                <select
                  value={discountBy}
                  onChange={(e) => setDiscountBy(Number(e.target.value))}
                  className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10">
                  <option value={0} disabled>
                    -- {t.choosePercentage} --
                  </option>
                  {PERCENTAGE.map((p) => (
                    <option key={p} value={p}>
                      {Math.round(p * 100)}%
                    </option>
                  ))}
                </select>

                <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-sm font-semibold text-neutral-900">
                    {t.discountedPrice}{" "}
                    <span className="text-emerald-700">{discountedPrice.toFixed(3)} KD</span>
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
              {isRTL ? "الخصم غير مفعّل." : "Discount is disabled."}
            </div>
          )}
        </div>

        {/* footer */}
        <DialogFooter className="px-5 py-4 border-t border-neutral-200 bg-white flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsDiscountModalOpen(false)}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {t.cancel}
          </button>

          <button
            type="button"
            onClick={handleUpdateProduct}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-950 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {busy ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
            {busy ? t.saving : t.save}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DiscountModal;
