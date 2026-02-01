import { useEffect, useMemo, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import {
  useGetProductsQuery,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useGetAllCategoriesQuery,
  useGetCategoriesTreeQuery,
  useUploadVariantImageMutation,
} from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import {
  Box,
  Plus,
  Search,
  ImagePlus,
  SlidersHorizontal,
  X,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";

import { useSelector } from "react-redux";
import { texts } from "./translation";
import Error from "@/components/Error";
import Paginate from "@/components/Paginate";
import { COLORS } from "./constants";

function ProductList() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [stockStatus, setStockStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filteredProducts, setFilteredProducts] = useState<any>([]);
  const [isVariantsModalOpen, setIsVariantsModalOpen] = useState<boolean>(false);

  // ✅ Mobile: filters hidden until user clicks button
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // For product variants
  const [variants, setVariants] = useState<
    {
      color: string;
      images: File[];
      sizes: { size: string; price: string; stock: string }[];
    }[]
  >([]);

  /*Variants helpers  */
  const addColorVariant = () => {
    setVariants([...variants, { color: "", images: [], sizes: [] }]);
  };

  const updateColorVariant = (index: number, field: string, value: any) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  const handleColorImages = (index: number, files: File[]) => {
    const updated = [...variants];
    updated[index].images = files;
    setVariants(updated);
  };

  const addSizeToVariant = (index: number) => {
    const updated = [...variants];
    updated[index].sizes.push({ size: "", price: "", stock: "" });
    setVariants(updated);
  };

  const updateSizeInVariant = (
    colorIndex: number,
    sizeIndex: number,
    field: string,
    value: any,
  ) => {
    const updated = [...variants];
    (updated[colorIndex].sizes[sizeIndex] as any)[field] = value;
    setVariants(updated);
  };

  const removeColorVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  const removeSizeFromVariant = (colorIndex: number, sizeIndex: number) => {
    const updated = [...variants];
    updated[colorIndex].sizes.splice(sizeIndex, 1);
    setVariants(updated);
  };

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const language = useSelector((state: any) => state.language.lang);
  const navigate = useNavigate();

  const isRTL = language === "ar";

  const {
    data: productsData,
    isLoading: loadingProducts,
    error: errorGettingProducts,
  } = useGetProductsQuery({
    pageNumber: page,
    keyword: searchQuery,
  });

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

  useEffect(() => {
    if (products) {
      let filtered: any = [...products];

      if (searchQuery) {
        filtered = filtered.filter((product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }
      if (selectedCategory) {
        // NOTE: keeping your logic as requested
        filtered = filtered.filter((product: any) => product.category === selectedCategory);
      }
      if (minPrice !== "") {
        filtered = filtered.filter((product: any) => product.price >= parseFloat(minPrice));
      }
      if (maxPrice !== "") {
        filtered = filtered.filter((product: any) => product.price <= parseFloat(maxPrice));
      }
      if (stockStatus === "in-stock") {
        filtered = filtered.filter((product: any) => product.countInStock >= 5);
      } else if (stockStatus === "low-stock") {
        filtered = filtered.filter(
          (product: any) => product.countInStock > 0 && product.countInStock < 5,
        );
      } else if (stockStatus === "out-of-stock") {
        filtered = filtered.filter((product: any) => product.countInStock === 0);
      }

      setFilteredProducts(filtered);
    }
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, stockStatus]);

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (selectedCategory) n++;
    if (minPrice !== "") n++;
    if (maxPrice !== "") n++;
    if (stockStatus) n++;
    return n;
  }, [selectedCategory, minPrice, maxPrice, stockStatus]);

  const clearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setStockStatus("");
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
      if (!countInStock) {
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

    let variantPayload: any[] = [];

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
        setIsModalOpen(false);
        resetForm();
      }
    } catch (err) {
      toast.error("Failed to create product");
    }
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

  const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

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
      <div className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-black text-gray-900">
        <span className="text-green-700">{discounted} KD</span>
        <span className="h-3 w-px bg-gray-200" />
        <span className="text-gray-500 line-through font-bold">{base} KD</span>
      </div>
    ) : (
      <div className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-black text-gray-900">
        {base} KD
      </div>
    );
  };

  return (
    <Layout>
      {errorGettingProducts ? (
        <Error />
      ) : loadingProducts ? (
        <Loader />
      ) : (
        <div className="flex w-full mb-10 lg:w-4xl min-h-screen lg:min-h-auto justify-between py-3 mt-[70px] lg:mt-[50px] px-4 ">
          <div className="w-full">
            {/* ===================== HEADER (UNCHANGED) ===================== */}
            <div className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
              <h1
                dir={isRTL ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
                {texts[language].products}:
                <Badge icon={false}>
                  <Box />
                  <p className="text-lg lg:text-sm">
                    {productsData?.total ?? 0}{" "}
                    <span className="hidden lg:inline">{texts[language].products}</span>
                  </p>
                </Badge>
              </h1>

              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] cursor-pointer hover:bg-black/70 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md">
                <Plus />
                {texts[language].addProduct}
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* ===================== SEARCH + MOBILE FILTER BUTTON ===================== */}
            <div className="mt-5 mb-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative w-full lg:w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={texts[language].searchProducts}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                  />
                </div>

                {/* ✅ Mobile only: Filters toggle */}
                <div className="w-full lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters((v) => !v)}
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      {isRTL ? "الفلاتر" : "Filters"}
                      {activeFiltersCount > 0 ? (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-black text-white text-xs w-5 h-5">
                          {activeFiltersCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-gray-500">
                      {showMobileFilters ? (isRTL ? "إخفاء" : "Hide") : isRTL ? "عرض" : "Show"}
                    </span>
                  </button>
                </div>
              </div>

              {/* ===================== FILTERS ===================== */}
              {/* ✅ Desktop: same grid as before (4 cols). Mobile: collapsible */}
              <div className={`${showMobileFilters ? "block" : "hidden"} lg:block`}>
                <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-5">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm">
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
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm"
                  />
                  <input
                    type="number"
                    placeholder={texts[language].maxPrice}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm"
                  />

                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm">
                    <option value="">{texts[language].allStock}</option>
                    <option value="in-stock">{texts[language].inStock}</option>
                    <option value="low-stock">{texts[language].lowStock}</option>
                    <option value="out-of-stock">{texts[language].outOfStock}</option>
                  </select>
                </div>

                {activeFiltersCount > 0 ? (
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs text-gray-500">
                      {isRTL ? "فلاتر مفعّلة" : "Active filters"}:{" "}
                      <span className="font-bold">{activeFiltersCount}</span>
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-bold text-gray-700 hover:text-black inline-flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {isRTL ? "مسح" : "Clear"}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* ===================== PRODUCTS LIST (DESKTOP TABLE UNCHANGED) ===================== */}
              {/* Desktop Table */}
              <div className="hidden lg:block rounded-lg mb-10 border lg:p-5 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">{texts[language].name}</th>
                      <th className="px-4 py-3 border-b">{texts[language].variants}</th>
                      <th className="px-4 py-3 border-b">{texts[language].category}</th>
                      <th className="px-4 py-3 border-b">{texts[language].stock}</th>
                      <th className="px-4 py-3 border-b">{texts[language].status}</th>
                      <th className="px-4 py-3 border-b">{texts[language].price}</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredProducts?.length > 0 ? (
                      filteredProducts?.map((product: any) => (
                        <tr
                          key={product?._id}
                          className="hover:bg-gray-100 cursor-pointer transition-all duration-300 font-bold"
                          onClick={() => navigate(`/productlist/${product?._id}`)}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 max-w-64">
                              {/* ✅ same size everywhere */}
                              <img
                                className="w-16 h-16 object-cover rounded-md bg-gray-50 border shrink-0"
                                src={product?.image?.[0]?.url}
                                alt="thumbnail"
                                loading="lazy"
                              />
                              <p className="truncate">{product?.name}</p>
                            </div>
                          </td>

                          <td className="px-4 py-3">{product?.variants?.length}</td>
                          <td className="px-4 py-3">{product?.category?.name}</td>
                          <td className="px-4 py-3">{product?.countInStock}</td>

                          <td className="px-4 py-3 ">
                            <StockBadge countInStock={product?.countInStock ?? 0} />
                          </td>

                          <td className="px-4 py-3">
                            {product?.hasDiscount ? (
                              <div>
                                <span className="line-through text-zinc-500 mr-2">
                                  {product.price.toFixed(3)} KD
                                </span>
                                <span className="text-green-600 font-bold">
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
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                          {texts[language].noProductsFound}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <Paginate page={page} pages={pages} setPage={setPage} />
              </div>

              {/* ✅ Mobile: Better cards, price in ONE pill "plate" */}
              <div className="lg:hidden mb-10">
                {filteredProducts?.length > 0 ? (
                  <div className="space-y-3">
                    {filteredProducts.map((product: any) => {
                      const arrow = isRTL ? (
                        <ChevronLeft className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      );

                      return (
                        <button
                          key={product?._id}
                          onClick={() => navigate(`/productlist/${product?._id}`)}
                          className="w-full text-left rounded-2xl border bg-white p-3 shadow-sm hover:bg-gray-50 transition">
                          <div className="flex gap-3 items-stretch">
                            {/* Image */}
                            <div className="shrink-0">
                              <img
                                className="w-20 h-20 rounded-xl object-cover bg-gray-50 border"
                                src={product?.image?.[0]?.url}
                                alt="thumbnail"
                                loading="lazy"
                              />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1 flex flex-col justify-between">
                              {/* Top row */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className=" text-black truncate">{product?.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                                    {product?.category?.name || "—"} •{" "}
                                    <span className="font-bold text-gray-700">
                                      {product?.variants?.length ?? 0}
                                    </span>{" "}
                                    {texts[language].variants}
                                  </p>
                                </div>
                                <div className="pt-0.5">{arrow}</div>
                              </div>

                              {/* Bottom row: badges + price plate */}
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                  <StockBadge countInStock={product?.countInStock ?? 0} />
                                  <span className="text-xs text-gray-600 font-bold truncate">
                                    {texts[language].stock}: {product?.countInStock ?? 0}
                                  </span>
                                </div>

                                {/* ✅ Price on ONE "plate" */}
                                <PricePill product={product} />
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}

                    {/* ✅ mobile pagination */}
                    <div className="pt-2">
                      <Paginate page={page} pages={pages} setPage={setPage} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-10">
                    {texts[language].noProductsFound}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================== CREATE PRODUCT MODAL (same as your last version) ======================== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent
          className="
      w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)]
      max-w-[1100px] xl:max-w-[1280px]
      p-0 overflow-hidden
      max-h-[90vh] flex flex-col
    ">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold">
                {texts[language].addProduct}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                {language === "ar"
                  ? "أضف بيانات المنتج ثم أضف المتغيرات (الألوان والمقاسات) إذا لزم."
                  : "Add product info, then manage variants (colors & sizes) if needed."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* LEFT: PRODUCT FORM */}
              <div className="px-4 sm:px-6 py-5 sm:py-6 bg-white">
                <div className="space-y-5">
                  {/* Images */}
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-900 mb-3">
                      {language === "ar" ? "صور المنتج" : "Product Images"}
                    </p>

                    <label className="block cursor-pointer">
                      <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-5 hover:bg-neutral-100 hover:border-neutral-400 transition">
                        <div className="flex justify-between items-center gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-neutral-900">
                              {language === "ar" ? "رفع الصور" : "Upload images"}
                            </p>
                            <p className="text-xs text-neutral-500">
                              {language === "ar"
                                ? "PNG / JPG — يمكنك اختيار عدة صور"
                                : "PNG / JPG — multiple allowed"}
                            </p>
                          </div>

                          <span className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
                            <ImagePlus className="h-4 w-4" />
                            {imageFiles.length}
                          </span>
                        </div>

                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                          className="hidden"
                        />
                      </div>
                    </label>

                    {imageFiles.length > 0 ? (
                      <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-2">
                        {imageFiles.map((file, i) => (
                          <div key={i} className="rounded-xl overflow-hidden border bg-white">
                            <img
                              src={URL.createObjectURL(file)}
                              className="h-20 w-full object-cover"
                              alt="preview"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-neutral-500">
                        {language === "ar" ? "لا توجد صور مختارة" : "No images selected"}
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div className="rounded-2xl border bg-white p-4">
                    <label className="text-xs font-semibold text-neutral-600">
                      {texts[language].productName}
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={texts[language].productName}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                    />
                  </div>

                  {/* Description */}
                  <div className="rounded-2xl border bg-white p-4">
                    <label className="text-xs font-semibold text-neutral-600">
                      {texts[language].productDescription}
                    </label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={texts[language].productDescription}
                      className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                    />
                  </div>

                  {/* Price + Category + Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-2xl border bg-white p-4">
                      <label className="text-xs font-semibold text-neutral-600">
                        {texts[language].productPrice}
                      </label>
                      <div className="relative mt-2">
                        <input
                          type="number"
                          value={price ?? ""}
                          onChange={(e) => setPrice(Number(e.target.value))}
                          placeholder={texts[language].productPrice}
                          className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 pr-12 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-500">
                          KD
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-white p-4">
                      <label className="text-xs font-semibold text-neutral-600">
                        {texts[language].selectCategory}
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10">
                        <option value="" disabled>
                          {texts[language].selectCategory}
                        </option>
                        {tree?.length > 0 && renderCategoryOptions(tree)}
                      </select>
                    </div>

                    <div className="rounded-2xl border bg-white p-4 sm:col-span-2">
                      <label className="text-xs font-semibold text-neutral-600">
                        {texts[language].productStock}
                      </label>
                      <input
                        type="number"
                        value={countInStock ?? ""}
                        disabled={variants.length > 0}
                        onChange={(e) => setCountInStock(Number(e.target.value))}
                        className={`mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10 ${
                          variants.length ? "opacity-60 cursor-not-allowed" : ""
                        }`}
                      />
                      {variants.length > 0 ? (
                        <p className="mt-2 text-xs text-neutral-500">
                          {language === "ar"
                            ? "المخزون يُحسب تلقائياً من المتغيرات."
                            : "Stock is calculated automatically from variants."}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: VARIANTS PREVIEW */}
              <div className="px-4 sm:px-6 py-5 sm:py-6 bg-neutral-50 lg:border-l">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-neutral-900">
                      {language === "ar" ? "المتغيرات" : "Variants"}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {language === "ar"
                        ? "معاينة الألوان والمقاسات والصور."
                        : "Preview colors, sizes, and images."}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    className="rounded-xl"
                    onClick={() => setIsVariantsModalOpen(true)}>
                    {language === "ar" ? "إدارة" : "Manage"}
                  </Button>
                </div>

                {variants.length > 0 ? (
                  <div className="space-y-3">
                    {variants.map((variant, i) => {
                      const total = (variant.sizes || []).reduce(
                        (sum: number, s: any) => sum + Number(s.stock || 0),
                        0,
                      );

                      return (
                        <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900">
                                {language === "ar" ? "اللون" : "Color"}:{" "}
                                <span className="font-bold">
                                  {variant.color || `Variant ${i + 1}`}
                                </span>
                              </p>
                              <p className="text-xs text-neutral-500 mt-1">
                                {language === "ar" ? "إجمالي المخزون" : "Total stock"}:{" "}
                                <span className="font-semibold text-neutral-800">{total}</span>
                              </p>
                            </div>

                            <span className="inline-flex items-center rounded-full border bg-neutral-50 px-3 py-1 text-xs font-semibold text-neutral-700">
                              {(variant.sizes || []).length} {language === "ar" ? "مقاس" : "sizes"}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-xs font-semibold text-neutral-600">
                              {language === "ar" ? "الصور" : "Images"}
                            </p>

                            {variant.images?.length > 0 ? (
                              <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 gap-2">
                                {variant.images.map((file: File, idx: number) => (
                                  <div
                                    key={idx}
                                    className="h-12 w-12 rounded-xl overflow-hidden border bg-white">
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt="variant preview"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-neutral-400">
                                {language === "ar" ? "لا توجد صور" : "No images"}
                              </p>
                            )}
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-semibold text-neutral-600">
                              {language === "ar" ? "المقاسات" : "Sizes"}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">
                              {(variant.sizes || []).map((s: any, idx: number) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-semibold text-neutral-700">
                                  <span className="text-neutral-900">{s.size || "—"}</span>
                                  <span className="h-1 w-1 rounded-full bg-neutral-300" />
                                  <span className="text-neutral-500">
                                    {language === "ar" ? "مخزون" : "stock"}: {s.stock ?? 0}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed bg-white p-6 text-center">
                    <p className="text-sm font-semibold text-neutral-800">
                      {language === "ar" ? "لا توجد متغيرات حتى الآن" : "No variants yet"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {language === "ar"
                        ? "أضف لونًا ومقاسات وصور من زر إدارة المتغيرات."
                        : "Add color, sizes and optional images from Manage variants."}
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-4 rounded-xl"
                      onClick={() => setIsVariantsModalOpen(true)}>
                      {language === "ar" ? "إضافة متغيرات" : "Add variants"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t bg-white shrink-0">
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button
                variant="outline"
                className="rounded-xl w-full sm:w-auto"
                onClick={() => setIsModalOpen(false)}>
                {language === "ar" ? "إغلاق" : "Close"}
              </Button>

              <Button
                className="rounded-xl w-full sm:w-auto bg-neutral-950 hover:bg-neutral-900"
                disabled={loadingCreateOrder || loadingUploadImage}
                onClick={handleCreateProduct}>
                {loadingUploadImage
                  ? texts[language].uploading
                  : loadingCreateOrder
                    ? texts[language].creating
                    : texts[language].create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ======================== VARIANTS MODAL (left as-is) ======================== */}
      <Dialog open={isVariantsModalOpen} onOpenChange={setIsVariantsModalOpen}>
        <DialogContent
          className="
      w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)]
      max-w-[1100px] xl:max-w-[1280px]
      p-0 overflow-hidden
      max-h-[90vh] flex flex-col
      rounded-3xl
    ">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b bg-white shrink-0">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold">
                {language === "ar" ? "إدارة المتغيرات" : "Manage Variants"}
              </DialogTitle>
              <DialogDescription className="text-sm text-neutral-500">
                {language === "ar"
                  ? "أضف الألوان واربطها بالمقاسات والمخزون، ويمكن إضافة صور لكل لون."
                  : "Add colors, sizes & stock, and optional images per color."}
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 sm:py-6 bg-neutral-50">
            <div className="space-y-4">
              {variants.map((variant, i) => (
                <div key={i} className="rounded-2xl border bg-white p-4 shadow-sm">
                  {/* COLOR (type OR select) */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-semibold text-neutral-600">
                            {language === "ar" ? "اللون" : "Color"}
                          </label>
                          <p className="text-[11px] text-neutral-500 mt-0.5">
                            {language === "ar" ? "اكتب اللون أو اختره" : "Type or select a color"}
                          </p>
                        </div>

                        <span
                          className="h-4 w-4 rounded-full border border-neutral-200"
                          style={{
                            backgroundColor: variant.color?.trim().toLowerCase() || "transparent",
                          }}
                          title={variant.color || ""}
                        />
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-12 gap-2">
                        <div className="sm:col-span-7">
                          <input
                            type="text"
                            placeholder={language === "ar" ? "مثال: أسود" : "e.g. Black"}
                            value={variant.color}
                            onChange={(e) => updateColorVariant(i, "color", e.target.value)}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                          />
                        </div>

                        <div className="sm:col-span-5">
                          <select
                            value=""
                            onChange={(e) => {
                              if (!e.target.value) return;
                              updateColorVariant(i, "color", e.target.value);
                            }}
                            className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10">
                            <option value="">
                              {language === "ar" ? "اختر لون" : "Select color"}
                            </option>
                            {COLORS.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      className="rounded-xl"
                      onClick={() => removeColorVariant(i)}>
                      {language === "ar" ? "حذف اللون" : "Remove color"}
                    </Button>
                  </div>

                  <Separator className="my-4 bg-black/10" />

                  {/* Images */}
                  <div className="rounded-2xl border bg-white p-4">
                    <p className="text-sm font-semibold text-neutral-900 mb-2">
                      {language === "ar" ? "صور اللون (اختياري)" : "Color images (optional)"}
                    </p>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleColorImages(i, Array.from(e.target.files || []))}
                      className="block w-full text-sm text-neutral-700 file:mr-4 file:rounded-xl file:border-0
                  file:bg-neutral-950 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white
                  hover:file:bg-neutral-900"
                    />

                    {variant.images?.length > 0 ? (
                      <div className="mt-4 grid grid-cols-6 sm:grid-cols-10 gap-2">
                        {variant.images.map((file, idx) => (
                          <div
                            key={idx}
                            className="h-12 w-12 rounded-xl overflow-hidden border bg-white">
                            <img
                              src={URL.createObjectURL(file)}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-3 text-xs text-neutral-400">
                        {language === "ar" ? "لا توجد صور" : "No images"}
                      </p>
                    )}
                  </div>

                  {/* Sizes */}
                  <div className="mt-4 rounded-2xl border bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">
                          {language === "ar" ? "المقاسات" : "Sizes"}
                        </p>
                        <p className="text-[11px] text-neutral-500 mt-0.5">
                          {language === "ar"
                            ? "اكتب المقاس أو اختره (يمكن تخصيص المقاس)"
                            : "Type a size or select it (custom sizes allowed)"}
                        </p>
                      </div>

                      <Button
                        className="rounded-xl"
                        variant="secondary"
                        onClick={() => addSizeToVariant(i)}>
                        <Plus className="h-4 w-4 mr-2" />
                        {language === "ar" ? "إضافة مقاس" : "Add size"}
                      </Button>
                    </div>

                    <div className="mt-4 space-y-3">
                      {variant.sizes.map((s, j) => (
                        <div
                          key={j}
                          className="rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                            <div className="sm:col-span-5">
                              <label className="text-xs font-semibold text-neutral-600">
                                {language === "ar" ? "المقاس" : "Size"}
                              </label>
                              <input
                                type="text"
                                placeholder={language === "ar" ? "مثال: XL أو 42" : "e.g. XL or 42"}
                                value={s.size}
                                onChange={(e) => updateSizeInVariant(i, j, "size", e.target.value)}
                                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="text-xs font-semibold text-neutral-600">
                                {language === "ar" ? "اختيار سريع" : "Quick select"}
                              </label>
                              <select
                                value=""
                                onChange={(e) => {
                                  if (!e.target.value) return;
                                  updateSizeInVariant(i, j, "size", e.target.value);
                                }}
                                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10">
                                <option value="">{language === "ar" ? "اختر" : "Select"}</option>
                                {SIZES.map((c) => (
                                  <option key={c} value={c}>
                                    {c}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div className="sm:col-span-2">
                              <label className="text-xs font-semibold text-neutral-600">
                                {language === "ar" ? "المخزون" : "Stock"}
                              </label>
                              <input
                                type="number"
                                min={0}
                                placeholder="10"
                                value={s.stock}
                                onChange={(e) => updateSizeInVariant(i, j, "stock", e.target.value)}
                                className="mt-2 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-950/10"
                              />
                            </div>

                            <div className="sm:col-span-2">
                              <Button
                                variant="destructive"
                                className="rounded-xl w-full"
                                onClick={() => removeSizeFromVariant(i, j)}>
                                {language === "ar" ? "حذف" : "Remove"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <Button
                onClick={addColorVariant}
                className="w-full rounded-2xl bg-neutral-950 hover:bg-neutral-900">
                <Plus className="h-4 w-4 mr-2" />
                {language === "ar" ? "إضافة لون" : "Add color"}
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-4 border-t bg-white shrink-0 flex items-center justify-end">
            <Button className="rounded-xl" onClick={() => setIsVariantsModalOpen(false)}>
              {language === "ar" ? "تم" : "Done"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

// Recursively render category options for dropdown
const renderCategoryOptions = (nodes: any, level = 0): JSX.Element[] => {
  return nodes.flatMap((node: any) => [
    <option key={node._id} value={node._id}>
      {"‣ ".repeat(level)}
      {node.name}
    </option>,
    ...(node.children ? renderCategoryOptions(node.children, level + 1) : []),
  ]);
};

export default ProductList;
