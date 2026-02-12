import Layout from "../../Layout";
import { useMemo, useState, type JSX } from "react";
import { toast } from "react-toastify";
import { Separator } from "../../components/ui/separator";
import { Plus, Loader2Icon, Ticket, Sparkles, Percent, Tags, Hash, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";
import clsx from "clsx";
import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponsQuery,
} from "../../redux/queries/couponApi";
import { useGetAllCategoriesQuery } from "../../redux/queries/categoryApi";

type RootState = {
  language: { lang: "en" | "ar" };
};

type Category = {
  _id: string;
  name: string;
  parent?: { _id?: string } | string | null;
};

type CouponItem = {
  _id: string;
  code: string;
  discountBy: number; // 0.1 = 10%
  categories: Array<string | { _id: string; name?: string }>;
  isActive?: boolean;
  createdAt?: string;
};

function Coupons(): JSX.Element {
  const language = useSelector((state: RootState) => state.language.lang);

  const labels = {
    en: {
      title: "Coupons",
      subtitle: "Create coupon codes for categories and manage existing coupons.",
      createCoupon: "Create Coupon",
      couponCode: "Coupon code",
      discountBy: "Discount rate",
      categories: "Categories",
      required: "Required",
      enterCode: "Enter code (e.g. SAVE10)",
      pickRate: "Choose discount value",
      pickCat: "Choose at least one category",
      codeExists: "Coupon code already exists",
      noCategories: "You have no categories.",
      createCategory: "Create",
      selectAll: "Select all",
      clear: "Clear",
      selected: "Selected",
      active: "Active",
      disabled: "Disabled",
      delete: "Delete",
      noCoupons: "No coupons available.",
      created: "Created",
      saveOk: "Coupon created",
      deleteOk: "Coupon deleted",
      invalidCode: "Invalid coupon code",
      confirmDeleteTitle: "Delete coupon?",
      confirmDeleteText: "This action cannot be undone.",
      cancel: "Cancel",
      confirm: "Delete",
    },
    ar: {
      title: "كوبونات",
      subtitle: "إنشاء أكواد خصم للفئات .",
      createCoupon: "إنشاء كوبون",
      couponCode: "كود الكوبون",
      discountBy: "نسبة الخصم",
      categories: "الفئات",
      required: "مطلوب",
      enterCode: "أدخل الكود (مثال SAVE10)",
      pickRate: "اختر قيمة خصم صالحة",
      pickCat: "اختر فئة واحدة على الأقل",
      codeExists: "الكود موجود بالفعل",
      noCategories: "لا توجد فئات لديك.",
      createCategory: "إنشاء",
      selectAll: "تحديد الكل",
      clear: "مسح",
      selected: "المحدد",
      active: "مفعل",
      disabled: "موقوف",
      delete: "حذف",
      noCoupons: "لا توجد كوبونات.",
      created: "تم الإنشاء",
      saveOk: "تم إنشاء الكوبون",
      deleteOk: "تم حذف الكوبون",
      invalidCode: "كود غير صالح",
      confirmDeleteTitle: "حذف الكوبون؟",
      confirmDeleteText: "لا يمكن التراجع عن هذا الإجراء.",
      cancel: "إلغاء",
      confirm: "حذف",
    },
  } as const;

  const t = labels[language] || labels.en;

  const { data: categories, isLoading: loadingCategories } = useGetAllCategoriesQuery(
    undefined,
  ) as { data?: Category[]; isLoading: boolean };

  const {
    data: couponsData,
    refetch: refetchCoupons,
    isLoading: loadingCoupons,
  } = useGetCouponsQuery(undefined) as {
    data?: unknown;
    refetch: () => void;
    isLoading: boolean;
  };

  const coupons: CouponItem[] = useMemo(() => {
    if (Array.isArray(couponsData)) return couponsData as CouponItem[];
    if (Array.isArray((couponsData as any)?.coupons))
      return (couponsData as any).coupons as CouponItem[];
    return [];
  }, [couponsData]);

  const [createCoupon, { isLoading: loadingCreate }] = useCreateCouponMutation() as any;
  const [deleteCoupon, { isLoading: loadingDelete }] = useDeleteCouponMutation() as any;

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [code, setCode] = useState<string>("");

  // ✅ delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<CouponItem | null>(null);

  const discountOptions = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];

  // ✅ children map (for selecting main -> selects all descendants)
  const childrenByParent = useMemo(() => {
    const list = categories || [];
    const children = new Map<string, string[]>();

    list.forEach((c) => {
      const parentId =
        typeof c.parent === "string" ? c.parent : c.parent?._id ? c.parent._id : null;
      if (!parentId) return;
      children.set(parentId, [...(children.get(parentId) || []), c._id]);
    });

    return children;
  }, [categories]);

  // Helper: category full path including parents
  const getFullCategoryPath = (catId: string, cats: Category[] = []): string => {
    const map = new Map<string, Category>(cats.map((c) => [c._id, c]));
    const path: string[] = [];
    let current: Category | undefined = map.get(catId);

    while (current) {
      path.unshift(current.name);

      const parentId =
        typeof current.parent === "string"
          ? current.parent
          : current.parent?._id
            ? current.parent._id
            : undefined;

      current = parentId ? map.get(parentId) : undefined;
    }

    return path.join(" < ");
  };

  // ✅ Get all descendants (deep)
  const getDescendants = (parentId: string): string[] => {
    const out: string[] = [];
    const stack: string[] = [...(childrenByParent.get(parentId) || [])];

    while (stack.length) {
      const id = stack.pop()!;
      out.push(id);
      const kids = childrenByParent.get(id) || [];
      for (const k of kids) stack.push(k);
    }
    return out;
  };

  const handleCategoryChange = (catId: string): void => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(catId);
      const descendants = getDescendants(catId);

      if (descendants.length > 0) {
        if (isSelected) {
          const toRemove = new Set([catId, ...descendants]);
          return prev.filter((id) => !toRemove.has(id));
        }
        return Array.from(new Set([...prev, catId, ...descendants]));
      }

      return isSelected ? prev.filter((id) => id !== catId) : [...prev, catId];
    });
  };

  const handleSelectAll = (): void => {
    const ids = (categories || []).map((c) => c._id);
    setSelectedCategories(ids);
  };

  const handleClear = (): void => setSelectedCategories([]);

  const existingCodes = useMemo(() => {
    return coupons.map((c) => (c.code || "").trim().toUpperCase()).filter(Boolean);
  }, [coupons]);

  const handleCreate = async () => {
    const normalized = code.trim().toUpperCase();

    if (!normalized) return toast.error(t.invalidCode);
    if (existingCodes.includes(normalized)) return toast.error(t.codeExists);

    if (!discount) return toast.error(t.pickRate);
    if (!selectedCategories.length) return toast.error(t.pickCat);

    const payload: any = {
      code: normalized,
      discountBy: discount,
      categories: selectedCategories,
    };

    try {
      await createCoupon(payload).unwrap?.();
      toast.success(t.saveOk);
      setCode("");
      setDiscount(0);
      setSelectedCategories([]);
      refetchCoupons();
    } catch (e: any) {
      toast.error(e?.data?.message || (language === "ar" ? "فشل الإنشاء" : "Create failed"));
    }
  };

  // ✅ open delete modal
  const openDeleteModal = (coupon: CouponItem) => {
    setDeleteTarget(coupon);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  // ✅ confirm delete
  const confirmDelete = async () => {
    if (!deleteTarget?._id) return;

    try {
      await deleteCoupon(deleteTarget._id).unwrap?.();
      toast.success(t.deleteOk);
      closeDeleteModal();
      refetchCoupons();
    } catch (e: any) {
      toast.error(e?.data?.message || (language === "ar" ? "فشل الحذف" : "Delete failed"));
    }
  };

  const fmtDate = (iso?: string | null) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString(language === "ar" ? "ar-KW" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ✅ styles (dark mode added)
  const bentoCard =
    "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm dark:border-white/10 dark:bg-zinc-950/80";
  const tile =
    "rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-zinc-950";
  const chipBase =
    "select-none inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition";
  const chipOn =
    "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-900 dark:border-white";
  const chipOff =
    "bg-white text-zinc-900 border-black/10 hover:bg-zinc-50 dark:bg-zinc-950 dark:text-white dark:border-white/10 dark:hover:bg-white/5";

  if (loadingCategories) return <Loader />;

  return (
    <Layout>
      <div
        dir={language === "ar" ? "rtl" : "ltr"}
        className="px-4 w-full max-w-4xl min-h-screen mt-[70px] lg:mt-[50px] lg:py-6 pb-6 text-zinc-900 dark:text-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center dark:bg-white dark:text-zinc-900">
              <Ticket className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl lg:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {t.title}
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{t.subtitle}</p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            disabled={loadingCreate}
            className={clsx(
              "text-sm px-4 py-2 rounded-md font-semibold shadow-sm flex items-center gap-2",
              "disabled:opacity-50 disabled:cursor-not-allowed transition",
              "bg-zinc-950 hover:bg-zinc-800 text-white",
              "dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
            )}>
            {loadingCreate ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {t.createCoupon}
          </button>
        </div>

        <Separator className="my-5 bg-black/10 dark:bg-white/10" />

        <div className="grid grid-cols-1 gap-4">
          {/* Create coupon */}
          <section className={`${bentoCard} p-5`}>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-900 dark:text-white" />
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                {language === "ar" ? "إنشاء كوبون للفئات" : "Create category coupon"}
              </h2>
            </div>

            <Separator className="my-4 bg-black/10 dark:bg-white/10" />

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Code */}
              <div className={`${tile} md:col-span-5`}>
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t.couponCode}
                  </label>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">• {t.required}</span>
                </div>

                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={t.enterCode}
                  className={clsx(
                    "w-full text-base px-4 py-2.5 border rounded-xl shadow-sm transition",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "border-black/10 bg-white text-zinc-900 placeholder:text-zinc-400",
                    "dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:placeholder:text-zinc-500",
                  )}
                />

                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {language === "ar"
                    ? "سيتم تحويل الكود تلقائياً إلى أحرف كبيرة."
                    : "Code will be normalized to UPPERCASE."}
                </div>
              </div>

              {/* Discount */}
              <div className={`${tile} md:col-span-7`}>
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                  <label className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {t.discountBy}
                  </label>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">• {t.required}</span>
                </div>

                <select
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value))}
                  className={clsx(
                    "w-full text-base cursor-pointer px-4 py-2.5 border rounded-xl shadow-sm transition",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500",
                    "border-black/10 bg-white text-zinc-900",
                    "dark:border-white/10 dark:bg-zinc-950 dark:text-white",
                  )}>
                  <option value={0}>{language === "ar" ? "اختر" : "Choose"}</option>
                  {discountOptions.map((v) => (
                    <option key={v} value={v}>
                      {v * 100}%
                    </option>
                  ))}
                </select>
              </div>

              {/* Categories */}
              <div className={`${tile} md:col-span-12`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Tags className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
                    <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                      {t.categories}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      • {t.selected}: {selectedCategories.length}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className={clsx(
                        "rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                        "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50",
                        "dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5",
                      )}>
                      {t.selectAll}
                    </button>
                    <button
                      type="button"
                      onClick={handleClear}
                      className={clsx(
                        "rounded-2xl border px-3 py-2 text-xs font-semibold transition",
                        "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50",
                        "dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5",
                      )}>
                      {t.clear}
                    </button>
                  </div>
                </div>

                <Separator className="my-3 bg-black/10 dark:bg-white/10" />

                {categories?.length === 0 ? (
                  <p className="py-3 text-sm text-zinc-700 dark:text-zinc-300">
                    {t.noCategories}{" "}
                    <Link to="/categories" className="underline text-blue-600 dark:text-blue-300">
                      {t.createCategory}
                    </Link>
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                    {categories?.map((cat) => {
                      const active = selectedCategories.includes(cat._id);
                      return (
                        <label key={cat._id} className={`${chipBase} ${active ? chipOn : chipOff}`}>
                          <input
                            type="checkbox"
                            value={cat._id}
                            checked={active}
                            onChange={() => handleCategoryChange(cat._id)}
                            className="hidden"
                          />
                          <span className="capitalize">
                            {getFullCategoryPath(cat._id, categories)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ✅ Only show this section if there ARE coupons */}
          {coupons.length > 0 ? (
            <section className={`${bentoCard} p-5`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-zinc-900 dark:text-white" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    {language === "ar" ? "الكوبونات الحالية" : "Current Coupons"}
                  </h3>
                </div>

                {loadingCoupons ? (
                  <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                    <Loader2Icon className="h-4 w-4 animate-spin" />{" "}
                    {language === "ar" ? "تحميل..." : "Loading..."}
                  </div>
                ) : null}
              </div>

              <Separator className="my-4 bg-black/10 dark:bg-white/10" />

              <div className="grid sm:grid-cols-2 gap-3">
                {coupons.map((c) => {
                  const active = !!c.isActive;

                  const cats = (c.categories || []).map((x) =>
                    typeof x === "string" ? x : x?._id,
                  );

                  return (
                    <div
                      key={c._id}
                      className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-950">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-extrabold text-zinc-900 dark:text-white truncate">
                              {c.code}
                            </span>

                            <span
                              className={clsx(
                                "text-xs font-semibold rounded-full px-2 py-1 border",
                                active
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300",
                              )}>
                              {active ? t.active : t.disabled}
                            </span>
                          </div>

                          <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                            <span className="font-semibold">{Math.round(c.discountBy * 100)}%</span>{" "}
                            {language === "ar" ? "خصم" : "off"}
                          </div>

                          <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                            {t.created}:{" "}
                            <span className="font-semibold text-zinc-900 dark:text-white">
                              {c.createdAt ? fmtDate(c.createdAt) : "—"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => openDeleteModal(c)}
                          disabled={loadingDelete}
                          className={clsx(
                            "rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:opacity-60 flex items-center gap-2",
                            "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                            "dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15",
                          )}>
                          {loadingDelete && deleteTarget?._id === c._id ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          {t.delete}
                        </button>
                      </div>

                      <Separator className="my-3 bg-black/10 dark:bg-white/10" />

                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                        {language === "ar" ? "الفئات:" : "Categories:"}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {cats.slice(0, 10).map((catId) => (
                          <span
                            key={String(catId)}
                            className={clsx(
                              "rounded-full border px-3 py-1 text-xs font-semibold",
                              "border-black/10 bg-zinc-50 text-zinc-800",
                              "dark:border-white/10 dark:bg-white/5 dark:text-zinc-200",
                            )}>
                            {getFullCategoryPath(String(catId), categories || [])}
                          </span>
                        ))}
                        {cats.length > 10 ? (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 px-2 py-1">
                            +{cats.length - 10}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}
        </div>

        {/* Delete Confirmation Modal */}
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={closeDeleteModal} />
            <div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-lg p-5 dark:bg-zinc-950 dark:border-white/10">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                    {t.confirmDeleteTitle}
                  </h4>
                  <p className="text-sm text-zinc-600 mt-1 dark:text-zinc-400">
                    {t.confirmDeleteText}
                  </p>
                </div>
                <button
                  onClick={closeDeleteModal}
                  className={clsx(
                    "rounded-xl border px-2.5 py-2 text-xs font-semibold transition",
                    "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50",
                    "dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5",
                  )}
                  aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{t.couponCode}</div>
                <div className="text-base font-bold text-zinc-900 dark:text-white">
                  {deleteTarget?.code}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  onClick={closeDeleteModal}
                  className={clsx(
                    "rounded-2xl border px-4 py-2 text-sm font-semibold transition",
                    "border-black/10 bg-white text-zinc-900 hover:bg-zinc-50",
                    "dark:border-white/10 dark:bg-zinc-950 dark:text-white dark:hover:bg-white/5",
                  )}>
                  {t.cancel}
                </button>

                <button
                  onClick={confirmDelete}
                  disabled={loadingDelete}
                  className={clsx(
                    "rounded-2xl border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 flex items-center gap-2",
                    "border-rose-200 bg-rose-600 text-white hover:bg-rose-700",
                    "dark:border-rose-900/40 dark:bg-rose-500/20 dark:text-rose-100 dark:hover:bg-rose-500/30",
                  )}>
                  {loadingDelete ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  {t.confirm}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default Coupons;
