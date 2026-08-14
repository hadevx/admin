// src/pages/products/ProductList.tsx
import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import {
  useGetProductsQuery,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useUploadVariantImageMutation,
} from "../../redux/queries/productApi";
import {
  useGetAllCategoriesQuery,
  useGetCategoriesTreeQuery,
} from "../../redux/queries/categoryApi";
import { Box, Plus, SlidersHorizontal, X, ChevronRight, Star, ImageOff } from "lucide-react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { texts } from "./translation";
import Error from "@/components/Error";
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import { PageSkeleton } from "@/components/Skeleton";
import CreateProductModal from "../../components/CreateProductModal";
import clsx from "clsx";

function ProductList() {
  const [page, setPage] = useState(1);

  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  /**
   * UI values:
   * - "" (all)
   * - "in-stock" (>=5)
   * - "low-stock" (1..4)
   * - "out-of-stock" (0)
   *
   * Backend supports only ?inStock=true (countInStock > 0).
   */
  const [stockStatus, setStockStatus] = useState<string>("");

  // ✅ NEW: featured filter
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);

  // refine only what backend can't express (out-of-stock thresholds)
  const [filteredProducts, setFilteredProducts] = useState<any>([]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const [variants, setVariants] = useState<
    {
      color: string;
      images: File[];
      sizes: { size: string; price: string; stock: string }[];
    }[]
  >([]);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const language = useSelector((state: any) => state.language.lang);
  const navigate = useNavigate();
  const isRTL = language === "ar";
  const t = texts[language];

  // ✅ Map UI filters -> backend params
  const queryArgs = useMemo(() => {
    const inStockParam = stockStatus === "in-stock" || stockStatus === "low-stock";

    return {
      pageNumber: page,
      keyword: searchQuery,
      limit: 30,
      category: selectedCategory, // ✅ server now supports it
      featured: onlyFeatured, // ✅ server now supports it
      inStock: inStockParam,
      minPrice: minPrice !== "" ? Number(minPrice) : "",
      maxPrice: maxPrice !== "" ? Number(maxPrice) : "",
    };
  }, [page, searchQuery, selectedCategory, minPrice, maxPrice, stockStatus, onlyFeatured]);

  const {
    data: productsData,
    isLoading: loadingProducts,
    isFetching: fetchingProducts,
    error: errorGettingProducts,
  } = useGetProductsQuery(queryArgs);

  const products = productsData?.products || [];
  const pages = productsData?.pages || 1;

  const { data: tree } = useGetCategoriesTreeQuery(undefined);
  const { data: categories } = useGetAllCategoriesQuery(undefined);

  /* Create product fields */
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState<string>("");
  const [countInStock, setCountInStock] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>("");

  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();
  const [createProduct, { isLoading: loadingCreateOrder }] = useCreateProductMutation();
  const [uploadVariantImage] = useUploadVariantImageMutation();

  // ✅ Client refinement only for out-of-stock thresholds (backend only has inStock>0)
  useEffect(() => {
    let list = [...products];

    if (stockStatus === "in-stock") {
      list = list.filter((p: any) => Number(p?.countInStock || 0) >= 5);
    } else if (stockStatus === "low-stock") {
      list = list.filter((p: any) => {
        const s = Number(p?.countInStock || 0);
        return s > 0 && s < 5;
      });
    } else if (stockStatus === "out-of-stock") {
      list = list.filter((p: any) => Number(p?.countInStock || 0) === 0);
    }

    setFilteredProducts(list);
  }, [products, stockStatus]);

  // reset page when filters change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, minPrice, maxPrice, stockStatus, onlyFeatured]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (selectedCategory) n++;
    if (minPrice !== "") n++;
    if (maxPrice !== "") n++;
    if (stockStatus) n++;
    if (onlyFeatured) n++;
    return n;
  }, [selectedCategory, minPrice, maxPrice, stockStatus, onlyFeatured]);

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setStockStatus("");
    setOnlyFeatured(false);
  };

  const resetForm = () => {
    setName("");
    setPrice(undefined);
    setImageFiles([]);
    setCategory("");
    setCountInStock(undefined);
    setDescription("");
    setVariants([]);
  };

  const handleCreateProduct = async () => {
    if (price && price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    if (!name || !price || imageFiles.length === 0 || !category || !description) {
      toast.error("All fields are required");
      return;
    }

    let totalStock = countInStock ?? 0;
    if (variants.length > 0) {
      totalStock = variants.reduce((acc, v) => {
        const variantStock = v.sizes.reduce((sum, s) => sum + Number(s.stock), 0);
        return acc + variantStock;
      }, 0);
    } else {
      if (!countInStock && countInStock !== 0) {
        toast.error("Stock is required if no variants exist");
        return;
      }
    }

    let uploadedImages: { url: string; publicId: string }[] = [];

    if (imageFiles.length > 0) {
      try {
        const formData = new FormData();
        imageFiles.forEach((file) => formData.append("images", file));
        const res = await uploadProductImage(formData).unwrap();
        uploadedImages = res.images.map((img: any) => ({
          url: img.imageUrl,
          publicId: img.publicId,
        }));
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    const variantPayload: any[] = [];

    for (const v of variants) {
      let uploadedVariantImages: { url: string; publicId: string }[] = [];

      if (v.images.length > 0) {
        const formData = new FormData();
        v.images.forEach((file) => formData.append("images", file));
        const res = await uploadVariantImage(formData).unwrap();
        uploadedVariantImages = res.images.map((img: any) => ({
          url: img.imageUrl,
          publicId: img.publicId,
        }));
      }

      variantPayload.push({
        color: v.color,
        images: uploadedVariantImages,
        sizes: v.sizes.map((s) => ({
          size: s.size,
          stock: Number(s.stock),
          price: Number(s.price),
        })),
      });
    }

    const newProduct = {
      name,
      price,
      image: uploadedImages,
      category,
      countInStock: totalStock,
      description,
      variants: variantPayload,
    };

    try {
      const result = await createProduct(newProduct);
      if ("error" in (result as any)) {
        toast.error("Error creating product");
      } else {
        toast.success("Product created");
        setIsCreateModalOpen(false);
        resetForm();
      }
    } catch {
      toast.error("Failed to create product");
    }
  };

  const StockBadge = ({ countInStock }: { countInStock: number }) => {
    if (countInStock === 0)
      return <span className="ws-pill ws-pill-danger">{t.outOfStock}</span>;
    if (countInStock < 5)
      return <span className="ws-pill ws-pill-warning">{t.lowStock}</span>;
    return <span className="ws-pill ws-pill-success">{t.inStock}</span>;
  };

  const PricePill = ({ product }: { product: any }) => {
    const base = Number(product?.price || 0).toFixed(3);
    const discounted = Number(product?.discountedPrice || 0).toFixed(3);

    return product?.hasDiscount ? (
      <div className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
          {discounted} KD
        </span>
        <span className="text-xs font-semibold text-muted-foreground line-through">{base} KD</span>
      </div>
    ) : (
      <span className="whitespace-nowrap font-extrabold">{base} KD</span>
    );
  };

  const FeaturedBadge = () => (
    <span className="ws-pill ws-pill-warning">
      <Star className="size-3 fill-current" />
      {isRTL ? "مميز" : "Featured"}
    </span>
  );

  const Thumb = ({ product, size = "size-14" }: { product: any; size?: string }) => {
    const url = product?.image?.[0]?.url;
    return url ? (
      <img
        className={clsx(size, "shrink-0 rounded-xl border border-border object-cover")}
        src={url}
        alt=""
        loading="lazy"
      />
    ) : (
      <div
        className={clsx(
          size,
          "grid shrink-0 place-items-center rounded-xl border border-border bg-muted text-muted-foreground",
        )}>
        <ImageOff className="size-5" />
      </div>
    );
  };

  const headerCount = productsData?.total ?? filteredProducts.length;

  return (
    <Layout>
      {errorGettingProducts ? (
        <Error />
      ) : loadingProducts ? (
        <PageSkeleton />
      ) : (
        <div className="animate-fade-up">
          <PageHeader
            title={t.products}
            subtitle={isRTL ? "أدر الكتالوج والمخزون" : "Manage your catalogue and stock"}
            icon={Box}
            count={headerCount}
            countLabel={` ${t.products}`}
            actions={
              <button onClick={() => setIsCreateModalOpen(true)} className="ws-btn-primary">
                <Plus className="size-4" />
                {t.addProduct}
              </button>
            }
          />

          {/* Search + filters */}
          <div className="ws-card mb-5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={t.searchProducts}
                className="flex-1"
              />

              <button
                type="button"
                onClick={() => setShowMobileFilters((v) => !v)}
                className="ws-btn-secondary justify-between sm:hidden">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4" />
                  {isRTL ? "الفلاتر" : "Filters"}
                  {activeFiltersCount > 0 ? (
                    <span className="grid size-5 place-items-center rounded-full bg-emphasis text-[11px] font-bold text-emphasis-foreground">
                      {activeFiltersCount}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {showMobileFilters ? (isRTL ? "إخفاء" : "Hide") : isRTL ? "عرض" : "Show"}
                </span>
              </button>
            </div>

            <div className={clsx(showMobileFilters ? "block" : "hidden", "sm:block")}>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="ws-select">
                  <option value="">{t.allCategories}</option>
                  {categories?.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder={t.minPrice}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="ws-input"
                />
                <input
                  type="number"
                  placeholder={t.maxPrice}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="ws-input"
                />

                <select
                  value={stockStatus}
                  onChange={(e) => setStockStatus(e.target.value)}
                  className="ws-select">
                  <option value="">{t.allStock}</option>
                  <option value="in-stock">{t.inStock}</option>
                  <option value="low-stock">{t.lowStock}</option>
                  <option value="out-of-stock">{t.outOfStock}</option>
                </select>

                {/* ✅ Featured filter */}
                <label
                  className={clsx(
                    "flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                    onlyFeatured
                      ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                      : "border-input bg-card text-muted-foreground hover:bg-muted",
                  )}>
                  <span className="flex items-center gap-2">
                    <Star className={clsx("size-4", onlyFeatured && "fill-current")} />
                    {isRTL ? "المميز" : "Featured"}
                  </span>
                  <input
                    type="checkbox"
                    checked={onlyFeatured}
                    onChange={(e) => setOnlyFeatured(e.target.checked)}
                    className="size-4 accent-amber-500"
                  />
                </label>
              </div>

              {activeFiltersCount > 0 ? (
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    {isRTL ? "فلاتر مفعّلة" : "Active filters"}:{" "}
                    <span className="font-bold text-foreground">{activeFiltersCount}</span>
                  </p>
                  <button type="button" onClick={clearFilters} className="ws-chip">
                    <X className="size-3.5" />
                    {isRTL ? "مسح" : "Clear"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <div
            className={clsx("transition-opacity duration-200", fetchingProducts && "opacity-60")}>
            {/* Desktop table */}
            <div className="hidden lg:block">
              <div className="ws-table-wrap">
                <table className="ws-table">
                  <thead>
                    <tr>
                      <th>{t.name}</th>
                      <th>{t.variants}</th>
                      <th>{t.category}</th>
                      <th>{t.stock}</th>
                      <th>{t.status}</th>
                      <th className="text-end">{t.price}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts?.length > 0 ? (
                      filteredProducts.map((product: any) => (
                        <tr
                          key={product?._id}
                          className="ws-row-link"
                          onClick={() => navigate(`/products/${product?._id}`)}>
                          <td>
                            <div className="flex max-w-sm items-center gap-3">
                              <Thumb product={product} />
                              <div className="min-w-0">
                                <p className="truncate font-bold">{product?.name}</p>
                                {product?.featured ? (
                                  <div className="mt-1">
                                    <FeaturedBadge />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="ws-pill ws-pill-neutral">
                              {product?.variants?.length ?? 0}
                            </span>
                          </td>
                          <td className="text-muted-foreground">{product?.category?.name || "—"}</td>
                          <td className="font-bold">{product?.countInStock}</td>

                          <td>
                            <StockBadge countInStock={product?.countInStock ?? 0} />
                          </td>

                          <td className="text-end">
                            <PricePill product={product} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <EmptyState
                            title={t.noProductsFound}
                            description={
                              isRTL ? "عدّل الفلاتر أو البحث." : "Adjust your filters or search."
                            }
                            icon={Box}
                            action={
                              activeFiltersCount > 0 ? (
                                <button onClick={clearFilters} className="ws-btn-secondary">
                                  <X className="size-4" />
                                  {isRTL ? "مسح الفلاتر" : "Clear filters"}
                                </button>
                              ) : null
                            }
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Paginate page={page} pages={pages} setPage={setPage} />
            </div>

            {/* Mobile / tablet cards */}
            <div className="lg:hidden">
              {filteredProducts?.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredProducts.map((product: any) => (
                      <button
                        key={product?._id}
                        onClick={() => navigate(`/products/${product?._id}`)}
                        className="ws-card w-full p-3 text-start transition active:scale-[0.99]">
                        <div className="flex items-stretch gap-3">
                          <Thumb product={product} size="size-20" />

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold">{product?.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {product?.category?.name || "—"} •{" "}
                                  <span className="font-bold text-foreground">
                                    {product?.variants?.length ?? 0}
                                  </span>{" "}
                                  {t.variants}
                                </p>
                                {product?.featured ? (
                                  <div className="mt-1.5">
                                    <FeaturedBadge />
                                  </div>
                                ) : null}
                              </div>

                              <ChevronRight
                                className={clsx(
                                  "mt-0.5 size-4 shrink-0 text-muted-foreground",
                                  isRTL && "rotate-180",
                                )}
                              />
                            </div>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                              <StockBadge countInStock={product?.countInStock ?? 0} />
                              <PricePill product={product} />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <Paginate page={page} pages={pages} setPage={setPage} />
                </>
              ) : (
                <div className="ws-card">
                  <EmptyState
                    title={t.noProductsFound}
                    description={isRTL ? "عدّل الفلاتر أو البحث." : "Adjust your filters or search."}
                    icon={Box}
                    action={
                      activeFiltersCount > 0 ? (
                        <button onClick={clearFilters} className="ws-btn-secondary">
                          <X className="size-4" />
                          {isRTL ? "مسح الفلاتر" : "Clear filters"}
                        </button>
                      ) : null
                    }
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CreateProductModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        language={language}
        tree={tree}
        renderCategoryOptions={renderCategoryOptions}
        name={name}
        setName={setName}
        price={price}
        setPrice={setPrice}
        category={category}
        setCategory={setCategory}
        description={description}
        setDescription={setDescription}
        countInStock={countInStock}
        setCountInStock={setCountInStock}
        imageFiles={imageFiles}
        setImageFiles={setImageFiles}
        variants={variants}
        setVariants={setVariants}
        onCreate={handleCreateProduct}
        onReset={resetForm}
        creating={loadingCreateOrder}
        uploading={loadingUploadImage}
      />
    </Layout>
  );
}

// Recursively render category options for dropdown
export const renderCategoryOptions = (nodes: any, level = 0): JSX.Element[] => {
  return nodes.flatMap((node: any) => [
    <option key={node._id} value={node._id}>
      {"‣ ".repeat(level)}
      {node.name}
    </option>,
    ...(node.children ? renderCategoryOptions(node.children, level + 1) : []),
  ]);
};

export default ProductList;
