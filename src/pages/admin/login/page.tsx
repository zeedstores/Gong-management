
import { useState, type FormEvent } from "react"
import { LockKeyhole } from "lucide-react"
import { useNavigate } from "react-router"
import { Button, Field } from "../../../components/ui"
import { supabase } from "../../../lib/supabase"

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (loginError) throw loginError

      navigate("/admin", { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again.",
      )
    } finally {
      setLoading(false)
    }
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
        <p>Sign in with your authorized administrator account.</p>

        <form onSubmit={submit}>
          <Field
            label="Email"
            type="email"
            required
            placeholder="admin@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Field
            label="Password"
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          {error && <p role="alert">{error}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </main>
  )
}
