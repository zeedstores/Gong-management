import { NavLink, Outlet } from "react-router"
import {
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Package,
  Settings,
  Ticket,
  Wrench,
} from "lucide-react"

const links = [
  ["Overview", "/admin", LayoutDashboard],
  ["Products", "/admin/products", Package],
  ["Events & tickets", "/admin/events", CalendarDays],
  ["Equipment", "/admin/equipment", Wrench],
  ["Enquiries", "/admin/enquiries", MessageSquare],
  ["Settings", "/admin/settings", Settings],
] as const

export default function AdminLayout() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <img src="/assets/gong-logo.png" alt="" />
          <span>GONG ADMIN</span>
        </div>
        <nav>
          {links.map(([label, path, Icon]) => (
            <NavLink end={path === "/admin"} key={path} to={path}>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-note">
          <Ticket size={18} />
          <p>Demo mode</p>
          <span>Changes are not yet connected to secure storage.</span>
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
