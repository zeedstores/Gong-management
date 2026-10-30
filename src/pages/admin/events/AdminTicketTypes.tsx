
import { useEffect, useState } from "react"
import { Plus, Edit3, Trash2, X } from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type TicketType = {
  id: string
  event_id: string
  name: string
  description: string | null
  price: number
  currency: string
  capacity: number | null
  sales_start: string | null
  sales_end: string | null
  is_active: boolean
}

type Props = {
  eventId: string
  eventTitle: string
  onClose: () => void
}

const emptyForm = {
  name: "",
  description: "",
  price: "0",
  currency: "GHS",
  capacity: "",
  sales_start: "",
  sales_end: "",
  is_active: true,
}

export default function AdminTicketTypes({
  eventId,
  eventTitle,
  onClose,
}: Props) {
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TicketType | null>(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    fetchTickets()
  }, [eventId])

  async function fetchTickets() {
    setLoading(true)

    const { data, error } = await supabase
      .from("event_ticket_types")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false })

    if (error) alert(error.message)
    else setTickets((data || []) as TicketType[])

    setLoading(false)
  }

  function updateField(field: keyof typeof emptyForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  function openEdit(ticket: TicketType) {
    setEditing(ticket)
    setForm({
      name: ticket.name,
      description: ticket.description || "",
      price: String(ticket.price),
      currency: ticket.currency || "GHS",
      capacity: ticket.capacity === null ? "" : String(ticket.capacity),
      sales_start: ticket.sales_start?.slice(0, 16) || "",
      sales_end: ticket.sales_end?.slice(0, 16) || "",
      is_active: ticket.is_active,
    })
    setModalOpen(true)
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.name.trim()) {
      alert("Ticket name is required.")
      return
    }

    const price = Number(form.price)
    const capacity = form.capacity.trim()
      ? Number(form.capacity)
      : null

    if (!Number.isFinite(price) || price < 0) {
      alert("Enter a valid ticket price.")
      return
    }

    if (
      capacity !== null &&
      (!Number.isInteger(capacity) || capacity < 1)
    ) {
      alert("Capacity must be a positive whole number.")
      return
    }

    if (
      form.sales_start &&
      form.sales_end &&
      new Date(form.sales_end) <= new Date(form.sales_start)
    ) {
      alert("Sales end must be after sales start.")
      return
    }

    setSaving(true)

    const payload = {
      event_id: eventId,
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      currency: form.currency,
      capacity,
      sales_start: form.sales_start
        ? new Date(form.sales_start).toISOString()
        : null,
      sales_end: form.sales_end
        ? new Date(form.sales_end).toISOString()
        : null,
      is_active: form.is_active,
    }

    const result = editing
      ? await supabase
          .from("event_ticket_types")
          .update(payload)
          .eq("id", editing.id)
      : await supabase
          .from("event_ticket_types")
          .insert(payload)

    if (result.error) {
      alert(result.error.message)
    } else {
      setModalOpen(false)
      await fetchTickets()
    }

    setSaving(false)
  }

  async function handleDelete(ticket: TicketType) {
    if (
      !window.confirm(
        `Delete the "${ticket.name}" ticket type?`
      )
    ) return

    const { error } = await supabase
      .from("event_ticket_types")
      .delete()
      .eq("id", ticket.id)

    if (error) {
      alert(error.message)
      return
    }

    await fetchTickets()
  }

  async function toggleActive(ticket: TicketType) {
    const { error } = await supabase
      .from("event_ticket_types")
      .update({ is_active: !ticket.is_active })
      .eq("id", ticket.id)

    if (error) {
      alert(error.message)
      return
    }

    await fetchTickets()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-gray-900 rounded-xl w-full max-w-3xl my-8">
        <div className="p-5 border-b flex justify-between items-center gap-3">
          <div>
            <span className="text-xs text-gray-500">Ticket management</span>
            <h2 className="text-lg font-semibold">{eventTitle}</h2>
          </div>

          <button onClick={onClose} className="p-2">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-semibold">Ticket types</h3>
            <Button onClick={openCreate}>
              <Plus size={16} />
              Add ticket type
            </Button>
          </div>

          {loading ? (
            <p>Loading ticket types...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 py-8 text-center">
              No ticket types created for this event yet.
            </p>
          ) : (
            <div className="space-y-3">
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                >
                  <div>
                    <h4 className="font-semibold">{ticket.name}</h4>
                    <p className="text-sm text-gray-500">
                      {ticket.currency} {Number(ticket.price).toLocaleString()}
                      {" · "}
                      {ticket.capacity === null
                        ? "Unlimited capacity"
                        : `${ticket.capacity} tickets`}
                    </p>
                    <span className={`text-xs ${ticket.is_active ? "text-green-600" : "text-gray-500"}`}>
                      {ticket.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => toggleActive(ticket)}
                      className="text-sm underline"
                    >
                      {ticket.is_active ? "Deactivate" : "Activate"}
                    </button>

                    <button
                      onClick={() => openEdit(ticket)}
                      className="flex items-center gap-1 text-sm"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(ticket)}
                      className="flex items-center gap-1 text-sm text-red-600"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {modalOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white text-gray-900 rounded-xl w-full max-w-xl my-8">
              <div className="p-5 border-b flex justify-between items-center">
                <h3 className="font-semibold">
                  {editing ? "Edit ticket type" : "Create ticket type"}
                </h3>
                <button onClick={() => setModalOpen(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSave} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm mb-1">Ticket name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    placeholder="e.g. VIP, Regular, Early Bird"
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-1">Price</label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(e) => updateField("price", e.target.value)}
                      className="w-full border rounded-lg p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => updateField("currency", e.target.value)}
                      className="w-full border rounded-lg p-3"
                    >
                      <option value="GHS">GHS</option>
                      <option value="NGN">NGN</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Capacity</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.capacity}
                      onChange={(e) => updateField("capacity", e.target.value)}
                      placeholder="Leave blank for unlimited"
                      className="w-full border rounded-lg p-3"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => updateField("is_active", e.target.checked)}
                    />
                    <label className="text-sm">Active for sale</label>
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Sales start</label>
                    <input
                      type="datetime-local"
                      value={form.sales_start}
                      onChange={(e) => updateField("sales_start", e.target.value)}
                      className="w-full border rounded-lg p-3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-1">Sales end</label>
                    <input
                      type="datetime-local"
                      value={form.sales_end}
                      onChange={(e) => updateField("sales_end", e.target.value)}
                      className="w-full border rounded-lg p-3"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : editing ? "Save changes" : "Create ticket"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
