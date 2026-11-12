
import { useEffect, useState } from "react"
import { Link, NavLink, Outlet, useLocation } from "react-router"
import { Menu, ShoppingBag, X, MapPin, Phone } from "lucide-react"
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaLinkedinIn,
  FaXTwitter,
  FaWhatsapp,
} from "react-icons/fa6"
import { supabase } from "../lib/supabase"
import { navItems } from "../data/mockData"
import { useCart } from "./CartContext"
import { ButtonLink } from "./ui"

type SocialLinks = {
  instagram_url: string | null
  facebook_url: string | null
  youtube_url: string | null
  tiktok_url: string | null
  linkedin_url: string | null
  x_url: string | null
}

const emptySocialLinks: SocialLinks = {
  instagram_url: null,
  facebook_url: null,
  youtube_url: null,
  tiktok_url: null,
  linkedin_url: null,
  x_url: null,
}

export default function PublicLayout() {
  const [open, setOpen] = useState(false)
  const [whatsapp, setWhatsapp] = useState("")
  const [socialLinks, setSocialLinks] =
    useState<SocialLinks>(emptySocialLinks)

  const location = useLocation()
  const { count } = useCart()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    let active = true

    async function fetchSiteSettings() {
      const { data, error } = await supabase
        .from("site_settings")
        .select(
          "whatsapp_number, instagram_url, facebook_url, youtube_url, tiktok_url, linkedin_url, x_url"
        )
        .eq("id", true)
        .single()

      if (!active) return

      if (error) {
        console.error("Site settings error:", error.message)
        return
      }

      setWhatsapp(data?.whatsapp_number ?? "")

      setSocialLinks({
        instagram_url: data?.instagram_url ?? null,
        facebook_url: data?.facebook_url ?? null,
        youtube_url: data?.youtube_url ?? null,
        tiktok_url: data?.tiktok_url ?? null,
        linkedin_url: data?.linkedin_url ?? null,
        x_url: data?.x_url ?? null,
      })
    }

    fetchSiteSettings()

    return () => {
      active = false
    }
  }, [])

  const whatsappNumber = whatsapp.replace(/\D/g, "")

  const whatsappLink = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hello Gong Management, I would like to make an enquiry."
      )}`
    : ""

  const socialItems = [
    {
      name: "Instagram",
      url: socialLinks.instagram_url,
      Icon: FaInstagram,
      color: "#E4405F",
    },
    {
      name: "Facebook",
      url: socialLinks.facebook_url,
      Icon: FaFacebookF,
      color: "#1877F2",
    },
    {
      name: "YouTube",
      url: socialLinks.youtube_url,
      Icon: FaYoutube,
      color: "#FF0000",
    },
    {
      name: "TikTok",
      url: socialLinks.tiktok_url,
      Icon: FaTiktok,
      color: "#25F4EE",
    },
    {
      name: "LinkedIn",
      url: socialLinks.linkedin_url,
      Icon: FaLinkedinIn,
      color: "#0A66C2",
    },
    {
      name: "X",
      url: socialLinks.x_url,
      Icon: FaXTwitter,
      color: "#FFFFFF",
    },
  ].filter((item) => item.url?.trim())

  return (
    <div className="site">
      {/* HEADER */}
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

      {/* PAGE CONTENT */}
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

      {/* FOOTER */}
      <footer className="footer">
        <div className="shell footer-grid">
          {/* BRAND */}
          <div>
            <img src="/assets/gong-logo.png" alt="Gong Management" />

            <p className="footer-mark">
              WHERE SOUND
              <br />
              BECOMES POWER.
            </p>

            <p className="muted">
              Professional management and production services.
            </p>

            {socialItems.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {socialItems.map(({ name, url, Icon, color }) => (
                  <a
                    key={name}
                    href={url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Visit Gong Managements on ${name}`}
                    title={name}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-white/10"
                  >
                    <Icon size={18} style={{ color }} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* EXPLORE */}
          <div>
            <h3>Explore</h3>
            {navItems.map(([label, path]) => (
              <Link key={path} to={path}>
                {label}
              </Link>
            ))}
          </div>

          {/* WORK WITH US */}
          <div>
            <h3>Work with us</h3>
            <Link to="/booking">Booking</Link>
            <Link to="/equipment">Hire Equipment</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/admin/login">Admin portal</Link>
          </div>

          {/* OFFICE & CONTACT */}
          <div>
            <h3>Office & Contact</h3>

            <div className="mb-5 flex items-start gap-3 text-sm text-white/70">
              <MapPin size={18} className="mt-1 shrink-0 text-[#d6aa33]" />
              <div>
                <p className="font-semibold text-white">
                  Gong Managements
                </p>
                <p>P. O. Box CO 437</p>
                <p>Tema, Ghana</p>
                <p className="mt-2">
                  GPS Address: GT-106-9742
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-white/70">
              <Phone size={18} className="mt-1 shrink-0 text-[#d6aa33]" />
              <div className="flex flex-col gap-2">
                <a href="tel:+233243728969" className="hover:text-white">
                  +233 243728969
                </a>
                <a href="tel:+233277810803" className="hover:text-white">
                  +233 0277810803
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER BOTTOM */}
        <div className="shell footer-bottom">
          <span>© 2026 Gong Managements. Where Sound Becomes Power.</span>
          <span>Privacy · Terms</span>
        </div>
      </footer>
    </div>
  )
}
