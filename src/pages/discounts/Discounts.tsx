import Layout from "../../Layout";
import { useMemo, useState, type ChangeEvent, type JSX } from "react";
import {
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useGetAllCategoriesQuery,
  useGetDiscountStatusQuery,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import { Separator } from "../../components/ui/separator";
import {
  Trash2,
  Plus,
  Loader2Icon,
  Percent,
  Tags,
  Calculator,
  Ticket,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import Coupon from "../../components/Coupon";
import { useSelector } from "react-redux";

type RootState = {
  language: { lang: "en" | "ar" };
};

type Category = {
  _id: string;
  name: string;
  parent?: { _id?: string } | string | null;
};

type DiscountItem = {
  _id: string;
  discountBy: number;
  category: string[];
};

function Discounts(): JSX.Element {
  const language = useSelector((state: RootState) => state.language.lang);

  const labels = {
    en: {
      setDiscounts: "Discounts",
      subtitle: "Create category discounts and manage existing coupons.",
      createDiscount: "Create Discount",
      discountBy: "Discount rate",
      categories: "Categories",
      noCategories: "You have no categories.",
      createCategory: "Create",
      chooseDiscountValue: "Choose valid discount value",
      chooseCategory: "Choose at least one category",
      discountExists: "Discount already exists on this category",
      currentDiscounts: "Current Discounts",
      calculateDiscount: "Quick calculator",
      enterOriginalPrice: "Enter original price",
      none: "None",
      noMinimum: "No minimum",
      free: "Free",
      noDiscounts: "No discounts available.",
      priceAfter: "Price after discount",
      currency: "KD",
      validUntil: "Valid until",
      selectAll: "Select all",
      clear: "Clear",
      selected: "Selected",
    },
    ar: {
      setDiscounts: "الخصومات",
      subtitle: "ادارة وانشاء الخصومات",
      createDiscount: "إنشاء خصم",
      discountBy: "نسبة الخصم",
      categories: "الفئات",
      noCategories: "لا توجد فئات لديك.",
      createCategory: "إنشاء",
      chooseDiscountValue: "اختر قيمة خصم صالحة",
      chooseCategory: "اختر فئة واحدة على الأقل",
      discountExists: "يوجد خصم بالفعل على هذه الفئة",
      currentDiscounts: "الخصومات الحالية",
      calculateDiscount: "حاسبة سريعة",
      enterOriginalPrice: "أدخل السعر الأصلي",
      none: "لا يوجد",
      noMinimum: "لا يوجد حد أدنى",
      free: "مجاني",
      noDiscounts: "لا توجد خصومات متاحة.",
      priceAfter: "السعر بعد الخصم",
      currency: "دك",
      validUntil: "صالحة حتى",
      selectAll: "تحديد الكل",
      clear: "مسح",
      selected: "المحدد",
    },
  } as const;

  const t = labels[language] || labels.en;

  const { data: categories, isLoading: loadingCategories } = useGetAllCategoriesQuery(
    undefined,
  ) as { data?: Category[]; isLoading: boolean };

  const { data: discountStatus, refetch } = useGetDiscountStatusQuery(undefined) as {
    data?: DiscountItem[];
    refetch: () => void;
  };

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);

  const [createDiscount, { isLoading: loadingCreate }] = useCreateDiscountMutation() as any;
  const [deleteDiscount, { isLoading: loadingDelete }] = useDeleteDiscountMutation() as any;

  // Helper: full category path including parents
  const getFullCategoryPath = (catId: string, cats: Category[] = []): string => {
    const categoryMap = new Map<string, Category>(cats.map((c) => [c._id, c]));
    const path: string[] = [];
    let current = categoryMap.get(catId);

    while (current) {
      path.unshift(current.name);
      const parentId =
        typeof current.parent === "string"
          ? current.parent
          : current.parent?._id
            ? current.parent._id
            : undefined;

      current = parentId ? categoryMap.get(parentId) : undefined;
    }

    return path.join(" < ");
  };

  const discountOptions = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  const existingCategories = useMemo(() => {
    return discountStatus?.flatMap((d) => d.category) || [];
  }, [discountStatus]);

  const handleCreateDiscount = async (): Promise<void> => {
    if (selectedCategories.length === 0) {
      toast.error(t.chooseCategory);
      return;
    }
    if (discount === 0) {
      toast.error(t.chooseDiscountValue);
      return;
    }
    const overlap = selectedCategories.some((cat) => existingCategories.includes(cat));
    if (overlap) {
      toast.error(t.discountExists);
      return;
    }

    await createDiscount({ category: selectedCategories, discountBy: discount });
    toast.success(t.createDiscount);
    refetch();
  };

  const handleDeleteDiscount = async (id: string): Promise<void> => {
    setDeletingDiscountId(id);
    try {
      await deleteDiscount(id).unwrap();
      toast.success(language === "ar" ? "تم حذف الخصم" : "Discount deleted");
      await refetch();
    } catch (e) {
      toast.error(language === "ar" ? "حدث خطأ أثناء الحذف" : "Error deleting discount");
    } finally {
      setDeletingDiscountId(null);
    }
  };

  const handleCategoryChange = (catId: string): void => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId],
    );
  };

  const handleSelectAll = (): void => {
    const ids = (categories || []).map((c) => c._id);
    setSelectedCategories(ids);
  };

  const handleClear = (): void => {
    setSelectedCategories([]);
  };

  const calculateDiscountedPrice = (): string => {
    const price = parseFloat(originalPrice);
    if (Number.isNaN(price) || Number.isNaN(discount)) return "";
    return (price - price * discount).toFixed(3);
  };

  const handleDiscountChange = (e: ChangeEvent<HTMLSelectElement>): void =>
    setDiscount(parseFloat(e.target.value));

  const handleOriginalPriceChange = (e: ChangeEvent<HTMLInputElement>): void =>
    setOriginalPrice(e.target.value);

  // Styles
  const bentoCard = "rounded-3xl border border-black/10 bg-white/80 backdrop-blur shadow-sm";
  const tile = "rounded-2xl border border-black/10 bg-white p-4";
  const chipBase =
    "select-none inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition";
  const chipOn = "bg-zinc-900 text-white border-zinc-900";
  const chipOff = "bg-white text-zinc-900 border-black/10 hover:bg-zinc-50";

  return (
    <Layout>
      {loadingCategories ? (
        <Loader />
      ) : (
        <div
          dir={language === "ar" ? "rtl" : "ltr"}
          className="px-4 w-full max-w-4xl  min-h-screen mt-[70px] lg:mt-[50px] lg:py-6 pb-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="h-11 w-11 rounded-2xl bg-zinc-900 text-white grid place-items-center">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-extrabold text-zinc-900">
                    {t.setDiscounts}
                  </h1>
                  <p className="text-sm text-zinc-600">{t.subtitle}</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateDiscount}
              disabled={loadingCreate}
              className="bg-zinc-900 drop-shadow-[0_0_10px_rgba(24,24,27,0.35)] hover:bg-zinc-800 text-white text-sm px-4 py-2.5 rounded-2xl font-semibold shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingCreate ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t.createDiscount}
            </button>
          </div>

          <Separator className="my-5 bg-black/10" />

          {/* Bento grid */}
          <div className="grid grid-cols-1  gap-4">
            {/* Create discount (wide) */}
            <section className={`${bentoCard} lg:col-span-12 p-5`}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-zinc-900" />
                <h2 className="text-base font-bold text-zinc-900">
                  {language === "ar" ? "إنشاء خصم للفئات" : "Create category discount"}
                </h2>
              </div>

              <Separator className="my-4 bg-black/10" />

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* Discount selector */}
                <div className={`${tile} md:col-span-5`}>
                  <div className="flex items-center gap-2 mb-2">
                    <Percent className="h-4 w-4 text-zinc-700" />
                    <label className="text-sm font-semibold text-zinc-800">{t.discountBy}</label>
                  </div>

                  <select
                    onChange={handleDiscountChange}
                    value={discount}
                    className="w-full text-base cursor-pointer px-4 py-2.5 border border-black/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                    {discountOptions.map((value) => (
                      <option key={value} value={value}>
                        {value === 0 ? t.none : `${value * 100}%`}
                      </option>
                    ))}
                  </select>

                  <div className="mt-3 text-xs text-zinc-500">
                    {language === "ar"
                      ? "اختر نسبة الخصم قبل تحديد الفئات."
                      : "Pick a rate, then select categories."}
                  </div>
                </div>

                {/* Quick calculator */}
                <div className={`${tile} md:col-span-7`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-4 w-4 text-zinc-700" />
                      <div className="text-sm font-semibold text-zinc-800">
                        {t.calculateDiscount}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {discount === 0 ? t.none : `${discount * 100}%`}
                    </div>
                  </div>

                  <div className="mt-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder={t.enterOriginalPrice}
                      value={originalPrice}
                      onChange={handleOriginalPriceChange}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "+") e.preventDefault();
                      }}
                      className="w-full text-base px-4 py-2.5 border border-black/10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                    />
                  </div>

                  <div className="mt-3 rounded-2xl border border-black/10 bg-zinc-50 px-4 py-3">
                    <div className="text-xs text-zinc-500">{t.priceAfter}</div>
                    <div className="text-lg font-extrabold text-zinc-900">
                      {originalPrice && discount ? (
                        <>
                          {calculateDiscountedPrice()} {t.currency}
                        </>
                      ) : (
                        "—"
                      )}
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className={`${tile} md:col-span-12`}>
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-zinc-700" />
                      <div className="text-sm font-semibold text-zinc-800">{t.categories}</div>
                      <div className="text-xs text-zinc-500">
                        • {t.selected}: {selectedCategories.length}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 transition">
                        {t.selectAll}
                      </button>
                      <button
                        type="button"
                        onClick={handleClear}
                        className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-zinc-900 hover:bg-zinc-50 transition">
                        {t.clear}
                      </button>
                    </div>
                  </div>

                  <Separator className="my-3 bg-black/10" />

                  {categories?.length === 0 ? (
                    <p className="py-3 text-sm text-zinc-700">
                      {t.noCategories}{" "}
                      <Link to="/categories" className="underline text-blue-600">
                        {t.createCategory}
                      </Link>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                      {categories?.map((cat) => {
                        const active = selectedCategories.includes(cat._id);
                        return (
                          <label
                            key={cat._id}
                            className={`${chipBase} ${active ? chipOn : chipOff}`}>
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

            {/* Full-width list (optional, keeps your existing grid for coupons if you want) */}
            {discountStatus && discountStatus.length > 0 ? (
              <section className="lg:col-span-12">
                <div className="mt-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-zinc-900">
                    {language === "ar" ? "الخصومات الحاليه" : "Current Discounts"}
                  </h3>
                </div>
                <Separator className="my-3 bg-black/10" />

                <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-2">
                  {discountStatus.map((d) => (
                    <Coupon
                      discountBy={d.discountBy}
                      categories={d.category.map((catId) =>
                        getFullCategoryPath(catId, categories || []),
                      )}
                      validUntil="Dec, 2025"
                      key={d._id}>
                      <button
                        onClick={() => handleDeleteDiscount(d._id)}
                        disabled={loadingDelete && deletingDiscountId === d._id}
                        className="bg-zinc-900 text-white rounded-full p-2 hover:bg-zinc-800 transition disabled:opacity-60">
                        {loadingDelete && deletingDiscountId === d._id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </Coupon>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </div>
      )}
    </Layout>
  );
}

export default Discounts;
