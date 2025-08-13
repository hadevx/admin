import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import { useGetProductsQuery } from "../../redux/queries/productApi";
import Badge from "../../components/Badge";
import { Box, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { Separator } from "@/components/ui/separator";
import { Loader2Icon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { clsx } from "clsx";
import { Button } from "@/components/ui/button";
import {
  useUploadProductImageMutation,
  useCreateProductMutation,
  useGetCategoriesQuery,
  useGetDiscountStatusQuery,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import { useGetCategoriesTreeQuery } from "../../redux/queries/productApi";
import discounts from "./../discounts/Discounts";
import CategoryTree from "./../categories/CategoryTree";

function ProductList() {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockStatus, setStockStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();

  const { data: products, refetch, isLoading: loadingProducts } = useGetProductsQuery();
  const { data: tree, refetch: refetchTree } = useGetCategoriesTreeQuery();

  const { data: discounts } = useGetDiscountStatusQuery();
  // const categoryName = findCategoryNameById(newCategory, categoryTree) || newCategory;
  console.log("tree", tree);

  useEffect(() => {
    if (products) {
      let filtered = [...products];

      // Search
      if (searchQuery) {
        filtered = filtered.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Category
      if (selectedCategory) {
        filtered = filtered.filter((product) => product.category === selectedCategory);
      }

      // Price Range
      if (minPrice !== "") {
        filtered = filtered.filter((product) => product.price >= parseFloat(minPrice));
      }
      if (maxPrice !== "") {
        filtered = filtered.filter((product) => product.price <= parseFloat(maxPrice));
      }

      // Stock
      if (stockStatus === "in-stock") {
        filtered = filtered.filter((product) => product.countInStock >= 5);
      } else if (stockStatus === "low-stock") {
        filtered = filtered.filter(
          (product) => product.countInStock > 0 && product.countInStock < 5
        );
      } else if (stockStatus === "out-of-stock") {
        filtered = filtered.filter((product) => product.countInStock === 0);
      }

      setFilteredProducts(filtered);
    }
  }, [products, searchQuery, selectedCategory, minPrice, maxPrice, stockStatus]);

  /* Create products */
  const [name, setName] = useState("");
  const [price, setPrice] = useState();
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState();
  const [description, setDescription] = useState("");

  const [uploadProductImage, { isLoading: loadingUpload }] = useUploadProductImageMutation();
  const [createProduct, { isLoading: loadingCreateOrder }] = useCreateProductMutation();
  const { data: categories, refetch: refetchCat } = useGetCategoriesQuery();

  const hnadleCreateProduct = async () => {
    if (price <= 0) {
      toast.error("Price must be a positive number");
      return;
    }
    if (!name || !price || !image || !category || !countInStock || !description) {
      toast.error("All fields are required");
      return;
    }

    const newProduct = {
      name,
      price,
      image,
      brand,
      category: category.charAt(0).toUpperCase() + category.slice(1),
      countInStock,
      description,
    };

    const result = await createProduct(newProduct);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product created");
      refetch();
      setIsModalOpen(false);
      // ✅ Reset form fields
      setName("");
      setPrice("");
      setImage("");
      setBrand("");
      setCategory("");
      setCountInStock("");
      setDescription("");
    }
  };
  const uploadFileHandler = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setImage(res.image);

      console.log(res);
    } catch (error) {
      toast.error(error?.data.message || error?.error);
    }
  };
  /* ------- */

  return (
    <Layout>
      {loadingProducts ? (
        <Loader />
      ) : (
        <div className="lg:px-4 flex w-full lg:w-4xl min-h-screen lg:min-h-auto justify-between py-3 mt-[50px] px-2 lg:ml-[50px]  ">
          <div className="w-full">
            <div className="flex justify-between items-center ">
              <h1 className=" text-sm lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
                Products:{" "}
                <Badge icon={false}>
                  <Box />
                  {products?.length > 0 ? products?.length : "0"} products
                </Badge>
              </h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black cursor-pointer hover:bg-black/70 transition-all duration-300 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md ">
                <Plus />
                Add new Product
              </button>
            </div>

            <Separator className="my-4 bg-black/20" />
            <div className=" w-full max-w-full  mt-10  lg:w-4xl mb-2 overflow-hidden ">
              <div className="flex flex-wrap items-center gap-4 mb-5">
                {/* Search Input */}
                <div className="relative w-full lg:w-64">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none  focus:border-blue-500 focus:border-2"
                  />
                </div>

                <div className="grid grid-cols-4 lg:grid-cols-4 gap-2 lg:gap-4 ">
                  {/* Category Filter */}
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm">
                    <option value="">All Categories</option>
                    {categories?.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  {/* Price Range Filter */}
                  <input
                    type="number"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:border-2 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm focus:border-blue-500 focus:border-2 focus:outline-none"
                  />

                  {/* Stock Filter */}
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value)}
                    className="border bg-white border-gray-300 rounded-lg p-2 text-sm">
                    <option value="">All Stock</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock (&lt; 5)</option>
                    <option value="out-of-stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className=" rounded-lg border lg:p-10 bg-white  overflow-x-auto">
                <table className="w-full overflow-x-scroll rounded-lg min-w-[700px]  border-gray-200 text-sm text-left text-gray-700 ">
                  <thead className="bg-white text-gray-900/50 font-semibold">
                    <tr>
                      <th className="px-4 py-3 border-b whitespace-nowrap">Name</th>
                      <th className="px-4 py-3 border-b">Category</th>
                      <th className="px-4 py-3 border-b">Stock</th>
                      <th className="px-4 py-3 border-b">Status</th>
                      <th className="px-4 py-3 border-b">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredProducts?.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr
                          key={product._id}
                          className="hover:bg-gray-100 cursor-pointer transition-all duration-300 font-bold"
                          onClick={() => navigate(`/admin/productlist/${product._id}`)}>
                          <td className="px-4 py-3 flex items-center gap-4 max-w-64  ">
                            <img
                              className="w-16"
                              src={product.image}
                              alt="thumbnail"
                              loading="lazy"
                            />
                            <p className="truncate">{product.name}</p>
                          </td>
                          <td className="px-4 py-3">
                            {tree?.length ? findCategoryNameById(product.category, tree) : "---"}
                          </td>
                          <td className="px-4 py-3">{product.countInStock}</td>
                          <td className="px-4 py-3 ">
                            {product.countInStock === 0 ? (
                              <p className="bg-red-50 rounded-xl  py-1  text-red-600 text-center border-red-100 border">
                                Out of stock
                              </p>
                            ) : product.countInStock < 5 ? (
                              <p className="bg-orange-50 py-1 rounded-xl text-orange-600 text-center border-orange-100 border">
                                Low stock
                              </p>
                            ) : (
                              <p className="bg-teal-50  py-1 rounded-xl text-teal-600 text-center border-teal-100 border">
                                In stock
                              </p>
                            )}
                          </td>

                          <td className="px-4 py-3">
                            {(() => {
                              const discount = getDiscountForCategory(
                                findCategoryNameById(product.category, tree),
                                discounts
                              );
                              if (discount > 0) {
                                const discountedPrice = product.price - product.price * discount;
                                return (
                                  <div>
                                    <span className="line-through text-zinc-500 mr-2">
                                      {product.price.toFixed(3)} KD
                                    </span>
                                    <span className="text-green-600 font-bold">
                                      {discountedPrice.toFixed(3)} KD
                                    </span>
                                  </div>
                                );
                              }
                              return `${product.price.toFixed(3)} KD`;
                            })()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                          No products found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Create product */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>
          <input
            type="file"
            placeholder={image}
            onChange={uploadFileHandler}
            className="p-2 cursor-pointer  w-full shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border"
          />
          <input
            type="text"
            placeholder="Product Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 w-full  shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border"
          />
          <textarea
            placeholder="Product Description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 w-full shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border"
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="p-2 w-full shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border"
            placeholder="Product Price"
          />
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="p-2 w-full shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border"
            placeholder="Product Brand (optional)"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 w-full shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border">
            <option value="" disabled>
              Select a category
            </option>
            {tree?.length > 0 && renderCategoryOptions(tree)}
          </select>
          <input
            type="number"
            placeholder="Product Stock"
            value={countInStock}
            onChange={(e) => setCountInStock(e.target.value)}
            className="p-2 w-full shadow border rounded-md h-full bg-gray-100 bg-opacity-50 py-3 px-4  outline-0 focus:shadow-[0_0_0_4px_rgba(74,157,236,0.2)] focus:border-[#4A9DEC] focus:border"
          />
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="default"
              disabled={loadingCreateOrder}
              onClick={() => hnadleCreateProduct()}>
              {loadingCreateOrder ? (
                <p className="flex justify-center items-center">
                  <Loader2Icon className="animate-spin" />
                </p>
              ) : (
                <p className="flex justify-center items-center">Create</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --------- */}
    </Layout>
  );
}
const renderCategoryOptions = (nodes, level = 0) => {
  return nodes.map((node) => (
    <React.Fragment key={node._id}>
      <option value={node._id}>
        {"‣ ".repeat(level)}
        {node.name}
      </option>
      {node.children && renderCategoryOptions(node.children, level + 1)}
    </React.Fragment>
  ));
};
const findCategoryNameById = (id, nodes) => {
  if (!nodes) return "---";
  if (!id) return "---"; // handles null, undefined, empty

  for (const node of nodes) {
    if (node._id === id) return node.name;
    if (node.children) {
      const result = findCategoryNameById(id, node.children);
      if (result !== "---") return result;
    }
  }

  // console.warn("Category ID not found:", id);
  return "---";
};
const getDiscountForCategory = (categoryId, discounts) => {
  if (!discounts || !Array.isArray(discounts)) return 0;
  const discountEntry = discounts.find((d) => d.category.includes(categoryId));
  return discountEntry ? discountEntry.discountBy : 0;
};

export default ProductList;
