
import { useEffect, useRef, useState } from "react"
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  ImagePlus,
  Ticket,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"
import AdminTicketTypes from "./AdminTicketTypes"

type Event = {
  id: string
  title: string
  slug: string
  description: string | null
  event_type: string
  status: string
  start_date: string | null
  end_date: string | null
  venue: string | null
  city: string | null
  cover_image: string | null
  registration_url: string | null
  is_free: boolean
}

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  event_type: "flagship",
  status: "draft",
  start_date: "",
  end_date: "",
  venue: "",
  city: "",
  cover_image: "",
  registration_url: "",
  is_free: false,
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      alert(error.message)
    } else {
      setEvents((data || []) as Event[])
    }

    setLoading(false)
  }

  function openCreateModal() {
    setEditingEvent(null)
    setForm(emptyForm)
    setImageFile(null)
    setImagePreview("")
    setModalOpen(true)
  }

  function openEditModal(event: Event) {
    setEditingEvent(event)

    setForm({
      title: event.title || "",
      slug: event.slug || "",
      description: event.description || "",
      event_type: event.event_type || "flagship",
      status: event.status || "draft",
      start_date: event.start_date
        ? event.start_date.slice(0, 16)
        : "",
      end_date: event.end_date
        ? event.end_date.slice(0, 16)
        : "",
      venue: event.venue || "",
      city: event.city || "",
      cover_image: event.cover_image || "",
      registration_url: event.registration_url || "",
      is_free: event.is_free ?? false,
    })

    setImageFile(null)
    setImagePreview(event.cover_image || "")
    setModalOpen(true)
  }

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function createSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: editingEvent ? current.slug : createSlug(value),
    }))
  }

  function handleImageChange(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be 5MB or smaller.")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  async function uploadImage() {
    if (!imageFile) return form.cover_image

    const extension = imageFile.name.split(".").pop() || "jpg"
    const path = `${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from("event-images")
      .upload(path, imageFile, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from("event-images")
      .getPublicUrl(path)

    return data.publicUrl
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!form.title.trim()) {
      alert("Event title is required.")
      return
    }

    setSaving(true)

    try {
      const imageUrl = await uploadImage()

      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || createSlug(form.title),
        description: form.description.trim() || null,
        event_type: form.event_type,
        status: form.status,
        start_date: form.start_date
          ? new Date(form.start_date).toISOString()
          : null,
        end_date: form.end_date
          ? new Date(form.end_date).toISOString()
          : null,
        venue: form.venue.trim() || null,
        city: form.city.trim() || null,
        cover_image: imageUrl || null,
        registration_url: form.registration_url.trim() || null,
        is_free: form.is_free,
      }

      const result = editingEvent
        ? await supabase
            .from("events")
            .update(payload)
            .eq("id", editingEvent.id)
        : await supabase
            .from("events")
            .insert(payload)

      if (result.error) throw result.error

      setModalOpen(false)
      setImageFile(null)
      await fetchEvents()
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Unable to save event."
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(event: Event) {
    if (
      !window.confirm(
        `Delete "${event.title}"? This will also delete its ticket types and orders.`
      )
    ) {
      return
    }

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", event.id)

    if (error) {
      alert(error.message)
      return
    }

    setEvents((current) =>
      current.filter((item) => item.id !== event.id)
    )
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Programming</span>
          <h1>EVENTS & TICKETS</h1>
          <p>Manage events, schedules and ticket availability.</p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Create event
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg bg-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-4 py-3 bg-transparent"
        >
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      <div className="admin-card-list">
        {loading ? (
          <p className="p-6">Loading events...</p>
        ) : filteredEvents.length === 0 ? (
          <p className="p-6">No events found.</p>
        ) : (
          filteredEvents.map((event) => (
            <article key={event.id}>
              {event.cover_image ? (
                <img src={event.cover_image} alt="" />
              ) : (
                <div className="w-24 h-20 rounded bg-gray-100 flex items-center justify-center">
                  <ImagePlus size={24} className="text-gray-400" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <span>{event.status}</span>
                <h2>{event.title}</h2>
                <p>
                  {event.start_date
                    ? new Date(event.start_date).toLocaleString()
                    : "Date not set"}
                  {" · "}
                  {event.venue || "Venue not set"}
                  {event.city ? `, ${event.city}` : ""}
                </p>
              </div>

              <div className="event-admin-actions">
                <button onClick={() => setSelectedEvent(event)}>
                  <Ticket size={17} />
                  Manage tickets
                </button>

                <button onClick={() => openEditModal(event)}>
                  <Edit3 size={17} />
                  Edit event
                </button>

                <button onClick={() => handleDelete(event)}>
                  <Trash2 size={17} />
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-gray-900 rounded-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-semibold">
                {editingEvent ? "Edit event" : "Create event"}
              </h2>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-2"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Event title
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Slug
                </label>
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", e.target.value)}
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Event type
                  </label>
                  <select
                    value={form.event_type}
                    onChange={(e) =>
                      updateField("event_type", e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  >
                    <option value="flagship">Flagship</option>
                    <option value="conference">Conference</option>
                    <option value="workshop">Workshop</option>
                    <option value="concert">Concert</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Publication status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      updateField("status", e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start date and time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) =>
                      updateField("start_date", e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    End date and time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) =>
                      updateField("end_date", e.target.value)
                    }
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Venue
                  </label>
                  <input
                    value={form.venue}
                    onChange={(e) => updateField("venue", e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    City
                  </label>
                  <input
                    value={form.city}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full border rounded-lg p-3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Event cover image
                </label>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="w-full border-2 border-dashed rounded-lg p-4 flex items-center justify-center gap-2"
                >
                  <ImagePlus size={20} />
                  Choose image
                </button>

                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Event preview"
                    className="mt-3 w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Registration URL (optional)
                </label>
                <input
                  value={form.registration_url}
                  onChange={(e) =>
                    updateField("registration_url", e.target.value)
                  }
                  className="w-full border rounded-lg p-3"
                />
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.is_free}
                  onChange={(e) =>
                    updateField("is_free", e.target.checked)
                  }
                />
                This is a free event
              </label>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingEvent
                      ? "Save changes"
                      : "Create event"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEvent && (
        <AdminTicketTypes
          eventId={selectedEvent.id}
          eventTitle={selectedEvent.title}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </main>
  )
}

