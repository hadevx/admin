import { Search, X } from "lucide-react";
import clsx from "clsx";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/** Search field with a leading icon and a clear button once there is a query. */
function SearchInput({ value, onChange, placeholder, className, autoFocus }: SearchInputProps) {
  return (
    <div className={clsx("relative w-full", className)}>
      <Search className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-muted-foreground" />

      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="ws-input ps-10 pe-10 [&::-webkit-search-cancel-button]:hidden"
      />

      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute inset-y-0 end-2 my-auto grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

export default SearchInput;
