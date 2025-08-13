import React from "react";
import { Provider } from "@/components/ui/provider";
const ProvideProvider = ({ children }) => {
  return (
    <div>
      <Provider>{children}</Provider>
    </div>
  );
};

export default ProvideProvider;
