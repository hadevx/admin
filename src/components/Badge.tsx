import { CircleCheck, TriangleAlert, Lightbulb, Crown, Clock } from "lucide-react";

function Badge({
  variant = "primary",
  children,
  icon = true,
}: {
  variant?: string;
  children: React.ReactNode;
  icon?: boolean;
}) {
  if (variant === "success") {
    return (
      <div className=" text-teal-500 text-sm   lg:text-sm border border-teal-500 relative items-center  bg-teal-50   flex  px-2 py-1 rounded-lg    gap-1 font-semibold ">
        <CircleCheck strokeWidth={2} size={18} />
        {children}
      </div>
    );
  }
  if (variant === "danger") {
    return (
      <div className="text-rose-500 border border-rose-500  text-sm    lg:text-sm  relative items-center  bg-rose-50   flex  px-2 py-1 rounded-lg    gap-1 font-semibold ">
        <TriangleAlert strokeWidth={2} size={18} />
        {children}
      </div>
    );
  }
  if (variant === "pending") {
    return (
      <div className="text-orange-500 border border-orange-500  text-sm    lg:text-sm  relative items-center  bg-orange-50    flex  px-2 py-1 rounded-lg    gap-1 font-semibold ">
        <Clock strokeWidth={2} size={18} />
        {children}
      </div>
    );
  }
  if (variant === "primary") {
    return (
      <div className="text-blue-700 shadow-md  text-sm   lg:text-sm  relative items-center  bg-gradient-to-t from-blue-200 to-blue-100    flex  px-2 py-1 rounded-lg    gap-1 font-semibold ">
        {icon && <Lightbulb strokeWidth={2} size={18} />}
        {children}
      </div>
    );
  }
  if (variant === "admin") {
    return (
      <div className="text-yellow-700 shadow text-sm   lg:text-sm  relative items-center  bg-gradient-to-t from-orange-200 to-orange-100    flex  px-2 py-1 rounded-lg    gap-1 font-semibold ">
        <Crown strokeWidth={2} />
        {children}
      </div>
    );
  }
}

export default Badge;
