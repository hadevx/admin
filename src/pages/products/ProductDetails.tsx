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
  const [newImages, setNewImages] = useState<{ url: string; publicId: string }[]>([]);
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCountInStock, setNewCountInStock] = useState<number>();
  const [newDescription, setNewDescription] = useState("");
  const [clickEditProduct, setClickEditProduct] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [featured, setFeatured] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { id: productId } = useParams();
  const navigate = useNavigate();
  const { data: product, refetch, isLoading: loadingProduct } = useGetProductByIdQuery(productId);
  const { data: categoryTree } = useGetCategoriesTreeQuery(undefined);

  const [deleteProduct, { isLoading: loadingDeleteProduct }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: loadingUpdateProduct }] = useUpdateProductMutation();
  const { refetch: refetchProducts } = useGetProductsQuery(undefined);
  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();

  useEffect(() => {
    if (product) {
      setNewName(product.name);
      setNewPrice(product.price);
      setNewImages(product.image);
      setNewBrand(product.brand);
      setNewCategory(product.category);
      setNewCountInStock(product.countInStock);
      setNewDescription(product.description);
      setFeatured(product.featured ?? false); // ✅ initialize featured state
    }
  }, [product]);

  console.log(product);

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
      toast.error(
        language === "ar" ? "السعر يجب أن يكون رقمًا موجبًا" : "Price must be a positive number"
      );
      return;
    }

    /*     let imageUrl = newImage;
    let newImagePublicId = product?.imagePublicId;

    if (selectedFile) {
      const formData = new FormData();
      formData.append("image", selectedFile);

      try {
        const res = await uploadProductImage(formData).unwrap();
        imageUrl = res.imageUrl;
        newImagePublicId = res.publicId;
      } catch (error: any) {
        toast.error(
          error?.data?.message ||
            error?.error ||
            (language === "ar" ? "فشل رفع الصورة" : "Image upload failed")
        );
        return;
      }
    } */
    let uploadedImages = [...product.image]; // keep existing images

    if (selectedFiles.length > 0) {
      uploadedImages = []; // reset if new images selected
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          const res = await uploadProductImage(formData).unwrap();

          // ✅ FIX: push each uploaded image instead of overwriting
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

    const updatedProduct = {
      _id: productId,
      name: newName.trim() || product.name,
      price: typeof newPrice === "number" ? newPrice : product.price,
      // image: imageUrl,
      image: uploadedImages, // update with array of images,
      // imagePublicId: newImagePublicId,
      brand: newBrand.trim() || product.brand,
      category: newCategory || product.category,
      countInStock: typeof newCountInStock === "number" ? newCountInStock : product.countInStock,
      description: newDescription.trim() || product.description,
      featured: featured, // ✅ send to backend
    };

    try {
      await updateProduct(updatedProduct).unwrap();
      toast.success(language === "ar" ? "تم تحديث المنتج بنجاح" : "Product updated successfully");
      setClickEditProduct(false);
      refetch();
      refetchProducts();
      setSelectedFiles([]);
    } catch (err: any) {
      toast.error(
        err?.data?.message || (language === "ar" ? "خطأ في تحديث المنتج" : "Error updating product")
      );
    }
  };

  return (
    <Layout>
      {loadingProduct ? (
        <Loader />
      ) : (
        <div
          className={`px-4 w-full lg:w-4xl py-6 mb-10 mt-10 min-h-screen ${
            dir === "rtl" ? "rtl" : "ltr"
          } font-custom`}>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {language === "ar" ? "تفاصيل المنتج" : "Product Details"}
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="select-none bg-gradient-to-t drop-shadow-[0_4px_6px_rgba(236,72,153,0.5)]  from-rose-500 hover:opacity-90 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
              {language === "ar" ? "حذف المنتج" : "Delete Product"}
            </button>
          </div>

          <Separator className="my-4 bg-black/20" />

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

            {/* Product Image & Details */}
            <div className="flex flex-col sm:flex-row lg:flex-row gap-5">
              <div className="flex-shrink-0 w-full sm:w-80 lg:w-96 h-80 lg:h-96">
                {!clickEditProduct ? (
                  product?.image?.length > 1 ? (
                    <Carousel className="h-full">
                      <CarouselContent>
                        {product.image.map((img: any, index: number) => (
                          <CarouselItem key={index}>
                            <img
                              src={img.url}
                              alt={`Product ${index + 1}`}
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
                      className="w-full h-80 lg:h-96 object-cover rounded-lg"
                    />
                  )
                ) : (
                  <div>
                    <label className="cursor-pointer h-full flex flex-col items-center justify-center w-full p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg shadow hover:bg-gray-100 hover:border-gray-400 transition">
                      <div className="w-44 h-44">
                        <Lottie animationData={upload} loop />
                      </div>
                      <span className="text-gray-700 font-medium">
                        {language === "ar" ? "رفع صور/ه جديدة" : "Upload new image/s"}
                      </span>
                      {selectedFiles && selectedFiles.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700">
                            {language === "ar" ? "الملفات المحددة:" : "Selected files:"}
                          </p>
                          <ul className="list-disc list-inside text-sm text-gray-600">
                            {Array.from(selectedFiles).map((file, index) => (
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
                  </div>
                )}
              </div>

              <div className="flex-1 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-gray-600">{language === "ar" ? "الاسم:" : "Name:"}</label>
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
                    {language === "ar" ? "الفئة:" : "Category:"}
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
                      {newCategory &&
                        findCategoryNameById(newCategory, categoryTree || []) === null && (
                          <option value={newCategory} disabled className="text-red-500">
                            ❌ {language === "ar" ? "تم حذف الفئة" : "Deleted Category"}
                          </option>
                        )}
                      <option value="" disabled>
                        -- {language === "ar" ? "اختر الفئة" : "Choose a category"} --
                      </option>
                      {categoryTree?.length > 0 && renderCategoryOptions(categoryTree)}
                    </select>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-gray-600">{language === "ar" ? "السعر:" : "Price:"}</label>
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
                    {language === "ar" ? "المخزون:" : "Stock:"}
                  </label>
                  {!clickEditProduct ? (
                    <p className="font-bold">
                      {product?.countInStock > 0 ? (
                        product.countInStock < 5 ? (
                          <span className="text-orange-500">
                            {product?.countInStock} {language === "ar" ? "متبقي" : "left"}
                          </span>
                        ) : (
                          product?.countInStock
                        )
                      ) : (
                        <span className="text-rose-600">
                          {language === "ar" ? "غير متوفر" : "Out of stock"}
                        </span>
                      )}
                    </p>
                  ) : (
                    <input
                      value={newCountInStock}
                      onChange={(e) => setNewCountInStock(Number(e.target.value))}
                      className="w-full p-2 bg-gray-50 border rounded-lg shadow"
                    />
                  )}
                </div>

                {/* Created At */}
                <div>
                  <label className="text-gray-600">
                    {language === "ar" ? ":تاريخ الإنشاء" : "Created At:"}
                  </label>
                  <p className="font-bold">{product?.createdAt.substring(0, 10)}</p>
                </div>

                {/* Updated At */}
                <div>
                  <label className="text-gray-600">
                    {language === "ar" ? ":آخر تحديث" : "Updated At:"}
                  </label>
                  <p className="font-bold">{product?.updatedAt.substring(0, 10)}</p>
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
                <div className="col-span-2 flex flex-row-reverse items-center gap-2">
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
                    <div>
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
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

// Category helpers
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
