import Layout from "../../Layout";
import { useState } from "react";
import { useUpdateDeliverMutation } from "../../redux/queries/orderApi";
import { toast } from "react-toastify";
import { useGetDeliveryStatusQuery } from "../../redux/queries/productApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon, TruckIcon, PackageIcon } from "lucide-react";

function Delivery() {
  const [timeToDeliver, setTimeToDeliver] = useState("");
  const [shippingFee, setShippingFee] = useState("");
  const [minDeliveryCost, setMinDeliveryCost] = useState("");

  const { data: deliveryStatus, refetch, isLoading } = useGetDeliveryStatusQuery();
  const [updateDelivery, { isLoading: loadingUpdateDelivery }] = useUpdateDeliverMutation();

  const handleUpdateDelivery = async () => {
    const res = await updateDelivery({ timeToDeliver, shippingFee, minDeliveryCost });
    toast.success("Delivery status updated");
    console.log(res);
    refetch();
  };

  console.log(deliveryStatus);

  return (
    <Layout>
      <div className="px-4 w-full lg:w-4xl min-h-screen lg:min-h-auto lg:text-lg py-6 mt-[50px] lg:ml-[50px] space-y-5">
        {/* Update Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-lg font-bold text-zinc-800">Update Delivery Settings</h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white shadow-md rounded-xl p-5  space-y-3 lg:space-y-0 lg:flex lg:items-end lg:justify-between gap-6">
            {/* Time to Deliver */}
            <div className="w-full lg:w-[200px]">
              <label className="block mb-1 text-sm font-medium text-zinc-700">
                Time to Deliver
              </label>
              <select
                onChange={(e) => setTimeToDeliver(e.target.value)}
                value={timeToDeliver}
                className="cursor-pointer px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full">
                <option value="" disabled>
                  Choose time to deliver
                </option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="two days">2 days</option>
              </select>
            </div>

            {/* Shipping Fee */}
            <div className="w-full lg:w-[200px]">
              <label className="block mb-1 text-sm font-medium text-zinc-700">Shipping Fee</label>
              <select
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="cursor-pointer px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full">
                <option value="" disabled>
                  Choose shipping fee
                </option>
                {[0, 1, 2, 3, 4, 5].map((fee) => (
                  <option key={fee} value={fee}>
                    {fee === 0 ? "Free" : `${fee}.000 KD`}
                  </option>
                ))}
              </select>
            </div>
            {/* Min delivery cost */}
            <div className="w-full lg:w-[200px]">
              <p className="block mb-1 text-sm font-medium text-zinc-700">Min delivery cost</p>
              <select
                value={minDeliveryCost}
                onChange={(e) => setMinDeliveryCost(e.target.value)}
                className="cursor-pointer px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 w-full">
                <option value="" disabled>
                  Min delivery cost
                </option>
                {[0, 1, 2, 3, 4, 5].map((fee) => (
                  <option key={fee} value={fee}>
                    {fee === 0 ? "No minimum cost" : `${fee}.000 KD`}
                  </option>
                ))}
              </select>
            </div>

            {/* Update Button */}
            <div className="w-full lg:w-[200px]">
              <button
                onClick={handleUpdateDelivery}
                disabled={loadingUpdateDelivery}
                className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 w-full flex justify-center items-center">
                {loadingUpdateDelivery ? <Loader2Icon className="animate-spin" /> : "Update"}
              </button>
            </div>
          </div>
        </section>

        {/* Current Status Section */}
        <section>
          <div className="flex   lg:text-lg items-center gap-2 mb-2">
            <h1 className="text-lg font-bold text-zinc-800">Current Delivery Status</h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white  shadow-md rounded-xl p-5  flex flex-col lg:flex-row lg:items-center lg:justify-start gap-3 lg:gap-10 font-semibold text-zinc-800">
            <div>
              <span className="block text-xs text-zinc-500">Time to Deliver</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <p className="capitalize">{deliveryStatus?.[0].timeToDeliver}</p>
              )}
            </div>

            <div>
              <span className="block text-xs text-zinc-500">Shipping Fee</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : deliveryStatus?.[0].shippingFee === 0 ? (
                <p>Free</p>
              ) : (
                <p>{deliveryStatus?.[0].shippingFee.toFixed(3)} KD</p>
              )}
            </div>
            <div>
              <span className="block text-xs text-zinc-500"> Minimum delivery cost</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : deliveryStatus?.[0].minDeliveryCost === 0 ? (
                <p>No minimum cost</p>
              ) : (
                <p>{deliveryStatus?.[0].minDeliveryCost.toFixed(3)} KD</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Delivery;
