
import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { Menu, ShoppingBag, X } from "lucide-react"
import { supabase } from "../lib/supabase"
import { navItems } from "../data/mockData"
import { useCart } from "./CartContext"
import { ButtonLink } from "./ui"
import { FaWhatsapp } from "react-icons/fa"

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const [whatsapp, setWhatsapp] = useState("")
  const location = useLocation()
  const { count } = useCart()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    let active = true

    async function fetchWhatsApp() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("whatsapp_number")
        .eq("id", true)
        .single()

      if (!active) return

      if (error) {
        console.error("WhatsApp settings error:", error.message)
        return
      }

      setWhatsapp(data?.whatsapp_number ?? "")
    }

    fetchWhatsApp()

    return () => {
      active = false
    }
  }, [])

  const whatsappLink = whatsapp.replace(/\D/g, "")
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        "Hello Gong Management, I would like to make an enquiry.",
      )}`
    : ""

  return (
    <div className="site">
      <header className="header">
        <Link className="brand" to="/">
          <img src="/assets/gong-logo.png" alt="Gong Management" />
          <span>
            GONG<small>MANAGEMENTS</small>
          </span>
        </Link>

        <nav
          className={`nav ${open ? "open" : ""}`}
          aria-label="Main navigation"
        >
          {navItems.map(([label, path]) => (
            <NavLink key={path} to={path}>
              {label}
            </NavLink>
          ))}

          <NavLink className="mobile-only" to="/cart">
            Cart ({count})
          </NavLink>
        </nav>

        <div className="header-actions">
          <Link
            className="cart-link"
            to="/cart"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBag size={20} />
            {count > 0 && <span>{count}</span>}
          </Link>

          <ButtonLink to="/booking">Book now</ButtonLink>
        </div>

        <button
          className="menu-button"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>

      <main>
        <Outlet />
      </main>

      {/* FLOATING WHATSAPP BUTTON */}
      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Gong Management on WhatsApp"
          className="fixed bottom-6 right-4 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform duration-300 hover:scale-110 sm:bottom-6 sm:right-6 sm:h-auto sm:w-auto sm:gap-3 sm:px-5 sm:py-4"
        >
          <FaWhatsapp size={30} />

          <span className="hidden text-sm font-bold sm:inline">
            Chat with us
          </span>
        </a>
      )}

      <footer className="footer">
        <div className="shell footer-grid">
          <div>
            <img src="/assets/gong-logo.png" alt="" />
            <p className="footer-mark">
              WHERE SOUND
              <br />
              BECOMES POWER.
            </p>
            <p className="muted">
              Tema, Ghana · Contact details pending client confirmation.
            </p>
          </div>

          <div>
            <h3>Explore</h3>
            {navItems.map(([label, path]) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </div>

          <div>
            <h3>Work with us</h3>
            <Link to="/booking">Booking</Link>
            <Link to="/equipment">Hire Equipment</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/admin/login">Admin portal</Link>
          </div>

          <div>
            <h3>Connect</h3>
            <span>Instagram · Link pending</span>
            <span>Facebook · Link pending</span>
            <span>YouTube · Link pending</span>
          </div>
        </div>

        <div className="shell footer-bottom">
          <span>© 2026 Gong Management. Where Sound Becomes Power.</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>
    </div>
  )
}
