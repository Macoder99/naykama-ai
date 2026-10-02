import {
  BarChart3,
  Bell,
  Bot,
  Boxes,
  CalendarDays,
  CircleDollarSign,
  FileText,
  Inbox,
  LayoutDashboard,
  ListTodo,
  Plug,
  Receipt,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const navGroups: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/dashboard/chat", label: "AI Assistant", icon: Bot },
      { href: "/dashboard/studio", label: "AI Studio", icon: Sparkles },
      { href: "/dashboard/inbox", label: "Customer Inbox", icon: Inbox, badge: "3" },
    ],
  },
  {
    label: "Business",
    items: [
      { href: "/dashboard/crm", label: "CRM & Leads", icon: Users },
      { href: "/dashboard/calendar", label: "Appointments", icon: CalendarDays },
      { href: "/dashboard/invoices", label: "Invoices & Quotes", icon: FileText },
      { href: "/dashboard/inventory", label: "Inventory", icon: Boxes },
      { href: "/dashboard/sales", label: "Sales & Profit", icon: TrendingUp },
      { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
      { href: "/dashboard/tasks", label: "Employee Tasks", icon: ListTodo },
    ],
  },
  {
    label: "Insights",
    items: [
      { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
      { href: "/dashboard/integrations", label: "Integrations", icon: Plug },
      { href: "/dashboard/billing", label: "Billing", icon: CircleDollarSign },
      { href: "/dashboard/settings", label: "Settings", icon: Settings },
    ],
  },
];

export const allNavItems = navGroups.flatMap((g) => g.items);
