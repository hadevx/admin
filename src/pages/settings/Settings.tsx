import Layout from "../../Layout";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useUpdateStoreStatusMutation,
  useGetStoreStatusQuery,
} from "../../redux/queries/maintenanceApi";
import Spinner from "../../components/Spinner";
import { Separator } from "../../components/ui/separator";
import { Loader2Icon } from "lucide-react";
import React from "react";

function Settings() {
  const [updateStoreStatus, { isLoading: loadingUpdateStatus }] = useUpdateStoreStatusMutation();
  const { data: storeStatus, refetch, isLoading } = useGetStoreStatusQuery(undefined);

  const [status, setStatus] = useState("");
  const [banner, setBanner] = useState("");

  const handleUpdateStoreStatus = async () => {
    await updateStoreStatus({ status, banner: banner.trim() });
    setBanner("");
    toast.success("Store status updated successfully");
    refetch();
  };

  const formatDate = (isoString: any) => {
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  React.useEffect(() => {
    if (storeStatus?.[0]) {
      setStatus(storeStatus[0].status || "");
      setBanner(storeStatus[0].banner || "");
    }
  }, [storeStatus]);

  return (
    <Layout>
      <div className="px-4 w-full min-h-screen lg:w-4xl lg:min-h-auto text-lg py-6 mt-[50px] lg:ml-[50px] space-y-5">
        {/* Update Section */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-lg font-bold text-zinc-800">Settings</h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white shadow-md rounded-xl p-5  space-y-4">
            {/* Row with select and button */}
            <div className="flex items-end gap-6">
              <div className="w-full lg:w-full">
                <label className="block mb-1 text-sm font-medium text-zinc-700">
                  Store condition
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="cursor-pointer px-4 py-2 border rounded-lg outline-0 shadow-sm focus:ring-2 focus:ring-blue-500 w-full ">
                  <option value="" disabled>
                    Choose store condition
                  </option>
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div className="w-full lg:w-[200px]">
                <button
                  onClick={handleUpdateStoreStatus}
                  disabled={loadingUpdateStatus}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-all duration-200 w-full flex justify-center items-center">
                  {loadingUpdateStatus ? <Loader2Icon className="animate-spin" /> : "Update"}
                </button>
              </div>
            </div>

            {/* Banner textarea below */}
            <div className="w-full lg:w-full">
              <label className="block mb-1 text-sm font-medium text-zinc-700">Banner Text</label>
              <textarea
                value={banner}
                onChange={(e) => setBanner(e.target.value)}
                rows={3}
                placeholder="Enter banner text (optional)"
                className="w-full px-4 py-2 border outline-0 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </section>

        {/* Current Status Section */}
        <section>
          <div className="flex  items-center gap-2 mb-2">
            <h1 className="text-lg font-bold text-zinc-800">Current Store Status</h1>
          </div>
          <Separator className="my-4 bg-black/10" />

          <div className="bg-white shadow-md rounded-xl p-5  flex flex-col gap-4 lg:gap-6 font-semibold text-zinc-800">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-start gap-4 lg:gap-10">
              <div>
                <span className="block text-xs text-zinc-500">Condition</span>
                {isLoading ? (
                  <Spinner className="border-t-black" />
                ) : storeStatus?.[0].status === "active" ? (
                  <p className="capitalize text-teal-500">{storeStatus?.[0].status}</p>
                ) : (
                  <p className="capitalize text-rose-500">{storeStatus?.[0].status}</p>
                )}
              </div>

              <div>
                <span className="block text-xs text-zinc-500">Last updated</span>
                {isLoading ? (
                  <Spinner className="border-t-black" />
                ) : (
                  <p>{formatDate(storeStatus?.[0].updatedAt)}</p>
                )}
              </div>
            </div>

            <div>
              <span className="block text-xs text-zinc-500">Banner Text</span>
              {isLoading ? (
                <Spinner className="border-t-black" />
              ) : (
                <p className="whitespace-pre-wrap max-w-md">
                  {storeStatus?.[0].banner?.trim() ? storeStatus[0].banner : "No banner"}
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default Settings;
