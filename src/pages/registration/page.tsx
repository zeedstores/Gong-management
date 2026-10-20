import { useMemo, useState, type FormEvent } from "react"
import { CheckCircle2, ShieldCheck } from "lucide-react"
import { useParams } from "react-router"
import { events } from "../../data/mockData"
import {
  Button,
  ButtonLink,
  Field,
  PageHero,
  Select,
} from "../../components/ui"

export default function RegistrationPage() {
  const { eventId } = useParams()
  const event = useMemo(
    () => events.find((item) => item.id === eventId) || events[0],
    [eventId],
  )
  const paid = event.id === "xplosion-live"
  const [done, setDone] = useState(false)
  const [tier, setTier] = useState("General")
  const [quantity, setQuantity] = useState(1)
  const prices: Record<string, number> = { General: 200, VIP: 350, Vendor: 500 }
  const submit = (e: FormEvent) => {
    e.preventDefault()
    setDone(true)
  }
  return (
    <>
      <PageHero
        eyebrow={event.status}
        title={event.title}
        copy={`${event.tagline} ${event.date} · ${event.venue}`}
        image={event.image}
      />
      <section className="section light-section">
        <div className="shell registration-layout">
          <div>
            <span className="form-kicker">
              {paid ? "Ticket order" : "Free registration"}
            </span>
            {done ? (
              <div className="success-panel">
                <CheckCircle2 size={44} />
                <h2>{paid ? "ORDER PREPARED" : "REGISTRATION RECORDED"}</h2>
                <p>
                  {paid
                    ? "No payment has been processed. Continue only when the secure payment integration is configured."
                    : "Prototype reference: GONG-DEMO-2026. In production, a unique server-generated reference will be issued."}
                </p>
                {paid && (
                  <div className="payment-pending">
                    <ShieldCheck />
                    <strong>ONLINE PAYMENT INTEGRATION PENDING</strong>
                    <span>
                      Secure ticket payments will be available once the payment
                      provider credentials have been configured.
                    </span>
                  </div>
                )}
                <ButtonLink to="/events">Back to events</ButtonLink>
              </div>
            ) : (
              <form className="form-grid registration-form" onSubmit={submit}>
                {paid && (
                  <>
                    <Select
                      label="Ticket tier"
                      value={tier}
                      onChange={(e) => setTier(e.target.value)}
                    >
                      <option>General</option>
                      <option>VIP</option>
                      <option>Vendor</option>
                    </Select>
                    <Field
                      label="Quantity"
                      min={1}
                      max={10}
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                    <div className="ticket-total">
                      <span>Order total</span>
                      <strong>
                        GHS {(prices[tier] * quantity).toFixed(2)}
                      </strong>
                    </div>
                  </>
                )}
                <Field label="Full name" required />
                <Field label="Phone number" required placeholder="+233" />
                <Field label="Email" type="email" required />
                {!paid && <Field label="Church or organisation" required />}
                <Button type="submit">
                  {paid
                    ? "Continue to payment notice"
                    : "Complete free registration"}
                </Button>
              </form>
            )}
          </div>
          <aside className="registration-aside">
            <img src={event.image} alt="" />
            <span>Important</span>
            <p>
              Event details, availability and prices in this prototype remain
              editable demo data. Do not travel until the organiser confirms the
              final date and venue.
            </p>
          </aside>
        </div>
      </section>
    </>
  )
}
