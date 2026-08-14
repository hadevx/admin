import { useSelector } from "react-redux";
import { RefreshCcw, WifiOff } from "lucide-react";

const Error = () => {
  const language = useSelector((state: any) => state.language.lang);
  const isRTL = language === "ar";

  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center px-4 text-center">
      <div className="ws-card w-full max-w-md animate-fade-up p-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10">
          <WifiOff className="size-7 text-rose-600 dark:text-rose-400" />
        </div>

        <h1 className="text-xl font-extrabold tracking-tight">
          {isRTL ? "حدث خطأ ما !" : "Oops! Something went wrong."}
        </h1>

        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {isRTL
            ? "راجع اتصال الانترنت ثم حاول مره أخرى"
            : "Please check your network connection and try again."}
        </p>

        <button onClick={() => window.location.reload()} className="ws-btn-primary mt-6 w-full">
          <RefreshCcw className="size-4" />
          {isRTL ? "حاول مره اخرى" : "Retry"}
        </button>
      </div>
    </div>
  );
};

export default Error;
