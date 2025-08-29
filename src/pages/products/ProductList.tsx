import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import {
  useGetProductsQuery,
  useUploadProductImageMutation,
  useCreateProductMutation,
  useGetAllCategoriesQuery,
  useGetDiscountStatusQuery,
  useGetCategoriesTreeQuery,
  useUploadVariantImageMutation,
} from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import { Box, Plus, Search } from "lucide-react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSelector } from "react-redux";
import { texts } from "./translation";
import Error from "@/components/Error";

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
    value: any
  ) => {
    const updated = [...variants];
    (updated[colorIndex].sizes[sizeIndex] as any)[field] = value;
    setVariants(updated);
  };
  const removeColorVariant = (index: number) => {
    const updated = [...variants];
    updated.splice(index, 1); // remove the variant at index
    setVariants(updated);
  };
  const removeSizeFromVariant = (colorIndex: number, sizeIndex: number) => {
    const updated = [...variants];
    updated[colorIndex].sizes.splice(sizeIndex, 1);
    setVariants(updated);
  };

  /* -- */

  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  console.log(imageFiles);
  // const [isCancelled, setIsCancelled] = useState(false);

  const language = useSelector((state: any) => state.language.lang);
  const navigate = useNavigate();

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
  const { data: discounts } = useGetDiscountStatusQuery(undefined);
  const { data: categories } = useGetAllCategoriesQuery(undefined);

  /* Create product fields */
  const [name, setName] = useState<string>("");
  const [price, setPrice] = useState<number | undefined>(undefined);
  // const [brand, setBrand] = useState<string>("");
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
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (selectedCategory) {
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
          (product: any) => product.countInStock > 0 && product.countInStock < 5
        );
      } else if (stockStatus === "out-of-stock") {
        filtered = filtered.filter((product: any) => product.countInStock === 0);
      }

      setFilteredProducts(filtered);
    }
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, stockStatus]);

  const handleCreateProduct = async () => {
    if (price && price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    if (!name || !price || imageFiles.length === 0 || !category || !countInStock || !description) {
      toast.error("All fields are required");
      return;
    }

    // Calculate total stock from variants if variants exist
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

        // Send all images in a single request
        const res = await uploadProductImage(formData).unwrap();

        // res.images is now an array of uploaded images
        uploadedImages = res.images.map((img: any) => ({
          url: img.imageUrl,
          publicId: img.publicId,
        }));

        console.log(uploadedImages);
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    /* Variants */
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

      // flatten sizes into variant schema
      for (const s of v.sizes) {
        variantPayload.push({
          options: { color: v.color, size: s.size },
          stock: s.stock,
          price: s.price,
          images: uploadedVariantImages,
        });
      }
    }
    /* --- */
    const newProduct = {
      name,
      price,
      image: uploadedImages,
      category,
      countInStock: totalStock, // ✅ use total stock from variants
      description,
      variants: variantPayload,
    };

    try {
      const result = await createProduct(newProduct);
      console.log("result creating product: ", result);

      if ("error" in result) {
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
    // setBrand("");
    setCategory("");
    setCountInStock(undefined);
    setDescription("");
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
            <div
              className={`flex justify-between items-center ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}>
              <h1
                dir={language === "ar" ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl  font-black flex gap-2 lg:gap-5 items-center">
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
                className="bg-black  drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] cursor-pointer hover:bg-black/70 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md">
                <Plus />
                {texts[language].addProduct}
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />

            {/* Filters */}
            <div className="mt-5 mb-2">
              <div className="flex flex-wrap items-center gap-4 mb-5">
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

                <div className="grid w-full grid-cols-4 gap-2 lg:gap-4">
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
              </div>
              {/* Table */}
              <div className="rounded-lg mb-10 border lg:p-10 bg-white overflow-x-auto">
                <table className="w-full min-w-[700px] border-gray-200 text-sm text-left text-gray-700">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b">{texts[language].name}</th>
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
                          onClick={() => navigate(`/admin/productlist/${product?._id}`)}>
                          <td className="px-4 py-3 flex items-center gap-2 max-w-64">
                            <img
                              className="w-16 h-16 object-cover "
                              src={product?.image[0].url}
                              alt="thumbnail"
                              loading="lazy"
                            />
                            <p className="truncate">{product?.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            {tree?.length ? findCategoryNameById(product?.category, tree) : "---"}
                          </td>
                          <td className="px-4 py-3">{product?.countInStock}</td>
                          <td className="px-4 py-3 ">
                            {product?.countInStock === 0 ? (
                              <p className="bg-red-50 rounded-xl  py-1 text-red-600 text-center border-red-100 border">
                                {texts[language].outOfStock}
                              </p>
                            ) : product.countInStock < 5 ? (
                              <p className="bg-orange-50 py-1 rounded-xl text-orange-600 text-center border-orange-100 border">
                                {texts[language].lowStock}
                              </p>
                            ) : (
                              <p className="bg-teal-50 py-1  rounded-xl text-teal-600 text-center border-teal-100 border">
                                {texts[language].inStock}
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {(() => {
                              const categoryName = findCategoryNameById(product.category, tree);
                              const discount = getDiscountForCategory(categoryName, discounts);
                              if (discount > 0) {
                                const discountedPrice = product.price - product.price * discount;
                                return (
                                  <div>
                                    <span className="line-through text-zinc-500 mr-2">
                                      {product?.price.toFixed(3)} KD
                                    </span>
                                    <span className="text-green-600 font-bold">
                                      {discountedPrice?.toFixed(3)} KD
                                    </span>
                                  </div>
                                );
                              }
                              return `${product?.price.toFixed(3)} KD`;
                            })()}
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

                {/* Pagination */}
                <Pagination className="py-2">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious onClick={() => page > 1 && setPage(page - 1)} href="#" />
                    </PaginationItem>

                    {[...Array(pages).keys()].map((x) => (
                      <PaginationItem key={x + 1}>
                        <PaginationLink
                          href="#"
                          isActive={page === x + 1}
                          onClick={() => setPage(x + 1)}>
                          {x + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext onClick={() => page < pages && setPage(page + 1)} href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create product modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{texts[language].addProduct}</DialogTitle>
          </DialogHeader>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT SIDE – Product Info */}
            <div className="space-y-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                className="p-2 w-full border rounded-md"
              />
              <div className="flex gap-2 flex-wrap">
                {imageFiles.map((file, i) => (
                  <img
                    key={i}
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                ))}
              </div>

              <input
                type="text"
                placeholder={texts[language].productName}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
              <textarea
                placeholder={texts[language].productDescription}
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="p-2 w-full border rounded-md"
              />
              <input
                type="number"
                value={price ?? ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="p-2 w-full border rounded-md"
                placeholder={texts[language].productPrice}
              />

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 w-full border rounded-md">
                <option value="" disabled>
                  {texts[language].selectCategory}
                </option>
                {tree?.length > 0 && renderCategoryOptions(tree)}
              </select>

              <input
                type="number"
                placeholder={texts[language].productStock}
                value={countInStock ?? ""}
                onChange={(e) => setCountInStock(Number(e.target.value))}
                className="p-2 w-full border rounded-md"
              />
              <Button variant="outline" onClick={() => setIsVariantsModalOpen(true)}>
                Manage Variants
              </Button>
            </div>

            {/* RIGHT SIDE – Variants preview */}
            <div className="space-y-4">
              {variants.map((v, i) => (
                <div key={i} className="border p-3 rounded space-y-3">
                  <p className="font-bold">{v.color || "No Color"}</p>
                  <div className="flex gap-2 flex-wrap">
                    {v.images.map((file, idx) => (
                      <img
                        key={idx}
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-16 h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                  {v.sizes.map((s, idx) => (
                    <p key={idx}>
                      {s.size || "No Size"} - {s.stock} in stock - {s.price} KD
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {texts[language].cancel}
            </Button>
            <Button
              variant="default"
              disabled={loadingCreateOrder || loadingUploadImage}
              onClick={handleCreateProduct}>
              {loadingUploadImage
                ? texts[language].uploading
                : loadingCreateOrder
                ? texts[language].creating
                : texts[language].create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VARIANTS MODAL */}
      <Dialog open={isVariantsModalOpen} onOpenChange={setIsVariantsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Variants</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Button
              type="button"
              onClick={addColorVariant}
              className="bg-blue-500 text-white px-3 py-1 rounded">
              + Add Variant
            </Button>
            {variants.map((v, i) => (
              <div key={i} className="border p-3 rounded space-y-3">
                {/* Remove entire variant */}
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    placeholder="Color Name"
                    value={v.color}
                    onChange={(e) => updateColorVariant(i, "color", e.target.value)}
                    className="p-2 w-full border rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    className="ml-2"
                    onClick={() => removeColorVariant(i)}>
                    Remove Variant
                  </Button>
                </div>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleColorImages(i, Array.from(e.target.files || []))}
                  className="mb-2"
                />
                <div className="flex gap-2 flex-wrap">
                  {v.images.map((file, idx) => (
                    <img
                      key={idx}
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  onClick={() => addSizeToVariant(i)}
                  className="bg-blue-500 text-white px-3 py-1 rounded">
                  + Add Size
                </Button>
                {v.sizes.map((s, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Size"
                      value={s.size}
                      onChange={(e) => updateSizeInVariant(i, idx, "size", e.target.value)}
                      className="p-2 border rounded w-20"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={s.price}
                      onChange={(e) => updateSizeInVariant(i, idx, "price", Number(e.target.value))}
                      className="p-2 border rounded w-24"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={s.stock}
                      onChange={(e) => updateSizeInVariant(i, idx, "stock", Number(e.target.value))}
                      className="p-2 border rounded w-24"
                    />
                    {/* Remove size */}
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeSizeFromVariant(i, idx)}>
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="default" onClick={() => setIsVariantsModalOpen(false)}>
              Done
            </Button>
          </DialogFooter>
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
// Find category name by id in category tree
const findCategoryNameById = (id: string, nodes?: any): string => {
  if (!nodes || !id) return "---";
  for (const node of nodes) {
    if (node._id === id) return node.name;
    if (node.children) {
      const result = findCategoryNameById(id, node.children);
      if (result !== "---") return result;
    }
  }
  return "---";
};
// Get discount percentage for a given category
const getDiscountForCategory = (categoryName: string, discounts?: any): number => {
  if (!discounts || !Array.isArray(discounts)) return 0;
  const discountEntry = discounts.find((d) => d.category.includes(categoryName));
  return discountEntry ? discountEntry.discountBy : 0;
};

export default ProductList;
