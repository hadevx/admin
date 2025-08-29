import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { PencilLine, Loader2Icon } from "lucide-react";
import Lottie from "lottie-react";
import upload from "./uploading.json";

import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetProductsQuery,
  useUploadProductImageMutation,
  useGetCategoriesTreeQuery,
  useUploadVariantImageMutation,
} from "../../redux/queries/productApi";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function ProductDetails() {
  const language = useSelector((state: any) => state.language.lang); // 'ar' or 'en'
  const dir = language === "ar" ? "rtl" : "ltr";

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<number>();
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCountInStock, setNewCountInStock] = useState<number>();
  const [newDescription, setNewDescription] = useState("");
  const [clickEditProduct, setClickEditProduct] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<any[]>([]);

  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { data: product, refetch, isLoading: loadingProduct } = useGetProductByIdQuery(productId);
  const { data: categoryTree } = useGetCategoriesTreeQuery(undefined);

  const [deleteProduct, { isLoading: loadingDeleteProduct }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: loadingUpdateProduct }] = useUpdateProductMutation();
  const { refetch: refetchProducts } = useGetProductsQuery(undefined);
  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();
  const [uploadVariantImage] = useUploadVariantImageMutation();

  // --- Variant functions ---
  const addVariant = () => {
    setVariants([
      ...variants,
      { options: { color: "", size: "" }, price: 0, stock: 0, _id: Date.now().toString() },
    ]);
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...variants];
    if (field.startsWith("options.")) {
      const optionKey = field.split(".")[1];
      updated[index] = {
        ...updated[index],
        options: { ...updated[index].options, [optionKey]: value },
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  // --- Initialize state from product ---
  useEffect(() => {
    if (product) {
      setNewName(product.name);
      setNewPrice(product.price);
      setNewBrand(product.brand);
      setNewCategory(product.category);
      setNewCountInStock(product.countInStock);
      setNewDescription(product.description);
      setFeatured(product.featured ?? false);
      setVariants(product.variants || []);
    }
  }, [product]);

  const handleDeleteProduct = async () => {
    if (product) {
      await deleteProduct(productId);
      toast.success(language === "ar" ? "تم حذف المنتج بنجاح" : "Product deleted successfully");
      refetchProducts();
      navigate("/admin/productlist");
    }
  };

  const handleUpdateProduct = async () => {
    if (typeof newPrice === "number" && newPrice <= 0) {
      toast.error(language === "ar" ? "السعر يجب أن يكون رقمًا موجبًا" : "Price must be positive");
      return;
    }

    let uploadedImages = [...product.image]; // keep existing images
    if (selectedFiles.length > 0) {
      uploadedImages = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          const res = await uploadProductImage(formData).unwrap();
          if (Array.isArray(res.images)) {
            res.images.forEach((img: any) =>
              uploadedImages.push({ url: img.imageUrl, publicId: img.publicId })
            );
          } else {
            uploadedImages.push({ url: res.imageUrl, publicId: res.publicId });
          }
        } catch (error: any) {
          toast.error(error?.data?.message || "Image upload failed");
          return;
        }
      }
    }
    // --- Upload variant images ---
    const uploadedVariants = [];
    for (let idx = 0; idx < variants.length; idx++) {
      const variant = variants[idx];
      let variantImages = [...(variant.images || [])];

      // if you store new files for each variant in variant.selectedFiles
      if (variant.selectedFiles && variant.selectedFiles.length > 0) {
        variantImages = [];
        for (const file of variant.selectedFiles) {
          const formData = new FormData();
          formData.append("images", file);
          try {
            const res = await uploadVariantImage(formData).unwrap();
            if (Array.isArray(res.images)) {
              res.images.forEach((img: any) =>
                variantImages.push({ url: img.imageUrl, publicId: img.publicId })
              );
            } else {
              variantImages.push({ url: res.imageUrl, publicId: res.publicId });
            }
          } catch (error: any) {
            toast.error(error?.data?.message || "Variant image upload failed");
            return;
          }
        }
      }

      uploadedVariants.push({ ...variant, images: variantImages });
    }

    const updatedProduct = {
      _id: productId,
      name: newName.trim() || product.name,
      price: typeof newPrice === "number" ? newPrice : product.price,
      image: uploadedImages,
      brand: newBrand.trim() || product.brand,
      category: newCategory || product.category,
      countInStock: typeof newCountInStock === "number" ? newCountInStock : product.countInStock,
      description: newDescription.trim() || product.description,
      featured,
      variants, // ✅ send variants to backend
    };

    try {
      await updateProduct(updatedProduct).unwrap();
      toast.success(language === "ar" ? "تم تحديث المنتج بنجاح" : "Product updated successfully");
      setClickEditProduct(false);
      refetch();
      refetchProducts();
      setSelectedFiles([]);
      setVariants((prev) => prev.map((v) => ({ ...v, selectedFiles: [] })));
    } catch (err: any) {
      toast.error(
        err?.data?.message || (language === "ar" ? "خطأ في تحديث المنتج" : "Error updating product")
      );
    }
  };

  console.log(product);
  return (
    <Layout>
      {loadingProduct ? (
        <Loader />
      ) : (
        <div className={`px-4 w-full lg:w-4xl py-6 mb-10 mt-10 min-h-screen ${dir} font-custom`}>
          {/* Header */}
          <div
            className={`flex justify-between items-center mb-6 ${
              language === "ar" ? "flex-row-reverse" : ""
            }`}>
            <h1 className="text-2xl font-bold">
              {language === "ar" ? "تفاصيل المنتج" : "Product Details"}
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="select-none bg-gradient-to-t from-rose-500 hover:opacity-90 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
              {language === "ar" ? "حذف المنتج" : "Delete Product"}
            </button>
          </div>

          <Separator className="my-4 bg-black/20" />

          {/* Main Content */}
          <div className="bg-white border rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{product?.name}</h2>
              <div className="flex items-center gap-3">
                {clickEditProduct && (
                  <button
                    onClick={handleUpdateProduct}
                    disabled={loadingUploadImage || loadingUpdateProduct}
                    className={`px-4 py-2 rounded-lg text-white font-semibold shadow transition
                      ${
                        loadingUploadImage || loadingUpdateProduct
                          ? "bg-zinc-400"
                          : "bg-black hover:opacity-90"
                      }`}>
                    {loadingUploadImage
                      ? language === "ar"
                        ? "جاري الرفع..."
                        : "Uploading..."
                      : loadingUpdateProduct
                      ? language === "ar"
                        ? "جاري التحديث..."
                        : "Updating..."
                      : language === "ar"
                      ? "تحديث"
                      : "Update"}
                  </button>
                )}
                <button
                  onClick={() => setClickEditProduct(!clickEditProduct)}
                  className="bg-zinc-100 border px-4 py-2 rounded-lg text-black font-semibold shadow hover:opacity-70 transition flex items-center gap-2">
                  {clickEditProduct ? (
                    language === "ar" ? (
                      "إلغاء"
                    ) : (
                      "Cancel"
                    )
                  ) : (
                    <PencilLine size={18} />
                  )}
                </button>
              </div>
            </div>

            <Separator />

            {/* Images & Details */}
            <div className="flex flex-col sm:flex-row lg:flex-row gap-5">
              <div className="flex-shrink-0 w-full sm:w-80 lg:w-96 h-96 lg:h-96">
                {!clickEditProduct ? (
                  product?.image?.length > 1 ? (
                    <Carousel className="h-full">
                      <CarouselContent>
                        {product.image.map((img: any, index: number) => (
                          <CarouselItem key={index}>
                            <img
                              src={img.url}
                              alt={`Product ${index + 1}`}
                              loading="lazy"
                              className="w-full h-80 lg:h-96 object-cover rounded-lg"
                            />
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-white/50">
                        &#8592;
                      </CarouselPrevious>
                      <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-white/50">
                        &#8594;
                      </CarouselNext>
                    </Carousel>
                  ) : (
                    <img
                      src={product?.image[0]?.url}
                      alt="Product"
                      className="w-full h-96 lg:h-96 object-cover rounded-lg"
                    />
                  )
                ) : (
                  <label className="cursor-pointer h-full flex flex-col items-center justify-center w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg shadow hover:bg-gray-100 hover:border-gray-400 transition">
                    <div className="w-44 h-44">
                      <Lottie animationData={upload} loop />
                    </div>
                    <span className="text-gray-700 font-medium">
                      {language === "ar" ? "رفع صور/ه جديدة" : "Upload new image/s"}
                    </span>
                    {selectedFiles.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-700">
                          {language === "ar" ? "الملفات المحددة:" : "Selected files:"}
                        </p>
                        <ul className="list-disc list-inside text-sm text-gray-600">
                          {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])
                      }
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Product Fields */}
              <div className="flex-1 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-3 gap-6">
                {/* Name */}
                <div>
                  <label className="text-gray-600">{language === "ar" ? ":الاسم" : "Name:"}</label>
                  {!clickEditProduct ? (
                    <p className="font-bold">{product?.name}</p>
                  ) : (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full p-2 bg-gray-50 border rounded-lg shadow"
                    />
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="text-gray-600">
                    {language === "ar" ? ":الفئة" : "Category:"}
                  </label>
                  {!clickEditProduct ? (
                    <p className="font-bold">
                      {categoryTree?.length > 0
                        ? findCategoryNameById(product?.category, categoryTree)
                        : "---"}
                    </p>
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                      <option value="" disabled>
                        -- {language === "ar" ? "اختر الفئة" : "Choose a category"} --
                      </option>
                      {categoryTree && renderCategoryOptions(categoryTree)}
                    </select>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-gray-600">{language === "ar" ? ":السعر" : "Price:"}</label>
                  {!clickEditProduct ? (
                    <p className="font-bold">{product?.price.toFixed(3)} KD</p>
                  ) : (
                    <input
                      value={newPrice}
                      onChange={(e) => setNewPrice(Number(e.target.value))}
                      className="w-full p-2 bg-gray-50 border rounded-lg shadow"
                    />
                  )}
                </div>

                {/* Stock */}
                <div>
                  <label className="text-gray-600">
                    {language === "ar" ? ":المخزون" : "Stock:"}
                  </label>
                  {!clickEditProduct ? (
                    <p className="font-bold">{product?.countInStock}</p>
                  ) : (
                    <input
                      value={newCountInStock}
                      onChange={(e) => setNewCountInStock(Number(e.target.value))}
                      className="w-full p-2 bg-gray-50 border rounded-lg shadow"
                    />
                  )}
                </div>

                {/* Description */}
                <div className="col-span-3 lg:col-span-2">
                  <label className="text-gray-600">
                    {language === "ar" ? ":الوصف" : "Description:"}
                  </label>
                  {!clickEditProduct ? (
                    <p className="font-bold break-words whitespace-pre-line">
                      {product?.description}
                    </p>
                  ) : (
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full h-24 p-2 bg-gray-50 border rounded-lg shadow"
                    />
                  )}
                </div>

                {/* Featured */}
                <div className="flex flex-col items-center gap-2">
                  <label className="text-gray-600">
                    {language === "ar" ? ":منتج مميز" : "Featured Product:"}
                  </label>
                  {!clickEditProduct ? (
                    <p className="font-bold">
                      {product?.featured
                        ? language === "ar"
                          ? "نعم"
                          : "Yes"
                        : language === "ar"
                        ? "لا"
                        : "No"}
                    </p>
                  ) : (
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className=" grid grid-cols-3 gap-2 mt-6">
            {/*   <h3 className="font-semibold mb-3 text-lg">
              {variants?.length}: {language === "ar" ? "الأنواع" : "Variants"}
            </h3> */}

            {variants?.length === 0 ? (
              <p>{language === "ar" ? "لا توجد أنواع" : "No variants"}</p>
            ) : (
              variants.map((v, idx) => (
                <div
                  key={v?._id || idx}
                  className="p-3 border rounded-lg mb-2 flex flex-col sm:flex-col gap-2 items-start bg-gray-50">
                  {/* Variant Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    {clickEditProduct ? (
                      <input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const updated = [...variants];
                          updated[idx].image = URL.createObjectURL(file);
                          setVariants(updated);
                        }}
                        className="w-full h-full cursor-pointer"
                      />
                    ) : v.images ? (
                      <img
                        src={v?.images[0]?.url}
                        alt={`Variant ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center text-gray-400">
                        {language === "ar" ? "لا توجد صورة" : "No Image"}
                      </div>
                    )}
                  </div>

                  {/* Variant Options */}
                  {Object.entries(v.options).map(([key, value]) => (
                    <div key={key} className="flex-1">
                      <span className="font-semibold">{key}:</span>
                      {clickEditProduct ? (
                        <input
                          value={String(value)}
                          onChange={(e) => updateVariant(idx, `options.${key}`, e.target.value)}
                          className="ml-2 w-full p-1 border rounded"
                        />
                      ) : (
                        <span className="ml-1">
                          {key.toLowerCase() === "size" && value === ""
                            ? "No size"
                            : key.toLowerCase() === "color" && value === ""
                            ? "No color"
                            : String(value)}
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Price */}
                  <div className="flex-1">
                    <span className="font-semibold">{language === "ar" ? "Price:" : "Price:"}</span>
                    {clickEditProduct ? (
                      <input
                        type="number"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", Number(e.target.value))}
                        className="ml-2 w-full p-1 border rounded"
                      />
                    ) : (
                      <span className="ml-1">{v.price.toFixed(3)} KD</span>
                    )}
                  </div>

                  {/* Stock */}
                  <div className="flex-1">
                    <span className="font-semibold">{language === "ar" ? "Stock:" : "Stock:"}</span>
                    {clickEditProduct ? (
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, "stock", Number(e.target.value))}
                        className="ml-2 w-full p-1 border rounded"
                      />
                    ) : (
                      <span className="ml-1">{v.stock}</span>
                    )}
                  </div>

                  {/* Remove Button */}
                  {clickEditProduct && (
                    <button className="text-red-500 font-bold" onClick={() => removeVariant(idx)}>
                      {language === "ar" ? "حذف" : "Remove"}
                    </button>
                  )}
                </div>
              ))
            )}

            {clickEditProduct && (
              <Button onClick={addVariant} className="mt-2">
                {language === "ar" ? "إضافة نوع" : "Add Variant"}
              </Button>
            )}
          </div>

          {/* Delete Modal */}
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{language === "ar" ? "حذف المنتج" : "Delete Product"}</DialogTitle>
              </DialogHeader>
              {language === "ar"
                ? "هل أنت متأكد أنك تريد حذف هذا المنتج؟"
                : "Are you sure you want to delete this product?"}
              <DialogFooter className="mt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  disabled={loadingDeleteProduct}
                  variant="destructive"
                  className="bg-gradient-to-t from-rose-500 hover:opacity-90 to-rose-400"
                  onClick={handleDeleteProduct}>
                  {loadingDeleteProduct ? (
                    <Loader2Icon className="animate-spin" />
                  ) : language === "ar" ? (
                    "حذف"
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Layout>
  );
}

// --- Helpers ---
const findCategoryNameById = (id: any, nodes: any) => {
  if (!id || !Array.isArray(nodes)) return null;
  for (const node of nodes) {
    if (String(node._id) === String(id)) return node.name;
    if (node.children) {
      const result: any = findCategoryNameById(id, node.children);
      if (result) return result;
    }
  }
  return null;
};

const renderCategoryOptions = (nodes: any, level = 0) =>
  nodes.map((node: any) => (
    <React.Fragment key={node._id}>
      <option value={node._id}>
        {"⤷ ".repeat(level)} {node.name}
      </option>
      {node.children && renderCategoryOptions(node.children, level + 1)}
    </React.Fragment>
  ));

export default ProductDetails;
