import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button, Field, Select, TextArea } from "./ui"

export function InquiryForm({ type = "General enquiry" }: { type?: string }) {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setSent(true)
  }
  if (sent)
    return (
      <div className="success-panel">
        <CheckCircle2 size={36} />
        <h3>Request received</h3>
        <p>
          This is a prototype confirmation. A connected backend will securely
          deliver and track this enquiry.
        </p>
        <Button onClick={() => setSent(false)}>Send another</Button>
      </div>
    )
  return (
    <form className="form-grid" onSubmit={submit}>
      <Select label="Enquiry type" defaultValue={type}>
        <option>Book an Artist</option>
        <option>Book Event Production</option>
        <option>Request Equipment Hire Quote</option>
        <option>Event Ticket Registration</option>
        <option>General enquiry</option>
      </Select>
      <Field label="Full name" required placeholder="Your name" />
      <Field label="Phone / WhatsApp" required placeholder="+233" />
      <Field
        label="Email"
        required
        type="email"
        placeholder="you@example.com"
      />
      <Field label="Event date" type="date" />
      <Field label="Venue / location" placeholder="Tema, Ghana" />
      <Field label="Budget (GHS)" inputMode="numeric" placeholder="Optional" />
      <TextArea
        label="Tell us what you need"
        required
        placeholder="Share the idea, audience size and any key requirements."
      />
      <Button type="submit">Submit request</Button>
    </form>
  )
}
