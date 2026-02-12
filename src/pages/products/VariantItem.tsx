import { useMemo, useState } from "react";
import {
  useUploadVariantImageMutation,
  useUpdateProductVariantMutation,
  useDeleteProductVariantMutation,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PencilLine,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Ruler,
  Boxes,
  Loader2Icon,
} from "lucide-react";
import clsx from "clsx";
import { COLORS, SIZES } from "./constants";

type VariantImage = { url: string; publicId?: string };
type VariantSize = { size: string; stock: number };

type Variant = {
  _id: string;
  color: string;
  sizes: VariantSize[];
  images: VariantImage[];
  selectedFiles?: File[];
};

type Props = {
  variant: Variant;
  productId: string;
  language: "ar" | "en";
};

const VariantItem = ({ variant, productId, language }: Props) => {
  const isRTL = language === "ar";

  const t = useMemo(() => {
    return isRTL
      ? {
          colorImages: "اللون / الصور",
          size: "المقاس",
          stock: "المخزون",
          actions: "إجراءات",
          edit: "تعديل",
          delete: "حذف",
          editVariant: "تعديل المتغير",
          editVariantDesc: "قم بتعديل اللون والمقاسات والمخزون والصور ثم احفظ.",
          color: "اللون",
          selectColor: "اختر اللون",
          sizes: "المقاسات",
          selectSize: "اختر المقاس",
          addSize: "إضافة مقاس",
          images: "الصور",
          uploadHint: "يمكنك إضافة صور جديدة أو حذف الصور الحالية",
          cancel: "إلغاء",
          save: "حفظ",
          saving: "جاري الحفظ...",
          deleting: "جاري الحذف...",
          deleteConfirm: "هل أنت متأكد أنك تريد حذف هذا المتغير؟",
          deleted: "تم حذف المتغير",
          updated: "تم تحديث المتغير",
          deleteFailed: "فشل حذف المتغير",
          updateFailed: "فشل تحديث المتغير",
          uploadFailed: "فشل رفع صور المتغير",
          noImages: "لا توجد صور",
          empty: "—",
          stockNonNegative: "المخزون لا يمكن أن يكون سالبًا",
          duplicateSize: "لا يمكن تكرار نفس المقاس",
          minOneSize: "يجب أن يحتوي المتغير على مقاس واحد على الأقل",
        }
      : {
          colorImages: "Color / Images",
          size: "Size",
          stock: "Stock",
          actions: "Actions",
          edit: "Edit",
          delete: "Delete",
          editVariant: "Edit Variant",
          editVariantDesc: "Edit color, sizes, stock, and images — then save.",
          color: "Color",
          selectColor: "Select Color",
          sizes: "Sizes",
          selectSize: "Select Size",
          addSize: "Add Size",
          images: "Images",
          uploadHint: "You can add new images or remove existing ones",
          cancel: "Cancel",
          save: "Save",
          saving: "Saving...",
          deleting: "Deleting...",
          deleteConfirm: "Are you sure you want to delete this variant?",
          deleted: "Variant deleted successfully",
          updated: "Variant updated successfully",
          deleteFailed: "Failed to delete variant",
          updateFailed: "Failed to update variant",
          uploadFailed: "Variant image upload failed",
          noImages: "No images",
          empty: "—",
          stockNonNegative: "Stock can't be negative",
          duplicateSize: "Duplicate size is not allowed",
          minOneSize: "Variant must have at least one size",
        };
  }, [isRTL]);

  const [localVariant, setLocalVariant] = useState<Variant>({
    ...variant,
    images: Array.isArray(variant?.images) ? variant.images : [],
    sizes: Array.isArray(variant?.sizes) ? variant.sizes : [],
  });

  const [isOpen, setIsOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [updateProductVariant, { isLoading: updating }] = useUpdateProductVariantMutation();
  const [uploadVariantImage] = useUploadVariantImageMutation();
  const [deleteProductVariant] = useDeleteProductVariantMutation();

  const validate = () => {
    if (!localVariant.sizes || localVariant.sizes.length === 0) {
      toast.error(t.minOneSize);
      return false;
    }
    if (localVariant.sizes.some((s) => !s.size)) {
      toast.error(t.selectSize);
      return false;
    }
    if (localVariant.sizes.some((s) => Number(s.stock) < 0)) {
      toast.error(t.stockNonNegative);
      return false;
    }
    const uniq = new Set(localVariant.sizes.map((s) => s.size));
    if (uniq.size !== localVariant.sizes.length) {
      toast.error(t.duplicateSize);
      return false;
    }
    return true;
  };

  const handleDeleteVariant = async () => {
    const ok = window.confirm(t.deleteConfirm);
    if (!ok) return;

    setDeleting(true);
    try {
      await deleteProductVariant({ productId, variantId: localVariant._id }).unwrap();
      toast.success(t.deleted);
      setLocalVariant(null as any);
    } catch (error: any) {
      toast.error(error?.data?.message || t.deleteFailed);
    } finally {
      setDeleting(false);
    }
  };

  const handleUploadImages = async () => {
    let updatedImages: VariantImage[] = [...(localVariant.images || [])];

    const files = localVariant.selectedFiles || [];
    if (files.length > 0) {
      for (const file of files) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          const res = await uploadVariantImage(formData).unwrap();
          if (Array.isArray(res?.images)) {
            res.images.forEach((img: any) =>
              updatedImages.push({ url: img.imageUrl, publicId: img.publicId }),
            );
          } else if (res?.imageUrl) {
            updatedImages.push({ url: res.imageUrl, publicId: res.publicId });
          }
        } catch (error: any) {
          toast.error(error?.data?.message || t.uploadFailed);
        }
      }
    }

    return updatedImages;
  };

  const handleUpdateProductVariant = async () => {
    if (!validate()) return;

    const images = await handleUploadImages();

    try {
      const updatedVariant = await updateProductVariant({
        productId,
        variantId: localVariant._id,
        color: localVariant.color,
        sizes: localVariant.sizes,
        images,
      }).unwrap();

      setLocalVariant({
        ...updatedVariant,
        selectedFiles: [],
        images: Array.isArray(updatedVariant?.images) ? updatedVariant.images : [],
        sizes: Array.isArray(updatedVariant?.sizes) ? updatedVariant.sizes : [],
      });

      toast.success(t.updated);
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || t.updateFailed);
    }
  };

  if (!localVariant) return null;

  const card = "rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm";
  const tile = "rounded-2xl border border-neutral-200 bg-white";

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className={clsx(card, "mt-4 overflow-hidden")}>
      {/* Header row */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-neutral-950">
            {isRTL ? "متغير" : "Variant"} •{" "}
            <span className="text-neutral-600">{localVariant.color || t.empty}</span>
          </p>
          <p className="text-xs text-neutral-500">
            {(localVariant.sizes?.length || 0) + " " + (isRTL ? "مقاسات" : "sizes")} •{" "}
            {(localVariant.images?.length || 0) + " " + (isRTL ? "صور" : "images")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
            <PencilLine className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleDeleteVariant}
            disabled={deleting}
            className={clsx(
              "inline-flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition",
              deleting
                ? "bg-rose-200 text-rose-900 cursor-not-allowed"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
            )}>
            {deleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Bento grid view */}
      <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* IMAGES ONLY (one side) */}
        <div className={clsx(tile, "p-2 lg:col-span-5")}>
          {/* Bigger images */}
          <div className=" ">
            {localVariant.images?.length ? (
              localVariant.images.map((img, i) => (
                <div
                  key={i}
                  className="relative w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 aspect-[5/4] ">
                  <img
                    src={img.url}
                    alt={`variant-${i}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center bg-neutral-50 rounded-2xl border border-neutral-200 aspect-[5/4] lg:aspect-[16/10]">
                <ImageIcon className="w-6 h-6 text-neutral-400" />
              </div>
            )}
          </div>
        </div>

        {/* SIZES / STOCK ONLY (other side) - color removed from here */}
        <div className={clsx(tile, "p-4 lg:col-span-7")}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center">
                <Ruler className="h-4 w-4 text-neutral-900" />
              </div>
              <div>
                <div className="text-xs text-neutral-500">{t.sizes}</div>
                <div className="text-sm font-semibold text-neutral-950">
                  {localVariant.sizes?.length ? `${localVariant.sizes.length}` : t.empty}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-500">
              <Boxes className="h-4 w-4" />
              <span>
                {localVariant.sizes?.reduce((acc, s) => acc + (Number(s.stock) || 0), 0)}{" "}
                {isRTL ? "قطعة" : "items"}
              </span>
            </div>
          </div>

          <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-3 py-2 text-right font-semibold">{t.size}</th>
                  <th className="px-3 py-2 text-right font-semibold">{t.stock}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {localVariant.sizes?.map((s, idx) => (
                  <tr key={idx} className="text-neutral-900">
                    <td className="px-3 py-2 font-semibold">{s.size || t.empty}</td>
                    <td className="px-3 py-2">{s.stock ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-2xl p-0 overflow-hidden max-h-[90vh] flex flex-col rounded-3xl">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 border-b bg-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold">{t.editVariant}</DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                {t.editVariantDesc}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-6 bg-neutral-50 space-y-4">
            {/* Color */}
            <div className={clsx(tile, "p-4")}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{t.color}</p>
                  <p className="text-xs text-neutral-500">
                    {isRTL ? "اكتب اللون أو اختره" : "Type or select a color"}
                  </p>
                </div>

                <span
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: localVariant.color?.toLowerCase() || "transparent" }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                <div className="sm:col-span-7">
                  <input
                    value={localVariant.color}
                    onChange={(e) => setLocalVariant({ ...localVariant, color: e.target.value })}
                    placeholder="Black / White / Red"
                    className="w-full rounded-xl border px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-5">
                  <select
                    value=""
                    onChange={(e) =>
                      e.target.value && setLocalVariant({ ...localVariant, color: e.target.value })
                    }
                    className="w-full rounded-xl border px-3 py-2 text-sm">
                    <option value="">{t.selectColor}</option>
                    {COLORS.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Sizes */}
            <div className={clsx(tile, "p-4")}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold">{t.sizes}</p>
                  <p className="text-xs text-neutral-500">
                    {isRTL ? "اكتب المقاس أو اختره" : "Type or select a size"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setLocalVariant({
                      ...localVariant,
                      sizes: [...localVariant.sizes, { size: "", stock: 0 }],
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 text-white px-3 py-2 text-xs font-semibold">
                  <Plus size={14} />
                  {t.addSize}
                </button>
              </div>

              <div className="space-y-3">
                {localVariant.sizes.map((row, idx) => {
                  const updateRow = (patch: any) => {
                    const next = localVariant.sizes.map((r, i) =>
                      i === idx ? { ...r, ...patch } : r,
                    );
                    setLocalVariant({ ...localVariant, sizes: next });
                  };

                  return (
                    <div key={idx} className="rounded-xl border bg-white p-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-5">
                          <input
                            value={row.size}
                            onChange={(e) => updateRow({ size: e.target.value })}
                            placeholder="XS / S / M / Custom"
                            className="w-full rounded-xl border px-3 py-2 text-sm"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <select
                            value=""
                            onChange={(e) => e.target.value && updateRow({ size: e.target.value })}
                            className="w-full rounded-xl border px-3 py-2 text-sm">
                            <option value="">{t.selectSize}</option>
                            {SIZES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <input
                            type="number"
                            min={0}
                            value={row.stock}
                            onChange={(e) => updateRow({ stock: Number(e.target.value) || 0 })}
                            className="w-full rounded-xl border px-3 py-2 text-sm text-center"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              const next = localVariant.sizes.filter((_, i) => i !== idx);
                              setLocalVariant({ ...localVariant, sizes: next });
                            }}
                            className="h-10 w-10 rounded-xl border bg-rose-50 text-rose-700 grid place-items-center">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Images */}
            <div className={clsx(tile, "p-4")}>
              <p className="text-sm font-semibold mb-2">{t.images}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {localVariant.images.length ? (
                  localVariant.images.map((img, i) => (
                    <div
                      key={i}
                      className="relative w-full overflow-hidden rounded-2xl border bg-white aspect-[5/4]">
                      <img
                        src={img.url}
                        className="absolute inset-0 w-full h-full object-cover"
                        alt={`img-${i}`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLocalVariant({
                            ...localVariant,
                            images: localVariant.images.filter((_, x) => x !== i),
                          })
                        }
                        className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 shadow">
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-neutral-500">{t.noImages}</p>
                )}
              </div>

              <input
                type="file"
                multiple
                onChange={(e) =>
                  setLocalVariant({
                    ...localVariant,
                    selectedFiles: e.target.files ? Array.from(e.target.files) : [],
                  })
                }
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t bg-white shrink-0 flex justify-end gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-xl border font-semibold">
              {t.cancel}
            </button>

            <button
              onClick={handleUpdateProductVariant}
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-neutral-950 text-white font-semibold inline-flex items-center gap-2">
              {updating && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {updating ? t.saving : t.save}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariantItem;
