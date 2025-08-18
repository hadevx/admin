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

const texts: any = {
  en: {
    products: "Products",
    addProduct: "Add new Product",
    allCategories: "All Categories",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    allStock: "All Stock",
    inStock: "In Stock",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",
    searchProducts: "Search products...",
    name: "Name",
    category: "Category",
    stock: "Stock",
    status: "Status",
    price: "Price",
    cancel: "Cancel",
    create: "Create",
    uploading: "Uploading...",
    creating: "Creating...",
    productName: "Product Name",
    productDescription: "Product Description",
    productPrice: "Product Price",
    productBrand: "Product Brand (optional)",
    selectCategory: "Select a category",
    productStock: "Product Stock",
    noProductsFound: "No products found.",
  },
  ar: {
    products: "المنتجات",
    addProduct: "إضافة منتج جديد",
    allCategories: "جميع الفئات",
    minPrice: "السعر الأدنى",
    maxPrice: "السعر الأعلى",
    allStock: "جميع المخزون",
    inStock: "متوفر",
    lowStock: "المخزون منخفض",
    outOfStock: "غير متوفر",
    searchProducts: "ابحث عن المنتجات...",
    name: "الاسم",
    category: "الفئة",
    stock: "المخزون",
    status: "الحالة",
    price: "السعر",
    cancel: "إلغاء",
    create: "إنشاء",
    uploading: "جارٍ الرفع...",
    creating: "جارٍ الإنشاء...",
    productName: "اسم المنتج",
    productDescription: "وصف المنتج",
    productPrice: "سعر المنتج",
    productBrand: "ماركة المنتج (اختياري)",
    selectCategory: "اختر الفئة",
    productStock: "المخزون",
    noProductsFound: "لا توجد منتجات.",
  },
};

function ProductList() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const language = useSelector((state: any) => state.language.lang);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [stockStatus, setStockStatus] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filteredProducts, setFilteredProducts] = useState<any>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCancelled, setIsCancelled] = useState(false);
  const navigate = useNavigate();

  const { data: productsData, isLoading: loadingProducts } = useGetProductsQuery({
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
  const [brand, setBrand] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [countInStock, setCountInStock] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState<string>("");

  const [uploadProductImage, { isLoading: loadingUploadImage }] = useUploadProductImageMutation();
  const [createProduct, { isLoading: loadingCreateOrder }] = useCreateProductMutation();

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
    if (!name || !price || !imageFile || !category || !countInStock || !description) {
      toast.error("All fields are required");
      return;
    }

    let uploadedImage = "";
    let uploadedPublicId = "";
    if (imageFile) {
      const formData = new FormData();
      formData.append("image", imageFile);

      try {
        const res = await uploadProductImage(formData).unwrap();
        if (isCancelled) return;
        uploadedImage = res.image;
        uploadedPublicId = res.publicId;
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    const newProduct = {
      name,
      price,
      image: uploadedImage,
      imagePublicId: uploadedPublicId,
      brand,
      category,
      countInStock,
      description,
    };

    try {
      const result = await createProduct(newProduct);
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
    setImageFile(null);
    setBrand("");
    setCategory("");
    setCountInStock(undefined);
    setDescription("");
  };

  return (
    <Layout>
      {loadingProducts ? (
        <Loader />
      ) : (
        <div className="flex w-full mb-10 lg:w-4xl min-h-screen lg:min-h-auto justify-between py-3 mt-[50px] px-4 ">
          <div className="w-full">
            <div className="flex justify-between items-center">
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
            <div className="mt-10 mb-2">
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
                              src={product?.image}
                              alt="thumbnail"
                              loading="lazy"
                            />
                            <p className="truncate">{product?.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            {tree?.length ? findCategoryNameById(product?.category, tree) : "---"}
                          </td>
                          <td className="px-4 py-3">{product?.countInStock}</td>
                          <td className="px-4 py-3">
                            {product?.countInStock === 0 ? (
                              <p className="bg-red-50 rounded-xl py-1 text-red-600 text-center border-red-100 border">
                                {texts[language].outOfStock}
                              </p>
                            ) : product.countInStock < 5 ? (
                              <p className="bg-orange-50 py-1 rounded-xl text-orange-600 text-center border-orange-100 border">
                                {texts[language].lowStock}
                              </p>
                            ) : (
                              <p className="bg-teal-50 py-1 rounded-xl text-teal-600 text-center border-teal-100 border">
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
                <Pagination>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{texts[language].addProduct}</DialogTitle>
          </DialogHeader>
          <input
            type="file"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="p-2 w-full border rounded-md"
          />
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
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="p-2 w-full border rounded-md"
            placeholder={texts[language].productBrand}
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
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setIsCancelled(true);
                window.location.reload();
              }}>
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
    </Layout>
  );
}

const renderCategoryOptions = (nodes: any, level = 0): JSX.Element[] => {
  return nodes.flatMap((node: any) => [
    <option key={node._id} value={node._id}>
      {"‣ ".repeat(level)}
      {node.name}
    </option>,
    ...(node.children ? renderCategoryOptions(node.children, level + 1) : []),
  ]);
};

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

const getDiscountForCategory = (categoryName: string, discounts?: any): number => {
  if (!discounts || !Array.isArray(discounts)) return 0;
  const discountEntry = discounts.find((d) => d.category.includes(categoryName));
  return discountEntry ? discountEntry.discountBy : 0;
};

export default ProductList;
