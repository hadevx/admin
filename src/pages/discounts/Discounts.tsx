import Layout from "../../Layout";
import { useState } from "react";
import type { ChangeEvent } from "react";
import {
  useCreateDiscountMutation,
  useDeleteDiscountMutation,
  useGetCategoriesQuery,
  useGetDiscountStatusQuery,
} from "../../redux/queries/productApi";
import { toast } from "react-toastify";
import { Separator } from "../../components/ui/separator";
import { Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";

interface Category {
  _id: string;
  name: string;
}

interface Discount {
  _id: string;
  category: string[];
  discountBy: number;
}

function Discounts() {
  const { data: categories, isLoading: loadingCategories } = useGetCategoriesQuery(undefined);
  const { data: discountStatus, refetch } = useGetDiscountStatusQuery(undefined);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [originalPrice, setOriginalPrice] = useState<string>("");

  const [createDiscount, { isLoading: loadingCreate }] = useCreateDiscountMutation();
  const [deleteDiscount, { isLoading: loadingDelete }] = useDeleteDiscountMutation();

  const handleCreateDiscount = async () => {
    if (selectedCategories.length === 0) {
      toast.error("Choose at least one category");
      return;
    }
    if (discount === 0) {
      toast.error("Choose valid discount value");
      return;
    }

    const existingCategories = discountStatus?.flatMap((d: Discount) => d.category) || [];

    const overlap = selectedCategories.some((cat) => existingCategories.includes(cat));

    if (overlap) {
      toast.error("Discount already exists on this category");
      return;
    }

    await createDiscount({ category: selectedCategories, discountBy: discount });
    toast.success("Discount created");
    refetch();
  };

  const handleDeleteDiscount = async (id: string) => {
    await deleteDiscount(id);
    toast.success("Discount deleted");
    refetch();
  };

  const handleCategoryChange = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const discountOptions = [0, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];

  const calculateDiscountedPrice = () => {
    const price = parseFloat(originalPrice);
    const discountNum = discount;
    if (isNaN(price) || isNaN(discountNum)) return "";
    return (price - price * discountNum).toFixed(3);
  };

  const handleDiscountChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setDiscount(parseFloat(e.target.value));
  };

  const handleOriginalPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setOriginalPrice(e.target.value);
  };

  return (
    <Layout>
      {loadingCategories ? (
        <Loader />
      ) : (
        <div className="px-2 w-full lg:w-4xl min-h-screen lg:min-h-auto lg:px-4 lg:py-6 mt-[50px] lg:ml-[50px] space-y-8">
          {/* Discounts Section */}
          <section className="max-w-4xl mx-auto w-full">
            <div className="flex mt-5 lg:mt-0 justify-between items-center ">
              <h1 className="lg:text-2xl text-lg font-extrabold text-gray-900">Set Discounts</h1>
              <div className="flex ">
                <button
                  onClick={handleCreateDiscount}
                  disabled={loadingCreate}
                  className="bg-black gap-1 transition-all text-white text-sm lg:text-md px-3 py-2 rounded-lg font-semibold shadow-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                  <Plus /> Create Discount
                </button>
              </div>
            </div>
            <Separator className="my-4 bg-black/20" />

            <div className="bg-white lg:mt-10 lg:w-4xl p-8 rounded-2xl border space-y-8">
              {/* Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                {/* Discount Selector */}
                <div className="flex flex-col w-full lg:w-1/2">
                  <label
                    htmlFor="discount"
                    className="mb-2 text-lg lg:text-sm font-semibold text-gray-700 tracking-wide">
                    Discount by:
                  </label>
                  <select
                    id="discount"
                    onChange={handleDiscountChange}
                    value={discount}
                    className="w-full text-lg lg:text-lg cursor-pointer px-5 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    {discountOptions.map((value) => (
                      <option key={value} value={value}>
                        {value === 0 ? "None" : `${value * 100}%`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Categories */}
                <div className="flex flex-col w-full lg:w-2/3">
                  <p className="mb-2 text-lg lg:text-sm font-semibold text-gray-700 tracking-wide">
                    Categories:
                  </p>
                  {categories?.length === 0 ? (
                    <p className="py-3">
                      You have no categories.{" "}
                      <Link to="/admin/categories" className="underline text-blue-500">
                        Create
                      </Link>
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-3 max-h-40 overflow-y-auto px-2 py-2 border border-gray-300 rounded-lg scrollbar-thin scrollbar-thumb-zinc-400 scrollbar-track-gray-100">
                      {categories?.map((cat: Category) => (
                        <label
                          key={cat._id}
                          className="flex text-lg lg:text-lg items-center gap-2 border border-gray-300 px-4 py-1 cursor-pointer hover:bg-zinc-50 transition select-none">
                          <input
                            type="checkbox"
                            value={cat.name}
                            checked={selectedCategories.includes(cat.name)}
                            onChange={() => handleCategoryChange(cat.name)}
                            className="cursor-pointer h-5 w-5 text-zinc-900 focus:ring-zinc-600 rounded"
                          />
                          <span className="capitalize text-gray-800">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Calculate Discount Section */}
              <div className="lg:mt-6 p-4 border rounded-lg bg-gray-50">
                <p className="block mb-2 text-sm font-semibold text-gray-700">Calculate Discount</p>
                <input
                  id="originalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter original price"
                  value={originalPrice}
                  onChange={handleOriginalPriceChange}
                  className="w-full text-base px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                {originalPrice && (
                  <p className="mt-3 text-lg font-semibold text-green-700">
                    New price: {calculateDiscountedPrice()} KD
                  </p>
                )}
              </div>
            </div>
          </section>

          {/* Current Coupons Section */}
          <section className="mb-10">
            <h1 className="text-lg lg:text-lg font-bold mb-4">Current Discounts</h1>
            <Separator className="my-3 bg-black/20" />
            {discountStatus && discountStatus.length > 0 ? (
              <div className="flex flex-wrap flex-col gap-6 w-full lg:w-4xl">
                {discountStatus.map((d: Discount) => (
                  <div
                    key={d._id}
                    className="relative lg:w-full bg-white rounded-xl shadow-lg border-2 border-dashed border-blue-500 p-6 flex flex-col gap-4">
                    {/* Coupon Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-extrabold text-blue-600">
                        {d.discountBy * 100}% OFF
                      </span>
                      <button
                        onClick={() => handleDeleteDiscount(d._id)}
                        disabled={loadingDelete}
                        aria-label="Delete coupon"
                        title="Delete coupon"
                        className="text-red-600 hover:text-red-800 transition-colors">
                        <Trash2 size={24} />
                      </button>
                    </div>

                    {/* Categories */}
                    <p className="text-gray-700 font-semibold">
                      Categories:{" "}
                      {d.category.length === 0 ? (
                        <span className="italic text-gray-400">No categories</span>
                      ) : (
                        d.category.map((cat, i) => (
                          <span key={cat}>
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            {i !== d.category.length - 1 ? ", " : ""}
                          </span>
                        ))
                      )}
                    </p>

                    {/* Coupon cutout effect bottom */}
                    <div
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-6 bg-white border-t-2 border-white rounded-b-xl"
                      style={{
                        clipPath:
                          "polygon(0 0, 10% 100%, 20% 0, 30% 100%, 40% 0, 50% 100%, 60% 0, 70% 100%, 80% 0, 90% 100%, 100% 0, 100% 100%, 0 100%)",
                      }}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-lg">No discounts available.</p>
            )}
          </section>
        </div>
      )}
    </Layout>
  );
}

export default Discounts;
