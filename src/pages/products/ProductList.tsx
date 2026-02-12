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
import Badge from "../../components/Badge";
import {
  Box,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
} from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { texts } from "./translation";
import Error from "@/components/Error";
import Paginate from "@/components/Paginate";
import CreateProductModal from "../../components/CreateProductModal";

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
      return (
        <Badge variant="danger" icon={false} className="py-1 rounded-full">
          {texts[language].outOfStock}
        </Badge>
      );
    if (countInStock < 5)
      return (
        <Badge variant="pending" icon={false} className="py-1 rounded-full">
          {texts[language].lowStock}
        </Badge>
      );
    return (
      <Badge variant="success" icon={false} className="py-1 rounded-full">
        {texts[language].inStock}
      </Badge>
    );
  };

  const PricePill = ({ product }: { product: any }) => {
    const base = Number(product?.price || 0).toFixed(3);
    const discounted = Number(product?.discountedPrice || 0).toFixed(3);

    return product?.hasDiscount ? (
      <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-black text-gray-900 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100">
        <span className="text-green-700 dark:text-emerald-300">{discounted} KD</span>
        <span className="h-3 w-px bg-gray-200 dark:bg-neutral-800" />
        <span className="text-gray-500 dark:text-neutral-400 line-through font-bold">
          {base} KD
        </span>
      </div>
    ) : (
      <div className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-black text-gray-900 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100">
        {base} KD
      </div>
    );
  };

  // ✅ NEW: Featured badge
  const FeaturedBadge = () => (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
      <Star className="h-3 w-3" />
      {isRTL ? "مميز" : "Featured"}
    </span>
  );

  const headerCount = productsData?.total ?? filteredProducts.length;

  return (
    <Layout>
      {errorGettingProducts ? (
        <Error />
      ) : loadingProducts ? (
        <Loader />
      ) : (
        <div className="flex w-full mb-10 lg:w-4xl min-h-screen lg:min-h-auto justify-between py-3 mt-[70px] lg:mt-[50px] px-4 text-neutral-900 dark:text-neutral-100">
          <div className="w-full">
            {/* HEADER */}
            <div className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
              <h1
                dir={isRTL ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center text-neutral-900 dark:text-neutral-50">
                {texts[language].products}:
                <Badge icon={false}>
                  <Box className="size-5 sm:size-6" />
                  <p className="text-sm lg:text-sm">
                    {headerCount}{" "}
                    <span className="hidden lg:inline">{texts[language].products}</span>
                  </p>
                </Badge>
              </h1>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-neutral-950 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-900 transition dark:bg-neutral-50 dark:text-neutral-950 dark:hover:bg-neutral-200">
                {texts[language].addProduct}
                <Plus className="size-4" />
              </button>
            </div>

            <Separator className="my-4 bg-black/20 dark:bg-white/10" />

            {/* SEARCH + MOBILE FILTER BUTTON */}
            <div className="mt-5 mb-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative w-full lg:w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-neutral-500">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={texts[language].searchProducts}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:border-2 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500 dark:focus:border-sky-400"
                  />
                </div>

                {/* Mobile only: Filters toggle */}
                <div className="w-full lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters((v) => !v)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold flex items-center justify-between dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      {isRTL ? "الفلاتر" : "Filters"}
                      {activeFiltersCount > 0 ? (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-black text-white text-xs w-5 h-5 dark:bg-neutral-50 dark:text-neutral-950">
                          {activeFiltersCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-gray-500 dark:text-neutral-400">
                      {showMobileFilters ? (isRTL ? "إخفاء" : "Hide") : isRTL ? "عرض" : "Show"}
                    </span>
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div className={`${showMobileFilters ? "block" : "hidden"} lg:block`}>
                <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 lg:gap-4 mb-5">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100">
                    <option value="">{texts[language].allCategories}</option>
                    {categories?.map((cat: any) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    placeholder={texts[language].minPrice}
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  />
                  <input
                    type="number"
                    placeholder={texts[language].maxPrice}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100 dark:placeholder:text-neutral-500"
                  />

                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100">
                    <option value="">{texts[language].allStock}</option>
                    <option value="in-stock">{texts[language].inStock}</option>
                    <option value="low-stock">{texts[language].lowStock}</option>
                    <option value="out-of-stock">{texts[language].outOfStock}</option>
                  </select>

                  {/* ✅ Featured filter */}
                  <label className="border bg-white border-gray-300 rounded-lg p-2 text-sm font-bold flex items-center justify-between gap-2 dark:bg-neutral-950 dark:border-neutral-800 dark:text-neutral-100">
                    <span className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-500 dark:text-amber-300" />
                      {isRTL ? "المميز" : "Featured"}
                    </span>
                    <input
                      type="checkbox"
                      checked={onlyFeatured}
                      onChange={(e) => setOnlyFeatured(e.target.checked)}
                      className="h-4 w-4 accent-black dark:accent-white"
                    />
                  </label>
                </div>

                {activeFiltersCount > 0 ? (
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs text-gray-500 dark:text-neutral-400">
                      {isRTL ? "فلاتر مفعّلة" : "Active filters"}:{" "}
                      <span className="font-bold">{activeFiltersCount}</span>
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-bold text-gray-700 hover:text-black inline-flex items-center gap-1 dark:text-neutral-300 dark:hover:text-neutral-50">
                      <X className="h-4 w-4" />
                      {isRTL ? "مسح" : "Clear"}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block rounded-lg mb-10 border lg:p-5 bg-white overflow-x-auto dark:bg-neutral-950 dark:border-neutral-800">
                <table className="w-full min-w-[820px] text-sm text-left text-gray-700 dark:text-neutral-200">
                  <thead className="bg-white text-gray-900/50 font-semibold dark:bg-neutral-950 dark:text-neutral-400">
                    <tr>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        {texts[language].name}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        {texts[language].variants}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        {texts[language].category}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        {texts[language].stock}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        {texts[language].status}
                      </th>
                      <th className="px-4 py-3 border-b border-gray-200 dark:border-neutral-800">
                        {texts[language].price}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950">
                    {filteredProducts?.length > 0 ? (
                      filteredProducts?.map((product: any) => (
                        <tr
                          key={product?._id}
                          className="hover:bg-gray-100 dark:hover:bg-neutral-900/60 cursor-pointer transition-all duration-300 font-bold"
                          onClick={() => navigate(`/products/${product?._id}`)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 max-w-64">
                              <img
                                className="w-16 h-16 object-cover rounded-md bg-gray-50 border shrink-0 dark:bg-neutral-900/50 dark:border-neutral-800"
                                src={product?.image?.[0]?.url}
                                alt="thumbnail"
                                loading="lazy"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-neutral-900 dark:text-neutral-100">
                                  {product?.name}
                                </p>
                                {product?.featured ? (
                                  <div className="mt-1">
                                    <FeaturedBadge />
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">{product?.variants?.length}</td>
                          <td className="px-4 py-3">{product?.category?.name}</td>
                          <td className="px-4 py-3">{product?.countInStock}</td>

                          <td className="px-4 py-3">
                            <StockBadge countInStock={product?.countInStock ?? 0} />
                          </td>

                          <td className="px-4 py-3">
                            {product?.hasDiscount ? (
                              <div>
                                <span className="line-through text-zinc-500 dark:text-neutral-500 mr-2">
                                  {product.price.toFixed(3)} KD
                                </span>
                                <span className="text-green-600 dark:text-emerald-300 font-bold">
                                  {product.discountedPrice.toFixed(3)} KD
                                </span>
                              </div>
                            ) : (
                              `${product.price.toFixed(3)} KD`
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-gray-500 dark:text-neutral-500">
                          {texts[language].noProductsFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden mb-10">
                {filteredProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProducts.map((product: any) => {
                      const arrow = isRTL ? (
                        <ChevronLeft className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400 dark:text-neutral-500" />
                      );

                      return (
                        <button
                          key={product?._id}
                          onClick={() => navigate(`/products/${product?._id}`)}
                          className="w-full text-left rounded-2xl border bg-white p-3 shadow-sm hover:bg-gray-50 transition dark:bg-neutral-950 dark:border-neutral-800 dark:hover:bg-neutral-900/60">
                          <div className="flex gap-3 items-stretch">
                            <div className="shrink-0">
                              <img
                                className="w-20 h-20 rounded-xl object-cover bg-gray-50 border dark:bg-neutral-900/50 dark:border-neutral-800"
                                src={product?.image?.[0]?.url}
                                alt="thumbnail"
                                loading="lazy"
                              />
                            </div>

                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-black dark:text-neutral-100 truncate">
                                    {product?.name}
                                  </p>

                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <p className="text-xs text-gray-500 dark:text-neutral-400 truncate">
                                      {product?.category?.name || "—"} •{" "}
                                      <span className="font-bold text-gray-700 dark:text-neutral-200">
                                        {product?.variants?.length ?? 0}
                                      </span>{" "}
                                      {texts[language].variants}
                                    </p>

                                    {product?.featured ? <FeaturedBadge /> : null}
                                  </div>
                                </div>

                                <div className="pt-0.5">{arrow}</div>
                              </div>

                              <div className="mt-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <StockBadge countInStock={product?.countInStock ?? 0} />
                                  <span className="text-xs text-gray-600 dark:text-neutral-300 font-bold truncate">
                                    {texts[language].stock}: {product?.countInStock ?? 0}
                                  </span>
                                </div>

                                <PricePill product={product} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    <div className="pt-2">
                      <Paginate page={page} pages={pages} setPage={setPage} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-neutral-500 py-10">
                    {texts[language].noProductsFound}
                  </div>
                )}
              </div>
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
