
import { useEffect, useState } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import {
  Button,
  Eyebrow,
  Field,
  Heading,
  PageHero,
  TextArea,
} from "../../components/ui"
import { supabase } from "../../lib/supabase"

type EquipmentItem = {
  id: string
  name: string
  category: string
  description: string | null
  rental_rate: number
  rate_unit: string
  image_url: string | null
  availability: string
}

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEquipment = async () => {
      const { data, error } = await supabase
        .from("equipment")
        .select(
          "id, name, category, description, rental_rate, rate_unit, image_url, availability",
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false })

      if (error) {
        setError("Unable to load equipment. Please refresh the page.")
      } else {
        setEquipment(data ?? [])
      }

      setLoading(false)
    }

    fetchEquipment()
  }, [])

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")

    if (selected.length === 0) {
      setError("Please select at least one equipment item.")
      return
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    const customerName = String(formData.get("customer_name") ?? "").trim()
    const customerPhone = String(formData.get("customer_phone") ?? "").trim()
    const customerEmail = String(formData.get("customer_email") ?? "").trim()
    const rentalStart = String(formData.get("rental_start") ?? "")
    const rentalEnd = String(formData.get("rental_end") ?? "")
    const venue = String(formData.get("venue") ?? "").trim()
    const additionalRequirements = String(
      formData.get("message") ?? "",
    ).trim()

    if (rentalEnd < rentalStart) {
      setError("The rental end date cannot be before the start date.")
      return
    }

    const selectedItems = equipment.filter((item) =>
      selected.includes(item.id),
    )

    const requests = selectedItems.map((item) => ({
      equipment_id: item.id,
      equipment_name: item.name,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone || null,
      quantity: 1,
      rental_start: rentalStart || null,
      rental_end: rentalEnd || null,
      message: [
        venue ? `Event venue: ${venue}` : "",
        additionalRequirements
          ? `Additional requirements: ${additionalRequirements}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    }))

    setSubmitting(true)

    const { error: submitError } = await supabase
      .from("equipment_quote_requests")
      .insert(requests)

    setSubmitting(false)

    if (submitError) {
      setError("We couldn't submit your request. Please try again.")
      return
    }

    form.reset()
    setSelected([])
    setSent(true)
  }

  return (
    <>
      <PageHero
        eyebrow="Equipment hire"
        title="THE GEAR TO GO BIG."
        copy="Explore our production equipment and build a quote request. Availability and final pricing are confirmed by our team."
        image="/assets/event-stage.jpg"
      />

      <section className="section light-section">
        <div className="shell equipment-grid">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <article key={index} className="animate-pulse">
                <div className="mb-5 aspect-video rounded bg-black/10" />
                <div className="mb-3 h-3 w-1/3 rounded bg-black/10" />
                <div className="mb-3 h-8 w-2/3 rounded bg-black/10" />
                <div className="mb-5 h-4 w-full rounded bg-black/10" />
                <div className="h-10 w-full rounded bg-black/10" />
              </article>
            ))
          ) : equipment.length === 0 ? (
            <div className="empty-state">
              <Heading>NO EQUIPMENT AVAILABLE.</Heading>
              <p>Our equipment listings will be updated soon.</p>
            </div>
          ) : (
            equipment.map((item, index) => {
              const isSelected = selected.includes(item.id)

              return (
                <article
                  className={isSelected ? "selected" : ""}
                  key={item.id}
                >
                  {item.image_url && (
                    <div className="mb-5 aspect-video overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        width={640}
                        height={360}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}

                  <span>
                    {String(index + 1).padStart(2, "0")} · {item.category}
                  </span>

                  <Heading>{item.name}</Heading>

                  {item.description && <p>{item.description}</p>}

                  <strong>
                    GHS {Number(item.rental_rate).toFixed(2)}
                    {item.rate_unit ? ` / ${item.rate_unit}` : ""}
                  </strong>

                  <p>{item.availability}</p>

                  <Button
                    onClick={() => toggle(item.id)}
                    className={isSelected ? "filter-active" : ""}
                  >
                    {isSelected ? "Selected ✓" : "Add to request"}
                  </Button>
                </article>
              )
            })
          )}
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell form-section">
          <div>
            <Eyebrow>Quote request</Eyebrow>
            <Heading>
              TELL US WHAT
              <br />
              YOU'RE BUILDING.
            </Heading>
            <p>
              Select your equipment and submit your event details. Our team
              will review your request and confirm availability and pricing.
            </p>

            {selected.length > 0 && (
              <div className="mt-6">
                <p className="mb-2">
                  Selected equipment ({selected.length})
                </p>
                <ul className="space-y-2">
                  {equipment
                    .filter((item) => selected.includes(item.id))
                    .map((item) => (
                      <li key={item.id}>• {item.name}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {sent ? (
            <div className="success-panel dark">
              <CheckCircle2 size={36} />
              <h3>Quote request received</h3>
              <p>
                Your request has been submitted successfully. Our team will
                review it and get back to you.
              </p>
              <Button onClick={() => setSent(false)}>
                Start another request
              </Button>
            </div>
          ) : (
            <form className="form-grid" onSubmit={handleSubmit}>
              <Field
                label="Customer name"
                name="customer_name"
                required
              />

              <Field
                label="Phone / WhatsApp"
                name="customer_phone"
                placeholder="+233"
              />

              <Field
                label="Email"
                name="customer_email"
                type="email"
                required
              />

              <Field
                label="Rental start date"
                name="rental_start"
                type="date"
                required
              />

              <Field
                label="Rental end date"
                name="rental_end"
                type="date"
                required
              />

              <Field
                label="Event venue"
                name="venue"
                required
              />

              <TextArea
                label="Additional requirements"
                name="message"
              />

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={submitting || loading}
              >
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request quotation"
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
