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
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  PencilLine,
  Trash2,
  Image as ImageIcon,
  Plus,
  X,
  Palette,
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
  // local-only
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
      // hide item after deletion
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
            className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 text-xs font-semibold text-neutral-900 hover:bg-neutral-50 transition">
            <PencilLine className="h-4 w-4" />
            {t.edit}
          </button>

          <button
            type="button"
            onClick={handleDeleteVariant}
            disabled={deleting}
            className={clsx(
              "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition",
              deleting
                ? "bg-rose-200 text-rose-900 cursor-not-allowed"
                : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100",
            )}>
            {deleting ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {t.delete}
          </button>
        </div>
      </div>

      {/* Bento grid view */}
      <div className="px-4 sm:px-5 pb-5 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Images + color */}
        <div className={clsx(tile, "p-4 lg:col-span-5")}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center">
                <Palette className="h-4 w-4 text-neutral-900" />
              </div>
              <div>
                <div className="text-xs text-neutral-500">{t.colorImages}</div>
                <div className="text-sm font-semibold text-neutral-950">
                  {localVariant.color || t.empty}
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold text-neutral-500">
              {localVariant.images?.length ? `${localVariant.images.length}` : t.noImages}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {localVariant.images?.length ? (
              localVariant.images.map((img, i) => (
                <div key={i} className="relative h-14 w-14">
                  <img
                    src={img.url}
                    alt={`variant-${i}`}
                    className="h-full w-full object-cover rounded-xl border border-neutral-200"
                  />
                </div>
              ))
            ) : (
              <div className="h-14 w-14 flex items-center justify-center bg-neutral-50 rounded-xl border border-neutral-200">
                <ImageIcon className="w-5 h-5 text-neutral-400" />
              </div>
            )}
          </div>
        </div>

        {/* Sizes / Stock */}
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
                  <th className="px-3 py-2 text-left font-semibold">{t.size}</th>
                  <th className="px-3 py-2 text-left font-semibold">{t.stock}</th>
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
        <DialogContent className="max-w-xl rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">{t.editVariant}</DialogTitle>
            <DialogDescription className="text-sm">{t.editVariantDesc}</DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-4">
            {/* Color */}
            <div className={clsx(tile, "p-4")}>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">{t.color}</label>
              <select
                value={localVariant.color}
                onChange={(e) => setLocalVariant({ ...localVariant, color: e.target.value })}
                className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/25">
                <option value="">{t.selectColor}</option>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sizes */}
            <div className={clsx(tile, "p-4")}>
              <div className="flex items-center justify-between gap-3">
                <label className="block text-sm font-semibold text-neutral-900">{t.sizes}</label>
                <button
                  type="button"
                  onClick={() =>
                    setLocalVariant({
                      ...localVariant,
                      sizes: [...localVariant.sizes, { size: "", stock: 0 }],
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl bg-neutral-950 text-white px-3 py-2 text-xs font-semibold hover:bg-neutral-900 transition">
                  <Plus size={14} />
                  {t.addSize}
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {localVariant.sizes.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-7">
                      <select
                        value={s.size}
                        onChange={(e) => {
                          const sizes = localVariant.sizes.map((item, i) =>
                            i === idx ? { ...item, size: e.target.value } : item,
                          );
                          setLocalVariant({ ...localVariant, sizes });
                        }}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/25">
                        <option value="">{t.selectSize}</option>
                        {SIZES.map((sz) => (
                          <option key={sz} value={sz}>
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-4">
                      <input
                        type="number"
                        min={0}
                        value={s.stock}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          const sizes = localVariant.sizes.map((item, i) =>
                            i === idx ? { ...item, stock: isNaN(next) ? 0 : next } : item,
                          );
                          setLocalVariant({ ...localVariant, sizes });
                        }}
                        className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/25 text-center"
                      />
                    </div>

                    <div className="col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => {
                          const sizes = localVariant.sizes.filter((_, i) => i !== idx);
                          setLocalVariant({ ...localVariant, sizes });
                        }}
                        className="h-10 w-10 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 transition grid place-items-center"
                        aria-label="remove size">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Images */}
            <div className={clsx(tile, "p-4")}>
              <label className="block text-sm font-semibold text-neutral-900 mb-2">
                {t.images}
              </label>

              {/* Preview existing images with remove option */}
              <div className="flex flex-wrap gap-2 mb-3">
                {localVariant.images?.length ? (
                  localVariant.images.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16">
                      <img
                        src={img.url}
                        alt={`variant-img-${idx}`}
                        className="w-full h-full object-cover rounded-xl border border-neutral-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setLocalVariant({
                            ...localVariant,
                            images: localVariant.images.filter((_, i) => i !== idx),
                          })
                        }
                        className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow"
                        aria-label="remove image">
                        <X size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-neutral-500">{t.noImages}</div>
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
                className="w-full cursor-pointer rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
              />

              <p className="text-xs text-neutral-500 mt-2">{t.uploadHint}</p>

              {/* Show selected files */}
              {localVariant.selectedFiles?.length ? (
                <div className="mt-3 rounded-2xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-xs font-semibold text-neutral-700">
                    {isRTL ? "الملفات الجديدة:" : "New files:"}
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-xs text-neutral-600 space-y-1">
                    {localVariant.selectedFiles.map((f, i) => (
                      <li key={i} className="break-all">
                        {f.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-white border border-neutral-200 rounded-2xl hover:bg-neutral-50 font-semibold">
              {t.cancel}
            </button>
            <button
              type="button"
              onClick={handleUpdateProductVariant}
              disabled={updating}
              className="px-4 py-2 bg-neutral-950 text-white rounded-2xl hover:bg-neutral-900 disabled:opacity-50 font-semibold inline-flex items-center gap-2">
              {updating ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
              {updating ? t.saving : t.save}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariantItem;
