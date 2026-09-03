import type { DashboardStat, Incident } from "@/types/incident";

// Presentation-only data. This module can be replaced by API data in a later stage.
export const stats: DashboardStat[] = [
  { label: "Open Incidents", value: 18, note: "Requires attention", icon: "inbox", tone: "teal" },
  { label: "In Progress", value: 9, note: "Currently assigned", icon: "progress", tone: "blue" },
  { label: "Critical", value: 3, note: "Immediate priority", icon: "alert", tone: "red" },
  { label: "Resolved Today", value: 24, note: "Across all teams", icon: "check", tone: "green" },
];

export const incidents: Incident[] = [
  { id: "INC-1005", title: "Payment API timeout errors", description: "The payment API is timing out intermittently during checkout.", category: "Software", priority: "Critical", status: "Open", createdAt: "Sep 02, 2026 · 09:18", updatedAt: "12 min ago" },
  { id: "INC-1004", title: "VPN access issue for remote users", description: "Remote users are unable to establish a stable VPN connection.", category: "Network", priority: "High", status: "InProgress", createdAt: "Sep 02, 2026 · 08:42", updatedAt: "36 min ago" },
  { id: "INC-1003", title: "Employee laptop not booting", description: "A recently issued laptop is not completing the startup sequence.", category: "Hardware", priority: "High", status: "Open", createdAt: "Sep 01, 2026 · 16:05", updatedAt: "1 hr ago" },
  { id: "INC-1002", title: "Password reset request", description: "User requested access recovery after multiple failed attempts.", category: "Access", priority: "Low", status: "Resolved", createdAt: "Sep 01, 2026 · 14:30", updatedAt: "3 hrs ago" },
  { id: "INC-1001", title: "Network outage", description: "The third-floor network segment experienced an unexpected outage.", category: "Network", priority: "Critical", status: "Closed", createdAt: "Aug 31, 2026 · 10:12", updatedAt: "Yesterday" },
];
