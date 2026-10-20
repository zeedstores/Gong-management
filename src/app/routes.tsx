import { createBrowserRouter } from "react-router"
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
import AdminOverviewPage from "../pages/admin/overview/page"
import AdminProductsPage from "../pages/admin/products/page"
import AdminEventsPage from "../pages/admin/events/page"
import AdminEquipmentPage from "../pages/admin/equipment/page"
import AdminEnquiriesPage from "../pages/admin/enquiries/page"
import AdminSettingsPage from "../pages/admin/settings/page"
import AdminLoginPage from "../pages/admin/login/page"
import NotFoundPage from "../pages/not-found/page"

function PublicRoot() {
  return (
    <CartProvider>
      <AppShell />
    </CartProvider>
  )
}

export const router = createBrowserRouter([
  { path: "/admin/login", Component: AdminLoginPage },
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
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminOverviewPage },
      { path: "products", Component: AdminProductsPage },
      { path: "events", Component: AdminEventsPage },
      { path: "equipment", Component: AdminEquipmentPage },
      { path: "enquiries", Component: AdminEnquiriesPage },
      { path: "settings", Component: AdminSettingsPage },
    ],
  },
])
