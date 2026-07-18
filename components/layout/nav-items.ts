import {
  Activity,
  BookOpen,
  CandlestickChart,
  GraduationCap,
  History,
  LayoutDashboard,
  Layers,
  Library,
  Newspaper,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

// Fuente única de la navegación — la usan el sidebar (desktop) y el menú móvil.
export const navigation: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Operations", href: "/operations", icon: Activity },
  { name: "Historial", href: "/historial", icon: History },
  { name: "Guardian", href: "/guardian", icon: ShieldCheck },
  { name: "Simulador", href: "/simulador", icon: SlidersHorizontal },
  { name: "Gráfico", href: "/chart", icon: CandlestickChart },
  { name: "Order Flow", href: "/orderflow", icon: Layers },
  { name: "Research", href: "/research", icon: BookOpen },
  { name: "Noticias", href: "/news", icon: Newspaper },
  { name: "Academy", href: "/academy", icon: GraduationCap },
  { name: "Knowledge", href: "/knowledge", icon: Library },
  { name: "Settings", href: "/settings", icon: Settings },
];
