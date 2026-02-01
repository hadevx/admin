import { useEffect, useMemo, useState, type ChangeEvent, type JSX } from "react";
import Layout from "../../Layout";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoriesTreeQuery,
  useGetProductsQuery,
  useUploadCategoryImageMutation,
  useUpdateCategoryMutation,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
// import Badge from "../../components/Badge";
import Loader from "../../components/Loader";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Boxes,
  Search,
  Loader2Icon,
  SquarePen,
  FolderTree,
  Image as ImageIcon,
} from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useSelector } from "react-redux";

type RootState = {
  language: { lang: "en" | "ar" };
};

type Category = {
  _id: string;
  name: string;
  image?: string;
  parent?: { _id?: string; name?: string } | null;
};

type CategoriesResponse = {
  categories: Category[];
  pages: number;
  total: number;
};

function Categories(): JSX.Element {
  const language = useSelector((state: RootState) => state.language.lang);

  const labels = {
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
      updating: "Updating...",
      update: "Update",
      pleaseEnterName: "Please enter a valid category name.",
      categoryExists: "This category already exists.",
      subOf: "Sub of",
      main: "Main",
      manage: "Manage your category list, hierarchy, and images.",
      filters: "Filters",
      list: "Category list",
      hierarchy: "Hierarchy",
      editCategory: "Edit Category",
      imageUpload: "Category image",
      preview: "Preview",
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
      updating: "جارٍ التحديث...",
      update: "تحديث",
      pleaseEnterName: "يرجى إدخال اسم فئة صالح.",
      categoryExists: "هذه الفئة موجودة بالفعل.",
      subOf: "فرعي من",
      main: "رئيسية",
      manage: "إدارة قائمة الفئات.",
      filters: "الفلاتر",
      list: "قائمة الفئات",
      hierarchy: "التسلسل",
      editCategory: "تعديل الفئة",
      imageUpload: "صورة الفئة",
      preview: "معاينة",
    },
  } as const;

  const t = labels[language] || labels.en;

  const [uploadCategoryImage] = useUploadCategoryImageMutation() as any;

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

  const [page, setPage] = useState<number>(1);
  const [category, setCategory] = useState<string>("");
  const [parent, setParent] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryError, setCategoryError] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<"all" | "main" | "sub">("all");

  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { refetch: refetchProducts } = useGetProductsQuery(undefined) as any;

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation() as any;
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation() as any;
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation() as any;

  const {
    data,
    isLoading: isLoadingCategories,
    refetch,
  } = useGetCategoriesQuery({
    pageNumber: page || 1,
    keyword: searchTerm || "",
  }) as {
    data?: CategoriesResponse;
    isLoading: boolean;
    refetch: () => void;
  };

  const { data: tree, refetch: refetchTree } = useGetCategoriesTreeQuery(undefined) as {
    data?: any;
    refetch: () => void;
  };

  const categories = data?.categories || [];
  const pages = data?.pages || 1;

  console.log(categories);
  const filteredCategories = useMemo(() => {
    const bySearch = categories.filter((cat) =>
      String(cat.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );
    return bySearch.filter((cat) => {
      if (filterType === "main") return !cat.parent;
      if (filterType === "sub") return !!cat.parent;
      return true;
    });
  }, [categories, searchTerm, filterType]);

  const resetForm = () => {
    setCategory("");
    setParent("");
    setImageFile(null);
    setCategoryError(false);
  };

  const openCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategory(cat.name || "");
    setParent(cat.parent?._id || "");
    setImageFile(null);
    setCategoryError(false);
    setIsEditModalOpen(true);
  };

  const handleCreateCategory = async () => {
    if (!category.trim()) {
      setCategoryError(true);
      return toast.error(t.pleaseEnterName);
    }

    let uploadedImageUrl: string | null = null;

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
      await createCategory({
        name: category[0].toUpperCase() + category.slice(1).toLowerCase(),
        parent: parent || null,
        image: uploadedImageUrl,
      }).unwrap();

      toast.success(`${t.create} ${t.categories} successfully.`);
      resetForm();
      setIsModalOpen(false);
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error(t.categoryExists);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    setDeletingCategoryId(id);
    try {
      await deleteCategory({ name }).unwrap();
      toast.success(`${t.categories} deleted successfully.`);
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error(`Error deleting ${t.categories}`);
    } finally {
      setDeletingCategoryId(null);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;

    if (!category.trim()) {
      setCategoryError(true);
      return toast.error(t.pleaseEnterName);
    }

    let uploadedImageUrl: string | null = editingCategory?.image || null;

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

      toast.success(language === "ar" ? "تم تحديث الفئة بنجاح" : "Category updated successfully!");
      resetForm();
      setEditingCategory(null);
      setIsEditModalOpen(false);
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error) {
      toast.error(language === "ar" ? "فشل تحديث الفئة" : "Failed to update category");
    }
  };

  useEffect(() => {
    if (isModalOpen || isEditModalOpen) {
      setTimeout(
        () => document.querySelector<HTMLInputElement>("input[type='text']")?.focus(),
        100,
      );
    }
  }, [isModalOpen, isEditModalOpen]);

  const bentoCard = "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm";
  const tile = "rounded-2xl border border-black/10 bg-white p-4";

  return (
    <Layout>
      {isLoadingCategories ? (
        <Loader />
      ) : (
        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className="px-4 mb-10 py-3 mt-[70px] lg:mt-[50px] w-full max-w-6xl min-h-screen lg:min-h-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-extrabold text-zinc-900 flex items-center gap-2">
                    {t.categories}
                    {/* <Badge icon={false}>
                      <p className="text-base lg:text-sm font-semibold">
                        {data?.total || 0}{" "}
                        <span className="hidden lg:inline">{t.totalCategories}</span>
                      </p>
                    </Badge> */}
                  </h1>
                  <p className="text-sm text-zinc-600">{t.manage}</p>
                </div>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="bg-zinc-900 drop-shadow-[0_0_10px_rgba(24,24,27,0.35)] hover:bg-zinc-800 transition-all duration-200 text-white font-semibold flex items-center gap-2 text-sm shadow-sm px-4 py-2.5 rounded-2xl">
              <Plus className="h-4 w-4" />
              {t.addCategory}
            </button>
          </div>

          <Separator className="my-5 bg-black/10" />

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Filters card */}
            <section className={`${bentoCard} lg:col-span-4 p-5`}>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-zinc-900">{t.filters}</h2>
              </div>

              <Separator className="my-4 bg-black/10" />

              <div className="grid grid-cols-1 gap-3">
                <div className={tile}>
                  <div className="flex items-center gap-2 mb-2">
                    <Search className="h-4 w-4 text-zinc-700" />
                    <p className="text-sm font-semibold text-zinc-800">
                      {language === "ar" ? "بحث" : "Search"}
                    </p>
                  </div>

                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                      <Search className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchTerm}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="w-full border bg-white border-black/10 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className={tile}>
                  <p className="text-sm font-semibold text-zinc-800 mb-2">
                    {language === "ar" ? "نوع الفئات" : "Category type"}
                  </p>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="w-full border bg-white border-black/10 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="all">{t.allCategories}</option>
                    <option value="main">{t.mainCategories}</option>
                    <option value="sub">{t.subCategories}</option>
                  </select>
                </div>

                <div className={`${tile} bg-zinc-50`}>
                  <div className="text-xs text-zinc-500">
                    {language === "ar" ? "النتائج" : "Results"}
                  </div>
                  <div className="text-2xl font-extrabold text-zinc-900">
                    {filteredCategories.length}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {language === "ar" ? "ضمن الصفحة الحالية" : "on this page"}
                  </div>
                </div>
              </div>
            </section>

            {/* List card (table) */}
            <section className={`${bentoCard} lg:col-span-8 p-5`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-base font-bold text-zinc-900">{t.list}</h2>
              </div>

              <Separator className="my-4 bg-black/10" />

              <div className="rounded-2xl border border-black/10 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-zinc-700">
                    <thead className="bg-white text-zinc-900/60 font-semibold">
                      <tr>
                        <th className="px-4 py-3 border-b border-black/10">{t.tableName}</th>
                        <th className="px-4 py-3 border-b border-black/10">{t.tableParent}</th>
                        <th className="px-4 py-3 border-b border-black/10">{t.tableActions}</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-black/5 bg-white">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => (
                          <tr key={cat._id} className="font-semibold">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                {cat.image ? (
                                  <img
                                    src={cat.image}
                                    alt={cat.name}
                                    className="w-10 h-10 object-cover rounded-xl border border-black/10"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl border border-black/10 bg-zinc-50 grid place-items-center">
                                    <ImageIcon className="h-4 w-4 text-zinc-500" />
                                  </div>
                                )}
                                <span className="truncate">{cat.name}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3">
                              {cat.parent?.name ? (
                                <span className="text-zinc-500 text-sm">
                                  {t.subOf} {cat.parent.name}
                                </span>
                              ) : (
                                <span className="text-sm text-zinc-500">{t.main}</span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button
                                  disabled={isDeleting && deletingCategoryId === cat._id}
                                  onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                  className="text-zinc-900 hover:bg-zinc-100 bg-zinc-50 border border-black/10 p-2 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px] disabled:opacity-60"
                                  title={language === "ar" ? "حذف" : "Delete"}>
                                  {isDeleting && deletingCategoryId === cat._id ? (
                                    <Loader2Icon className="animate-spin h-4 w-4" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </button>

                                <button
                                  onClick={() => openEdit(cat)}
                                  className="text-zinc-900 hover:bg-zinc-100 bg-zinc-50 border border-black/10 p-2 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px]"
                                  title={language === "ar" ? "تعديل" : "Edit"}>
                                  <SquarePen className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-10 text-center text-zinc-500">
                            {t.noCategoriesFound}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-3 py-3 border-t border-black/10">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => page > 1 && setPage(page - 1)}
                          href="#"
                        />
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
                        <PaginationNext
                          onClick={() => page < pages && setPage(page + 1)}
                          href="#"
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            </section>

            {/* Tree full width */}
            {tree ? (
              <section className={`${bentoCard} lg:col-span-12 p-5`}>
                <div className="flex items-center gap-2">
                  <FolderTree className="h-4 w-4 text-zinc-900" />
                  <h2 className="text-base font-bold text-zinc-900">{t.hierarchy}</h2>
                </div>
                <Separator className="my-4 bg-black/10" />
                <CategoryTree data={tree} />
              </section>
            ) : null}
          </div>
        </div>
      )}

      {/* Create modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addCategory}</DialogTitle>
          </DialogHeader>

          <input
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (categoryError) setCategoryError(false);
            }}
            placeholder={t.enterCategoryName}
            className={clsx(
              "w-full border bg-white rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500",
              categoryError ? "border-rose-500 border-2" : "border-black/10",
            )}
          />

          <select
            className="w-full border bg-white border-black/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 my-2"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">{t.noParent}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-800 mb-2">{t.imageUpload}</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
              }}
              className="w-full text-sm"
            />

            {imageFile ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-black/10"
                />
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500">{t.preview}</div>
                  <div className="text-sm font-semibold text-zinc-900 truncate">
                    {imageFile.name}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

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

      {/* Edit modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.editCategory}</DialogTitle>
          </DialogHeader>

          <input
            type="text"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              if (categoryError) setCategoryError(false);
            }}
            placeholder={t.enterCategoryName}
            className={clsx(
              "w-full border bg-white rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500",
              categoryError ? "border-rose-500 border-2" : "border-black/10",
            )}
          />

          <select
            className="w-full border bg-white border-black/10 rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 my-2"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">{t.noParent}</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="text-sm font-semibold text-zinc-800 mb-2">{t.imageUpload}</div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
              }}
              className="w-full text-sm"
            />

            {editingCategory?.image || imageFile ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={
                    imageFile ? URL.createObjectURL(imageFile) : (editingCategory?.image as string)
                  }
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-black/10"
                />
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500">{t.preview}</div>
                  <div className="text-sm font-semibold text-zinc-900 truncate">
                    {imageFile ? imageFile.name : editingCategory?.name}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingCategory(null);
              }}>
              {t.cancel}
            </Button>
            <Button variant="default" disabled={isUpdating} onClick={handleUpdateCategory}>
              {isUpdating ? t.updating : t.update}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export default Categories;
