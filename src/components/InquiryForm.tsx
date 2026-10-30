
import { useState, type FormEvent } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"
import { Button, Field, Select, TextArea } from "./ui"
import { supabase } from "../lib/supabase"

const enquiryTypeMap: Record<string, string> = {
  "Book an Artist": "general",
  "Book Event Production": "general",
  "Request Equipment Hire Quote": "general",
  "Event Ticket Registration": "general",
  "General enquiry": "general",
}

export function InquiryForm({
  type = "General enquiry",
}: {
  type?: string
}) {
  const [sent, setSent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const form = event.currentTarget
    const formData = new FormData(form)

    const selectedType = String(
      formData.get("enquiry_type") || type,
    )

    const enquiryType =
      enquiryTypeMap[selectedType] ?? "general"

    const customerName = String(
      formData.get("customer_name") || "",
    ).trim()

    const customerPhone = String(
      formData.get("customer_phone") || "",
    ).trim()

    const customerEmail = String(
      formData.get("customer_email") || "",
    ).trim()

    const eventDate = String(
      formData.get("event_date") || "",
    )

    const venue = String(
      formData.get("venue") || "",
    ).trim()

    const budget = String(
      formData.get("budget") || "",
    ).trim()

    const requirements = String(
      formData.get("requirements") || "",
    ).trim()

    const message = [
      `Booking category: ${selectedType}`,
      eventDate ? `Event date: ${eventDate}` : "",
      venue ? `Venue / location: ${venue}` : "",
      budget ? `Budget: GHS ${budget}` : "",
      `Requirements: ${requirements}`,
    ]
      .filter(Boolean)
      .join("\n\n")

    setSubmitting(true)

    const { error: submitError } = await supabase
      .from("enquiries")
      .insert({
        enquiry_type: enquiryType,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        subject: selectedType,
        message,
      })

    setSubmitting(false)

    if (submitError) {
      console.error("Enquiry submission error:", submitError)
      setError(
        "Your request could not be submitted. Please try again.",
      )
      return
    }

    form.reset()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="success-panel">
        <CheckCircle2 size={36} />

        <h3>Request received</h3>

        <p>
          Thank you for contacting Gong Management. Your enquiry
          has been submitted successfully. Our team will review
          your request and get back to you.
        </p>

        <Button onClick={() => setSent(false)}>
          Send another enquiry
        </Button>
      </div>
    )
  }

  return (
    <form className="form-grid" onSubmit={submit}>
      <Select
        label="Enquiry type"
        name="enquiry_type"
        defaultValue={type}
      >
        <option>Book an Artist</option>
        <option>Book Event Production</option>
        <option>Request Equipment Hire Quote</option>
        <option>Event Ticket Registration</option>
        <option>General enquiry</option>
      </Select>

      <Field
        label="Full name"
        name="customer_name"
        required
        placeholder="Your name"
      />

      <Field
        label="Phone / WhatsApp"
        name="customer_phone"
        required
        placeholder="+233"
      />

      <Field
        label="Email"
        name="customer_email"
        required
        type="email"
        placeholder="you@example.com"
      />

      <Field
        label="Event date"
        name="event_date"
        type="date"
      />

      <Field
        label="Venue / location"
        name="venue"
        placeholder="Tema, Ghana"
      />

      <Field
        label="Budget (GHS)"
        name="budget"
        inputMode="numeric"
        placeholder="Optional"
      />

      <TextArea
        label="Tell us what you need"
        name="requirements"
        required
        placeholder="Share the idea, audience size and any key requirements."
      />

      {error && (
        <p className="text-sm text-red-500" role="alert">
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
          "Submit request"
        )}
      </Button>
    </form>
  )
}
