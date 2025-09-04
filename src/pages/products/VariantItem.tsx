import { useState } from "react";
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
} from "@/components/ui/dialog";
import { PencilLine, Trash2, Image as ImageIcon, Plus, X } from "lucide-react";
import { COLORS, SIZES } from "./constants";

const VariantItem = ({ variant, productId, language }: any) => {
  const [localVariant, setLocalVariant] = useState(variant);
  const [isOpen, setIsOpen] = useState(false);

  const [updateProductVariant, { isLoading }] = useUpdateProductVariantMutation();
  const [uploadVariantImage] = useUploadVariantImageMutation();
  const [deleteProductVariant] = useDeleteProductVariantMutation();

  const handleDeleteVariant = async () => {
    if (!confirm("Are you sure you want to delete this variant?")) return;
    try {
      await deleteProductVariant({ productId, variantId: localVariant._id }).unwrap();
      toast.success(language === "ar" ? "تم حذف المتغير" : "Variant deleted successfully");
      setLocalVariant(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete variant");
    }
  };

  const handleUploadImages = async () => {
    let updatedImages = [...(localVariant.images || [])];

    if (localVariant.selectedFiles && localVariant.selectedFiles.length > 0) {
      for (const file of localVariant.selectedFiles) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          const res = await uploadVariantImage(formData).unwrap();
          if (Array.isArray(res.images)) {
            res.images.forEach((img: any) =>
              updatedImages.push({ url: img.imageUrl, publicId: img.publicId })
            );
          } else {
            updatedImages.push({ url: res.imageUrl, publicId: res.publicId });
          }
        } catch (error: any) {
          toast.error(error?.data?.message || "Variant image upload failed");
        }
      }
    }

    return updatedImages;
  };

  const handleUpdateProductVariant = async () => {
    const images = await handleUploadImages();
    try {
      const updatedVariant = await updateProductVariant({
        productId,
        variantId: localVariant._id,
        color: localVariant.color,
        sizes: localVariant.sizes,
        images,
      }).unwrap();

      setLocalVariant(updatedVariant);
      toast.success(language === "ar" ? "تم تحديث المتغير" : "Variant updated successfully");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update variant");
    }
  };

  if (!localVariant) return null;

  return (
    <div className="border mt-2 rounded-2xl bg-white overflow-hidden p-3">
      {/* Variant Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="px-3 py-2 text-left">
              {language === "ar" ? "اللون / الصور" : "Color / Images"}
            </th>
            <th className="px-3 py-2 text-left">{language === "ar" ? "المقاس" : "Size"}</th>
            <th className="px-3 py-2 text-left">{language === "ar" ? "المخزون" : "Stock"}</th>
            <th className="px-3 py-2 text-center">{language === "ar" ? "إجراءات" : "Actions"}</th>
          </tr>
        </thead>
        <tbody>
          {localVariant.sizes.map((s: any, idx: any) => (
            <tr key={idx}>
              {idx === 0 && (
                <td rowSpan={localVariant.sizes.length} className="px-3 py-3 align-top">
                  <div className="flex items-center flex-wrap gap-2">
                    {localVariant.images.length > 0 ? (
                      localVariant.images.map((img: any, i: any) => (
                        <div key={i} className="relative w-12 h-12">
                          <img
                            src={img.url}
                            alt={`variant-${i}`}
                            className="w-full h-full object-cover rounded border"
                          />
                        </div>
                      ))
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded border">
                        <ImageIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                    <span>{localVariant.color}</span>
                  </div>
                </td>
              )}
              <td className="px-3 py-2">{s.size}</td>
              <td className="px-3 py-2">{s.stock}</td>
              {idx === 0 && (
                <td rowSpan={localVariant.sizes.length} className="px-3 py-2 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => setIsOpen(true)}
                      className="p-2 border bg-zinc-50 rounded hover:bg-gray-100">
                      <PencilLine size={18} />
                    </button>
                    <button
                      onClick={handleDeleteVariant}
                      className="p-2 border border-red-200 rounded bg-red-50 text-red-600 hover:bg-red-200">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              {language === "ar" ? "تعديل المتغير" : "Edit Variant"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Color */}
            <div>
              <label className="block font-medium mb-1">
                {language === "ar" ? "اللون" : "Color"}
              </label>
              <select
                value={localVariant.color}
                onChange={(e) => setLocalVariant({ ...localVariant, color: e.target.value })}
                className="border px-3 py-2 rounded w-full">
                <option value="">{language === "ar" ? "اختر اللون" : "Select Color"}</option>
                {COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sizes */}
            <div>
              <label className="block font-medium mb-2">
                {language === "ar" ? "المقاسات" : "Sizes"}
              </label>
              {localVariant.sizes.map((s: any, idx: any) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <select
                    value={s.size}
                    onChange={(e) => {
                      const sizes = localVariant.sizes.map((item: any, i: any) =>
                        i === idx ? { ...item, size: e.target.value } : item
                      );
                      setLocalVariant({ ...localVariant, sizes });
                    }}
                    className="border px-2 py-2 rounded flex-1">
                    <option value="">{language === "ar" ? "اختر المقاس" : "Select Size"}</option>
                    {SIZES.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={s.stock}
                    onChange={(e) => {
                      const sizes = localVariant.sizes.map((item: any, i: any) =>
                        i === idx ? { ...item, stock: Number(e.target.value) } : item
                      );
                      setLocalVariant({ ...localVariant, sizes });
                    }}
                    className="border px-2 py-2 rounded w-20 text-center"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const sizes = localVariant.sizes.filter((_: any, i: any) => i !== idx);
                      setLocalVariant({ ...localVariant, sizes });
                    }}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setLocalVariant({
                    ...localVariant,
                    sizes: [...localVariant.sizes, { size: "", stock: 0 }],
                  })
                }
                className="mt-2 px-4 py-2 bg-black text-white rounded flex items-center gap-2">
                <Plus size={16} /> {language === "ar" ? "إضافة مقاس" : "Add Size"}
              </button>
            </div>

            {/* Images */}
            <div>
              <label className="block font-medium mb-1">
                {language === "ar" ? "الصور" : "Images"}
              </label>

              {/* Preview existing images with remove option */}
              <div className="flex flex-wrap gap-2 mb-2">
                {localVariant.images?.map((img: any, idx: any) => (
                  <div key={idx} className="relative w-16 h-16">
                    <img
                      src={img.url}
                      alt={`variant-img-${idx}`}
                      className="w-full h-full object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setLocalVariant({
                          ...localVariant,
                          images: localVariant.images.filter((_: any, i: any) => i !== idx),
                        })
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Upload new images */}
              <input
                type="file"
                multiple
                onChange={(e) =>
                  setLocalVariant({
                    ...localVariant,
                    selectedFiles: e.target.files ? Array.from(e.target.files) : [],
                  })
                }
                className="border px-2 py-2 rounded w-full cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === "ar"
                  ? "يمكنك إضافة صور جديدة أو حذف الصور الحالية"
                  : "You can add new images or remove existing ones"}
              </p>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleUpdateProductVariant}
              disabled={isLoading}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-black/80 disabled:opacity-50">
              {language === "ar" ? "حفظ" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariantItem;
