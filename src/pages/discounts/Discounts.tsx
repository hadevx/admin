import Layout from "../../Layout";
import { useState, type ChangeEvent } from "react";
import {
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useGetAllCategoriesQuery,
  useGetDiscountStatusQuery,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import { Separator } from "../../components/ui/separator";
import { Trash2, Plus, Loader2Icon } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";
import Coupon from "../../components/Coupon";
import { useSelector } from "react-redux";

function Discounts() {
  const language = useSelector((state: any) => state.language.lang);

  const labels: any = {
    en: {
      setDiscounts: "Set Discounts",
      createDiscount: "Create Discount",
      discountBy: "Discount by:",
      categories: "Categories:",
      noCategories: "You have no categories.",
      createCategory: "Create",
      chooseDiscountValue: "Choose valid discount value",
      chooseCategory: "Choose at least one category",
      discountExists: "Discount already exists on this category",
      currentDiscounts: "Current Discounts",
      calculateDiscount: "Calculate Discount",
      enterOriginalPrice: "Enter original price",
      none: "None",
      free: "Free",
      noDiscounts: "No discounts available.",
    },
    ar: {
      setDiscounts: "تحديد الخصومات",
      createDiscount: "إنشاء خصم",
      discountBy: "نسبة الخصم:",
      categories: "الفئات:",
      noCategories: "لا توجد فئات لديك.",
      createCategory: "إنشاء",
      chooseDiscountValue: "اختر قيمة خصم صالحة",
      chooseCategory: "اختر فئة واحدة على الأقل",
      discountExists: "يوجد خصم بالفعل على هذه الفئة",
      currentDiscounts: "الخصومات الحالية",
      calculateDiscount: "حساب الخصم",
      enterOriginalPrice: "أدخل السعر الأصلي",
      none: "لا يوجد",
      free: "مجاني",
      noDiscounts: "لا توجد خصومات متاحة.",
    },
  };
  const t = labels[language];

  const { data: categories, isLoading: loadingCategories } = useGetAllCategoriesQuery(undefined);
  const { data: discountStatus, refetch } = useGetDiscountStatusQuery(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [deletingDiscountId, setDeletingDiscountId] = useState<string | null>(null);

  const [createDiscount, { isLoading: loadingCreate }] = useCreateDiscountMutation();
  const [deleteDiscount, { isLoading: loadingDelete }] = useDeleteDiscountMutation();

  // --- Helper: Get full category path including all parents ---
  const getFullCategoryPath = (catId: string, categories: any[]): string => {
    const categoryMap = new Map(categories.map((c) => [c._id, c]));
    const path: string[] = [];
    let current = categoryMap.get(catId);
    while (current) {
      path.unshift(current.name);
      current = current.parent ? categoryMap.get(current.parent._id || current.parent) : null;
    }
    return path.join(" < ");
  };

  const handleCreateDiscount = async () => {
    if (selectedCategories.length === 0) {
      toast.error(t.chooseCategory);
      return;
    }
    if (discount === 0) {
      toast.error(t.chooseDiscountValue);
      return;
    }

    const existingCategories = discountStatus?.flatMap((d: any) => d.category) || [];
    const overlap = selectedCategories.some((cat) => existingCategories.includes(cat));
    if (overlap) {
      toast.error(t.discountExists);
      return;
    }

    await createDiscount({ category: selectedCategories, discountBy: discount });
    toast.success(t.createDiscount);
    refetch();
  };

  const handleDeleteDiscount = async (id: string) => {
    setDeletingDiscountId(id);
    console.log(id);
    try {
      await deleteDiscount(id).unwrap(); // ensure error handling + cache update
      toast.success(language === "ar" ? "تم حذف الخصم" : "Discount deleted");
      await refetch(); // wait for fresh data
    } catch (error) {
      toast.error(language === "ar" ? "حدث خطأ أثناء الحذف" : "Error deleting discount");
    } finally {
      setDeletingDiscountId(null);
    }
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const discountOptions = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  const calculateDiscountedPrice = () => {
    const price = parseFloat(originalPrice);
    if (isNaN(price) || isNaN(discount)) return "";
    return (price - price * discount).toFixed(3);
  };

  const handleDiscountChange = (e: ChangeEvent<HTMLSelectElement>) =>
    setDiscount(parseFloat(e.target.value));
  const handleOriginalPriceChange = (e: ChangeEvent<HTMLInputElement>) =>
    setOriginalPrice(e.target.value);

  return (
    <Layout>
      {loadingCategories ? (
        <Loader />
      ) : (
        <div className="px-4 w-full lg:w-4xl min-h-screen mt-[70px] lg:mt-[50px] lg:px-4 lg:py-6">
          {/* Discounts Section */}
          <section className="mx-auto w-full">
            <div
              className={`flex justify-between items-center ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}>
              <h1 className="lg:text-2xl text-lg font-extrabold text-gray-900">{t.setDiscounts}</h1>
              <button
                onClick={handleCreateDiscount}
                disabled={loadingCreate}
                className="bg-black drop-shadow-[0_0_10px_rgba(24,24,27,0.5)] gap-1 transition-all text-white text-sm lg:text-md px-3 py-2 rounded-lg font-semibold shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus /> {t.createDiscount}
              </button>
            </div>
            <Separator className="my-4 bg-black/20" />

            <div className="bg-white lg:mt-10 p-8 rounded-2xl border space-y-5">
              {/* Discount Selector */}
              <div className="flex flex-col w-full gap-5 lg:gap-8">
                <div className="flex flex-col w-full">
                  <label
                    dir={language === "ar" ? "rtl" : ""}
                    className="mb-2 text-base lg:text-sm font-semibold text-gray-700 tracking-wide">
                    {t.discountBy}
                  </label>
                  <select
                    onChange={handleDiscountChange}
                    dir={language === "ar" ? "rtl" : ""}
                    value={discount}
                    className="w-full text-base lg:text-lg cursor-pointer px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    {discountOptions.map((value) => (
                      <option key={value} value={value}>
                        {value === 0 ? t.none : `${value * 100}%`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                <div className="flex flex-col w-full" dir={language === "ar" ? "rtl" : ""}>
                  <p className="mb-2 text-base lg:text-sm font-semibold text-gray-700 tracking-wide">
                    {t.categories}
                  </p>
                  {categories?.length === 0 ? (
                    <p className="py-3">
                      {t.noCategories}{" "}
                      <Link to="/admin/categories" className="underline text-blue-500">
                        {t.createCategory}
                      </Link>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-3 overflow-y-auto px-2 py-2 border border-gray-300 rounded-lg scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-gray-100">
                      {categories?.map((cat: any) => (
                        <label
                          key={cat._id}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all duration-300 border ${
                            selectedCategories.includes(cat._id)
                              ? "bg-zinc-900 text-white border-zinc-900"
                              : "bg-white text-gray-800 border-gray-300"
                          } select-none`}>
                          <input
                            type="checkbox"
                            value={cat._id}
                            checked={selectedCategories.includes(cat._id)}
                            onChange={() => handleCategoryChange(cat._id)}
                            className="hidden"
                          />
                          <span className="capitalize">
                            {getFullCategoryPath(cat._id, categories)}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Calculate Discount */}
              <div
                className="lg:mt-6 p-4 border rounded-lg bg-gray-50 w-full"
                dir={language === "ar" ? "rtl" : ""}>
                <p className="block mb-2 text-sm font-semibold text-gray-700">
                  {t.calculateDiscount}
                </p>
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
                  className="w-full text-base px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {originalPrice && (
                  <p className="mt-3 text-lg font-semibold text-black">
                    {calculateDiscountedPrice()} {language === "ar" ? "دك" : "KD"}
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Current Coupons Section */}
          <section className="mb-10 w-full">
            <h1
              className={`text-lg lg:text-lg font-bold mb-4 mt-4 ${
                language === "ar" ? "text-right" : ""
              }`}>
              {t.currentDiscounts}
            </h1>
            <Separator className="my-3 bg-black/20" />
            {discountStatus && discountStatus.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-2 gap-5">
                {discountStatus.map((d: any) => (
                  <Coupon
                    discountBy={d.discountBy}
                    categories={d.category.map((catId: string) =>
                      getFullCategoryPath(catId, categories)
                    )}
                    validUntil="Dec, 2025"
                    key={d._id}>
                    <button
                      onClick={() => handleDeleteDiscount(d._id)}
                      disabled={loadingDelete && deletingDiscountId === d._id}
                      className="bg-gray-600 text-white rounded-full p-2">
                      {loadingDelete && deletingDiscountId === d._id ? (
                        <Loader2Icon className="animate-spin" />
                      ) : (
                        <Trash2 />
                      )}
                    </button>
                  </Coupon>
                ))}
              </div>
            ) : (
              <p
                className={`text-gray-600 text-base lg:text-lg ${
                  language === "ar" ? "text-right" : ""
                }`}>
                {t.noDiscounts}
              </p>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}

export default Discounts;
