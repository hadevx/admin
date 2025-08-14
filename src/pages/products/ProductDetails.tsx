import React from "react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../Layout";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import { PencilLine } from "lucide-react";
import {
  useGetProductByIdQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetProductsQuery,
  useUploadProductImageMutation,
} from "../../redux/queries/productApi";
import { Separator } from "@/components/ui/separator";
import { useGetCategoriesTreeQuery } from "../../redux/queries/productApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2Icon } from "lucide-react";

function ProductDetails() {
  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState<number>();
  const [newImage, setNewImage] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newCountInStock, setNewCountInStock] = useState<number>();
  const [newDescription, setNewDescription] = useState("");

  const { data: categoryTree } = useGetCategoriesTreeQuery(undefined);

  const { id: productId } = useParams();
  const navigate = useNavigate();
  const [clickEditProduct, setClickEditProduct] = useState(false);
  const { data: product, refetch, isLoading: loadingProduct } = useGetProductByIdQuery(productId);
  const [deleteProduct, { isLoading: loadingDeleteProduct }] = useDeleteProductMutation();
  const [updateProduct, { isLoading: loadingUpdateProduct }] = useUpdateProductMutation();
  const { refetch: refetchProducts } = useGetProductsQuery(undefined);
  const [uploadProductImage] = useUploadProductImageMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (product) {
      setNewName(product.name);
      setNewPrice(product.price);
      setNewImage(product.image);
      setNewBrand(product.brand);
      setNewCategory(product.category);
      setNewCountInStock(product.countInStock);
      setNewDescription(product.description);
    }
  }, [product]);

  const handleDeleteProduct = async () => {
    if (product) {
      await deleteProduct(productId);
      toast.success("Product deleted successfully");
      refetchProducts();
      navigate("/admin/productlist");
    }
  };

  const categoryName = findCategoryNameById(newCategory, categoryTree) || newCategory;
  console.log(categoryName);

  const handleUpdateProduct = async () => {
    if (newPrice && newPrice <= 0) {
      toast.error("Price must be a positive number");
      return;
    }

    const updatedProduct = {
      _id: productId,
      name: newName || product.name,
      price: newPrice || product.price,
      image: newImage || product.image,
      brand: newBrand || product.brand,
      category: newCategory || product.category,
      countInStock: newCountInStock || product.countInStock,
      description: newDescription || product.description,
    };

    const result = await updateProduct(updatedProduct).unwrap();
    console.log(result);
    setClickEditProduct(!clickEditProduct);
    refetch();
    refetchProducts();

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Product updated");
    }
  };

  const uploadFileHandler = async (e: any) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);

    try {
      const res = await uploadProductImage(formData).unwrap();
      toast.success(res.message);
      setNewImage(res.image);
    } catch (error: any) {
      toast.error(error?.data?.message || error?.error);
    }
  };
  /*   useEffect(() => {
    if (product?.category && !findCategoryNameById(product.category, categoryTree)) {
      console.log("Refetching category tree...");
      refetchCategories(); // make sure this function exists and works
    }
  }, [product, categoryTree]); */

  return (
    <Layout>
      {loadingProduct ? (
        <Loader />
      ) : (
        <div className="px-4 py-6 mb-10 lg:px-16 mt-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Product Details</h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className=" select-none   bg-gradient-to-t  from-rose-500 hover:opacity-90 to-rose-400 text-white px-3 py-2 rounded-lg font-bold shadow-md">
              Delete Product
            </button>
          </div>
          <Separator className="my-4 bg-black/20" />
          <div className="bg-white lg:w-4xl border rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{product?.name}</h2>
              <div className="flex items-center gap-3">
                {clickEditProduct &&
                  (loadingUpdateProduct ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    <button
                      onClick={handleUpdateProduct}
                      className="bg-zinc-900 px-4 py-2 rounded-lg text-white font-semibold shadow hover:opacity-90 transition">
                      Update
                    </button>
                  ))}
                <button
                  onClick={() => setClickEditProduct(!clickEditProduct)}
                  className="bg-zinc-100 border px-4 py-2 rounded-lg text-black font-semibold shadow hover:opacity-70 transition flex items-center gap-2">
                  {clickEditProduct ? "Cancel" : <PencilLine size={18} />}
                </button>
              </div>
            </div>

            <Separator />

            <div className="flex  flex-col lg:flex-row gap-8">
              <div className="flex-shrink-0 h-72 lg:h-auto ">
                {!clickEditProduct ? (
                  <img
                    src={product?.image}
                    alt="Product"
                    className="w-full h-full lg:w-64 lg:h-64 object-cover rounded-lg"
                  />
                ) : (
                  <div className="space-y-2">
                    <label className="block text-gray-600 font-medium">Upload new image:</label>
                    <input
                      type="file"
                      onChange={uploadFileHandler}
                      className="w-full  p-2 bg-gray-50 border rounded-lg shadow"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 grid grid-cols-3 lg:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="text-gray-600">Name:</label>
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
                  <label className="text-gray-600">Category:</label>
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
                      {/* Show fallback if selected category no longer exists */}
                      {newCategory &&
                        findCategoryNameById(newCategory, categoryTree || []) === null && (
                          <option value={newCategory} disabled className="text-red-500">
                            ❌ Deleted Category
                          </option>
                        )}

                      <option value="" disabled>
                        -- Choose a category --
                      </option>

                      {categoryTree?.length > 0 && renderCategoryOptions(categoryTree)}
                    </select>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="text-gray-600">Price:</label>
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
                  <label className="text-gray-600">Stock:</label>
                  {!clickEditProduct ? (
                    <p className="font-bold">
                      {product?.countInStock > 0 ? (
                        product.countInStock < 5 ? (
                          <span className="text-orange-500">{product.countInStock} left</span>
                        ) : (
                          product.countInStock
                        )
                      ) : (
                        <span className="text-rose-600">Out of stock</span>
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
                  <label className="text-gray-600">Created At:</label>
                  <p className="font-bold">{product?.createdAt.substring(0, 10)}</p>
                </div>

                {/* Updated At */}
                <div>
                  <label className="text-gray-600">Updated At:</label>
                  <p className="font-bold">{product?.updatedAt.substring(0, 10)}</p>
                </div>

                {/* Description */}
                <div className="col-span-3 lg:col-span-2">
                  <label className="text-gray-600">Description:</label>
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
              </div>
            </div>
          </div>
        </div>
      )}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          Are you sure you want to delete this product ?
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={loadingDeleteProduct}
              variant="destructive"
              onClick={() => {
                // perform deletion logic here
                handleDeleteProduct();
              }}>
              {loadingDeleteProduct ? (
                <p>
                  <Loader2Icon className="animate-spin" />
                </p>
              ) : (
                <p> Delete</p>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
const findCategoryNameById = (id: any, nodes: any) => {
  if (!id || !Array.isArray(nodes)) return null; // Return null if no id or nodes

  for (const node of nodes) {
    if (String(node._id) === String(id)) return node.name; // Coerce IDs to string for safety
    if (node.children) {
      const result: any = findCategoryNameById(id, node.children);
      if (result) return result;
    }
  }

  console.warn("Category ID not found:", id);
  return null; // return null if not found
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
