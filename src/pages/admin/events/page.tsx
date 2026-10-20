import { Edit3, Eye, Plus } from "lucide-react"
import { events } from "../../../data/mockData"
import { Button } from "../../../components/ui"

export default function AdminEventsPage() {
  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Programming</span>
          <h1>EVENTS & TICKETS</h1>
          <p>
            Dates remain unpublished until confirmed. Ticket values are editable
            demo content.
          </p>
        </div>
        <Button disabled title="Connect persistent storage to create events">
          <Plus size={17} />
          Create event
        </Button>
      </div>
      <div className="admin-card-list">
        {events.map((event) => (
          <article key={event.id}>
            <img src={event.image} alt="" />
            <div>
              <span>{event.status}</span>
              <h2>{event.title}</h2>
              <p>
                {event.date} · {event.venue}
              </p>
            </div>
            <div className="event-admin-actions">
              <button disabled title="Requires connected registration data">
                <Eye size={17} />
                Registrations
              </button>
              <button disabled title="Requires persistent storage">
                <Edit3 size={17} />
                Edit event
              </button>
            </div>
          </article>
        ))}
      </div>
      <section className="admin-panel ticket-panel">
        <div>
          <span>Ticket configuration preview</span>
          <h2>Xplosion Live tiers</h2>
        </div>
        {[
          ["General", "GHS 200"],
          ["VIP", "GHS 350"],
          ["Vendor", "GHS 500"],
        ].map(([tier, price]) => (
          <p key={tier}>
            <strong>{tier}</strong>
            <span>{price}</span>
            <button disabled title="Requires persistent storage">
              Edit
            </button>
          </p>
        ))}
      </section>
    </main>
  )
}
