import React, { useEffect, useState } from "react";
import Layout from "../../Layout";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoriesTreeQuery,
} from "../../redux/queries/productApi";

import { toast } from "react-toastify";
import Badge from "../../components/Badge";
import Loader from "../../components/Loader";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Boxes, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { clsx } from "clsx";
import CategoryTree from "./CategoryTree";
import { useGetProductsQuery } from "../../redux/queries/productApi";

function Categories() {
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);

  const [category, setCategory] = useState("");
  const [parent, setParent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { refetch: refetchProducts } = useGetProductsQuery(undefined);
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const {
    data: categories = [],
    refetch,
    isLoading: isLoadingCategories,
  } = useGetCategoriesQuery(undefined);

  const { data: tree, refetch: refetchTree } = useGetCategoriesTreeQuery(undefined);

  console.log(tree);
  const filteredCategories = categories.filter((cat: any) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCategory = async () => {
    if (!category.trim()) {
      setCategoryError(true);
      return toast.error("Please enter a valid category name.");
    }

    const isDuplicate = categories.some(
      (c: any) => c.name.toLowerCase() === category.trim().toLowerCase()
    );

    if (isDuplicate) {
      return toast.error("This category already exists.");
    }

    try {
      await createCategory({
        name: category[0].toUpperCase() + category.slice(1).toLowerCase(),
        parent: parent || null,
      }).unwrap();

      toast.success("Category created successfully.");
      setCategory("");
      setParent("");
      setIsModalOpen(false);
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error("Failed to create category.");
    }
  };

  const handleDeleteCategory = async (id: any, name: any) => {
    setDeletingCategoryId(id);
    try {
      await deleteCategory({ name }).unwrap();
      toast.success("Category deleted successfully.");
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error("Error deleting category.");
    } finally {
      setDeletingCategoryId(null);
    }
  };

  useEffect(() => {
    if (isModalOpen) {
      setTimeout(() => {
        document.querySelector("input")?.focus();
      }, 100);
    }
  }, [isModalOpen]);

  return (
    <Layout>
      {isLoadingCategories ? (
        <Loader />
      ) : (
        <div className="lg:px-4 py-3 mt-[50px] px-2 lg:ml-[50px] w-full lg:w-4xl min-h-screen lg:min-h-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-sm lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
              Categories:
              <Badge icon={"false"}>
                <Boxes strokeWidth={1} />
                {categories.length || 0} categories
              </Badge>
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black hover:bg-black/70 transition-all duration-300 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md">
              <Plus />
              Add new Category
            </button>
          </div>
          <Separator className="my-4 bg-black/20" />
          <div className=" lg:w-4xl mt-10 mb-2 overflow-hidden">
            <div className="relative w-full lg:w-64 mb-5">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                <Search className="h-5 w-5" />
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
              />
            </div>

            <div className="rounded-lg border lg:p-10 bg-white">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-white text-gray-900/50 font-semibold">
                  <tr>
                    <th className="px-4 py-3 border-b">Name</th>
                    <th className="px-4 py-3 border-b">Parent</th>
                    <th className="px-4 py-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat: any) => (
                      <tr key={cat._id} className="font-bold transition-all duration-300">
                        <td className="px-4 py-5">{cat?.name}</td>
                        <td className="px-4 py-5">
                          {cat.parent?.name ? (
                            <span className="text-gray-500  text-sm">
                              Sub of {cat?.parent.name}
                            </span>
                          ) : (
                            <span className="text-sm  text-gray-500">Main</span>
                          )}
                        </td>
                        <td className="px-4 py-5">
                          <button
                            disabled={isDeleting && deletingCategoryId === cat._id}
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="text-rose-500 hover:bg-red-100 bg-red-50 p-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[32px] min-h-[32px]">
                            {isDeleting && deletingCategoryId === cat._id ? (
                              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></span>
                            ) : (
                              <Trash2 />
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                        No categories found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          {tree && <CategoryTree data={tree} />}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
          </DialogHeader>

          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category name"
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2",
              categoryError ? "border-rose-500 border-2" : "border-gray-300"
            )}
          />

          <select
            className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">No Parent (Main Category)</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" disabled={isCreating} onClick={handleCreateCategory}>
              {isCreating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
const renderTreeRows = (
  nodes: any,
  level = 0,
  isDeleting: boolean,
  handleDeleteCategory: (name: any) => void
) => {
  return nodes.map((node: any) => (
    <React.Fragment key={node._id}>
      <tr className="font-bold transition-all duration-300">
        <td className="px-4 py-5">
          <span style={{ paddingLeft: `${level * 20}px` }}>
            {level > 0 && "↳ "}
            {node.name}
          </span>
        </td>
        <td className="px-4 py-5">
          {node.parent?.name ? (
            <span className="text-gray-500 italic text-sm">Sub of {node.parent.name}</span>
          ) : (
            <span className="text-xs text-gray-400">Main</span>
          )}
        </td>
        <td className="px-4 py-5">
          <button
            disabled={isDeleting}
            onClick={() => handleDeleteCategory(node.name)}
            className="text-rose-500 hover:bg-red-100 bg-red-50 p-2 rounded-lg transition-all duration-300">
            <Trash2 />
          </button>
        </td>
      </tr>
      {node.children && renderTreeRows(node.children, level + 1, isDeleting, handleDeleteCategory)}
    </React.Fragment>
  ));
};
export default Categories;
