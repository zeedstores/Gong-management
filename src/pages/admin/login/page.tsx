import { useState, type FormEvent } from "react"
import { LockKeyhole } from "lucide-react"
import { useNavigate } from "react-router"
import { Button, Field } from "../../../components/ui"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState("")
  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError("")
    navigate("/admin")
  }
  return (
    <main className="admin-login">
      <div className="login-visual">
        <img src="/assets/event-stage.jpg" alt="" />
        <div>
          <span>GONG MANAGEMENT</span>
          <h1>
            CONTROL THE
            <br />
            WHOLE SHOW.
          </h1>
          <p>
            Content, bookings, tickets and enquiries in one focused workspace.
          </p>
        </div>
      </div>
      <div className="login-panel">
        <img src="/assets/gong-logo.png" alt="Gong Management" />
        <LockKeyhole size={24} />
        <h2>Admin access</h2>
        <p>
          Prototype login only. Connect secure authentication before production
          use.
        </p>
        <form onSubmit={submit}>
          <Field
            label="Email"
            type="email"
            required
            placeholder="admin@example.com"
          />
          <Field
            label="Password"
            type="password"
            required
            placeholder="••••••••"
          />
          {error && <p>{error}</p>}
          <Button type="submit">Enter demo dashboard</Button>
        </form>
      </div>
    </main>
  )
}
