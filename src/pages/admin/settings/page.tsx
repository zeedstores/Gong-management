import { useState, type FormEvent } from "react"
import { CheckCircle2 } from "lucide-react"
import { Button, Field, TextArea } from "../../../components/ui"

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false)
  const save = (e: FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }
  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Configuration</span>
          <h1>SITE SETTINGS</h1>
          <p>
            Business contacts and payment instructions remain blank until
            confirmed.
          </p>
        </div>
        {saved && (
          <div className="saved">
            <CheckCircle2 />
            Demo changes saved
          </div>
        )}
      </div>
      <form className="settings-grid" onSubmit={save}>
        <section className="admin-panel">
          <h2>Business contact</h2>
          <Field label="Business name" defaultValue="Gong Management" />
          <Field label="Email" placeholder="Not yet provided" />
          <Field label="WhatsApp number" placeholder="+233" />
          <Field label="Location" defaultValue="Tema, Greater Accra, Ghana" />
          <Field label="Instagram URL" placeholder="Not yet provided" />
        </section>
        <section className="admin-panel">
          <h2>Bank transfer instructions</h2>
          <Field label="Account name" placeholder="Not configured" />
          <Field label="Bank name" placeholder="Not configured" />
          <Field label="Account number" placeholder="Not configured" />
          <TextArea
            label="Payment instructions"
            placeholder="Shown to customers only after configuration"
          />
          <p className="security-note">
            Never publish invented banking details. Production changes require
            authorised access and secure storage.
          </p>
        </section>
        <Button type="submit">Save demo settings</Button>
      </form>
    </main>
  )
}
