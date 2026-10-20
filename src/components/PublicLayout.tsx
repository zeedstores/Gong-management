import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { Menu, ShoppingBag, X } from "lucide-react"
import { navItems } from "../data/mockData"
import { useCart } from "./CartContext"
import { ButtonLink } from "./ui"

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { count } = useCart()
  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])
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
          <ButtonLink className="mobile-only" to="/booking">
            Get a quote
          </ButtonLink>
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
        >
          {open ? <X /> : <Menu />}
        </button>
      </header>
      <main>
        <Outlet />
      </main>
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
            {navItems.slice(0, 6).map(([label, path]) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </div>
          <div>
            <h3>Work with us</h3>
            <Link to="/booking">Book an artist</Link>
            <Link to="/equipment">Hire equipment</Link>
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
