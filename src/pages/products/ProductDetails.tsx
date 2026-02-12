import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { PencilLine, Loader2Icon, Star, StarOff, Trash2, Tag, Plus } from "lucide-react";
import Lottie from "lottie-react";
import upload from "./uploading.json";
import { texts } from "./translation";
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetProductsQuery,
  useUploadProductImageMutation,
  useUploadVariantImageMutation,
} from "../../redux/queries/productApi";

import { useGetCategoriesTreeQuery } from "../../redux/queries/categoryApi";
import { Separator } from "@/components/ui/separator";
import clsx from "clsx";
import DeleteProductModal from "@/components/DeleteProductModal";
import DiscountModal from "@/components/DiscountModal";
import AddVariantModal from "@/components/AddVariantModal";
import VariantItem from "./VariantItem";
import { PERCENTAGE } from "./constants";
import { useSelector } from "react-redux";

/** Types (minimal, safe) */
type RootState = { language: { lang: "ar" | "en" } };

type CategoryNode = {
  _id: string;
  name: string;
  children?: CategoryNode[];
};

type ProductImage = { url: string; publicId?: string };

type VariantSize = { size: string; stock: number; price?: number };
type ProductVariant = {
  _id?: string;
  color: string;
  images?: ProductImage[];
  sizes: VariantSize[];
};

type Product = {
  _id: string;
  name: string;
  price: number;
  discountedPrice?: number;
  hasDiscount?: boolean;
  discountBy?: number;
  image: ProductImage[];
  category: any; // API returns object when reading; update expects id
  countInStock: number;
  description: string;
  featured?: boolean;
  variants?: ProductVariant[];
};

type VariantSizeInput = { size: string; stock: number | ""; price?: number | "" };

/** =========================
 *  Category helpers (flatten -> regular select)
 *  ========================= */
type FlatCat = { id: string; path: string; level: number; name: string };

function flattenCategories(tree: CategoryNode[] = []): FlatCat[] {
  const out: FlatCat[] = [];
  const walk = (nodes: CategoryNode[], level: number, parents: string[]) => {
    for (const n of nodes) {
      const nextParents = [...parents, n.name];
      out.push({ id: n._id, name: n.name, level, path: nextParents.join(" / ") });
      if (n.children?.length) walk(n.children, level + 1, nextParents);
    }
  };
  walk(tree, 0, []);
  return out;
}

/** ✅ Settings-style switch */
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
          checked
            ? "bg-emerald-600 border-emerald-600"
            : "bg-zinc-200 border-zinc-200 dark:bg-neutral-800 dark:border-neutral-700",
        )}
      />
      <span
        className={clsx(
          "absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition dark:bg-neutral-50",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </label>
  );
}

function ProductDetails(): JSX.Element {
  const language = useSelector((state: RootState) => state.language.lang);
  const dir = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";

  const t = useMemo(() => texts[language], [language]);

  const { id } = useParams();
  const productId = id as string;
  const navigate = useNavigate();

  const { data: product, refetch, isLoading: loadingProduct } = useGetProductByIdQuery(productId);
  const { data: categoryTree } = useGetCategoriesTreeQuery(undefined);

  const [deleteProduct, { isLoading: loadingDeleteProduct }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: loadingUpdateProduct }] = useUpdateProductMutation();
  const { refetch: refetchProducts } = useGetProductsQuery(undefined);

  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();
  const [uploadVariantImage, { isLoading: loadingUploadVariant }] = useUploadVariantImageMutation();

  const [clickEditProduct, setClickEditProduct] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  const [isAddVariantOpen, setIsAddVariantOpen] = useState(false);
  const [variantColor, setVariantColor] = useState("");
  const [variantSizes, setVariantSizes] = useState<VariantSizeInput[]>([{ size: "", stock: "" }]);
  const [variantFiles, setVariantFiles] = useState<File[]>([]);

  const [newName, setNewName] = useState("");

  /**
   * ✅ IMPORTANT: keep price as STRING while editing
   * so user can type "4.", "4.5", "4.500" without being coerced.
   */
  const [newPrice, setNewPrice] = useState<string>("");
  const [newCategory, setNewCategory] = useState("");
  const [newCountInStock, setNewCountInStock] = useState<number | "">("");
  const [newDescription, setNewDescription] = useState("");
  const [featured, setFeatured] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountBy, setDiscountBy] = useState<number>(0);
  const [discountedPrice, setDiscountedPrice] = useState<number>(0);

  const initializedRef = useRef(false);

  useEffect(() => {
    initializedRef.current = false;
  }, [productId]);

  useEffect(() => {
    if (!product || initializedRef.current) return;
    const p = product as Product;

    setNewName(p.name ?? "");
    // ✅ preserve 3 decimals in the input
    setNewPrice(typeof p.price === "number" ? p.price.toFixed(3) : "");
    setNewCategory((p as any)?.category?._id || (p as any)?.category || "");
    setNewCountInStock(typeof p.countInStock === "number" ? p.countInStock : "");
    setNewDescription(p.description ?? "");
    setFeatured(!!p.featured);

    setHasDiscount(!!p.hasDiscount);
    setDiscountBy(typeof p.discountBy === "number" ? p.discountBy : 0);

    initializedRef.current = true;
  }, [product]);

  // ✅ parse price string safely (allows "4", "4.", "4.5", "4.500")
  const parsedPrice = useMemo(() => {
    const s = (newPrice || "").trim();
    if (!s) return null;
    // allow only digits + one dot
    const ok = /^\d+(\.\d+)?$/.test(s);
    if (!ok) return null;
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }, [newPrice]);

  useEffect(() => {
    const priceNum = parsedPrice ?? 0;
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
  }, [discountBy, hasDiscount, parsedPrice]);

  const busy = loadingUploadImage || loadingUpdateProduct || loadingUploadVariant;

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(productId as string);
      toast.success(t.deleted);
      refetchProducts();
      navigate("/products");
    } catch (e: any) {
      toast.error(e?.data?.message || "Delete failed");
    }
  };

  const uploadManyImages = async (files: File[], uploader: any): Promise<ProductImage[] | null> => {
    const uploaded: ProductImage[] = [];
    if (!files?.length) return uploaded;

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("images", f));
      const res = await uploader(formData).unwrap();

      if (Array.isArray(res?.images)) {
        res.images.forEach((img: any) =>
          uploaded.push({ url: img.imageUrl, publicId: img.publicId }),
        );
      } else if (res?.imageUrl) {
        uploaded.push({ url: res.imageUrl, publicId: res.publicId });
      }

      return uploaded;
    } catch (err: any) {
      toast.error(err?.data?.message || t.imageUploadFailed);
      return null;
    }
  };

  const computeTotalStockFromVariants = (variants: ProductVariant[] = []) => {
    return variants.reduce((acc, v) => {
      const sum = (v?.sizes || []).reduce((s, size) => s + (Number(size.stock) || 0), 0);
      return acc + sum;
    }, 0);
  };

  const handleUpdateProduct = async () => {
    const p = product as Product;

    // ✅ validate fractional price
    const priceNum = parsedPrice ?? p.price;

    if (parsedPrice === null && newPrice.trim() !== "") {
      toast.error(isRTL ? "صيغة السعر غير صحيحة" : "Invalid price format");
      return;
    }
    if (typeof priceNum === "number" && priceNum <= 0) {
      toast.error(t.priceMustBePositive);
      return;
    }

    let uploadedImages: ProductImage[] = Array.isArray(p?.image) ? [...p.image] : [];

    if (selectedFiles.length > 0) {
      const res = await uploadManyImages(selectedFiles, uploadProductImage);
      if (!res) return;
      uploadedImages = res;
    }

    const currentVariants = Array.isArray(p?.variants) ? p.variants : [];
    const stockFromVariants = currentVariants.length
      ? computeTotalStockFromVariants(currentVariants)
      : null;

    const updatedProduct = {
      _id: p?._id || productId,
      name: (newName || p.name || "").trim(),
      price: priceNum,
      image: uploadedImages,
      category: newCategory || (p as any)?.category?._id || (p as any)?.category,
      countInStock:
        currentVariants.length > 0
          ? (stockFromVariants ?? p?.countInStock ?? 0)
          : typeof newCountInStock === "number"
            ? newCountInStock
            : (p?.countInStock ?? 0),
      description: (newDescription || p.description || "").trim(),
      featured,
      hasDiscount,
      discountBy,
      discountedPrice,
      variants: currentVariants,
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

  const cancelEdit = () => {
    const p = product as Product | undefined;
    if (!p) return;

    setClickEditProduct(false);
    setSelectedFiles([]);

    setNewName(p.name ?? "");
    setNewPrice(typeof p.price === "number" ? p.price.toFixed(3) : "");
    setNewCategory((p as any)?.category?._id || (p as any)?.category || "");
    setNewCountInStock(typeof p.countInStock === "number" ? p.countInStock : "");
    setNewDescription(p.description ?? "");
    setFeatured(!!p.featured);

    setHasDiscount(!!p.hasDiscount);
    setDiscountBy(typeof p.discountBy === "number" ? p.discountBy : 0);
  };

  const formatPrice = (v: number) => `KD ${v.toFixed(3)} `;

  const flatCats = useMemo(
    () => flattenCategories(((categoryTree as any) || []) as CategoryNode[]),
    [categoryTree],
  );

  const resetVariantForm = () => {
    setVariantColor("");
    setVariantSizes([{ size: "", stock: "" }]);
    setVariantFiles([]);
  };

  const buildVariantPayload = async (): Promise<ProductVariant | null> => {
    const color = variantColor.trim();
    if (!color) {
      toast.error(t.colorRequired);
      return null;
    }

    const cleanedSizes = variantSizes
      .map((s) => ({
        size: (s.size || "").trim(),
        stock: s.stock === "" ? NaN : Number(s.stock),
      }))
      .filter((s) => s.size.length > 0);

    const invalid =
      cleanedSizes.length === 0 || cleanedSizes.some((s) => Number.isNaN(s.stock) || s.stock < 0);

    if (invalid) {
      toast.error(t.invalidSizes);
      return null;
    }

    let uploadedVariantImages: ProductImage[] = [];
    if (variantFiles.length > 0) {
      const res = await uploadManyImages(variantFiles, uploadVariantImage);
      if (!res) return null;
      uploadedVariantImages = res;
    }

    return {
      color,
      sizes: cleanedSizes.map((s) => ({ size: s.size, stock: s.stock })),
      images: uploadedVariantImages,
    };
  };

  const handleAddVariant = async () => {
    const p = product as Product;
    if (!p) return;

    const payload = await buildVariantPayload();
    if (!payload) return;

    const existing: ProductVariant[] = Array.isArray(p.variants) ? [...p.variants] : [];

    const duplicate = existing.some(
      (v) => String(v?.color || "").toLowerCase() === payload.color.toLowerCase(),
    );
    if (duplicate) {
      toast.error(t.colorExists);
      return;
    }

    const nextVariants = [...existing, payload];
    const totalStock = computeTotalStockFromVariants(nextVariants);

    try {
      await updateProduct({
        _id: p._id,
        name: (newName || p.name || "").trim(),
        price: parsedPrice ?? p.price,
        image: Array.isArray(p.image) ? p.image : [],
        category: newCategory || (p as any)?.category?._id || (p as any)?.category,
        description: (newDescription || p.description || "").trim(),
        featured,
        hasDiscount,
        discountBy,
        discountedPrice,
        variants: nextVariants,
        countInStock: totalStock,
      }).unwrap();

      toast.success(t.variantAdded);
      setIsAddVariantOpen(false);
      resetVariantForm();
      refetch();
      refetchProducts();
    } catch (err: any) {
      toast.error(err?.data?.message || t.variantFailed);
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
          "px-4 w-full max-w-6xl py-6 my-10 min-h-screen font-custom",
          isRTL ? "rtl" : "ltr",
          "text-neutral-900 dark:text-neutral-100",
        )}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-950 dark:text-neutral-50">{t.title}</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {clickEditProduct ? (
              <>
                <button
                  onClick={cancelEdit}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900/60">
                  {t.cancel}
                </button>

                <button
                  onClick={handleUpdateProduct}
                  disabled={busy}
                  type="button"
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition",
                    "bg-neutral-950 text-white hover:bg-neutral-900 dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200",
                    busy ? "opacity-60 cursor-not-allowed" : "",
                  )}>
                  {busy && <Loader2Icon className="h-4 w-4 animate-spin" />}
                  {loadingUploadImage ? t.uploading : loadingUpdateProduct ? t.updating : t.update}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAddVariantOpen(true)}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900/60">
                  <Plus className="h-4 w-4" />
                  {t.addVariant}
                </button>

                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-rose-500 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-600 transition dark:bg-rose-600 dark:hover:bg-rose-700">
                  <Trash2 className="h-4 w-4" />
                  {t.delete}
                </button>

                <button
                  onClick={() => setIsDiscountModalOpen(true)}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200">
                  <Tag className="h-4 w-4" />
                  {t.createDiscount}
                </button>

                <button
                  onClick={() => setClickEditProduct(true)}
                  type="button"
                  className="inline-flex items-center gap-2 rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50 transition dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:hover:bg-neutral-900/60">
                  <PencilLine className="h-4 w-4" />
                  <span>{t.edit}</span>
                </button>
              </>
            )}
          </div>
        </div>

        <Separator className="my-4 bg-black/10 dark:bg-white/10" />

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Images card */}
          <div className="lg:col-span-5 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm overflow-hidden dark:border-neutral-800 dark:bg-neutral-950/70">
            <div className="px-5 py-5">
              {!clickEditProduct ? (
                p?.image?.length ? (
                  <img
                    src={p.image[0].url}
                    alt="Product"
                    className="w-full h-[360px] sm:h-[420px] object-cover rounded-2xl"
                  />
                ) : (
                  <div className="h-[360px] sm:h-[420px] rounded-2xl border border-neutral-200 bg-neutral-50 grid place-items-center text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-neutral-400">
                    {isRTL ? "لا توجد صور" : "No images"}
                  </div>
                )
              ) : (
                <div className="space-y-3">
                  <label className="cursor-pointer h-[360px] sm:h-[420px] flex flex-col items-center justify-center w-full p-4 bg-neutral-50 border-2 border-dashed border-neutral-300 rounded-2xl hover:bg-neutral-100 hover:border-neutral-400 transition dark:bg-neutral-900/40 dark:border-neutral-700 dark:hover:bg-neutral-900/70 dark:hover:border-neutral-600">
                    <div className="w-44 h-44">
                      <Lottie animationData={upload} loop />
                    </div>
                    <span className="text-neutral-700 font-semibold dark:text-neutral-200">
                      {t.uploadNewImages}
                    </span>

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
                    <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {t.selectedFiles}
                      </p>
                      <ul className="mt-2 list-disc pl-5 text-sm text-neutral-700 dark:text-neutral-300 space-y-1">
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
          <div className="lg:col-span-7 rounded-3xl border border-neutral-200 bg-white/80 backdrop-blur shadow-sm dark:border-neutral-800 dark:bg-neutral-950/70">
            <div className="p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-lg font-semibold text-neutral-950 dark:text-neutral-50">
                  {p?.name}
                </h2>

                <span
                  className={clsx(
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    p?.featured
                      ? "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/30 dark:text-teal-200"
                      : "border-neutral-200 bg-white text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300",
                  )}>
                  {p?.featured ? (
                    <Star className="h-3.5 w-3.5" />
                  ) : (
                    <StarOff className="h-3.5 w-3.5" />
                  )}
                  {t.featured}: {p?.featured ? t.yes : t.no}
                </span>
              </div>

              <Separator className="my-4 bg-black/10 dark:bg-white/10" />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Name */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.name}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100 break-words">
                      {p?.name}
                    </div>
                  ) : (
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-white/10"
                    />
                  )}
                </div>

                {/* Category (regular select) */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.category}</div>

                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100 break-words">
                      {(p as any)?.category?.name || "—"}
                    </div>
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className={clsx(
                        "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-white/10",
                        isRTL ? "text-right" : "text-left",
                      )}>
                      <option value="">{`-- ${t.chooseCategory} --`}</option>
                      {flatCats.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.path}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* ✅ Price (fractional allowed) */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.price}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100">
                      {p?.hasDiscount ? (
                        <div className="flex flex-col">
                          <span className="line-through text-neutral-500 dark:text-neutral-400 text-sm">
                            {formatPrice(p.price)}
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-300 text-lg">
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
                      onChange={(e) => {
                        const v = e.target.value;
                        // allow empty or digits + optional one dot + up to 3 decimals
                        if (v === "" || /^\d*(\.\d{0,3})?$/.test(v)) setNewPrice(v);
                      }}
                      inputMode="decimal"
                      placeholder="4.500"
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-white/10"
                    />
                  )}
                  {clickEditProduct && newPrice.trim() !== "" && parsedPrice === null ? (
                    <p className="mt-2 text-xs font-semibold text-rose-600 dark:text-rose-300">
                      {isRTL ? "صيغة السعر غير صحيحة" : "Invalid price format"}
                    </p>
                  ) : null}
                </div>

                {/* Stock */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.stock}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100">
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
                        "mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:focus:ring-white/10",
                        p?.variants?.length ? "opacity-60 cursor-not-allowed" : "",
                      )}
                    />
                  )}
                </div>

                {/* Featured */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">{t.featured}</div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100">
                      {p?.featured ? t.yes : t.no}
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <SettingsStyleSwitch checked={featured} onChange={setFeatured} />
                      <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                        {featured ? t.yes : t.no}
                      </span>
                    </div>
                  )}
                </div>

                {/* Discount quick view */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {isRTL ? "الخصم" : "Discount"}
                  </div>
                  <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100">
                    {p?.hasDiscount
                      ? `${Math.round((p.discountBy ?? 0) * 100)}%`
                      : isRTL
                        ? "لا يوجد"
                        : "None"}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDiscountModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-neutral-900 dark:text-neutral-100 underline decoration-neutral-400 dark:decoration-neutral-600">
                    {isRTL ? "تعديل الخصم" : "Edit discount"}
                  </button>
                </div>

                {/* Description */}
                <div className="sm:col-span-3 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {t.description}
                  </div>
                  {!clickEditProduct ? (
                    <div className="mt-1 font-semibold text-neutral-950 dark:text-neutral-100 whitespace-pre-line break-words">
                      {p?.description || "—"}
                    </div>
                  ) : (
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="mt-2 w-full h-28 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:ring-white/10"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Variants section */}
        {p?.variants?.length ? (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-neutral-950 dark:text-neutral-50">
                {t.variants}
              </h3>
              <span className="text-sm text-neutral-500 dark:text-neutral-400">
                {p.variants.length}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-2 gap-4">
              {p.variants.map((v: any) => (
                <VariantItem
                  key={v._id || v.color}
                  variant={v}
                  productId={p._id}
                  language={language}
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Delete Product Modal */}
        <DeleteProductModal
          isDeleteModalOpen={isDeleteModalOpen}
          setIsDeleteModalOpen={setIsDeleteModalOpen}
          loadingDeleteProduct={loadingDeleteProduct}
          handleDeleteProduct={handleDeleteProduct}
        />

        {/* Discount Modal */}
        <DiscountModal
          isDiscountModalOpen={isDiscountModalOpen}
          setIsDiscountModalOpen={setIsDiscountModalOpen}
          hasDiscount={hasDiscount}
          setHasDiscount={setHasDiscount}
          discountBy={discountBy}
          setDiscountBy={setDiscountBy}
          discountedPrice={discountedPrice}
          busy={busy}
          handleUpdateProduct={handleUpdateProduct}
          PERCENTAGE={PERCENTAGE}
        />

        {/* Add Variant Modal */}
        <AddVariantModal
          isAddVariantOpen={isAddVariantOpen}
          setIsAddVariantOpen={setIsAddVariantOpen}
          variantColor={variantColor}
          setVariantColor={setVariantColor}
          variantSizes={variantSizes}
          setVariantSizes={setVariantSizes}
          variantFiles={variantFiles}
          setVariantFiles={setVariantFiles}
          resetVariantForm={resetVariantForm}
          handleAddVariant={handleAddVariant}
          busy={busy}
        />
      </div>
    </Layout>
  );
}

export default ProductDetails;
