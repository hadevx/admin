import {
  Box,
  Boxes,
  Codepen,
  Percent,
  ScrollText,
  Settings,
  ShoppingBasket,
  TicketPercent,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Lang = "en" | "ar";

export type Label = Record<Lang, string>;

export type NavItem = {
  key: string;
  to: string;
  icon: LucideIcon;
  label: Label;
  /** Extra path prefixes that should light this item up (detail pages…). */
  children?: NavItem[];
};

export type NavSection = {
  key: string;
  title: Label;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    key: "overview",
    title: { en: "Overview", ar: "نظرة عامة" },
    items: [
      {
        key: "summary",
        to: "/summary",
        icon: ScrollText,
        label: { en: "Summary", ar: "الملخص" },
      },
    ],
  },
  {
    key: "commerce",
    title: { en: "Commerce", ar: "المتجر" },
    items: [
      {
        key: "orders",
        to: "/orders",
        icon: ShoppingBasket,
        label: { en: "Orders", ar: "الطلبات" },
      },
      {
        key: "products",
        to: "/products",
        icon: Box,
        label: { en: "Products", ar: "المنتجات" },
      },
      {
        key: "categories",
        to: "/categories",
        icon: Boxes,
        label: { en: "Categories", ar: "الفئات" },
      },
      {
        key: "users",
        to: "/users",
        icon: Users,
        label: { en: "Customers", ar: "العملاء" },
      },
    ],
  },
  {
    key: "marketing",
    title: { en: "Marketing", ar: "التسويق" },
    items: [
      {
        key: "promotions",
        to: "/discounts",
        icon: Percent,
        label: { en: "Promotions", ar: "العروض" },
        children: [
          {
            key: "discounts",
            to: "/discounts",
            icon: TicketPercent,
            label: { en: "Discounts", ar: "الخصومات" },
          },
          {
            key: "coupons",
            to: "/coupons",
            icon: Codepen,
            label: { en: "Coupons", ar: "الكوبونات" },
          },
        ],
      },
    ],
  },
  {
    key: "operations",
    title: { en: "Operations", ar: "العمليات" },
    items: [
      {
        key: "delivery",
        to: "/delivery",
        icon: Truck,
        label: { en: "Delivery", ar: "التوصيل" },
      },
      {
        key: "settings",
        to: "/settings",
        icon: Settings,
        label: { en: "Settings", ar: "الإعدادات" },
      },
    ],
  },
];

/** Flat list of every leaf destination. */
export const NAV_LEAVES: NavItem[] = NAV_SECTIONS.flatMap((section) =>
  section.items.flatMap((item) => (item.children?.length ? item.children : [item])),
);

export const isPathActive = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

/** The leaf matching the current URL — used for the top bar title / breadcrumb. */
export const findActiveLeaf = (pathname: string): NavItem | undefined =>
  NAV_LEAVES.find((item) => isPathActive(pathname, item.to));

export const DETAIL_LABEL: Label = { en: "Details", ar: "التفاصيل" };
