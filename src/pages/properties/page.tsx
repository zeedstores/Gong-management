
import { useEffect, useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { ButtonLink, Eyebrow, PageHero } from "../../components/ui"

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

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [type, setType] = useState("All")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("id, title, type, location, description, image_url, price, status")
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (error) {
        setError("Unable to load property listings. Please try again.")
      } else {
        setProperties(data ?? [])
      }

      setLoading(false)
    }

    fetchProperties()
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

    return `GHS ${Number(price).toLocaleString("en-GH")}`
  }

  return (
    <>
      <PageHero
        eyebrow="Property desk"
        title="SPACE FOR WHAT COMES NEXT."
        copy="Browse available land and house opportunities. Listings are enquiry-only, and no property payment is taken online."
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

                  <a
                    className="button"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hello Gong Management, I would like to enquire about ${item.title} (${item.id}).`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Enquire on WhatsApp
                  </a>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="shell catalogue-note">
          <p>
            Property details and availability should be verified with our team
            before any transaction.
          </p>
          <ButtonLink to="/contact">General property enquiry</ButtonLink>
        </div>
      </section>
    </>
  )
}
