import { useEffect, useState } from "react";
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
import { Plus, Trash2, Boxes, Search, Loader2Icon, SquarePen } from "lucide-react";
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
import {
  useGetProductsQuery,
  useUploadCategoryImageMutation,
  useUpdateCategoryMutation,
} from "../../redux/queries/productApi";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSelector } from "react-redux";

function Categories() {
  const [uploadCategoryImage] = useUploadCategoryImageMutation();
  const language = useSelector((state: any) => state.language.lang);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState("");
  const [parent, setParent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryError, setCategoryError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const { refetch: refetchProducts } = useGetProductsQuery(undefined);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  const {
    data,
    isLoading: isLoadingCategories,
    refetch,
  } = useGetCategoriesQuery({
    pageNumber: page || 1,
    keyword: searchTerm || "",
  });

  const { data: tree, refetch: refetchTree } = useGetCategoriesTreeQuery(undefined);

  const categories = data?.categories || [];
  const pages = data?.pages || 1;
  console.log(categories);
  const labels: any = {
    en: {
      categories: "Categories",
      totalCategories: "categories",
      addCategory: "Add new Category",
      searchPlaceholder: "Search categories...",
      allCategories: "All Categories",
      mainCategories: "Main Categories",
      subCategories: "Subcategories",
      tableName: "Name",
      tableParent: "Parent",
      tableActions: "Actions",
      noCategoriesFound: "No categories found.",
      noParent: "No Parent (Main Category)",
      enterCategoryName: "Enter category name",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      pleaseEnterName: "Please enter a valid category name.",
      categoryExists: "This category already exists.",
      subOf: "Sub of",
      main: "Main",
    },
    ar: {
      categories: "الفئات",
      totalCategories: "فئة",
      addCategory: "إضافة فئة جديدة",
      searchPlaceholder: "ابحث عن الفئات...",
      allCategories: "جميع الفئات",
      mainCategories: "الفئات الرئيسية",
      subCategories: "الفئات الفرعية",
      tableName: "الاسم",
      tableParent: "الرئيسية",
      tableActions: "الاجراءات",
      noCategoriesFound: "لم يتم العثور على أي فئات.",
      noParent: "بدون رئيسية (فئة رئيسية)",
      enterCategoryName: "أدخل اسم الفئة",
      cancel: "إلغاء",
      create: "إنشاء",
      creating: "جارٍ الإنشاء...",
      pleaseEnterName: "يرجى إدخال اسم فئة صالح.",
      categoryExists: "هذه الفئة موجودة بالفعل.",
      subOf: "فرعي من",
      main: "رئيسية",
    },
  };
  const t = labels[language];

  const filteredCategories = categories
    .filter((cat: any) => cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((cat: any) => {
      if (filterType === "main") return !cat.parent;
      if (filterType === "sub") return !!cat.parent;
      return true;
    });

  const handleCreateCategory = async () => {
    if (!category.trim()) {
      setCategoryError(true);
      return toast.error(t.pleaseEnterName);
    }

    let uploadedImageUrl = null;
    if (imageFile) {
      try {
        const formData = new FormData();
        formData.append("image", imageFile);
        const res = await uploadCategoryImage(formData).unwrap();
        uploadedImageUrl = res.image.imageUrl; // only URL
      } catch (error: any) {
        toast.error(error?.data?.message || error?.error);
        return;
      }
    }

    try {
      await createCategory({
        name: category[0].toUpperCase() + category.slice(1).toLowerCase(),
        parent: parent || null,
        image: uploadedImageUrl,
      }).unwrap();

      toast.success(t.create + " " + t.categories + " successfully.");
      setCategory("");
      setParent("");
      setImageFile(null);
      setIsModalOpen(false);
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error(t.categoryExists);
    }
  };

  const handleDeleteCategory = async (id: any, name: any) => {
    setDeletingCategoryId(id);
    try {
      await deleteCategory({ name }).unwrap();
      toast.success(t.categories + " deleted successfully.");
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error("Error deleting " + t.categories);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  useEffect(() => {
    if (isModalOpen) setTimeout(() => document.querySelector("input")?.focus(), 100);
  }, [isModalOpen]);

  return (
    <Layout>
      {isLoadingCategories ? (
        <Loader />
      ) : (
        <div className="px-4 mb-10 py-3 mt-[70px] lg:mt-[50px] w-full lg:w-4xl min-h-screen lg:min-h-auto">
          <div
            className={`flex justify-between items-center ${
              language === "ar" ? "flex-row-reverse" : ""
            }`}>
            <h1
              dir={language === "ar" ? "rtl" : "ltr"}
              className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
              {t.categories}:
              <Badge icon={false}>
                <Boxes strokeWidth={1} />
                <p className="text-lg lg:text-sm">
                  {data?.total || 0} <span className="hidden lg:inline">{t.totalCategories}</span>
                </p>
              </Badge>
            </h1>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-black drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] hover:bg-black/70 transition-all duration-300 text-white font-bold flex items-center gap-1 text-sm lg:text-md shadow-md px-3 py-2 rounded-md">
              <Plus /> {t.addCategory}
            </button>
          </div>

          <Separator className="my-4 bg-black/20" />

          <div className="mt-5 mb-2 overflow-hidden">
            <div className="flex flex-row lg:flex-row items-center lg:items-center gap-3 mb-5">
              <div className="relative w-full lg:w-64">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                  <Search className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border bg-white border-gray-300 rounded-lg py-3 px-4 text-sm outline-none focus:border-blue-500">
                <option value="all">{t.allCategories}</option>
                <option value="main">{t.mainCategories}</option>
                <option value="sub">{t.subCategories}</option>
              </select>
            </div>

            <div className="rounded-lg border p-5 lg:p-5 bg-white">
              <table className="w-full text-sm text-left text-gray-700">
                <thead className="bg-white text-gray-900/50 font-semibold ">
                  <tr>
                    <th className="pb-2 border-b">{t.tableName}</th>
                    <th className=" border-b">{t.tableParent}</th>
                    <th className=" border-b">{t.tableActions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat: any) => (
                      <tr key={cat._id} className="font-bold transition-all duration-300">
                        <td className="flex items-center gap-2">
                          {cat.image && (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-10 h-10 object-cover rounded-md"
                            />
                          )}
                          <span>{cat.name}</span>
                        </td>
                        <td className="">
                          {cat.parent?.name ? (
                            <span className="text-gray-500 text-sm">
                              {t.subOf} {cat.parent.name}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">{t.main}</span>
                          )}
                        </td>
                        <td className="py-2 flex gap-2">
                          <button
                            disabled={isDeleting && deletingCategoryId === cat._id}
                            onClick={() => handleDeleteCategory(cat._id, cat.name)}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[32px] min-h-[32px]">
                            {isDeleting && deletingCategoryId === cat._id ? (
                              <Loader2Icon className="animate-spin" />
                            ) : (
                              <Trash2 />
                            )}
                          </button>
                          <button
                            disabled={isDeleting && deletingCategoryId === cat._id}
                            onClick={() => {
                              setEditingCategory(cat);
                              setCategory(cat.name);
                              setParent(cat.parent?._id || "");
                              setImageFile(null);
                              setIsEditModalOpen(true);
                            }}
                            className="text-black hover:bg-zinc-200 bg-zinc-100 p-2 rounded-lg transition-all duration-300 flex items-center justify-center min-w-[32px] min-h-[32px]">
                            <SquarePen />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                        {t.noCategoriesFound}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination className="pt-5">
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

          {tree && <CategoryTree data={tree} />}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addCategory}</DialogTitle>
          </DialogHeader>

          {/* Category Name */}
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.enterCategoryName}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2",
              categoryError ? "border-rose-500 border-2" : "border-gray-300"
            )}
          />

          {/* Parent Category */}
          <select
            className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 my-2"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">{t.noParent}</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
            }}
            className="p-4 w-full border rounded-md mb-2"
          />

          {/* Image Preview */}
          {imageFile && (
            <div className="mb-2 flex flex-col items-start gap-1">
              <p className="text-sm">Preview:</p>
              <img
                src={URL.createObjectURL(imageFile)}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-md border"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button variant="default" disabled={isCreating} onClick={handleCreateCategory}>
              {isCreating ? t.creating : t.create}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>

          {/* Category Name */}
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder={t.enterCategoryName}
            className={clsx(
              "w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 focus:border-2",
              categoryError ? "border-rose-500 border-2" : "border-gray-300"
            )}
          />

          {/* Parent Category */}
          <select
            className="w-full border bg-white border-gray-300 rounded-lg py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-blue-500 my-2"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">{t.noParent}</option>
            {categories.map((cat: any) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Image Upload */}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
            }}
            className="p-4 w-full border rounded-md mb-2"
          />

          {/* Image Preview (existing + new if uploaded) */}
          {(editingCategory?.image || imageFile) && (
            <div className="mb-2 flex flex-col items-start gap-1">
              <p className="text-sm">Preview:</p>
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : editingCategory?.image}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-md border"
              />
            </div>
          )}

          {/* Footer Buttons */}
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t.cancel}
            </Button>
            <Button
              variant="default"
              disabled={isUpdating}
              onClick={async () => {
                if (!category.trim()) {
                  setCategoryError(true);
                  return toast.error(t.pleaseEnterName);
                }

                let uploadedImageUrl = editingCategory?.image || null;
                if (imageFile) {
                  try {
                    const formData = new FormData();
                    formData.append("image", imageFile);
                    const res = await uploadCategoryImage(formData).unwrap();
                    uploadedImageUrl = res.image.imageUrl;
                  } catch (error: any) {
                    toast.error(error?.data?.message || error?.error);
                    return;
                  }
                }

                try {
                  await updateCategory({
                    id: editingCategory._id,
                    name: category[0].toUpperCase() + category.slice(1).toLowerCase(),
                    parent: parent || null,
                    image: uploadedImageUrl,
                  }).unwrap();

                  toast.success("Category updated successfully!");
                  setCategory("");
                  setParent("");
                  setImageFile(null);
                  setEditingCategory(null);
                  setIsEditModalOpen(false);
                  refetch();
                  refetchTree();
                  refetchProducts();
                } catch (error) {
                  toast.error("Failed to update category");
                }
              }}>
              {isUpdating ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default Categories;
