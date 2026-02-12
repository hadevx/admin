import { useEffect, useMemo, useState, type ChangeEvent, type JSX } from "react";
import Layout from "../../Layout";
import { useGetProductsQuery } from "../../redux/queries/productApi";
import {
  useUploadCategoryImageMutation,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useGetCategoriesTreeQuery,
  useUpdateCategoryMutation,
} from "../../redux/queries/categoryApi";
import { toast } from "react-toastify";
import Loader from "../../components/Loader";
import Badge from "../../components/Badge";
import Paginate from "@/components/Paginate";

import { Button } from "@/components/ui/button";
import {
  Boxes,
  Plus,
  Search,
  Trash2,
  SquarePen,
  Loader2Icon,
  Image as ImageIcon,
  SlidersHorizontal,
  X,
  FolderTree,
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
import { useSelector } from "react-redux";
import CategoryTree from "./CategoryTree";

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

type TreeNode = {
  _id: string;
  name: string;
  children?: TreeNode[];
};

type ParentOption = { id: string; label: string };

function Categories(): JSX.Element {
  const language = useSelector((state: RootState) => state.language.lang);
  const isRTL = language === "ar";

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
      tableType: "Type",
      tableActions: "Actions",
      noCategoriesFound: "No categories found.",
      noParent: "Main Category",
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
      editCategory: "Edit Category",
      imageUpload: "Category image",
      preview: "Preview",
      total: "Total",
      showing: "Showing",
      onThisPage: "on this page",
      type: "Category type",
      clear: "Clear",
      show: "Show",
      hide: "Hide",
      hierarchy: "Hierarchy",
      delete: "Delete",
      edit: "Edit",
      activeFilters: "Active filters",
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
      tableType: "النوع",
      tableActions: "الاجراءات",
      noCategoriesFound: "لم يتم العثور على أي فئات.",
      noParent: "فئه رئيسيه",
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
      editCategory: "تعديل الفئة",
      imageUpload: "صورة الفئة",
      preview: "معاينة",
      total: "الإجمالي",
      showing: "المعروض",
      onThisPage: "في هذه الصفحة",
      type: "نوع الفئات",
      clear: "مسح",
      show: "عرض",
      hide: "إخفاء",
      hierarchy: "التسلسل",
      delete: "حذف",
      edit: "تعديل",
      activeFilters: "فلاتر مفعّلة",
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

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
  const totalAllCategories = data?.total ?? 0;

  /* ---------------- Parent dropdown: use FULL TREE (not paginated list) ---------------- */
  const normalizeTree = (raw: any): TreeNode[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw as TreeNode[];
    if (Array.isArray(raw.categories)) return raw.categories as TreeNode[];
    if (Array.isArray(raw.data)) return raw.data as TreeNode[];
    return [];
  };

  const flattenTree = (nodes: TreeNode[] = [], prefix = ""): ParentOption[] => {
    return nodes.flatMap((n) => {
      const label = prefix ? `${prefix} > ${n.name}` : n.name;
      return [{ id: n._id, label }, ...flattenTree(n.children || [], label)];
    });
  };

  const parentOptions = useMemo(() => {
    const nodes = normalizeTree(tree);
    return flattenTree(nodes);
  }, [tree]);

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

  const activeFiltersCount = useMemo(() => {
    let n = 0;
    if (filterType !== "all") n++;
    if (searchTerm.trim()) n++;
    return n;
  }, [filterType, searchTerm]);

  const clearFilters = () => {
    setFilterType("all");
    setSearchTerm("");
    setPage(1);
  };

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

  return (
    <Layout>
      {isLoadingCategories ? (
        <Loader />
      ) : (
        <div
          dir={isRTL ? "ltr" : "ltr"}
          className="flex w-full mb-10 lg:w-4xl min-h-screen lg:min-h-auto justify-between py-3 mt-[70px] lg:mt-[50px] px-4">
          <div className="w-full">
            {/* HEADER (ProductList-like) */}
            <div className={`flex justify-between items-center ${isRTL ? "flex-row-reverse" : ""}`}>
              <h1
                dir={isRTL ? "rtl" : "ltr"}
                className="text-lg lg:text-2xl font-black flex gap-2 lg:gap-5 items-center">
                {t.categories}:
                <Badge icon={false}>
                  <Boxes className="size-5 sm:size-6" />
                  <p className="text-sm lg:text-sm">
                    {totalAllCategories}{" "}
                    <span className="hidden lg:inline">{t.totalCategories}</span>
                  </p>
                </Badge>
              </h1>

              <button
                onClick={openCreate}
                className="inline-flex items-center gap-2 rounded-md bg-neutral-950 dark:bg-white dark:text-neutral-950 px-3 py-2 text-sm font-semibold text-white hover:bg-neutral-900 dark:hover:bg-white/90 transition">
                {t.addCategory}
                <Plus className="size-4" />
              </button>
            </div>

            <Separator className="my-4 bg-black/20 dark:bg-white/10" />

            {/* SEARCH + MOBILE FILTER BUTTON */}
            <div className="mt-5 mb-2">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative w-full lg:w-full">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 dark:text-zinc-400">
                    <Search className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      setSearchTerm(e.target.value);
                      setPage(1);
                    }}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 focus:border-2 dark:focus:border-blue-400"
                  />
                </div>

                {/* Mobile only: filters toggle */}
                <div className="w-full lg:hidden">
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters((v) => !v)}
                    className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-white/10 rounded-lg px-3 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      {t.filters}
                      {activeFiltersCount > 0 ? (
                        <span className="ml-2 inline-flex items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black text-xs w-5 h-5">
                          {activeFiltersCount}
                        </span>
                      ) : null}
                    </span>
                    <span className="text-gray-500 dark:text-zinc-400">
                      {showMobileFilters ? t.hide : t.show}
                    </span>
                  </button>
                </div>
              </div>

              {/* FILTERS */}
              <div className={`${showMobileFilters ? "block" : "hidden"} lg:block`}>
                <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4 mb-5">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as any);
                      setPage(1);
                    }}
                    className="border bg-white dark:bg-zinc-900 border-gray-300 dark:border-white/10 rounded-lg p-2 text-sm text-zinc-900 dark:text-zinc-100">
                    <option value="all">{t.allCategories}</option>
                    <option value="main">{t.mainCategories}</option>
                    <option value="sub">{t.subCategories}</option>
                  </select>

                  {/* showing count on this page */}
                  <div className="border bg-white dark:bg-zinc-900 border-gray-300 dark:border-white/10 rounded-lg p-2 text-sm flex items-center justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">{t.showing}</span>
                    <span className="font-black text-gray-900 dark:text-zinc-100">
                      {filteredCategories.length}
                    </span>
                  </div>

                  {/* total */}
                  <div className="border bg-white dark:bg-zinc-900 border-gray-300 dark:border-white/10 rounded-lg p-2 text-sm flex items-center justify-between">
                    <span className="text-gray-500 dark:text-zinc-400">{t.total}</span>
                    <span className="font-black text-gray-900 dark:text-zinc-100">
                      {totalAllCategories}
                    </span>
                  </div>

                  {/* placeholder tile to keep 4-col symmetry on desktop */}
                  <div className="hidden lg:block border bg-white dark:bg-zinc-900 border-gray-300 dark:border-white/10 rounded-lg p-2 text-sm text-gray-500 dark:text-zinc-400">
                    {t.manage}
                  </div>
                </div>

                {activeFiltersCount > 0 ? (
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-xs text-gray-500 dark:text-zinc-400">
                      {t.activeFilters}: <span className="font-bold">{activeFiltersCount}</span>
                    </p>
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs font-bold text-gray-700 dark:text-zinc-200 hover:text-black dark:hover:text-white inline-flex items-center gap-1">
                      <X className="h-4 w-4" />
                      {t.clear}
                    </button>
                  </div>
                ) : null}

                {/* DESKTOP TABLE (ProductList-like) */}
                <div className="hidden lg:block rounded-lg mb-10 border border-gray-200 dark:border-white/10 lg:p-5 bg-white dark:bg-zinc-950 overflow-x-auto">
                  <table className="w-full min-w-[800px] border-gray-200 text-sm text-left text-gray-700 dark:text-zinc-200">
                    <thead className="bg-white dark:bg-zinc-950 text-gray-900/50 dark:text-zinc-400 font-semibold">
                      <tr>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                          {t.tableName}
                        </th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                          {t.tableParent}
                        </th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                          {t.tableType}
                        </th>
                        <th className="px-4 py-3 border-b border-gray-200 dark:border-white/10">
                          {t.tableActions}
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 dark:divide-white/10 bg-white dark:bg-zinc-950">
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat) => {
                          const isMain = !cat.parent?.name;
                          return (
                            <tr
                              key={cat._id}
                              className="hover:bg-gray-100 dark:hover:bg-white/5 transition-all font-bold">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2 max-w-72">
                                  {cat.image ? (
                                    <img
                                      className="w-16 h-16 object-cover rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shrink-0"
                                      src={cat.image}
                                      alt={cat.name}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-md bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 shrink-0 grid place-items-center">
                                      <ImageIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                    </div>
                                  )}
                                  <p className="truncate text-zinc-900 dark:text-zinc-100">
                                    {cat.name}
                                  </p>
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                {cat.parent?.name ? (
                                  <span className="text-gray-700 dark:text-zinc-200">
                                    {cat.parent.name}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 dark:text-zinc-400">—</span>
                                )}
                              </td>

                              <td className="px-4 py-3">
                                <span className="text-gray-700 dark:text-zinc-200">
                                  {isMain ? t.main : t.subCategories}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    disabled={isDeleting && deletingCategoryId === cat._id}
                                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                    className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px] disabled:opacity-60"
                                    title={t.delete}>
                                    {isDeleting && deletingCategoryId === cat._id ? (
                                      <Loader2Icon className="animate-spin h-4 w-4" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </button>

                                  <button
                                    onClick={() => openEdit(cat)}
                                    className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px]"
                                    title={t.edit}>
                                    <SquarePen className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-gray-500 dark:text-zinc-400">
                            {t.noCategoriesFound}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  <Paginate page={page} pages={pages} setPage={setPage} />
                </div>

                {/* MOBILE CARDS (ProductList-like) */}
                <div className="lg:hidden mb-10">
                  {filteredCategories.length > 0 ? (
                    <div className="space-y-3">
                      {filteredCategories.map((cat) => {
                        const isMain = !cat.parent?.name;

                        return (
                          <div
                            key={cat._id}
                            className="w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-3 shadow-sm hover:bg-gray-50 dark:hover:bg-white/5 transition">
                            <div className="flex gap-3 items-stretch">
                              {/* Image */}
                              <div className="shrink-0">
                                {cat.image ? (
                                  <img
                                    className="w-20 h-20 rounded-xl object-cover bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10"
                                    src={cat.image}
                                    alt="thumbnail"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-20 h-20 rounded-xl bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-white/10 grid place-items-center">
                                    <ImageIcon className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div className="min-w-0 flex-1 flex flex-col justify-between">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="text-black dark:text-zinc-100 truncate font-bold">
                                      {cat.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 truncate">
                                      {isMain ? t.main : `${t.subOf} ${cat.parent?.name || "—"}`}
                                    </p>
                                  </div>

                                  <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-1 text-xs font-black text-gray-900 dark:text-zinc-100">
                                    {isMain ? t.main : t.subCategories}
                                  </span>
                                </div>

                                <div className="mt-3 flex items-center justify-between gap-2">
                                  <div className="text-xs text-gray-600 dark:text-zinc-300 font-bold truncate">
                                    {t.tableParent}: {cat.parent?.name || "—"}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      disabled={isDeleting && deletingCategoryId === cat._id}
                                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                                      className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px] disabled:opacity-60"
                                      title={t.delete}>
                                      {isDeleting && deletingCategoryId === cat._id ? (
                                        <Loader2Icon className="animate-spin h-4 w-4" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </button>

                                    <button
                                      onClick={() => openEdit(cat)}
                                      className="text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/10 bg-zinc-50 dark:bg-white/5 border border-black/10 dark:border-white/10 p-2 rounded-xl transition flex items-center justify-center min-w-[36px] min-h-[36px]"
                                      title={t.edit}>
                                      <SquarePen className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="pt-2">
                        <Paginate page={page} pages={pages} setPage={setPage} />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500 dark:text-zinc-400 py-10">
                      {t.noCategoriesFound}
                    </div>
                  )}
                </div>

                {/* TREE */}
                {tree ? (
                  <div className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-950 p-4 lg:p-5 mb-10">
                    <div className="flex items-center gap-2">
                      <FolderTree className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
                      <h2 className="text-base font-black text-zinc-900 dark:text-zinc-100">
                        {t.hierarchy}
                      </h2>
                    </div>
                    <Separator className="my-4 bg-black/10 dark:bg-white/10" />
                    <CategoryTree data={normalizeTree(tree)} />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-100">
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
              "w-full border rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 dark:focus:ring-blue-400",
              categoryError ? "border-rose-500 border-2" : "border-black/10 dark:border-white/10",
            )}
          />

          <select
            className="w-full border rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 my-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-black/10 dark:border-white/10 dark:focus:ring-blue-400"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">{t.noParent}</option>
            {parentOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-4">
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              {t.imageUpload}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
              }}
              className="w-full text-sm text-zinc-900 dark:text-zinc-100 file:text-zinc-900 dark:file:text-zinc-100"
            />

            {imageFile ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-black/10 dark:border-white/10"
                />
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.preview}</div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
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
        <DialogContent className="bg-white dark:bg-zinc-950 border border-black/10 dark:border-white/10 text-zinc-900 dark:text-zinc-100">
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
              "w-full border rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 dark:focus:ring-blue-400",
              categoryError ? "border-rose-500 border-2" : "border-black/10 dark:border-white/10",
            )}
          />

          <select
            className="w-full border rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 my-2 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-black/10 dark:border-white/10 dark:focus:ring-blue-400"
            value={parent}
            onChange={(e) => setParent(e.target.value)}>
            <option value="">{t.noParent}</option>
            {parentOptions
              .filter((opt) => opt.id !== editingCategory?._id)
              .map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
          </select>

          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-4">
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              {t.imageUpload}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
              }}
              className="w-full text-sm text-zinc-900 dark:text-zinc-100 file:text-zinc-900 dark:file:text-zinc-100"
            />

            {editingCategory?.image || imageFile ? (
              <div className="mt-3 flex items-center gap-3">
                <img
                  src={
                    imageFile ? URL.createObjectURL(imageFile) : (editingCategory?.image as string)
                  }
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-xl border border-black/10 dark:border-white/10"
                />
                <div className="min-w-0">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.preview}</div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
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
