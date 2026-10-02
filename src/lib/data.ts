export type Channel = "whatsapp" | "email" | "sms" | "web" | "messenger" | "instagram";

export const channelMeta: Record<Channel, { label: string; color: string }> = {
  whatsapp: { label: "WhatsApp", color: "text-emerald-500" },
  email: { label: "Email", color: "text-amber-500" },
  sms: { label: "SMS", color: "text-violet-500" },
  web: { label: "Website chat", color: "text-sky-500" },
  messenger: { label: "Messenger", color: "text-blue-500" },
  instagram: { label: "Instagram", color: "text-pink-500" },
};

export const revenueSeries = [
  { month: "Jan", revenue: 182000, expenses: 104000, conversations: 3200 },
  { month: "Feb", revenue: 198000, expenses: 109000, conversations: 3650 },
  { month: "Mar", revenue: 221000, expenses: 112000, conversations: 4100 },
  { month: "Apr", revenue: 214000, expenses: 118000, conversations: 4380 },
  { month: "May", revenue: 246000, expenses: 121000, conversations: 5020 },
  { month: "Jun", revenue: 263000, expenses: 125000, conversations: 5410 },
  { month: "Jul", revenue: 281000, expenses: 129000, conversations: 5870 },
  { month: "Aug", revenue: 302000, expenses: 133000, conversations: 6340 },
  { month: "Sep", revenue: 329000, expenses: 138000, conversations: 6920 },
];

export const channelSplit = [
  { name: "WhatsApp", value: 46, fill: "#10b981" },
  { name: "Website", value: 19, fill: "#0ea5e9" },
  { name: "Instagram", value: 13, fill: "#ec4899" },
  { name: "Email", value: 11, fill: "#f59e0b" },
  { name: "Messenger", value: 7, fill: "#3b82f6" },
  { name: "SMS", value: 4, fill: "#8b5cf6" },
];

export const hourlyActivity = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h.toString().padStart(2, "0")}h`,
  ai: Math.round(40 + 160 * Math.exp(-((h - 13) ** 2) / 30) + (h < 7 ? 25 : 0)),
  human: Math.round(h >= 8 && h <= 17 ? 18 + 20 * Math.exp(-((h - 12) ** 2) / 12) : 0),
}));

export interface Conversation {
  id: string;
  name: string;
  channel: Channel;
  status: "ai" | "human" | "resolved";
  unread: boolean;
  time: string;
  tag?: string;
  messages: Array<{ from: "customer" | "ai" | "agent"; text: string; time: string }>;
}

export const conversations: Conversation[] = [
  {
    id: "c1",
    name: "Lerato Mahlangu",
    channel: "whatsapp",
    status: "ai",
    unread: true,
    time: "2m",
    tag: "Order",
    messages: [
      { from: "customer", text: "Hi! Do you deliver to Soweto? I need 3 large planters by Saturday.", time: "09:41" },
      { from: "ai", text: "Hi Lerato! Yes, we deliver to Soweto for R80. 3 large planters are R1,350 + R80 delivery = R1,430. Shall I reserve them for Saturday morning?", time: "09:41" },
      { from: "customer", text: "Yes please! Can I pay by card?", time: "09:43" },
    ],
  },
  {
    id: "c2",
    name: "James Khumalo",
    channel: "sms",
    status: "human",
    unread: true,
    time: "14m",
    tag: "Booking",
    messages: [
      { from: "customer", text: "I need to move my consultation from Thursday — something came up.", time: "09:29" },
      { from: "ai", text: "No problem, James. I have Friday 10:00 or Monday 14:00 available. I've also flagged this for the team in case you'd like to speak to someone.", time: "09:29" },
    ],
  },
  {
    id: "c3",
    name: "Aisha Patel",
    channel: "email",
    status: "ai",
    unread: false,
    time: "1h",
    tag: "Quote",
    messages: [
      { from: "customer", text: "Good morning, could you send a quotation for 20 large planters delivered to our Sandton office?", time: "08:12" },
      { from: "ai", text: "Good morning Aisha! I've attached quotation Q-482 for 20 large planters incl. delivery: R10,442.00 (incl. VAT). It's valid for 30 days.", time: "08:13" },
    ],
  },
  {
    id: "c4",
    name: "Sipho Ndlovu",
    channel: "instagram",
    status: "resolved",
    unread: false,
    time: "3h",
    messages: [
      { from: "customer", text: "Is the blue ceramic pot back in stock? 😍", time: "06:55" },
      { from: "ai", text: "It is! We have 8 in stock. Want me to send you a payment link?", time: "06:55" },
      { from: "customer", text: "Done, paid! Thanks", time: "07:02" },
    ],
  },
  {
    id: "c5",
    name: "Marié Joubert",
    channel: "messenger",
    status: "ai",
    unread: false,
    time: "5h",
    tag: "Support",
    messages: [
      { from: "customer", text: "My monstera leaves are turning yellow, what should I do?", time: "04:20" },
      { from: "ai", text: "Yellow leaves usually mean overwatering. Let the top 5cm of soil dry out between waterings and make sure the pot drains well. Want our free plant-care guide?", time: "04:20" },
    ],
  },
  {
    id: "c6",
    name: "Website visitor #2841",
    channel: "web",
    status: "ai",
    unread: false,
    time: "Yesterday",
    messages: [
      { from: "customer", text: "What are your opening hours?", time: "21:14" },
      { from: "ai", text: "We're open Mon–Sat, 08:00–18:00 — but I'm here 24/7 to take orders or book visits!", time: "21:14" },
    ],
  },
];

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  spend: number;
  orders: number;
  lastSeen: string;
  status: "active" | "vip" | "inactive";
}

export const customers: Customer[] = [
  { id: "u1", name: "Lerato Mahlangu", email: "lerato@mail.co.za", phone: "+27 82 555 0101", company: "—", spend: 8640, orders: 7, lastSeen: "Today", status: "vip" },
  { id: "u2", name: "James Khumalo", email: "james.k@khumalo.co.za", phone: "+27 71 555 0144", company: "Khumalo Legal", spend: 4200, orders: 3, lastSeen: "Today", status: "active" },
  { id: "u3", name: "Aisha Patel", email: "aisha@thriveclinics.co.za", phone: "+27 83 555 0190", company: "Thrive Clinics", spend: 26480, orders: 12, lastSeen: "Today", status: "vip" },
  { id: "u4", name: "Sipho Ndlovu", email: "sipho@mzansimotors.co.za", phone: "+27 60 555 0112", company: "Mzansi Motors", spend: 2350, orders: 2, lastSeen: "Yesterday", status: "active" },
  { id: "u5", name: "Marié Joubert", email: "marie.j@gmail.com", phone: "+27 72 555 0177", company: "—", spend: 960, orders: 1, lastSeen: "3 days ago", status: "active" },
  { id: "u6", name: "Pieter van Wyk", email: "pieter@capeinteriors.co.za", phone: "+27 84 555 0133", company: "Cape Interiors", spend: 41200, orders: 18, lastSeen: "1 week ago", status: "vip" },
  { id: "u7", name: "Nomsa Zulu", email: "nomsa.z@outlook.com", phone: "+27 79 555 0155", company: "—", spend: 380, orders: 1, lastSeen: "2 months ago", status: "inactive" },
];

export type LeadStage = "new" | "contacted" | "qualified" | "proposal" | "won";

export interface Lead {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: LeadStage;
  source: string;
  score: number;
}

export const leads: Lead[] = [
  { id: "l1", name: "Kagiso Molefe", company: "Molefe Events", value: 18500, stage: "new", source: "WhatsApp", score: 72 },
  { id: "l2", name: "Zanele Dube", company: "Dube Dental", value: 9600, stage: "new", source: "Website", score: 58 },
  { id: "l3", name: "Ruan Pretorius", company: "Pretorius Property", value: 32000, stage: "contacted", source: "Instagram", score: 81 },
  { id: "l4", name: "Fatima Essop", company: "Essop Boutique Hotel", value: 54000, stage: "qualified", source: "Email", score: 90 },
  { id: "l5", name: "Bongani Shabalala", company: "Shaba Gym", value: 12400, stage: "proposal", source: "Referral", score: 77 },
  { id: "l6", name: "Chloé Martin", company: "Le Café", value: 7800, stage: "proposal", source: "Messenger", score: 64 },
  { id: "l7", name: "Thabo Nkosi", company: "Nkosi Logistics", value: 61000, stage: "won", source: "WhatsApp", score: 95 },
];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  reorder: number;
}

export const products: Product[] = [
  { id: "p1", name: "Large ceramic planter", sku: "PLT-L-001", category: "Planters", price: 450, cost: 210, stock: 12, reorder: 10 },
  { id: "p2", name: "Small ceramic planter", sku: "PLT-S-002", category: "Planters", price: 180, cost: 70, stock: 34, reorder: 15 },
  { id: "p3", name: "Monstera deliciosa", sku: "PLN-MON-01", category: "Indoor plants", price: 320, cost: 140, stock: 5, reorder: 8 },
  { id: "p4", name: "Fiddle leaf fig", sku: "PLN-FIG-02", category: "Indoor plants", price: 420, cost: 190, stock: 9, reorder: 6 },
  { id: "p5", name: "Snake plant", sku: "PLN-SNK-03", category: "Indoor plants", price: 160, cost: 60, stock: 41, reorder: 12 },
  { id: "p6", name: "Organic potting soil 20L", sku: "SOL-20-01", category: "Supplies", price: 120, cost: 45, stock: 3, reorder: 20 },
  { id: "p7", name: "Blue glazed pot", sku: "PLT-B-003", category: "Planters", price: 290, cost: 120, stock: 8, reorder: 5 },
  { id: "p8", name: "Hanging macramé holder", sku: "ACC-MAC-01", category: "Accessories", price: 210, cost: 80, stock: 22, reorder: 8 },
];

export interface Appointment {
  id: string;
  title: string;
  customer: string;
  day: number;
  start: string;
  duration: number;
  type: "consultation" | "delivery" | "call" | "visit";
  bookedBy: "ai" | "team";
}

export const appointments: Appointment[] = [
  { id: "a1", title: "Garden consultation", customer: "Aisha Patel", day: 0, start: "09:00", duration: 60, type: "consultation", bookedBy: "ai" },
  { id: "a2", title: "Delivery — Soweto", customer: "Lerato Mahlangu", day: 0, start: "11:30", duration: 30, type: "delivery", bookedBy: "ai" },
  { id: "a3", title: "Supplier call", customer: "Plant Wholesalers SA", day: 1, start: "10:00", duration: 45, type: "call", bookedBy: "team" },
  { id: "a4", title: "Office plant install", customer: "Cape Interiors", day: 2, start: "13:00", duration: 120, type: "visit", bookedBy: "ai" },
  { id: "a5", title: "Consultation", customer: "James Khumalo", day: 4, start: "10:00", duration: 60, type: "consultation", bookedBy: "ai" },
  { id: "a6", title: "Delivery — Sandton", customer: "Thrive Clinics", day: 3, start: "15:00", duration: 30, type: "delivery", bookedBy: "ai" },
  { id: "a7", title: "Team meeting", customer: "Internal", day: 1, start: "16:00", duration: 30, type: "call", bookedBy: "team" },
];

export interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  method: string;
}

export const expenses: Expense[] = [
  { id: "e1", description: "Plant stock — wholesaler", category: "Inventory", amount: 18400, date: "2026-09-28", method: "EFT" },
  { id: "e2", description: "Shop rent — September", category: "Rent", amount: 22000, date: "2026-09-01", method: "Debit order" },
  { id: "e3", description: "Delivery van fuel", category: "Transport", amount: 3150, date: "2026-09-25", method: "Card" },
  { id: "e4", description: "Instagram ads", category: "Marketing", amount: 2500, date: "2026-09-20", method: "Card" },
  { id: "e5", description: "Electricity & water", category: "Utilities", amount: 4100, date: "2026-09-15", method: "Debit order" },
  { id: "e6", description: "Naykama AI — Business plan", category: "Software", amount: 999, date: "2026-09-01", method: "Card" },
  { id: "e7", description: "Staff wages", category: "Payroll", amount: 46000, date: "2026-09-25", method: "EFT" },
];

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  assignee: string;
  due: string;
  priority: "low" | "medium" | "high";
  status: TaskStatus;
  ai?: boolean;
}

export const tasks: Task[] = [
  { id: "t1", title: "Follow up with Fatima on hotel proposal", assignee: "Naykama AI", due: "Today", priority: "high", status: "todo", ai: true },
  { id: "t2", title: "Restock Monstera & potting soil", assignee: "Naledi", due: "Tomorrow", priority: "high", status: "todo" },
  { id: "t3", title: "Send overdue invoice reminders", assignee: "Naykama AI", due: "Today", priority: "medium", status: "doing", ai: true },
  { id: "t4", title: "Prepare Cape Interiors install", assignee: "Thabo", due: "Wed", priority: "medium", status: "doing" },
  { id: "t5", title: "Draft October newsletter", assignee: "Naykama AI", due: "Fri", priority: "low", status: "todo", ai: true },
  { id: "t6", title: "Reconcile September expenses", assignee: "Ontiretse", due: "Done", priority: "medium", status: "done" },
  { id: "t7", title: "Reply to 42 weekend WhatsApp messages", assignee: "Naykama AI", due: "Done", priority: "high", status: "done", ai: true },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "sale" | "alert" | "ai" | "booking" | "system";
  read: boolean;
}

export const notifications: Notification[] = [
  { id: "n1", title: "New order via WhatsApp", body: "Lerato Mahlangu ordered 3 × Large ceramic planter (R1,430).", time: "2 min ago", type: "sale", read: false },
  { id: "n2", title: "Low stock: Organic potting soil", body: "Only 3 left — below reorder level of 20.", time: "18 min ago", type: "alert", read: false },
  { id: "n3", title: "Appointment booked by AI", body: "James Khumalo rescheduled to Friday 10:00.", time: "32 min ago", type: "booking", read: false },
  { id: "n4", title: "Conversation escalated", body: "AI handed a refund request to your team with a summary.", time: "1 hour ago", type: "ai", read: true },
  { id: "n5", title: "Invoice INV-1039 paid", body: "Thrive Clinics paid R12,650.00.", time: "3 hours ago", type: "sale", read: true },
  { id: "n6", title: "Weekly report ready", body: "Your AI employee handled 1,284 conversations this week.", time: "Yesterday", type: "system", read: true },
];

export interface InvoiceLine {
  id: string;
  description: string;
  qty: number;
  price: number;
}

export interface Invoice {
  id: string;
  number: string;
  kind: "invoice" | "quote";
  customer: string;
  email: string;
  date: string;
  due: string;
  status: "draft" | "sent" | "paid" | "overdue";
  lines: InvoiceLine[];
  notes?: string;
}

export const invoices: Invoice[] = [
  {
    id: "i1",
    number: "INV-1042",
    kind: "invoice",
    customer: "Cape Interiors",
    email: "pieter@capeinteriors.co.za",
    date: "2026-09-29",
    due: "2026-10-13",
    status: "sent",
    lines: [
      { id: "x1", description: "Fiddle leaf fig", qty: 6, price: 420 },
      { id: "x2", description: "Large ceramic planter", qty: 6, price: 450 },
      { id: "x3", description: "Installation service", qty: 1, price: 850 },
    ],
  },
  {
    id: "i2",
    number: "INV-1041",
    kind: "invoice",
    customer: "Thrive Clinics",
    email: "aisha@thriveclinics.co.za",
    date: "2026-09-24",
    due: "2026-10-08",
    status: "paid",
    lines: [{ id: "x4", description: "Office plant package", qty: 1, price: 11000 }],
  },
  {
    id: "i3",
    number: "INV-1038",
    kind: "invoice",
    customer: "Khumalo Legal",
    email: "james.k@khumalo.co.za",
    date: "2026-09-02",
    due: "2026-09-16",
    status: "overdue",
    lines: [{ id: "x5", description: "Monthly plant care", qty: 1, price: 1800 }],
  },
  {
    id: "i4",
    number: "Q-482",
    kind: "quote",
    customer: "Thrive Clinics",
    email: "aisha@thriveclinics.co.za",
    date: "2026-10-02",
    due: "2026-11-01",
    status: "sent",
    lines: [
      { id: "x6", description: "Large ceramic planter", qty: 20, price: 450 },
      { id: "x7", description: "Delivery (Gauteng)", qty: 1, price: 80 },
    ],
  },
];

export const VAT_RATE = 0.15;

export function invoiceTotals(lines: InvoiceLine[]) {
  const subtotal = lines.reduce((s, l) => s + l.qty * l.price, 0);
  const vat = subtotal * VAT_RATE;
  return { subtotal, vat, total: subtotal + vat };
}

export const topProducts = [
  { name: "Large ceramic planter", sold: 184, revenue: 82800 },
  { name: "Fiddle leaf fig", sold: 96, revenue: 40320 },
  { name: "Office plant package", sold: 7, revenue: 77000 },
  { name: "Monstera deliciosa", sold: 112, revenue: 35840 },
  { name: "Snake plant", sold: 203, revenue: 32480 },
];
