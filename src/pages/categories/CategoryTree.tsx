import { useMemo, useState, type JSX } from "react";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronRight, Folder, FolderOpen, Search, X } from "lucide-react";
import { Separator } from "../../components/ui/separator";

type RootState = {
  language: { lang: "en" | "ar" };
};

type TreeNode = {
  _id: string;
  name: string;
  children?: TreeNode[];
};

type Props = {
  data: TreeNode[];
};

const CategoryTree = ({ data }: Props): JSX.Element => {
  const language = useSelector((state: RootState) => state.language.lang);

  const t = useMemo(() => {
    return language === "ar"
      ? {
          title: "شجرة الفئات",
          empty: "لا يوجد فئات",
          search: "ابحث داخل الشجرة...",
          expandAll: "توسيع الكل",
          collapseAll: "طي الكل",
          clear: "مسح",
          results: "النتائج",
          nodes: "عناصر",
        }
      : {
          title: "Category Tree",
          empty: "No categories found.",
          search: "Search inside the tree...",
          expandAll: "Expand all",
          collapseAll: "Collapse all",
          clear: "Clear",
          results: "Results",
          nodes: "nodes",
        };
  }, [language]);

  // Helpers
  const normalize = (s: string) =>
    String(s || "")
      .toLowerCase()
      .trim();

  const getAllIds = (nodes: TreeNode[]): string[] => {
    const ids: string[] = [];
    const walk = (list: TreeNode[]) => {
      list.forEach((n) => {
        ids.push(n._id);
        if (n.children?.length) walk(n.children);
      });
    };
    walk(nodes);
    return ids;
  };

  const getAllParentsOfMatches = (nodes: TreeNode[], q: string): Set<string> => {
    const toExpand = new Set<string>();
    const query = normalize(q);

    const walk = (list: TreeNode[], parents: string[]) => {
      list.forEach((n) => {
        const nameHit = normalize(n.name).includes(query);
        if (nameHit) parents.forEach((p) => toExpand.add(p));
        if (n.children?.length) walk(n.children, [...parents, n._id]);
      });
    };

    if (query) walk(nodes, []);
    return toExpand;
  };

  const filterTree = (nodes: TreeNode[], q: string): TreeNode[] => {
    const query = normalize(q);
    if (!query) return nodes;

    const walk = (list: TreeNode[]): TreeNode[] => {
      return list
        .map((n) => {
          const childHits = n.children?.length ? walk(n.children) : [];
          const selfHit = normalize(n.name).includes(query);
          if (selfHit || childHits.length) {
            return { ...n, children: childHits };
          }
          return null;
        })
        .filter(Boolean) as TreeNode[];
    };

    return walk(nodes);
  };

  const countNodes = (nodes: TreeNode[]): number => {
    let count = 0;
    const walk = (list: TreeNode[]) => {
      list.forEach((n) => {
        count += 1;
        if (n.children?.length) walk(n.children);
      });
    };
    walk(nodes);
    return count;
  };

  // State
  const [query, setQuery] = useState<string>("");
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const filtered = useMemo(() => filterTree(data || [], query), [data, query]);

  // When searching: auto-expand parents of matches (without forcing full expand)
  useMemo(() => {
    if (!query) return;
    const parents = getAllParentsOfMatches(data || [], query);
    if (parents.size) {
      setExpanded((prev) => new Set([...Array.from(prev), ...Array.from(parents)]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const totalVisible = useMemo(() => countNodes(filtered), [filtered]);
  const totalAll = useMemo(() => countNodes(data || []), [data]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => setExpanded(new Set(getAllIds(data || [])));
  const collapseAll = () => setExpanded(new Set());
  const clearSearch = () => setQuery("");

  const highlight = (text: string) => {
    const q = normalize(query);
    if (!q) return <span>{text}</span>;

    const low = text.toLowerCase();
    const idx = low.indexOf(q);
    if (idx === -1) return <span>{text}</span>;

    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + q.length);
    const after = text.slice(idx + q.length);

    return (
      <span className="text-zinc-900 dark:text-zinc-100">
        {before}
        <span className="rounded-md bg-yellow-100 dark:bg-yellow-500/20 px-1 font-semibold">
          {match}
        </span>
        {after}
      </span>
    );
  };

  const renderTree = (nodes: TreeNode[], level = 0) => {
    return (
      <ul className={level === 0 ? "space-y-1" : "space-y-1 mt-1"}>
        {nodes.map((node) => {
          const hasChildren = !!node.children?.length;
          const isOpen = expanded.has(node._id);

          return (
            <li key={node._id}>
              <div
                className={[
                  "group flex items-center gap-2 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 px-3 py-2",
                  "hover:bg-zinc-50 dark:hover:bg-white/5 transition",
                ].join(" ")}
                style={{ marginLeft: level * 12 }}>
                {/* Expand/collapse */}
                <button
                  type="button"
                  onClick={() => hasChildren && toggle(node._id)}
                  className={[
                    "h-7 w-7 rounded-xl grid place-items-center border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900",
                    hasChildren
                      ? "hover:bg-zinc-50 dark:hover:bg-white/10"
                      : "opacity-40 cursor-default",
                  ].join(" ")}
                  aria-label={hasChildren ? "toggle" : "leaf"}>
                  {hasChildren ? (
                    isOpen ? (
                      <ChevronDown className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-700 dark:text-zinc-200" />
                    )
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  )}
                </button>

                {/* Icon */}
                <div className="h-9 w-9 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 grid place-items-center">
                  {hasChildren ? (
                    isOpen ? (
                      <FolderOpen className="h-4 w-4" />
                    ) : (
                      <Folder className="h-4 w-4" />
                    )
                  ) : (
                    <Folder className="h-4 w-4 opacity-80" />
                  )}
                </div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {highlight(node.name)}
                  </div>
                  {hasChildren ? (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {node.children!.length} {language === "ar" ? "فرع" : "children"}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {language === "ar" ? "عنصر" : "item"}
                    </div>
                  )}
                </div>

                {/* Quick open/close */}
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(node._id)}
                    className="text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition">
                    {isOpen
                      ? language === "ar"
                        ? "طي"
                        : "Close"
                      : language === "ar"
                        ? "فتح"
                        : "Open"}
                  </button>
                ) : null}
              </div>

              {/* Children */}
              {hasChildren && isOpen ? (
                <div className="mt-2">{renderTree(node.children as TreeNode[], level + 1)}</div>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-zinc-950/80 backdrop-blur shadow-sm p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{t.title}</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {query
              ? `${t.results}: ${totalVisible} / ${totalAll} ${t.nodes}`
              : `${totalAll} ${t.nodes}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={expandAll}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-white/10 transition">
            {t.expandAll}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-white/10 transition">
            {t.collapseAll}
          </button>
        </div>
      </div>

      <Separator className="my-4 bg-black/10 dark:bg-white/10" />

      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400 dark:text-zinc-500">
            <Search className="h-4 w-4" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.search}
            className="w-full border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-900 rounded-2xl py-2.5 pl-10 pr-10 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          {query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
              aria-label={t.clear}>
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Tree */}
      <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
        {filtered?.length > 0 ? (
          renderTree(filtered)
        ) : (
          <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-zinc-950 p-6 text-center text-zinc-500 dark:text-zinc-400">
            {t.empty}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
