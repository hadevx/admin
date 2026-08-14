import { useEffect, useMemo, useState, type JSX } from "react";
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
import Paginate from "@/components/Paginate";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import { PageSkeleton } from "@/components/Skeleton";

import { Button } from "@/components/ui/button";
import {
  Boxes,
  Plus,
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
      addCategory: "Add Category",
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
      emptyHint: "Create your first category or clear the filters.",
    },
    ar: {
      categories: "الفئات",
      totalCategories: "فئة",
      addCategory: "إضافة فئة",
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
      emptyHint: "أنشئ أول فئة أو امسح الفلاتر.",
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
    } catch (error: any) {
      // "already exists" is only one of several reasons this can fail.
      toast.error(error?.data?.message || t.categoryExists);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setDeletingCategoryId(id);
    try {
      await deleteCategory({ id }).unwrap();
      toast.success(`${t.categories} deleted successfully.`);
      refetch();
      refetchTree();
      refetchProducts();
    } catch (error: any) {
      // The server explains *why* it refused (subcategories or products still
      // attached); a generic message hid that and looked like a bug.
      toast.error(error?.data?.message || `Error deleting ${t.categories}`);
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
    } catch (error: any) {
      // The server says which rule was broken (empty name, missing parent,
      // or moving a category under its own subcategory).
      toast.error(
        error?.data?.message ||
          (language === "ar" ? "فشل تحديث الفئة" : "Failed to update category"),
      );
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

  /* ---------------- Presentation helpers ---------------- */

  const Thumb = ({ cat, size = "size-14" }: { cat: Category; size?: string }) =>
    cat.image ? (
      <img
        className={clsx(size, "shrink-0 rounded-xl border border-border object-cover")}
        src={cat.image}
        alt=""
        loading="lazy"
      />
    ) : (
      <div
        className={clsx(
          size,
          "grid shrink-0 place-items-center rounded-xl border border-border bg-muted text-muted-foreground",
        )}>
        <ImageIcon className="size-5" />
      </div>
    );

  const RowActions = ({ cat }: { cat: Category }) => (
    <div className="flex items-center gap-2">
      <button
        disabled={isDeleting && deletingCategoryId === cat._id}
        onClick={() => handleDeleteCategory(cat._id)}
        className="ws-icon-btn size-9 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60 dark:hover:border-rose-500/30 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
        title={t.delete}
        aria-label={t.delete}>
        {isDeleting && deletingCategoryId === cat._id ? (
          <Loader2Icon className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </button>

      <button
        onClick={() => openEdit(cat)}
        className="ws-icon-btn size-9 hover:border-foreground/25 hover:bg-muted hover:text-foreground"
        title={t.edit}
        aria-label={t.edit}>
        <SquarePen className="size-4" />
      </button>
    </div>
  );

  const TypeTag = ({ isMain }: { isMain: boolean }) => (
    <span className={clsx("ws-pill", isMain ? "ws-pill-info" : "ws-pill-neutral")}>
      {isMain ? t.main : t.subCategories}
    </span>
  );

  return (
    <Layout>
      {isLoadingCategories ? (
        <PageSkeleton />
      ) : (
        <div className="animate-fade-up">
          <PageHeader
            title={t.categories}
            subtitle={t.manage}
            icon={Boxes}
            count={totalAllCategories}
            countLabel={` ${t.totalCategories}`}
            actions={
              <button onClick={openCreate} className="ws-btn-primary">
                <Plus className="size-4" />
                {t.addCategory}
              </button>
            }
          />

          {/* Search + filters */}
          <div className="ws-card mb-5 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={searchTerm}
                onChange={(value) => {
                  setSearchTerm(value);
                  setPage(1);
                }}
                placeholder={t.searchPlaceholder}
                className="flex-1"
              />

              <button
                type="button"
                onClick={() => setShowMobileFilters((v) => !v)}
                className="ws-btn-secondary justify-between sm:hidden">
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="size-4" />
                  {t.filters}
                  {activeFiltersCount > 0 ? (
                    <span className="grid size-5 place-items-center rounded-full bg-emphasis text-[11px] font-bold text-emphasis-foreground">
                      {activeFiltersCount}
                    </span>
                  ) : null}
                </span>
                <span className="text-xs text-muted-foreground">
                  {showMobileFilters ? t.hide : t.show}
                </span>
              </button>
            </div>

            <div className={clsx(showMobileFilters ? "block" : "hidden", "sm:block")}>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value as any);
                    setPage(1);
                  }}
                  className="ws-select">
                  <option value="all">{t.allCategories}</option>
                  <option value="main">{t.mainCategories}</option>
                  <option value="sub">{t.subCategories}</option>
                </select>

                <div className="ws-tile flex items-center justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">{t.showing}</span>
                  <span className="text-sm font-black">{filteredCategories.length}</span>
                </div>

                <div className="ws-tile flex items-center justify-between py-2.5">
                  <span className="text-sm text-muted-foreground">{t.total}</span>
                  <span className="text-sm font-black">{totalAllCategories}</span>
                </div>
              </div>

              {activeFiltersCount > 0 ? (
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    {t.activeFilters}:{" "}
                    <span className="font-bold text-foreground">{activeFiltersCount}</span>
                  </p>
                  <button type="button" onClick={clearFilters} className="ws-chip">
                    <X className="size-3.5" />
                    {t.clear}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden lg:block">
            <div className="ws-table-wrap">
              <table className="ws-table">
                <thead>
                  <tr>
                    <th>{t.tableName}</th>
                    <th>{t.tableParent}</th>
                    <th>{t.tableType}</th>
                    <th className="text-end">{t.tableActions}</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const isMain = !cat.parent?.name;
                      return (
                        <tr key={cat._id}>
                          <td>
                            <div className="flex max-w-sm items-center gap-3">
                              <Thumb cat={cat} />
                              <p className="truncate font-bold">{cat.name}</p>
                            </div>
                          </td>

                          <td className="text-muted-foreground">{cat.parent?.name || "—"}</td>

                          <td>
                            <TypeTag isMain={isMain} />
                          </td>

                          <td>
                            <div className="flex justify-end">
                              <RowActions cat={cat} />
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-0">
                        <EmptyState
                          title={t.noCategoriesFound}
                          description={t.emptyHint}
                          icon={Boxes}
                          action={
                            <button onClick={openCreate} className="ws-btn-primary">
                              <Plus className="size-4" />
                              {t.addCategory}
                            </button>
                          }
                        />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Paginate page={page} pages={pages} setPage={setPage} />
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden">
            {filteredCategories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {filteredCategories.map((cat) => {
                    const isMain = !cat.parent?.name;

                    return (
                      <div key={cat._id} className="ws-card p-3">
                        <div className="flex items-stretch gap-3">
                          <Thumb cat={cat} size="size-20" />

                          <div className="flex min-w-0 flex-1 flex-col justify-between">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-extrabold">{cat.name}</p>
                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                  {isMain ? t.main : `${t.subOf} ${cat.parent?.name || "—"}`}
                                </p>
                              </div>

                              <TypeTag isMain={isMain} />
                            </div>

                            <div className="mt-3 flex items-center justify-end">
                              <RowActions cat={cat} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Paginate page={page} pages={pages} setPage={setPage} />
              </>
            ) : (
              <div className="ws-card">
                <EmptyState
                  title={t.noCategoriesFound}
                  description={t.emptyHint}
                  icon={Boxes}
                  action={
                    <button onClick={openCreate} className="ws-btn-primary">
                      <Plus className="size-4" />
                      {t.addCategory}
                    </button>
                  }
                />
              </div>
            )}
          </div>

          {/* Hierarchy */}
          {tree ? (
            <div className="ws-card mt-6 p-4 lg:p-5">
              <div className="flex items-center gap-2">
                <FolderTree className="size-4 text-foreground" />
                <h2 className="text-base font-extrabold">{t.hierarchy}</h2>
              </div>
              <Separator className="my-4" />
              <CategoryTree data={normalizeTree(tree)} />
            </div>
          ) : null}
        </div>
      )}

      {/* Create modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent dir={isRTL ? "rtl" : "ltr"} className="ws-card max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.addCategory}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="ws-label">{t.tableName}</label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (categoryError) setCategoryError(false);
                }}
                placeholder={t.enterCategoryName}
                className={clsx("ws-input", categoryError && "border-rose-500 focus:border-rose-500")}
              />
            </div>

            <div>
              <label className="ws-label">{t.tableParent}</label>
              <select
                className="ws-select"
                value={parent}
                onChange={(e) => setParent(e.target.value)}>
                <option value="">{t.noParent}</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="ws-tile">
              <div className="mb-2 text-sm font-semibold">{t.imageUpload}</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                }}
                className="w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-emphasis file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emphasis-foreground hover:file:bg-emphasis-hover"
              />

              {imageFile ? (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Preview"
                    className="size-16 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{t.preview}</div>
                    <div className="truncate text-sm font-semibold">{imageFile.name}</div>
                  </div>
                </div>
              ) : null}
            </div>
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
        <DialogContent dir={isRTL ? "rtl" : "ltr"} className="ws-card max-w-lg">
          <DialogHeader>
            <DialogTitle>{t.editCategory}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <label className="ws-label">{t.tableName}</label>
              <input
                type="text"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  if (categoryError) setCategoryError(false);
                }}
                placeholder={t.enterCategoryName}
                className={clsx("ws-input", categoryError && "border-rose-500 focus:border-rose-500")}
              />
            </div>

            <div>
              <label className="ws-label">{t.tableParent}</label>
              <select
                className="ws-select"
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
            </div>

            <div className="ws-tile">
              <div className="mb-2 text-sm font-semibold">{t.imageUpload}</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
                }}
                className="w-full text-sm file:me-3 file:rounded-lg file:border-0 file:bg-emphasis file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emphasis-foreground hover:file:bg-emphasis-hover"
              />

              {editingCategory?.image || imageFile ? (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={
                      imageFile ? URL.createObjectURL(imageFile) : (editingCategory?.image as string)
                    }
                    alt="Preview"
                    className="size-16 rounded-xl border border-border object-cover"
                  />
                  <div className="min-w-0">
                    <div className="text-xs text-muted-foreground">{t.preview}</div>
                    <div className="truncate text-sm font-semibold">
                      {imageFile ? imageFile.name : editingCategory?.name}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
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
