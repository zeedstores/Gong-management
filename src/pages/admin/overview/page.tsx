import {
  CalendarDays,
  Home,
  MessageSquare,
  Package,
  ShoppingBag,
  Ticket,
  Wrench,
} from "lucide-react"
import { equipment, events, products, properties } from "../../../data/mockData"

export default function AdminOverviewPage() {
  const cards = [
    ["Total products", products.length, Package],
    ["Published events", events.length, CalendarDays],
    ["Active registrations", "—", Ticket],
    ["Pending bookings", "—", MessageSquare],
    ["Equipment categories", equipment.length, Wrench],
    ["Property listings", properties.length, Home],
    ["Shop orders", "—", ShoppingBag],
    ["Unread messages", "—", MessageSquare],
  ] as const
  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Overview</span>
          <h1>GOOD EVENING.</h1>
          <p>Here is the shape of the Gong Management demo workspace.</p>
        </div>
        <button disabled title="Connect the backend to export reports">
          Export report · backend required
        </button>
      </div>
      <div className="metric-grid">
        {cards.map(([label, value, Icon]) => (
          <article key={label}>
            <Icon size={20} />
            <span>{label}</span>
            <strong>{value}</strong>
            <small>
              {value === "—"
                ? "Connect backend for live count"
                : "Demo catalogue data"}
            </small>
          </article>
        ))}
      </div>
      <div className="admin-two-col">
        <section className="admin-panel">
          <div className="panel-title">
            <h2>Recent activity</h2>
            <button disabled title="Connect the backend to view activity">
              View all
            </button>
          </div>
          <div className="activity-empty">
            <MessageSquare />
            <strong>No connected activity yet</strong>
            <p>
              Bookings, orders and registrations will appear here after backend
              connection.
            </p>
          </div>
        </section>
        <section className="admin-panel gold-panel">
          <span>Setup progress</span>
          <h2>
            READY FOR THE
            <br />
            NEXT LAYER.
          </h2>
          <ul>
            <li className="done">Visual system and routing</li>
            <li className="done">Mock data models</li>
            <li>Authentication and roles</li>
            <li>Persistent content storage</li>
            <li>Payments and verification</li>
          </ul>
        </section>
      </div>
    </main>
  )
}
