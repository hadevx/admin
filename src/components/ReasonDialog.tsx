import { useEffect, useState } from "react";
import { Loader2Icon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type Lang = "en" | "ar";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  language: Lang;
  title: string;
  description: string;
  /** Placeholder for the free-text box. */
  placeholder: string;
  confirmLabel: string;
  loading?: boolean;
  /** Receives the trimmed reason, or "" when the admin left it blank. */
  onConfirm: (reason: string) => void;
};

const MAX_LENGTH = 500;

/**
 * Confirmation prompt with an OPTIONAL free-text reason.
 *
 * Shared by "cancel order" and "block user" so the two behave identically —
 * both record why, and both still go through when the admin has nothing to add.
 */
function ReasonDialog({
  open,
  onOpenChange,
  language,
  title,
  description,
  placeholder,
  confirmLabel,
  loading,
  onConfirm,
}: Props) {
  const [reason, setReason] = useState("");
  const isRTL = language === "ar";

  // Reset between openings so a previous draft never leaks into the next action.
  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  const t = {
    optional: isRTL ? "اختياري" : "Optional",
    cancel: isRTL ? "رجوع" : "Back",
    hint: isRTL
      ? "يمكنك تركه فارغًا. سيظهر هذا السبب في السجل."
      : "You can leave this blank. The reason is saved with the record.",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-start">{title}</DialogTitle>
          <DialogDescription className="text-start">{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          <div className="mb-1.5 flex items-baseline justify-between gap-2">
            <label htmlFor="reason-field" className="ws-label mb-0">
              {placeholder}
            </label>
            <span className="ws-pill ws-pill-neutral text-[10px]">{t.optional}</span>
          </div>

          <textarea
            id="reason-field"
            value={reason}
            onChange={(e) => setReason(e.target.value.slice(0, MAX_LENGTH))}
            rows={3}
            maxLength={MAX_LENGTH}
            placeholder={placeholder}
            className="ws-input resize-none"
          />

          <div className="mt-1 flex items-baseline justify-between gap-2">
            <p className="text-xs text-muted-foreground">{t.hint}</p>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {reason.length}/{MAX_LENGTH}
            </span>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="ws-btn-secondary ws-btn-sm"
            onClick={() => onOpenChange(false)}
            disabled={loading}>
            {t.cancel}
          </button>

          <button
            type="button"
            className="ws-btn-danger ws-btn-sm"
            disabled={loading}
            onClick={() => onConfirm(reason.trim())}>
            {loading ? <Loader2Icon className="size-4 animate-spin" /> : null}
            {confirmLabel}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ReasonDialog;
