
import { useEffect, useState, type FormEvent } from "react"
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
import { cachedFetch } from "../../lib/cache"

type Equipment = {
  id: string
  name: string
  category: string | null
  description: string | null
  image_url: string | null
  availability: string | null
}

const CACHE_TIME = 60 * 60 * 1000

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [whatsappNumber, setWhatsappNumber] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadPageData = async () => {
      try {
        const [equipmentData, settingsData] = await Promise.all([
          cachedFetch<Equipment[]>(
            "equipment",
            async () => {
              const { data, error } = await supabase
                .from("equipment")
                .select(
                  "id, name, category, description, image_url, availability"
                )
                .eq("is_published", true)
                .order("created_at", { ascending: false })

              if (error) throw error

              return data ?? []
            },
            CACHE_TIME
          ),

          cachedFetch<{ whatsapp_number: string | null } | null>(
            "equipment-page-settings",
            async () => {
              const { data, error } = await supabase
                .from("site_settings")
                .select("whatsapp_number")
                .limit(1)
                .maybeSingle()

              if (error) throw error

              return data
            },
            CACHE_TIME
          ),
        ])

        setEquipment(equipmentData)
        setWhatsappNumber(settingsData?.whatsapp_number ?? "")
      } catch (err) {
        console.error("Equipment page loading error:", err)
        setError("Unable to load equipment. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [])

  const requestEquipment = (item: Equipment) => {
    if (!whatsappNumber) {
      setError(
        "WhatsApp contact is currently unavailable. Please contact us directly."
      )
      return
    }

    const message = [
      "Hello Gong Managements,",
      "",
      "I am interested in hiring the following equipment:",
      `Equipment: ${item.name}`,
      `Category: ${item.category || "Not specified"}`,
      "",
      "Please share its availability and rental quotation.",
    ].join("\n")

    const number = whatsappNumber.replace(/\D/g, "")
    const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

    window.open(url, "_blank", "noopener,noreferrer")
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    setError("")
    setSubmitting(true)

    try {
      const form = e.currentTarget
      const formData = new FormData(form)

      const customerName = String(
        formData.get("customer_name") ?? ""
      ).trim()

      const customerEmail = String(
        formData.get("customer_email") ?? ""
      ).trim()

      const customerPhone = String(
        formData.get("customer_phone") ?? ""
      ).trim()

      const eventType = String(
        formData.get("event_type") ?? ""
      ).trim()

      const eventDate = String(
        formData.get("event_date") ?? ""
      ).trim()

      const venue = String(
        formData.get("venue") ?? ""
      ).trim()

      const guestCount = String(
        formData.get("guest_count") ?? ""
      ).trim()

      const requirements = String(
        formData.get("requirements") ?? ""
      ).trim()

      const message = [
        `Event type: ${eventType || "Not provided"}`,
        `Expected guests: ${guestCount || "Not provided"}`,
        `Event venue: ${venue || "Not provided"}`,
        `Equipment and service requirements: ${
          requirements || "Customer needs recommendations."
        }`,
      ].join("\n")

      const enquiryData = {
        equipment_id: null,
        equipment_name: eventType || "General enquiry",
        customer_name: customerName || "Not provided",
        customer_email: customerEmail || "Not provided",
        customer_phone: customerPhone || null,
        quantity: 1,
        rental_start: eventDate || null,
        rental_end: null,
        message,
      }

      const { error: submitError } = await supabase
        .from("equipment_quote_requests")
        .insert(enquiryData)

      if (submitError) {
        console.error("SUPABASE ENQUIRY ERROR:", submitError)
        setError(submitError.message || "We couldn't submit your enquiry.")
        return
      }

      form.reset()
      setSent(true)
    } catch (err) {
      console.error("UNEXPECTED ENQUIRY ERROR:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Equipment hire"
        title="LET'S BUILD YOUR EVENT."
        copy="Explore our equipment and contact our team for availability and rental quotations."
        image="/assets/equipment-stage.jpeg"
      />

      <section className="section dark-section">
        <div className="shell">
          <div className="mb-10">
            <Eyebrow>Our equipment</Eyebrow>
            <Heading>
              EQUIPMENT FOR
              <br />
              EVERY OCCASION.
            </Heading>

            <p className="mt-4 max-w-2xl text-white/70">
              Explore our equipment collection. Select what you need and
              contact our team for availability and a quotation.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-16 text-white/70">
              <Loader2 className="animate-spin" />
              <span className="ml-3">Loading equipment...</span>
            </div>
          ) : equipment.length === 0 ? (
            <p className="py-12 text-center text-white/60">
              {error || "Equipment will be displayed here soon."}
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {equipment.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-white/5">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/40">
                        Image unavailable
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    {item.category && (
                      <p className="mb-2 text-xs uppercase tracking-widest text-white/50">
                        {item.category}
                      </p>
                    )}

                    <h3 className="text-xl font-semibold text-white">
                      {item.name}
                    </h3>

                    {item.description && (
                      <p className="mt-3 text-sm leading-6 text-white/65">
                        {item.description}
                      </p>
                    )}

                    {item.availability && (
                      <p className="mt-3 text-xs text-white/50">
                        Status: {item.availability}
                      </p>
                    )}

                    <Button
                      type="button"
                      onClick={() => requestEquipment(item)}
                      className="mt-5 w-full"
                    >
                      Request for Hire
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section dark-section">
        <div className="shell form-section">
          <div>
            <Eyebrow>Event planning</Eyebrow>
            <Heading>
              TELL US WHAT
              <br />
              YOU'RE PLANNING.
            </Heading>

            <p>
              Whether it's a wedding, concert, corporate event or private
              celebration, tell us what you have in mind. Gong Managements
              will recommend suitable equipment and send you a quotation.
            </p>

            <div className="mt-8 space-y-4 text-sm text-white/70">
              <p>01. Tell us about your event.</p>
              <p>02. We recommend suitable equipment.</p>
              <p>03. We confirm availability and pricing.</p>
              <p>04. You receive your quotation.</p>
            </div>
          </div>

          {sent ? (
            <div className="success-panel dark">
              <CheckCircle2 size={36} />
              <h3>Enquiry received!</h3>
              <p>
                Thank you for contacting Gong Managements. Our team will
                review your event details and get back to you with
                recommendations and a quotation.
              </p>
              <Button type="button" onClick={() => setSent(false)}>
                Submit another enquiry
              </Button>
            </div>
          ) : (
            <form
              className="form-grid"
              onSubmit={handleSubmit}
              noValidate
            >
              <Field
                label="Full name"
                name="customer_name"
                autoComplete="name"
              />

              <Field
                label="Phone / WhatsApp"
                name="customer_phone"
                type="tel"
                placeholder="Enter phone number"
              />

              <Field
                label="Email address"
                name="customer_email"
                type="email"
                autoComplete="email"
              />

              <div className="field">
                <label htmlFor="event_type">Type of event</label>
                <select
                  id="event_type"
                  name="event_type"
                  defaultValue=""
                  className="w-full rounded-lg border border-white/20 bg-[#151515] px-4 py-3 text-white"
                >
                  <option value="">Select event type</option>
                  <option value="Wedding">Wedding</option>
                  <option value="Concert">Concert</option>
                  <option value="Corporate event">Corporate event</option>
                  <option value="Birthday party">Birthday party</option>
                  <option value="Conference">Conference</option>
                  <option value="Festival">Festival</option>
                  <option value="Private event">Private event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Field
                label="Event date"
                name="event_date"
                type="date"
              />

              <Field
                label="Expected number of guests"
                name="guest_count"
                type="number"
                placeholder="e.g. 500"
              />

              <Field
                label="Event venue / location"
                name="venue"
                placeholder="Enter event location"
              />

              <TextArea
                label="What equipment or services do you need?"
                name="requirements"
                placeholder="Tell us what you need, or let us recommend suitable equipment for your event."
              />

              {error && (
                <p className="text-sm text-red-400" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Request a quotation"
                )}
              </Button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
