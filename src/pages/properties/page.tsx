import { useMemo, useState } from "react"
import { MapPin } from "lucide-react"
import { properties } from "../../data/mockData"
import { ButtonLink, Eyebrow, PageHero } from "../../components/ui"

export default function PropertiesPage() {
  const [type, setType] = useState("All")
  const filtered = useMemo(
    () => properties.filter((p) => type === "All" || p.type === type),
    [type],
  )
  return (
    <>
      <PageHero
        eyebrow="Property desk"
        title="SPACE FOR WHAT COMES NEXT."
        copy="Browse land and house opportunities. Listings are enquiry-only and no property payment is taken online."
      />
      <section className="section light-section">
        <div className="shell property-toolbar">
          <p>Current demo listings</p>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option>All</option>
            <option>Land</option>
            <option>House</option>
          </select>
        </div>
        <div className="shell property-grid">
          {filtered.map((item) => (
            <article key={item.id}>
              <div className="property-image">
                <img src={item.image} alt="" loading="lazy" />
                <span>{item.status}</span>
              </div>
              <div>
                <Eyebrow dark>{item.type}</Eyebrow>
                <h2>{item.title}</h2>
                <p>
                  <MapPin size={16} />
                  {item.location}
                </p>
                <strong>{item.price}</strong>
                <a
                  className="button"
                  href={`https://wa.me/?text=${encodeURIComponent(`Hello Gong Management, I would like to enquire about ${item.title} (${item.id}).`)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Enquire on WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>
        <div className="shell catalogue-note">
          <p>
            Property information shown is replaceable demonstration content and
            should be verified before publication.
          </p>
          <ButtonLink to="/contact">General property enquiry</ButtonLink>
        </div>
      </section>
    </>
  )
}
