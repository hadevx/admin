import Lottie from "lottie-react";

import wizard from "./Cycling in the park.json";
const Loader = () => {
  return (
    /*     <div className="flex absolute inset-0 items-center justify-center ">
      <div className="w-14 h-14 border-4 border-t-4 border-t-white border-blue-500 border-solid rounded-full animate-spin"></div>
    </div> */
    <div className="flex absolute inset-0 items-center justify-center ">
      <div className="size-[500px]">
        <Lottie animationData={wizard} loop />
      </div>
    </div>
  );
};

export default Loader;
