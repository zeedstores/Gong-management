
import { NavLink, Outlet } from "react-router"
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Ticket,
  Wrench,
  HeartHandshake,
  Newspaper,
  CalendarPlus,
  HandCoins,
  Users,
} from "lucide-react"

const links = [
  { label: "Overview", path: "/admin", Icon: LayoutDashboard },
  { label: "Products", path: "/admin/products", Icon: Package },
  { label: "Events & tickets", path: "/admin/events", Icon: CalendarDays },
  { label: "Ticket orders", path: "/admin/orders", Icon: Ticket },
  { label: "Equipment", path: "/admin/equipment", Icon: Wrench },
  { label: "Team", path: "/admin/team", Icon: Users },
  { label: "Enquiries", path: "/admin/enquiries", Icon: MessageSquare },
  { label: "Settings", path: "/admin/settings", Icon: Settings },
] as const

const foundationLinks = [
  {
    label: "Foundation news",
    path: "/admin/foundation-news",
    Icon: Newspaper,
  },
  {
    label: "Foundation events",
    path: "/admin/foundation-events",
    Icon: CalendarPlus,
  },
  {
    label: "Campaigns",
    path: "/admin/foundation-campaigns",
    Icon: HeartHandshake,
  },
  {
    label: "Donations",
    path: "/admin/foundation-donations",
    Icon: HandCoins,
  },
] as const

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/gong-logo.png" alt="Gong Management" />
          <span>GONG ADMIN</span>
        </div>

        <nav>
          {links.map(({ label, path, Icon }) => (
            <NavLink
              end={path === "/admin"}
              key={path}
              to={path}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}

          <div className="px-4 pt-6 pb-2 text-xs font-semibold uppercase tracking-wider opacity-60">
            Foundation
          </div>

          {foundationLinks.map(({ label, path, Icon }) => (
            <NavLink key={path} to={path}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="admin-note">
          <Ticket size={18} />
          <p>Admin workspace</p>
          <span>Manage Gong Management website content.</span>
        </div>
      </aside>

      <div className="admin-content">
        <header>
          <div>
            <p>Gong Management</p>
            <strong>Content workspace</strong>
          </div>

          <NavLink to="/">View website</NavLink>
        </header>

        <Outlet />
      </div>
    </div>
  )
}
