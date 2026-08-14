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
      <span>
        {before}
        <span className="rounded-md bg-amber-200/70 px-1 font-semibold text-amber-900 dark:bg-amber-500/25 dark:text-amber-100">
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
                className="group flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 transition-colors hover:bg-muted"
                style={{ marginInlineStart: level * 14 }}>
                {/* Expand/collapse */}
                <button
                  type="button"
                  onClick={() => hasChildren && toggle(node._id)}
                  className={[
                    "grid size-7 place-items-center rounded-lg border border-border bg-[var(--surface-muted)] text-muted-foreground",
                    hasChildren ? "hover:bg-muted hover:text-foreground" : "cursor-default opacity-40",
                  ].join(" ")}
                  aria-label={hasChildren ? "toggle" : "leaf"}>
                  {hasChildren ? (
                    isOpen ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4 rtl:rotate-180" />
                    )
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                  )}
                </button>

                {/* Icon */}
                <div className="grid size-9 place-items-center rounded-xl bg-muted text-foreground">
                  {hasChildren && isOpen ? (
                    <FolderOpen className="size-4" />
                  ) : (
                    <Folder className="size-4" />
                  )}
                </div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{highlight(node.name)}</div>
                  <div className="text-xs text-muted-foreground">
                    {hasChildren
                      ? `${node.children!.length} ${language === "ar" ? "فرع" : "children"}`
                      : language === "ar"
                        ? "عنصر"
                        : "item"}
                  </div>
                </div>

                {/* Quick open/close */}
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => toggle(node._id)}
                    className="text-xs font-bold text-muted-foreground transition-colors hover:text-foreground">
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
    <div>
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-base font-extrabold">{t.title}</h3>
          <p className="text-sm text-muted-foreground">
            {query
              ? `${t.results}: ${totalVisible} / ${totalAll} ${t.nodes}`
              : `${totalAll} ${t.nodes}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={expandAll} className="ws-chip">
            {t.expandAll}
          </button>
          <button type="button" onClick={collapseAll} className="ws-chip">
            {t.collapseAll}
          </button>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Search */}
      <div className="relative w-full">
        <Search className="pointer-events-none absolute inset-y-0 start-3.5 my-auto size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.search}
          className="ws-input ps-10 pe-10"
        />
        {query ? (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 end-2 my-auto grid size-7 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={t.clear}>
            <X className="size-4" />
          </button>
        ) : null}
      </div>

      {/* Tree */}
      <div className="mt-4 max-h-[420px] overflow-y-auto pe-1">
        {filtered?.length > 0 ? (
          renderTree(filtered)
        ) : (
          <div className="ws-tile p-6 text-center text-sm text-muted-foreground">{t.empty}</div>
        )}
      </div>
    </div>
  );
};

export default CategoryTree;
