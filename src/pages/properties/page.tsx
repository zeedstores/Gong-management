
import { useEffect, useMemo, useState } from "react"
import { MapPin, MessageCircle } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { cachedFetch } from "../../lib/cache"
import { ButtonLink, Eyebrow, PageHero } from "../../components/ui"
import PaymentModal from "../../components/PaymentModal"

type Property = {
  id: string
  title: string
  type: string
  location: string
  description: string | null
  image_url: string | null
  price: number | null
  status: string
}

const CACHE_TIME = 60 * 60 * 1000

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [type, setType] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [whatsapp, setWhatsapp] = useState("")

  useEffect(() => {
    let active = true

    const fetchProperties = async () => {
      try {
        const data = await cachedFetch(
          "properties",
          async () => {
            const { data, error } = await supabase
              .from("properties")
              .select(
                "id, title, type, location, description, image_url, price, status"
              )
              .eq("is_published", true)
              .order("created_at", { ascending: false })

            if (error) throw error

            return data ?? []
          },
          CACHE_TIME,
        )

        if (!active) return

        setProperties(data as Property[])
        setError("")
      } catch (error) {
        if (!active) return

        console.error("Unable to load properties:", error)
        setError("Unable to load property listings. Please try again.")
      } finally {
        if (active) setLoading(false)
      }
    }

    const fetchSettings = async () => {
      try {
        const data = await cachedFetch(
          "properties-page-settings",
          async () => {
            const { data, error } = await supabase
              .from("site_settings")
              .select("whatsapp_number")
              .eq("id", true)
              .single()

            if (error) throw error

            return data
          },
          CACHE_TIME,
        )

        if (active) {
          setWhatsapp(data?.whatsapp_number ?? "")
        }
      } catch (error) {
        console.error("Unable to load property page settings:", error)
      }
    }

    fetchProperties()
    fetchSettings()

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(
    () =>
      properties.filter(
        (property) => type === "All" || property.type === type,
      ),
    [properties, type],
  )

  const formatPrice = (price: number | null) => {
    if (price === null) return "Price on enquiry"

    return `GH₵${Number(price).toLocaleString("en-GH")}`
  }

  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
        "Hello Gong Management, I would like to make a general property enquiry.",
      )}`
    : ""

  return (
    <>
      <PageHero
        eyebrow="Property desk"
        title="SPACE FOR WHAT COMES NEXT."
        copy="Explore selected residential properties in Greater Accra. Contact our team to confirm availability, documentation and purchase details."
      />

      <section className="section light-section">
        <div className="shell property-toolbar">
          <p>
            {loading
              ? "Loading listings..."
              : `${filtered.length} ${filtered.length === 1 ? "listing" : "listings"} available`}
          </p>

          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Filter properties by type"
          >
            <option value="All">All properties</option>
            <option value="Land">Land</option>
            <option value="House">House</option>
          </select>
        </div>

        <div className="shell property-grid">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <article key={index} className="animate-pulse">
                <div className="aspect-[4/3] bg-black/10" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/4 rounded bg-black/10" />
                  <div className="h-6 w-2/3 rounded bg-black/10" />
                  <div className="h-4 w-1/2 rounded bg-black/10" />
                  <div className="h-10 w-full rounded bg-black/10" />
                </div>
              </article>
            ))
          ) : error ? (
            <div className="empty-state">
              <h2>LISTINGS UNAVAILABLE.</h2>
              <p>{error}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <h2>NO PROPERTIES FOUND.</h2>
              <p>
                {properties.length === 0
                  ? "There are currently no published property listings."
                  : "Try selecting another property type."}
              </p>
              {type !== "All" && (
                <button
                  className="button"
                  onClick={() => setType("All")}
                >
                  View all properties
                </button>
              )}
            </div>
          ) : (
            filtered.map((item) => (
              <article key={item.id}>
                <div className="property-image">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      width={800}
                      height={600}
                    />
                  ) : (
                    <div className="flex h-full min-h-48 items-center justify-center bg-black/5">
                      No image available
                    </div>
                  )}
                  <span>{item.status}</span>
                </div>

                <div>
                  <Eyebrow dark>{item.type}</Eyebrow>

                  <h2>{item.title}</h2>

                  <p>
                    <MapPin size={16} />
                    {item.location}
                  </p>

                  {item.description && <p>{item.description}</p>}

                  <strong>{formatPrice(item.price)}</strong>

                  <button
                    type="button"
                    className="button"
                    onClick={() => setSelectedProperty(item)}
                  >
                    Buy
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="shell catalogue-note">
          <p>
            Property details, ownership documents and availability should be
            verified with our team before any transaction.
          </p>
          <ButtonLink to="/contact">General property enquiry</ButtonLink>
        </div>
      </section>

      {whatsappLink && (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Enquire about properties on WhatsApp"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition hover:scale-105"
        >
          <MessageCircle size={27} />
        </a>
      )}

      {selectedProperty && (
        <PaymentModal
          onClose={() => setSelectedProperty(null)}
          purpose="property"
          amount={selectedProperty.price ?? undefined}
          propertyTitle={selectedProperty.title}
        />
      )}
    </>
  )
}
