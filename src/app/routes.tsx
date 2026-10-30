
import { useEffect, useState } from "react"
import { createBrowserRouter, Navigate, Outlet } from "react-router"
import { supabase } from "../lib/supabase"

import AppShell from "../components/PublicLayout"
import AdminLayout from "../components/AdminLayout"
import { CartProvider } from "../components/CartContext"

import HomePage from "../pages/home/page"
import AboutPage from "../pages/about/page"
import ServicesPage from "../pages/services/page"
import EventsPage from "../pages/events/page"
import PortfolioPage from "../pages/portfolio/page"
import ShopPage from "../pages/shop/page"
import CartPage from "../pages/cart/page"
import EquipmentPage from "../pages/equipment/page"
import PropertiesPage from "../pages/properties/page"
import BookingPage from "../pages/booking/page"
import ContactPage from "../pages/contact/page"
import RegistrationPage from "../pages/registration/page"

import FoundationPage from "../pages/foundation/page"
import FoundationNewsPage from "../pages/foundation/news/page"

import AdminOrdersPage from "../pages/admin/orders/page"
import AdminOverviewPage from "../pages/admin/overview/page"
import AdminProductsPage from "../pages/admin/products/page"
import AdminEventsPage from "../pages/admin/events/page"
import AdminEquipmentPage from "../pages/admin/equipment/page"
import AdminEnquiriesPage from "../pages/admin/enquiries/page"
import AdminSettingsPage from "../pages/admin/settings/page"
import AdminLoginPage from "../pages/admin/login/page"
import AdminTeamPage from "../pages/admin/team/page"

import AdminFoundationNewsPage from "../pages/admin/foundation-news/page"
import AdminFoundationEventsPage from "../pages/admin/foundation-events/page"
import AdminFoundationCampaignsPage from "../pages/admin/foundation-campaigns/page"
import AdminFoundationDonationsPage from "../pages/admin/foundation-donations/page"

import NotFoundPage from "../pages/not-found/page"

function PublicRoot() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  )
}

function AdminGuard() {
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "unauthenticated"
  >("loading")

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(({ data, error }) => {
      if (active) {
        setStatus(!error && data.session ? "authenticated" : "unauthenticated")
      }
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) {
        setStatus(session ? "authenticated" : "unauthenticated")
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  if (status === "loading") {
    return <main className="admin-page">Checking admin session...</main>
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />
  }

  return <Outlet />
}

export const router = createBrowserRouter([
  {
    path: "/admin/login",
    Component: AdminLoginPage,
  },
  {
    path: "/",
    Component: PublicRoot,
    children: [
      { index: true, Component: HomePage },
      { path: "about", Component: AboutPage },
      { path: "services", Component: ServicesPage },
      { path: "events", Component: EventsPage },
      { path: "events/:eventId/register", Component: RegistrationPage },
      { path: "portfolio", Component: PortfolioPage },
      { path: "shop", Component: ShopPage },
      { path: "foundation", Component: FoundationPage },
      { path: "foundation/news/:slug", Component: FoundationNewsPage },
      { path: "cart", Component: CartPage },
      { path: "equipment", Component: EquipmentPage },
      { path: "properties", Component: PropertiesPage },
      { path: "booking", Component: BookingPage },
      { path: "contact", Component: ContactPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    path: "/admin",
    Component: AdminGuard,
    children: [
      {
        Component: AdminLayout,
        children: [
          { index: true, Component: AdminOverviewPage },
          { path: "products", Component: AdminProductsPage },
          { path: "events", Component: AdminEventsPage },
          { path: "orders", Component: AdminOrdersPage },
          { path: "equipment", Component: AdminEquipmentPage },
          { path: "team", Component: AdminTeamPage },
          { path: "enquiries", Component: AdminEnquiriesPage },
          { path: "settings", Component: AdminSettingsPage },

          { path: "foundation-news", Component: AdminFoundationNewsPage },
          { path: "foundation-events", Component: AdminFoundationEventsPage },
          { path: "foundation-campaigns", Component: AdminFoundationCampaignsPage },
          { path: "foundation-donations", Component: AdminFoundationDonationsPage },
        ],
      },
    ],
  },
])
