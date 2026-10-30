
import { useEffect, useState, type ReactNode, type FormEvent } from "react"
import {
  Edit3,
  Eye,
  Plus,
  Save,
  Trash2,
  X,
  CalendarDays,
  MapPin,
  ImagePlus,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type FoundationEvent = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image: string | null
  event_date: string
  end_date: string | null
  venue: string | null
  location: string | null
  status: "draft" | "published"
  event_progress: "upcoming" | "ongoing" | "completed" | "cancelled"
}

const BUCKET = "event-images"
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  cover_image: "",
  event_date: "",
  end_date: "",
  venue: "",
  location: "",
}

const panelClass =
  "rounded-xl border border-white/10 !bg-[#151515] p-5 !text-white shadow-sm sm:p-6"

const inputClass =
  "min-h-12 w-full rounded-xl border border-white/15 !bg-[#090909] px-4 !text-white outline-none placeholder:!text-neutral-500 focus:border-[#d6aa33]"

const labelClass = "grid gap-2 text-sm font-medium !text-neutral-200"

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function toLocalInput(value: string | null) {
  if (!value) return ""

  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000

  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function getProgress(event: FoundationEvent) {
  if (event.event_progress === "cancelled") return "cancelled"
  if (event.event_progress === "completed") return "completed"

  const now = Date.now()
  const start = new Date(event.event_date).getTime()
  const end = event.end_date
    ? new Date(event.end_date).getTime()
    : start

  if (now < start) return "upcoming"
  if (now <= end) return "ongoing"

  return "completed"
}

const progressStyles: Record<string, string> = {
  upcoming: "border-blue-500/20 bg-blue-500/10 text-blue-300",
  ongoing: "border-green-500/20 bg-green-500/10 text-green-300",
  completed: "border-neutral-500/20 bg-neutral-500/10 text-neutral-300",
  cancelled: "border-red-500/20 bg-red-500/10 text-red-300",
}

function StatusBadge({
  children,
  variant,
}: {
  children: ReactNode
  variant: "published" | "draft" | "progress"
}) {
  const styles = {
    published: "border-green-500/20 bg-green-500/10 text-green-300",
    draft: "border-white/15 bg-white/5 text-neutral-300",
    progress: "",
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs capitalize ${
        variant === "progress" ? "" : styles[variant]
      }`}
    >
      {children}
    </span>
  )
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className={panelClass}>
      <p className="text-sm !text-neutral-400">{label}</p>
      <h2 className="mt-2 text-3xl font-semibold !text-white">{value}</h2>
    </div>
  )
}

function getStoragePath(image: string | null) {
  if (!image) return null

  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = image.indexOf(marker)

  if (index === -1) return null

  return decodeURIComponent(image.slice(index + marker.length))
}

export default function AdminFoundationEventsPage() {
  const [events, setEvents] = useState<FoundationEvent[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingOriginalImage, setEditingOriginalImage] = useState<
    string | null
  >(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState("")

  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [progress, setProgress] = useState<
    "upcoming" | "ongoing" | "completed" | "cancelled"
  >("upcoming")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadEvents() {
    setLoading(true)

    const { data, error } = await supabase
      .from("foundation_events")
      .select("*")
      .order("event_date", { ascending: true })

    if (error) {
      setError(error.message)
    } else {
      setEvents((data ?? []) as FoundationEvent[])
      setError("")
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadEvents()
  }, [])

  function clearCoverPreview() {
    if (coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview)
    }

    setCoverPreview("")
  }

  function closeForm() {
    clearCoverPreview()
    setCoverFile(null)
    setEditingOriginalImage(null)
    setShowForm(false)
  }

  function startNewEvent() {
    clearCoverPreview()
    setCoverFile(null)
    setEditingOriginalImage(null)
    setForm(emptyForm)
    setEditingId(null)
    setStatus("draft")
    setProgress("upcoming")
    setMessage("")
    setError("")
    setShowForm(true)
  }

  function startEdit(event: FoundationEvent) {
    clearCoverPreview()
    setCoverFile(null)

    setForm({
      title: event.title,
      slug: event.slug,
      description: event.description ?? "",
      cover_image: event.cover_image ?? "",
      event_date: toLocalInput(event.event_date),
      end_date: toLocalInput(event.end_date),
      venue: event.venue ?? "",
      location: event.location ?? "",
    })

    setEditingId(event.id)
    setEditingOriginalImage(event.cover_image)
    setCoverPreview(event.cover_image ?? "")
    setStatus(event.status)
    setProgress(event.event_progress)
    setMessage("")
    setError("")
    setShowForm(true)
  }

  function handleCoverChange(file: File | undefined) {
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please select a JPEG, PNG or WebP image.")
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must not exceed 5MB.")
      return
    }

    setError("")
    clearCoverPreview()

    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  async function uploadCoverImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filePath = `${crypto.randomUUID()}.${extension}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path)

    return {
      path: data.path,
      url: publicUrlData.publicUrl,
    }
  }

  async function removeStoredImage(image: string | null) {
    const path = getStoragePath(image)

    if (!path) return

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path])

    if (error) {
      console.error("Could not remove event image:", error.message)
    }
  }

  async function saveEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSaving(true)
    setMessage("")
    setError("")

    let uploadedImagePath: string | null = null
    let coverImageUrl = form.cover_image.trim() || null

    const slug = makeSlug(form.slug || form.title)

    if (!form.title.trim()) {
      setError("Please enter an event title.")
      setSaving(false)
      return
    }

    if (!slug) {
      setError("Please enter a valid event title.")
      setSaving(false)
      return
    }

    if (!form.event_date) {
      setError("Please select an event start date.")
      setSaving(false)
      return
    }

    if (
      form.end_date &&
      new Date(form.end_date).getTime() <
        new Date(form.event_date).getTime()
    ) {
      setError("The event end date cannot be earlier than its start date.")
      setSaving(false)
      return
    }

    try {
      // Upload a newly selected image before saving the event.
      if (coverFile) {
        const uploaded = await uploadCoverImage(coverFile)
        uploadedImagePath = uploaded.path
        coverImageUrl = uploaded.url
      }

      const payload = {
        title: form.title.trim(),
        slug,
        description: form.description.trim() || null,
        cover_image: coverImageUrl,
        event_date: new Date(form.event_date).toISOString(),
        end_date: form.end_date
          ? new Date(form.end_date).toISOString()
          : null,
        venue: form.venue.trim() || null,
        location: form.location.trim() || null,
        status,
        event_progress: progress,
        updated_at: new Date().toISOString(),
      }

      const result = editingId
        ? await supabase
            .from("foundation_events")
            .update(payload)
            .eq("id", editingId)
            .select("id")
            .maybeSingle()
        : await supabase
            .from("foundation_events")
            .insert(payload)
            .select("id")
            .maybeSingle()

      if (result.error) {
        if (uploadedImagePath) {
          await supabase.storage
            .from(BUCKET)
            .remove([uploadedImagePath])
        }

        setError(
          result.error.code === "23505"
            ? "This event URL slug is already in use. Please change it."
            : result.error.message
        )
      } else if (!result.data) {
        if (uploadedImagePath) {
          await supabase.storage
            .from(BUCKET)
            .remove([uploadedImagePath])
        }

        setError("The event was not saved. Check your Supabase permissions.")
      } else {
        // Remove the old image only after the event update succeeds.
        if (editingOriginalImage && (coverFile || !coverImageUrl)) {
          await removeStoredImage(editingOriginalImage)
        }

        setMessage(editingId ? "Event updated." : "Event created.")
        closeForm()
        await loadEvents()
      }
    } catch (uploadError) {
      if (uploadedImagePath) {
        await supabase.storage
          .from(BUCKET)
          .remove([uploadedImagePath])
      }

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the event image."
      )
    }

    setSaving(false)
  }

  async function togglePublish(event: FoundationEvent) {
    setError("")
    setMessage("")

    const nextStatus = event.status === "published" ? "draft" : "published"

    const { data, error } = await supabase
      .from("foundation_events")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id)
      .select("id")
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else if (!data) {
      setError("Could not change publishing status. Check your permissions.")
    } else {
      setMessage(
        nextStatus === "published"
          ? "Event published."
          : "Event moved to drafts."
      )
      await loadEvents()
    }
  }

  async function deleteEvent(event: FoundationEvent) {
    const confirmed = window.confirm(
      `Delete "${event.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setDeletingId(event.id)
    setError("")
    setMessage("")

    const { error } = await supabase
      .from("foundation_events")
      .delete()
      .eq("id", event.id)

    if (error) {
      setError(error.message)
    } else {
      await removeStoredImage(event.cover_image)

      setMessage("Event deleted.")
      await loadEvents()
    }

    setDeletingId(null)
  }

  const publishedCount = events.filter(
    (event) => event.status === "published"
  ).length

  const draftCount = events.filter(
    (event) => event.status === "draft"
  ).length

  return (
    <main className="space-y-6 !bg-[#090909] !text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-sm !text-[#d6aa33]">Gong Foundation</span>
          <h1 className="mt-1 text-2xl font-bold !text-white">
            FOUNDATION EVENTS
          </h1>
          <p className="mt-1 text-sm !text-neutral-400">
            Create and manage foundation programmes and activities.
          </p>
        </div>

        <Button onClick={startNewEvent}>
          <Plus size={17} />
          New event
        </Button>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm !text-green-300"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="break-words rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm !text-red-300"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Total events" value={events.length} />
        <SummaryCard label="Published" value={publishedCount} />
        <SummaryCard label="Drafts" value={draftCount} />
      </div>

      {showForm && (
        <form onSubmit={saveEvent} className={`${panelClass} space-y-5`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-sm !text-[#d6aa33]">
                {editingId ? "Edit foundation event" : "New foundation event"}
              </span>
              <h2 className="mt-1 text-xl font-semibold !text-white">
                Event details
              </h2>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 !text-neutral-300 hover:bg-white/10"
              aria-label="Close editor"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Event title *
              <input
                required
                maxLength={180}
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                    slug: editingId ? form.slug : makeSlug(e.target.value),
                  })
                }
                className={inputClass}
                placeholder="Foundation community programme"
              />
            </label>

            <label className={labelClass}>
              URL slug *
              <input
                required
                maxLength={180}
                value={form.slug}
                onChange={(e) =>
                  setForm({ ...form, slug: makeSlug(e.target.value) })
                }
                className={inputClass}
                placeholder="foundation-community-programme"
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Description
              <textarea
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-xl border border-white/15 !bg-[#090909] p-4 !text-white outline-none placeholder:!text-neutral-500 focus:border-[#d6aa33]"
                placeholder="Describe this foundation event..."
              />
            </label>

            {/* Event image upload */}
            <div className={`${labelClass} sm:col-span-2`}>
              <span>Event cover image</span>

              <label
                htmlFor="event-cover"
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 !bg-[#090909] p-5 text-center transition hover:border-[#d6aa33]"
              >
                <ImagePlus size={28} className="text-[#d6aa33]" />

                <span className="font-medium !text-white">
                  {coverFile ? "Choose another image" : "Select event image"}
                </span>

                <span className="text-xs !text-neutral-500">
                  JPEG, PNG or WebP · Maximum 5MB
                </span>

                <input
                  id="event-cover"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    handleCoverChange(e.target.files?.[0])
                    e.target.value = ""
                  }}
                />
              </label>

              {coverPreview && (
                <div className="relative mt-2 w-full sm:w-80">
                  <img
                    src={coverPreview}
                    alt="Event cover preview"
                    className="h-48 w-full rounded-xl border border-white/10 object-cover"
                  />

                  <button
                    type="button"
                    onClick={() => {
                      clearCoverPreview()
                      setCoverFile(null)
                      setForm({ ...form, cover_image: "" })
                    }}
                    className="absolute right-2 top-2 rounded-lg bg-black/80 p-2 !text-white hover:bg-red-600"
                    aria-label="Remove event image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <label className={labelClass}>
              Start date and time *
              <input
                required
                type="datetime-local"
                value={form.event_date}
                onChange={(e) =>
                  setForm({ ...form, event_date: e.target.value })
                }
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              End date and time
              <input
                type="datetime-local"
                value={form.end_date}
                min={form.event_date || undefined}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Venue
              <input
                value={form.venue}
                onChange={(e) =>
                  setForm({ ...form, venue: e.target.value })
                }
                className={inputClass}
                placeholder="Event venue"
              />
            </label>

            <label className={labelClass}>
              City / Location
              <input
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
                className={inputClass}
                placeholder="City, country"
              />
            </label>

            <label className={labelClass}>
              Publishing status
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "draft" | "published")
                }
                className={inputClass}
              >
                <option value="draft">Save as draft</option>
                <option value="published">Publish now</option>
              </select>
            </label>

            <label className={labelClass}>
              Event progress
              <select
                value={progress}
                onChange={(e) =>
                  setProgress(
                    e.target.value as
                      | "upcoming"
                      | "ongoing"
                      | "completed"
                      | "cancelled"
                  )
                }
                className={inputClass}
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save event"}
            </Button>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="min-h-11 rounded-xl border border-white/20 px-5 text-sm font-medium !text-neutral-200 hover:bg-white/5"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarDays size={19} className="text-[#d6aa33]" />
          <h2 className="text-lg font-semibold !text-white">
            All foundation events
          </h2>
        </div>

        {loading ? (
          <div className={`${panelClass} !text-neutral-300`}>
            Loading foundation events...
          </div>
        ) : events.length === 0 ? (
          <div className={panelClass}>
            <h2 className="text-lg font-semibold !text-white">
              No foundation events yet.
            </h2>
            <p className="mt-2 text-sm !text-neutral-400">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const currentProgress = getProgress(event)

              return (
                <article
                  key={event.id}
                  className={`${panelClass} grid gap-4 sm:grid-cols-[120px_1fr_auto] sm:items-center`}
                >
                  {event.cover_image ? (
                    <img
                      src={event.cover_image}
                      alt=""
                      loading="lazy"
                      className="h-28 w-full rounded-xl object-cover sm:w-[120px]"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-xl bg-white/5 text-xs !text-neutral-500">
                      No image
                    </div>
                  )}

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge variant={event.status}>
                        {event.status}
                      </StatusBadge>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs capitalize ${progressStyles[currentProgress]}`}
                      >
                        {currentProgress}
                      </span>
                    </div>

                    <h3 className="break-words font-semibold !text-white">
                      {event.title}
                    </h3>

                    <p className="text-sm !text-neutral-400">
                      {new Date(event.event_date).toLocaleString()}
                    </p>

                    {(event.venue || event.location) && (
                      <p className="flex items-center gap-2 text-sm !text-neutral-400">
                        <MapPin size={15} />
                        {[event.venue, event.location]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}

                    <p className="break-all text-xs !text-neutral-500">
                      /foundation/events/{event.slug}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {event.status === "published" && (
                      <a
                        href={`/foundation/events/${event.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-sm !text-neutral-300 hover:!text-[#d6aa33]"
                      >
                        <Eye size={16} />
                        View
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => startEdit(event)}
                      className="inline-flex items-center gap-2 text-sm !text-neutral-300 hover:!text-[#d6aa33]"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void togglePublish(event)}
                      className="text-sm !text-[#d6aa33] hover:!text-white"
                    >
                      {event.status === "published" ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === event.id}
                      onClick={() => void deleteEvent(event)}
                      className="inline-flex items-center gap-2 text-sm !text-red-400 hover:!text-red-300 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === event.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
