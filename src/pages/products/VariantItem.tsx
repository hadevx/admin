// VariantItem.tsx
import { useState } from "react";
import {
  useUploadVariantImageMutation,
  useUpdateProductVariantMutation,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const COLORS = ["Red", "Blue", "Green", "Black", "White"];
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const VariantItem = ({ variant, productId, language }: any) => {
  const [localVariant, setLocalVariant] = useState(variant);
  const [isOpen, setIsOpen] = useState(false);

  console.log(localVariant._id);
  const [updateProductVariant, { isLoading }] = useUpdateProductVariantMutation();
  const [uploadVariantImage] = useUploadVariantImageMutation();

  const handleUploadImages = async () => {
    if (!localVariant.selectedFiles || localVariant.selectedFiles.length === 0)
      return localVariant.images;

    const uploadedImages = [...localVariant.images];
    for (const file of localVariant.selectedFiles) {
      const formData = new FormData();
      formData.append("images", file);
      try {
        const res: any = await uploadVariantImage(formData).unwrap();
        if (Array.isArray(res.images)) {
          res.images.forEach((img: any) =>
            uploadedImages.push({ url: img.imageUrl, publicId: img.publicId })
          );
        } else {
          uploadedImages.push({ url: res.imageUrl, publicId: res.publicId });
        }
      } catch (error: any) {
        toast.error(error?.data?.message || "Variant image upload failed");
        return localVariant.images;
      }
    }
    return uploadedImages;
  };

  const handleSave = async () => {
    if (!localVariant._id) return toast.error("Variant ID missing");

    const images = await handleUploadImages();
    try {
      await updateProductVariant({
        productId,
        variantId: localVariant._id,
        color: localVariant.color,
        sizes: localVariant.sizes,
        images,
      }).unwrap();

      setLocalVariant((prev: any) => ({ ...prev, images }));
      toast.success(language === "ar" ? "تم تحديث المتغير" : "Variant updated successfully");
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update variant");
    }
  };

  return (
    <div className="border rounded-lg bg-white mb-4">
      {/* Variant Table */}
      <table className="w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2">{language === "ar" ? "اللون" : "Color"}</th>
            <th className="border px-3 py-2">{language === "ar" ? "المقاس" : "Size"}</th>
            <th className="border px-3 py-2">{language === "ar" ? "المخزون" : "Stock"}</th>
            <th className="border px-3 py-2">{language === "ar" ? "السعر" : "Price"}</th>
            <th className="border px-3 py-2">{language === "ar" ? "الصور" : "Images"}</th>
            <th className="border px-3 py-2">{language === "ar" ? "إجراءات" : "Actions"}</th>
          </tr>
        </thead>
        <tbody>
          {localVariant.sizes.map((s: any, idx: any) => (
            <tr key={idx}>
              {idx === 0 && (
                <td rowSpan={localVariant.sizes.length} className="border px-3 py-2">
                  {localVariant.color}
                </td>
              )}
              <td className="border px-3 py-2">{s.size}</td>
              <td className="border px-3 py-2">{s.stock}</td>
              <td className="border px-3 py-2">{s.price} KD</td>
              {idx === 0 && (
                <td rowSpan={localVariant.sizes.length} className="border px-3 py-2">
                  <div className="flex gap-2 flex-wrap">
                    {localVariant.images?.map((img: any, i: any) => (
                      <img
                        key={i}
                        src={img.url}
                        alt={`variant-${localVariant.color}-${i}`}
                        className="w-12 h-12 object-cover rounded border"
                      />
                    ))}
                  </div>
                </td>
              )}
              {idx === 0 && (
                <td rowSpan={localVariant.sizes.length} className="border px-3 py-2">
                  <button
                    onClick={() => setIsOpen(true)}
                    className="px-2 py-1 bg-blue-500 text-white rounded">
                    {language === "ar" ? "تعديل" : "Edit"}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Edit Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{language === "ar" ? "تعديل المتغير" : "Edit Variant"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <select
              value={localVariant.color}
              onChange={(e) => setLocalVariant({ ...localVariant, color: e.target.value })}
              className="border px-2 py-1 rounded w-full">
              <option value="">{language === "ar" ? "اختر اللون" : "Select Color"}</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {localVariant.sizes.map((s: any, idx: any) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={s.size}
                  onChange={(e) => {
                    const sizes = [...localVariant.sizes];
                    sizes[idx].size = e.target.value;
                    setLocalVariant({ ...localVariant, sizes });
                  }}
                  className="border px-2 py-1 rounded">
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
                    const sizes = [...localVariant.sizes];
                    sizes[idx].stock = Number(e.target.value);
                    setLocalVariant({ ...localVariant, sizes });
                  }}
                  placeholder="Stock"
                  className="border px-2 py-1 rounded w-20"
                />
                <input
                  type="number"
                  value={s.price}
                  onChange={(e) => {
                    const sizes = [...localVariant.sizes];
                    sizes[idx].price = Number(e.target.value);
                    setLocalVariant({ ...localVariant, sizes });
                  }}
                  placeholder="Price"
                  className="border px-2 py-1 rounded w-20"
                />
              </div>
            ))}

            <input
              type="file"
              multiple
              onChange={(e) =>
                setLocalVariant({
                  ...localVariant,
                  selectedFiles: e.target.files ? Array.from(e.target.files) : [],
                })
              }
              className="mt-2"
            />
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-4">
            <button onClick={() => setIsOpen(false)} className="px-4 py-1 bg-gray-300 rounded">
              {language === "ar" ? "إلغاء" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="px-4 py-1 bg-blue-500 text-white rounded">
              {language === "ar" ? "حفظ" : "Save"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VariantItem;
