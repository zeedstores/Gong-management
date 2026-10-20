import { Inbox } from "lucide-react"

export default function AdminEnquiriesPage() {
  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Customer desk</span>
          <h1>ENQUIRIES</h1>
          <p>
            Bookings, contact messages, orders, property enquiries and quotes in
            one queue.
          </p>
        </div>
      </div>
      <div className="inbox-tabs">
        <button className="active">All</button>
        <button disabled>Bookings</button>
        <button disabled>Shop orders</button>
        <button disabled>Equipment</button>
        <button disabled>Properties</button>
        <button disabled>Contact</button>
      </div>
      <section className="admin-panel big-empty">
        <Inbox size={36} />
        <h2>THE INBOX IS READY.</h2>
        <p>
          Connect the backend to securely receive submissions, assign statuses
          and store internal notes.
        </p>
      </section>
    </main>
  )
}
