import React, { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import {
  PencilLine,
  Loader2Icon,
  Star,
  StarOff,
  ImagePlus,
  Trash2,
  Tag,
  Plus,
  Palette,
  Ruler,
  Package,
  X,
} from "lucide-react";
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
  DialogDescription,
} from "@/components/ui/dialog";
import { useSelector } from "react-redux";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import VariantItem from "./VariantItem";
import { Switch } from "@/components/ui/switch";
import { PERCENTAGE } from "./constants";
import clsx from "clsx";

/** Types (minimal, safe) */
type RootState = { language: { lang: "ar" | "en" } };

type CategoryNode = {
  _id: string;
  name: string;
  children?: CategoryNode[];
};

type ProductImage = { url: string; publicId?: string };

type Product = {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
  discountBy?: number;
  image: ProductImage[];
  category: any; // API seems to return object when reading; but update expects id
  countInStock: number;
  description: string;
  featured?: boolean;
  variants?: any[];
};

type VariantSizeInput = { size: string; stock: number | "" };

function ProductDetails(): JSX.Element {
  const language = useSelector((state: RootState) => state.language.lang);
  const dir = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";

  const t = useMemo(() => {
    return isRTL
      ? {
          title: "تفاصيل المنتج",
          delete: "حذف المنتج",
          createDiscount: "انشاء خصم",
          edit: "تعديل",
          cancel: "إلغاء",
          update: "تحديث",
          saving: "جاري الحفظ...",
          uploading: "جاري الرفع...",
          updating: "جاري التحديث...",
          updated: "تم تحديث المنتج بنجاح",
          deleted: "تم حذف المنتج بنجاح",
          deleteConfirmTitle: "حذف المنتج",
          deleteConfirmDesc: "هل أنت متأكد أنك تريد حذف هذا المنتج؟",
          priceMustBePositive: "السعر يجب أن يكون رقمًا موجبًا",
          uploadNewImages: "رفع صور/ه جديدة",
          selectedFiles: "الملفات المحددة:",
          name: "الاسم",
          category: "الفئة",
          price: "السعر",
          stock: "المخزون",
          featured: "منتج مميز",
          yes: "نعم",
          no: "لا",
          description: "الوصف",
          chooseCategory: "اختر الفئة",
          discountTitle: "خصم المنتج",
          enableDiscount: "تفعيل الخصم",
          discountPercentage: "نسبة الخصم",
          choosePercentage: "اختر نسبة",
          discountedPrice: "السعر بعد الخصم:",
          close: "إغلاق",
          save: "حفظ",
          imageUploadFailed: "فشل رفع الصورة",
          updateError: "خطأ في تحديث المنتج",
          deleteBtn: "حذف",
          badgeEditing: "وضع التعديل",
          badgeReadonly: "عرض فقط",
          keepImagesHint: "عند اختيار صور جديدة سيتم استبدال جميع الصور الحالية.",
          preview: "معاينة",

          // ✅ NEW (variants)
          variants: "الخيارات",
          addVariant: "إضافة خيار",
          addVariantTitle: "إضافة خيار جديد",
          addVariantDesc: "أضف لوناً ومقاسات مع المخزون. يمكن إضافة صور خاصة بالخيار (اختياري).",
          color: "اللون",
          enterColor: "مثال: Black / White / Red",
          sizes: "المقاسات",
          addSize: "إضافة مقاس",
          size: "المقاس",
          qty: "الكمية",
          variantImages: "صور الخيار (اختياري)",
          saveVariant: "حفظ الخيار",
          remove: "حذف",
          required: "مطلوب",
          invalidSizes: "أضف مقاس واحد على الأقل مع مخزون صحيح",
          colorRequired: "الرجاء إدخال اللون",
        }
      : {
          title: "Product Details",
          delete: "Delete Product",
          createDiscount: "Create Discount",
          edit: "Edit",
          cancel: "Cancel",
          update: "Update",
          saving: "Saving...",
          uploading: "Uploading...",
          updating: "Updating...",
          updated: "Product updated successfully",
          deleted: "Product deleted successfully",
          deleteConfirmTitle: "Delete Product",
          deleteConfirmDesc: "Are you sure you want to delete this product?",
          priceMustBePositive: "Price must be positive",
          uploadNewImages: "Upload new image/s",
          selectedFiles: "Selected files:",
          name: "Name",
          category: "Category",
          price: "Price",
          stock: "Stock",
          featured: "Featured Product",
          yes: "Yes",
          no: "No",
          description: "Description",
          chooseCategory: "Choose a category",
          discountTitle: "Product Discount",
          enableDiscount: "Enable Discount",
          discountPercentage: "Discount Percentage",
          choosePercentage: "Choose percentage",
          discountedPrice: "Discounted Price:",
          close: "Close",
          save: "Save",
          imageUploadFailed: "Image upload failed",
          updateError: "Error updating product",
          deleteBtn: "Delete",
          badgeEditing: "Editing",
          badgeReadonly: "Read-only",
          keepImagesHint: "Selecting new images will replace all existing ones.",
          preview: "Preview",

          // ✅ NEW (variants)
          variants: "Variants",
          addVariant: "Add Variant",
          addVariantTitle: "Add New Variant",
          addVariantDesc: "Add a color + sizes with stock. Variant images are optional.",
          color: "Color",
          enterColor: "e.g. Black / White / Red",
          sizes: "Sizes",
          addSize: "Add size",
          size: "Size",
          qty: "Stock",
          variantImages: "Variant Images (optional)",
          saveVariant: "Save Variant",
          remove: "Remove",
          required: "Required",
          invalidSizes: "Add at least 1 size with valid stock",
          colorRequired: "Please enter a color",
        };
  }, [isRTL]);

  const { id: productId } = useParams();
  const navigate = useNavigate();

  const { data: product, refetch, isLoading: loadingProduct } = useGetProductByIdQuery(productId);
  const { data: categoryTree } = useGetCategoriesTreeQuery(undefined);

  const [deleteProduct, { isLoading: loadingDeleteProduct }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: loadingUpdateProduct }] = useUpdateProductMutation();
  const { refetch: refetchProducts } = useGetProductsQuery(undefined);
  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();

  // UI / modals
  const [clickEditProduct, setClickEditProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // ✅ NEW: Add Variant modal
  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [variantColor, setVariantColor] = useState("");
  const [variantSizes, setVariantSizes] = useState<VariantSizeInput[]>([{ size: "", stock: "" }]);
  const [variantFiles, setVariantFiles] = useState<File[]>([]);

  // fields
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<number | "">("");
  const [newCategory, setNewCategory] = useState("");
  const [newCountInStock, setNewCountInStock] = useState<number | "">("");
  const [newDescription, setNewDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  // images
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // discount
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountBy, setDiscountBy] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);

  const initializedRef = useRef(false);

  // init from product (once)
  useEffect(() => {
    if (!product || initializedRef.current) return;
    const p = product as Product;

    setNewName(p.name ?? "");
    setNewPrice(typeof p.price === "number" ? p.price : "");
    setNewCategory((p as any)?.category?._id || (p as any)?.category || "");
    setNewCountInStock(typeof p.countInStock === "number" ? p.countInStock : "");
    setNewDescription(p.description ?? "");
    setFeatured(!!p.featured);

    setHasDiscount(!!p.hasDiscount);
    setDiscountBy(typeof p.discountBy === "number" ? p.discountBy : 0);

    initializedRef.current = true;
  }, [product]);

  // calculate discounted
  useEffect(() => {
    const priceNum = typeof newPrice === "number" ? newPrice : 0;
    if (!priceNum) {
      setDiscountedPrice(0);
      return;
    }
    if (hasDiscount && discountBy > 0) {
      const final = priceNum - priceNum * discountBy;
      setDiscountedPrice(final > 0 ? final : 0);
    } else {
      setDiscountedPrice(priceNum);
    }
  }, [discountBy, hasDiscount, newPrice]);

  const busy = loadingUploadImage || loadingUpdateProduct;

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(productId as string);
      toast.success(t.deleted);
      refetchProducts();
      navigate("/admin/productlist");
    } catch (e: any) {
      toast.error(e?.data?.message || "Delete failed");
    }
  };

  const handleUpdateProduct = async () => {
    const p = product as Product;
    const priceNum = typeof newPrice === "number" ? newPrice : p.price;

    if (typeof priceNum === "number" && priceNum <= 0) {
      toast.error(t.priceMustBePositive);
      return;
    }

    let uploadedImages: ProductImage[] = Array.isArray(p?.image) ? [...p.image] : [];

    // If user selected new images -> replace all
    if (selectedFiles.length > 0) {
      uploadedImages = [];
      for (const file of selectedFiles) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          const res = await uploadProductImage(formData).unwrap();

          if (Array.isArray(res?.images)) {
            res.images.forEach((img: any) =>
              uploadedImages.push({ url: img.imageUrl, publicId: img.publicId }),
            );
          } else if (res?.imageUrl) {
            uploadedImages.push({ url: res.imageUrl, publicId: res.publicId });
          }
        } catch (error: any) {
          toast.error(error?.data?.message || t.imageUploadFailed);
          return;
        }
      }
    }

    const updatedProduct = {
      _id: p?._id || productId,
      name: (newName || p.name || "").trim(),
      price: priceNum,
      image: uploadedImages,
      category: newCategory || (p as any)?.category?._id || (p as any)?.category,
      countInStock: typeof newCountInStock === "number" ? newCountInStock : (p?.countInStock ?? 0),
      description: (newDescription || p.description || "").trim(),
      featured,

      hasDiscount,
      discountBy,
      discountedPrice,
    };

    try {
      await updateProduct(updatedProduct).unwrap();
      toast.success(t.updated);
      setClickEditProduct(false);
      setIsDiscountModalOpen(false);
      setSelectedFiles([]);
      refetch();
      refetchProducts();
    } catch (err: any) {
      toast.error(err?.data?.message || t.updateError);
    }
  };

  const renderCategoryOptions = (nodes: CategoryNode[], level = 0): React.ReactNode =>
    nodes.map((node) => (
      <React.Fragment key={node._id}>
        <option value={node._id}>{`${"—".repeat(level)} ${node.name}`}</option>
        {node.children?.length ? renderCategoryOptions(node.children, level + 1) : null}
      </React.Fragment>
    ));

  const formatPrice = (v: number) => `${v.toFixed(3)} KD`;

  const statusBadge = (
    <span
      className={clsx(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
        clickEditProduct
          ? "border-neutral-950/15 bg-neutral-950 text-white"
          : "border-neutral-200 bg-white text-neutral-900",
      )}>
      {clickEditProduct ? <PencilLine className="h-3.5 w-3.5" /> : <EyeIcon />}
      {clickEditProduct ? t.badgeEditing : t.badgeReadonly}
    </span>
  );

  function EyeIcon() {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-neutral-900">
        <path
          d="M2.5 12s3.5-7.5 9.5-7.5S21.5 12 21.5 12s-3.5 7.5-9.5 7.5S2.5 12 2.5 12Z"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    );
  }

  // ✅ NEW: Variant helpers
  const resetVariantForm = () => {
    setVariantColor("");
    setVariantSizes([{ size: "", stock: "" }]);
    setVariantFiles([]);
  };

  const addSizeRow = () => setVariantSizes((prev) => [...prev, { size: "", stock: "" }]);

  const removeSizeRow = (idx: number) =>
    setVariantSizes((prev) => prev.filter((_, i) => i !== idx));

  const updateSizeRow = (idx: number, patch: Partial<VariantSizeInput>) =>
    setVariantSizes((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));

  const buildVariantPayload = async () => {
    // validate
    const color = variantColor.trim();
    if (!color) {
      toast.error(t.colorRequired);
      return null;
    }

    const cleanedSizes = variantSizes
      .map((s) => ({ size: s.size.trim(), stock: s.stock === "" ? NaN : Number(s.stock) }))
      .filter((s) => s.size.length > 0);

    const invalid =
      cleanedSizes.length === 0 || cleanedSizes.some((s) => Number.isNaN(s.stock) || s.stock < 0);

    if (invalid) {
      toast.error(t.invalidSizes);
      return null;
    }

    // upload variant images if provided
    const uploadedVariantImages: ProductImage[] = [];
    if (variantFiles.length > 0) {
      for (const file of variantFiles) {
        const formData = new FormData();
        formData.append("images", file);
        try {
          const res = await uploadProductImage(formData).unwrap();

          if (Array.isArray(res?.images)) {
            res.images.forEach((img: any) =>
              uploadedVariantImages.push({ url: img.imageUrl, publicId: img.publicId }),
            );
          } else if (res?.imageUrl) {
            uploadedVariantImages.push({ url: res.imageUrl, publicId: res.publicId });
          }
        } catch (error: any) {
          toast.error(error?.data?.message || t.imageUploadFailed);
          return null;
        }
      }
    }

    return {
      color,
      sizes: cleanedSizes.map((s) => ({ size: s.size, stock: s.stock })),
      images: uploadedVariantImages, // optional
    };
  };

  const handleAddVariant = async () => {
    const p = product as Product;
    if (!p) return;

    const payload = await buildVariantPayload();
    if (!payload) return;

    // Merge with existing variants
    const existing = Array.isArray(p.variants) ? [...p.variants] : [];

    // Prevent duplicate color (optional but helpful)
    const duplicate = existing.some(
      (v: any) => String(v?.color || "").toLowerCase() === payload.color.toLowerCase(),
    );
    if (duplicate) {
      toast.error(isRTL ? "هذا اللون موجود بالفعل" : "This color already exists");
      return;
    }

    const nextVariants = [...existing, payload];

    try {
      // Note: your backend must accept `variants` on updateProduct.
      // If it expects a different endpoint, tell me your API shape and I’ll adjust.
      await updateProduct({
        _id: p._id,
        name: (newName || p.name || "").trim(),
        price: typeof newPrice === "number" ? newPrice : p.price,
        image: Array.isArray(p.image) ? p.image : [],
        category: newCategory || (p as any)?.category?._id || (p as any)?.category,
        countInStock:
          typeof newCountInStock === "number" ? newCountInStock : (p?.countInStock ?? 0),
        description: (newDescription || p.description || "").trim(),
        featured,

        hasDiscount,
        discountBy,
        discountedPrice,

        variants: nextVariants,
      }).unwrap();

      toast.success(isRTL ? "تم إضافة الخيار بنجاح" : "Variant added successfully");
      setIsAddVariantOpen(false);
      resetVariantForm();
      refetch();
      refetchProducts();
    } catch (err: any) {
      toast.error(err?.data?.message || (isRTL ? "فشل إضافة الخيار" : "Failed to add variant"));
    }
  };

  if (loadingProduct) {
    return (
      <Layout>
        <Loader />
      </Layout>
    );
  }

  const p = product as Product | undefined;

  return (
    <Layout>
      <div
        dir={dir}
        className={clsx(
          "px-4 w-full max-w-6xl py-6 mb-10 mt-10 min-h-screen font-custom",
          isRTL ? "rtl" : "ltr",
        )}>
        {/* Header */}
        <div
          className={clsx(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6",
            isRTL ? "sm:flex-row-reverse" : "",
          )}>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-950">{t.title}</h1>
            {statusBadge}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* ✅ NEW: Add Variant button */}
            <button
              onClick={() => setIsAddVariantOpen(true)}
              className="select-none inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 font-semibold text-neutral-900 hover:bg-neutral-50 transition"
              type="button">
              <Plus className="h-4 w-4" />
              {t.addVariant}
            </button>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="select-none inline-flex items-center gap-2 bg-gradient-to-t from-rose-500 to-rose-400 hover:opacity-90 
             text-white px-3 py-2 rounded-2xl font-bold 
             drop-shadow-[0_4px_8px_rgba(244,63,94,0.5)] hover:drop-shadow-[0_6px_12px_rgba(251,113,133,0.5)] 
             transition-all"
              type="button">
              <Trash2 className="h-4 w-4" />
              {t.delete}
            </button>

            <button
              onClick={() => setIsDiscountModalOpen(true)}
              className="select-none inline-flex items-center gap-2 bg-neutral-950 hover:bg-neutral-900 text-white px-3 py-2 rounded-2xl font-bold shadow-md"
              type="button">
              <Tag className="h-4 w-4" />
              {t.createDiscount}
            </button>

            <button
              onClick={() => setClickEditProduct((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-neutral-200 bg-white px-3 py-2 font-semibold text-neutral-900 hover:bg-neutral-50 transition"
              type="button">
              {clickEditProduct ? (
                <span>{t.cancel}</span>
              ) : (
                <>
                  <PencilLine className="h-4 w-4" />
                  <span>{t.edit}</span>
                </>
              )}
            </button>

            {clickEditProduct ? (
              <button
                onClick={handleUpdateProduct}
                disabled={busy}
                className={clsx(
                  "inline-flex items-center gap-2 rounded-2xl px-4 py-2 font-semibold text-white transition",
                  busy
                    ? "bg-neutral-400 cursor-not-allowed"
                    : "bg-neutral-950 hover:bg-neutral-900",
                )}
                type="button">
                {busy ? <Loader2Icon className="h-4 w-4 animate-spin" /> : null}
                {loadingUploadImage ? t.uploading : loadingUpdateProduct ? t.updating : t.update}
              </button>
            ) : null}
          </div>
        </div>

        <Separator className="my-4 bg-black/10" />

        {/* Main content (bento) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Images card */}
          <div className="lg:col-span-5 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden">
            <div className="p-5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-neutral-900">{p?.name}</p>
                <p className="text-xs text-neutral-500">
                  {clickEditProduct ? t.keepImagesHint : " "}
                </p>
              </div>

              <div className="inline-flex items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold border-neutral-200 bg-white text-neutral-900">
                  <ImagePlus className="h-3.5 w-3.5" />
                  {p?.image?.length || 0}
                </span>
              </div>
            </div>

            <div className="px-5 pb-5">
              {!clickEditProduct ? (
                p?.image?.length && p.image.length > 1 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {p.image.map((img, index) => (
                        <CarouselItem key={index}>
                          <img
                            src={img.url}
                            alt={`Product ${index + 1}`}
                            loading="lazy"
                            className="w-full h-[360px] sm:h-[420px] object-cover rounded-2xl"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/60" />
                    <CarouselNext className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/60" />
                  </Carousel>
                ) : (
                  <img
                    src={p?.image?.[0]?.url}
                    alt="Product"
                    className="w-full h-[360px] sm:h-[420px] object-cover rounded-2xl"
                  />
                )
              ) : (
                <div className="space-y-3">
                  <label className="cursor-pointer h-[360px] sm:h-[420px] flex flex-col items-center justify-center w-full p-4 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl hover:bg-neutral-100 hover:border-neutral-400 transition">
                    <div className="w-44 h-44">
                      <Lottie animationData={upload} loop />
                    </div>
                    <span className="text-neutral-700 font-semibold">{t.uploadNewImages}</span>

                    <input
                      type="file"
                      multiple
                      onChange={(e) =>
                        setSelectedFiles(e.target.files ? Array.from(e.target.files) : [])
                      }
                      className="hidden"
                    />
                  </label>

                  {selectedFiles.length > 0 ? (
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                      <p className="text-sm font-semibold text-neutral-900">{t.selectedFiles}</p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 space-y-1">
                        {selectedFiles.map((file, idx) => (
                          <li key={idx} className="break-all">
                            {file.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Details card */}
          <div className="lg:col-span-7 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm">
            <div className="p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-neutral-950">{p?.name}</h2>

                <div className="inline-flex items-center gap-2">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                      p?.featured
                        ? "border-amber-200 bg-amber-50 text-amber-800"
                        : "border-neutral-200 bg-white text-neutral-700",
                    )}>
                    {p?.featured ? (
                      <Star className="h-3.5 w-3.5" />
                    ) : (
                      <StarOff className="h-3.5 w-3.5" />
                    )}
                    {t.featured}: {p?.featured ? t.yes : t.no}
                  </span>
                </div>
              </div>

              <Separator className="my-4 bg-black/10" />

              {/* Grid fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{t.name}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 break-words">{p?.name}</div>
                  ) : (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                    />
                  )}
                </div>

                {/* Category */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{t.category}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 break-words">
                      {(p as any)?.category?.name || "—"}
                    </div>
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30">
                      <option value="" disabled>
                        -- {t.chooseCategory} --
                      </option>
                      {categoryTree ? renderCategoryOptions(categoryTree as CategoryNode[]) : null}
                    </select>
                  )}
                </div>

                {/* Price */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{t.price}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950">
                      {p?.hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="line-through text-neutral-500 text-sm">
                            {formatPrice(p.price)}
                          </span>
                          <span className="text-emerald-600 text-lg">
                            {formatPrice(p.discountedPrice ?? p.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg">{formatPrice(p?.price ?? 0)}</span>
                      )}
                    </div>
                  ) : (
                    <input
                      value={newPrice}
                      onChange={(e) =>
                        setNewPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      inputMode="decimal"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                    />
                  )}
                </div>

                {/* Stock */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{t.stock}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950">
                      {p?.countInStock ?? 0}
                    </div>
                  ) : (
                    <input
                      value={newCountInStock}
                      onChange={(e) =>
                        setNewCountInStock(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      disabled={!!(p?.variants && p.variants.length > 0)}
                      className={clsx(
                        "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10",
                        p?.variants?.length ? "opacity-60 cursor-not-allowed" : "",
                      )}
                    />
                  )}
                </div>

                {/* Featured */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{t.featured}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950">
                      {p?.featured ? t.yes : t.no}
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <Switch
                        id="featured"
                        className="scale-125"
                        checked={featured}
                        onCheckedChange={setFeatured}
                      />
                      <span className="text-sm font-semibold text-neutral-700">
                        {featured ? t.yes : t.no}
                      </span>
                    </div>
                  )}
                </div>

                {/* Discount quick view */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{isRTL ? "الخصم" : "Discount"}</div>
                  <div className="mt-1 font-semibold text-neutral-950">
                    {p?.hasDiscount
                      ? `${Math.round((p.discountBy ?? 0) * 100)}%`
                      : isRTL
                        ? "لا يوجد"
                        : "None"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-neutral-900 underline">
                    {isRTL ? "تعديل الخصم" : "Edit discount"}
                  </button>
                </div>

                {/* Description - full width */}
                <div className="sm:col-span-3 rounded-2xl border border-neutral-200 bg-white p-4">
                  <div className="text-xs text-neutral-500">{t.description}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 whitespace-pre-line break-words">
                      {p?.description || "—"}
                    </div>
                  ) : (
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="mt-2 w-full h-28 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants */}
        {p?.variants?.length
          ? p.variants.map((v: any) => (
              <VariantItem key={v._id} variant={v} productId={p._id} language={language} />
            ))
          : null}

        {/* Delete Modal */}
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.deleteConfirmTitle}</DialogTitle>
              <DialogDescription>{t.deleteConfirmDesc}</DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
                {t.cancel}
              </Button>
              <Button
                disabled={loadingDeleteProduct}
                variant="destructive"
                className="bg-gradient-to-t from-rose-500 hover:opacity-90 to-rose-400"
                onClick={handleDeleteProduct}>
                {loadingDeleteProduct ? <Loader2Icon className="animate-spin" /> : t.deleteBtn}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Discount Modal */}
        <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.discountTitle}</DialogTitle>
              <DialogDescription>
                {isRTL
                  ? "تطبيق خصم على المنتج وحساب السعر النهائي تلقائيًا."
                  : "Enable a discount and auto-calculate the final price."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Switch
                  checked={hasDiscount}
                  onCheckedChange={setHasDiscount}
                  className="scale-125"
                />
                <span className="font-semibold text-neutral-900">{t.enableDiscount}</span>
              </div>

              {hasDiscount ? (
                <>
                  <div>
                    <label className="text-sm font-semibold text-neutral-700">
                      {t.discountPercentage}
                    </label>
                    <select
                      value={discountBy}
                      onChange={(e) => setDiscountBy(Number(e.target.value))}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/30">
                      <option value={0} disabled>
                        -- {t.choosePercentage} --
                      </option>
                      {PERCENTAGE.map((p) => (
                        <option key={p} value={p}>
                          {Math.round(p * 100)}%
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-semibold text-neutral-900">
                      {t.discountedPrice}{" "}
                      <span className="text-emerald-700">{discountedPrice.toFixed(3)} KD</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                  {isRTL ? "الخصم غير مفعّل." : "Discount is disabled."}
                </div>
              )}
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setIsDiscountModalOpen(false)}>
                {t.cancel}
              </Button>
              <Button
                disabled={loadingUpdateProduct || loadingUploadImage}
                onClick={handleUpdateProduct}
                className="bg-neutral-950 text-white hover:bg-neutral-900">
                {loadingUpdateProduct || loadingUploadImage ? (
                  <>
                    <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                    {t.saving}
                  </>
                ) : (
                  t.save
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ✅ NEW: Add Variant Modal */}
        <Dialog
          open={isAddVariantOpen}
          onOpenChange={(open) => {
            setIsAddVariantOpen(open);
            if (!open) resetVariantForm();
          }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t.addVariantTitle}</DialogTitle>
              <DialogDescription>{t.addVariantDesc}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Color */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4 text-neutral-700" />
                  <label className="text-sm font-semibold text-neutral-900">
                    {t.color} <span className="text-rose-500">*</span>
                  </label>
                </div>
                <input
                  value={variantColor}
                  onChange={(e) => setVariantColor(e.target.value)}
                  placeholder={t.enterColor}
                  className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                />
                {/* quick preview dot (best effort) */}
                <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
                  <span
                    className="h-3 w-3 rounded-full border border-neutral-200"
                    style={{ backgroundColor: variantColor.trim().toLowerCase() || "transparent" }}
                  />
                  <span>{isRTL ? "معاينة اللون" : "Color preview"}</span>
                </div>
              </div>

              {/* Sizes */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-neutral-700" />
                    <p className="text-sm font-semibold text-neutral-900">{t.sizes}</p>
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
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <div className="relative">
                          <input
                            value={row.size}
                            onChange={(e) => updateSizeRow(idx, { size: e.target.value })}
                            placeholder={t.size}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                          />
                        </div>
                      </div>
                      <div className="col-span-5">
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                          <input
                            value={row.stock}
                            onChange={(e) =>
                              updateSizeRow(idx, {
                                stock: e.target.value === "" ? "" : Number(e.target.value),
                              })
                            }
                            inputMode="numeric"
                            placeholder={t.qty}
                            className="w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                          />
                        </div>
                      </div>
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
                  <ImagePlus className="h-4 w-4 text-neutral-700" />
                  <label className="text-sm font-semibold text-neutral-900">
                    {t.variantImages}
                  </label>
                </div>

                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    setVariantFiles(e.target.files ? Array.from(e.target.files) : [])
                  }
                  className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-xl file:border-0
                             file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white
                             hover:file:bg-neutral-900"
                />

                {variantFiles.length > 0 ? (
                  <div className="mt-3 text-xs text-neutral-600">
                    {variantFiles.length} {isRTL ? "ملف/ملفات" : "file(s)"}:{" "}
                    <span className="font-semibold">
                      {variantFiles.map((f) => f.name).join(", ")}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddVariantOpen(false);
                  resetVariantForm();
                }}>
                {t.cancel}
              </Button>

              <Button
                onClick={handleAddVariant}
                disabled={busy}
                className={clsx(
                  "bg-neutral-950 text-white hover:bg-neutral-900",
                  busy && "opacity-60",
                )}>
                {busy ? (
                  <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                {t.saveVariant}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

export default ProductDetails;
