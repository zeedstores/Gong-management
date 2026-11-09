
import { useEffect, useState, type FormEvent } from "react"
import {
  Building2,
  Edit3,
  Plus,
  Trash2,
  ToggleRight,
  RefreshCw,
  X,
  Image,
  MapPin,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"

type Property = {
  id: string
  title: string
  type: string
  location: string
  description: string | null
  image_url: string | null
  price: number
  status: string
  is_published: boolean
  created_at: string
}

type PropertyForm = {
  title: string
  type: string
  location: string
  description: string
  price: string
  status: string
  is_published: boolean
}

type UploadedImage = {
  image_url: string
  image_path: string
}

const BUCKET = "property-images"

const emptyForm: PropertyForm = {
  title: "",
  type: "",
  location: "",
  description: "",
  price: "",
  status: "available",
  is_published: false,
}

const inputClass =
  "w-full rounded-none border border-[#d8d3c8] bg-[#fffef8] px-4 py-3 text-sm text-[#151515] outline-none transition focus:border-[#b58b20] focus:ring-1 focus:ring-[#d6aa33]"

const labelClass = "flex flex-col gap-2 text-xs font-semibold text-[#333]"

const primaryButton =
  "inline-flex items-center justify-center gap-2 bg-[#d6aa33] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#090909] transition hover:bg-[#f1c64d] disabled:cursor-not-allowed disabled:opacity-50"

const secondaryButton =
  "inline-flex items-center justify-center gap-2 border border-[#d8d3c8] bg-white px-4 py-3 text-xs font-semibold text-[#151515] transition hover:border-[#b58b20] hover:bg-[#f8f5ed] disabled:cursor-not-allowed disabled:opacity-50"

const money = (amount: number) =>
  `GH₵${Number(amount || 0).toLocaleString("en-GH")}`

function getPropertyImagePath(imageUrl: string | null) {
  if (!imageUrl) return null

  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = imageUrl.indexOf(marker)

  if (index === -1) return null

  return decodeURIComponent(imageUrl.slice(index + marker.length))
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Property | null>(null)

  const [form, setForm] = useState<PropertyForm>(emptyForm)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  async function loadProperties() {
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      setProperties((data || []) as Property[])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load properties."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("")
      return
    }

    const previewUrl = URL.createObjectURL(selectedImage)
    setImagePreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedImage])

  async function uploadPropertyImage(file: File): Promise<UploadedImage> {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filePath = `${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath)

    return {
      image_url: data.publicUrl,
      image_path: filePath,
    }
  }

  async function removePropertyImage(path: string) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path])

    if (error) {
      console.error("Property image deletion failed:", error.message)
      return false
    }

    return true
  }

  function openAddForm() {
    setEditing(null)
    setForm(emptyForm)
    setSelectedImage(null)
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  function openEditForm(item: Property) {
    setEditing(item)
    setSelectedImage(null)

    setForm({
      title: item.title,
      type: item.type,
      location: item.location,
      description: item.description || "",
      price: String(item.price ?? 0),
      status: item.status || "available",
      is_published: item.is_published,
    })

    setShowForm(true)
    setError("")
    setSuccess("")
  }

  async function saveProperty(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !form.title.trim() ||
      !form.type.trim() ||
      !form.location.trim()
    ) {
      setError("Property title, type and location are required.")
      return
    }

    if (
      form.price.trim() !== "" &&
      (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)
    ) {
      setError("Please enter a valid property price.")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    let uploadedImage: UploadedImage | null = null

    try {
      if (selectedImage) {
        uploadedImage = await uploadPropertyImage(selectedImage)
      }

      const payload = {
        title: form.title.trim(),
        type: form.type.trim(),
        location: form.location.trim(),
        description: form.description.trim() || null,
        price: form.price.trim() ? Number(form.price) : 0,
        status: form.status,
        is_published: form.is_published,
        image_url:
          uploadedImage?.image_url ?? editing?.image_url ?? null,
      }

      const result = editing
        ? await supabase
            .from("properties")
            .update(payload)
            .eq("id", editing.id)
        : await supabase
            .from("properties")
            .insert(payload)

      if (result.error) {
        if (uploadedImage) {
          await removePropertyImage(uploadedImage.image_path)
        }

        throw result.error
      }

      // Remove the previous uploaded image after a successful replacement.
      if (editing && uploadedImage) {
        const oldPath = getPropertyImagePath(editing.image_url)

        if (oldPath) {
          await removePropertyImage(oldPath)
        }
      }

      setSuccess(
        editing
          ? "Property updated successfully."
          : "Property added successfully."
      )

      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
      setSelectedImage(null)

      await loadProperties()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the property."
      )
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(item: Property) {
    setError("")
    setSuccess("")

    const newValue = !item.is_published

    const { error } = await supabase
      .from("properties")
      .update({ is_published: newValue })
      .eq("id", item.id)

    if (error) {
      setError(error.message)
      return
    }

    setProperties((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, is_published: newValue }
          : entry
      )
    )

    setSuccess(
      newValue ? "Property published." : "Property unpublished."
    )
  }

  async function updateStatus(item: Property, status: string) {
    setError("")
    setSuccess("")

    const { error } = await supabase
      .from("properties")
      .update({ status })
      .eq("id", item.id)

    if (error) {
      setError(error.message)
      return
    }

    setProperties((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, status } : entry
      )
    )

    setSuccess("Property status updated.")
  }

  async function deleteProperty(item: Property) {
    const confirmed = window.confirm(
      `Delete "${item.title}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError("")
    setSuccess("")

    const { error } = await supabase
      .from("properties")
      .delete()
      .eq("id", item.id)

    if (error) {
      setError(error.message)
      return
    }

    const imagePath = getPropertyImagePath(item.image_url)

    if (imagePath) {
      const removed = await removePropertyImage(imagePath)

      if (!removed) {
        setError(
          "Property deleted, but its image could not be removed from Storage."
        )
      }
    }

    setProperties((current) =>
      current.filter((entry) => entry.id !== item.id)
    )

    setSuccess("Property deleted successfully.")
  }

  const publishedCount = properties.filter(
    (item) => item.is_published
  ).length

  return (
    <main className="min-h-screen bg-[#f3f0e8] p-4 text-[#090909] sm:p-6 lg:p-8">
      {/* Heading */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a690f]">
            Property management
          </span>

          <h1 className="mt-2 font-['Anton'] text-4xl font-normal tracking-wide sm:text-5xl">
            PROPERTIES
          </h1>

          <p className="mt-2 text-sm text-[#77746d]">
            Add, edit and manage Gong property listings.
          </p>
        </div>

        <button className={primaryButton} onClick={openAddForm}>
          <Plus size={17} />
          Add property
        </button>
      </div>

      {/* Notifications */}
      {error && (
        <div className="mb-5 flex items-start justify-between gap-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button onClick={() => setError("")} aria-label="Dismiss">
            <X size={17} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-5 flex items-start justify-between gap-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <span>{success}</span>
          <button onClick={() => setSuccess("")} aria-label="Dismiss">
            <X size={17} />
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="border border-[#e0dcd2] bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77746d]">
            Total properties
          </span>
          <p className="mt-2 font-['Anton'] text-3xl">
            {properties.length}
          </p>
        </div>

        <div className="border border-[#e0dcd2] bg-white p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77746d]">
            Published
          </span>
          <p className="mt-2 font-['Anton'] text-3xl text-green-700">
            {publishedCount}
          </p>
        </div>

        <div className="col-span-2 border border-[#e0dcd2] bg-white p-4 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#77746d]">
            Drafts
          </span>
          <p className="mt-2 font-['Anton'] text-3xl">
            {properties.length - publishedCount}
          </p>
        </div>
      </div>

      {/* Inventory */}
      <section>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Property inventory</h2>
            <p className="mt-1 text-xs text-[#77746d]">
              {properties.length} properties in your database
            </p>
          </div>

          <button
            className={secondaryButton}
            onClick={loadProperties}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="border border-[#e0dcd2] bg-white px-5 py-16 text-center text-sm text-[#77746d]">
            Loading properties...
          </div>
        ) : properties.length === 0 ? (
          <div className="flex flex-col items-center border border-[#e0dcd2] bg-white px-5 py-16 text-center">
            <Building2 size={34} className="mb-4 text-[#b58b20]" />

            <strong className="text-sm">No properties added yet</strong>

            <p className="mt-2 text-xs text-[#77746d]">
              Add your first property to get started.
            </p>

            <button
              className={`${primaryButton} mt-5`}
              onClick={openAddForm}
            >
              <Plus size={16} />
              Add property
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {properties.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden border border-[#e0dcd2] bg-white transition hover:border-[#c5a34b]"
              >
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    className="h-48 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-[#eae6dc] text-[#aaa397]">
                    <Building2 size={38} strokeWidth={1.2} />
                  </div>
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a690f]">
                      {item.type}
                    </span>

                    <span
                      className={`px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${
                        item.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-[#eeeae1] text-[#77746d]"
                      }`}
                    >
                      {item.is_published ? "Published" : "Draft"}
                    </span>
                  </div>

                  <h3 className="mt-4 font-['Anton'] text-2xl font-normal uppercase">
                    {item.title}
                  </h3>

                  <p className="mt-2 flex items-center gap-1.5 text-xs text-[#77746d]">
                    <MapPin size={14} />
                    {item.location}
                  </p>

                  <p className="mt-3 min-h-10 text-xs leading-relaxed text-[#77746d]">
                    {item.description || "No description provided."}
                  </p>

                  <div className="mt-4 border-t border-[#eeeae1] pt-4">
                    <strong className="text-base">
                      {money(item.price)}
                    </strong>
                  </div>

                  <label className="mt-4 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wide text-[#77746d]">
                    Property status

                    <select
                      value={item.status}
                      onChange={(event) =>
                        updateStatus(item, event.target.value)
                      }
                      className={inputClass}
                    >
                      <option value="available">Available</option>
                      <option value="under offer">Under offer</option>
                      <option value="sold">Sold</option>
                      <option value="rented">Rented</option>
                    </select>
                  </label>

                  <div className="mt-4 flex items-center gap-2 border-t border-[#eeeae1] pt-4">
                    <button
                      onClick={() => togglePublished(item)}
                      className="flex flex-1 items-center justify-center gap-1.5 border border-[#d8d3c8] px-2 py-2.5 text-[10px] font-bold transition hover:border-[#d6aa33] hover:bg-[#f8f5ed]"
                    >
                      <ToggleRight size={16} />
                      {item.is_published ? "Unpublish" : "Publish"}
                    </button>

                    <button
                      onClick={() => openEditForm(item)}
                      className="flex flex-1 items-center justify-center gap-1.5 border border-[#d8d3c8] px-2 py-2.5 text-[10px] font-bold transition hover:border-[#d6aa33] hover:bg-[#f8f5ed]"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() => deleteProperty(item)}
                      className="flex h-10 w-10 items-center justify-center border border-[#ead1d1] text-red-600 transition hover:bg-red-50"
                      aria-label={`Delete ${item.title}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Add / edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-6"
          onClick={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false)
            }
          }}
        >
          <section className="my-auto w-full max-w-2xl border border-[#d8d3c8] bg-[#f3f0e8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#d8d3c8] px-5 py-5 sm:px-7">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#8a690f]">
                  Property management
                </span>

                <h2 className="mt-1 font-['Anton'] text-2xl font-normal uppercase">
                  {editing ? "Edit property" : "Add property"}
                </h2>
              </div>

              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
                className="flex h-9 w-9 items-center justify-center border border-[#d8d3c8] transition hover:bg-white disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              onSubmit={saveProperty}
              className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7"
            >
              <label className={labelClass}>
                Property title *

                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({ ...form, title: event.target.value })
                  }
                  placeholder="e.g. Premium Commercial Building"
                  className={inputClass}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Property type *

                  <input
                    required
                    value={form.type}
                    onChange={(event) =>
                      setForm({ ...form, type: event.target.value })
                    }
                    placeholder="e.g. Land, Residential, Commercial"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Location *

                  <input
                    required
                    value={form.location}
                    onChange={(event) =>
                      setForm({ ...form, location: event.target.value })
                    }
                    placeholder="e.g. Tema, Ghana"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className={labelClass}>
                Description

                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the property..."
                  className={`${inputClass} resize-y`}
                />
              </label>

              <label className={labelClass}>
                Price (GH₵)

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) =>
                    setForm({ ...form, price: event.target.value })
                  }
                  placeholder="e.g. 250000"
                  className={inputClass}
                />
              </label>

              {/* Image upload */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-[#333]">
                  Property image
                </span>

                {(imagePreview || editing?.image_url) && (
                  <div className="relative overflow-hidden border border-[#d8d3c8] bg-white">
                    <img
                      src={imagePreview || editing?.image_url || undefined}
                      alt="Property preview"
                      className="h-52 w-full object-cover"
                    />

                    <span className="absolute bottom-2 left-2 bg-black/70 px-3 py-1.5 text-[10px] font-semibold text-white">
                      {selectedImage ? "New image preview" : "Current image"}
                    </span>
                  </div>
                )}

                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-[#d8d3c8] bg-white px-4 py-7 text-center transition hover:border-[#b58b20]">
                  <Image size={25} className="text-[#8a690f]" />

                  <span className="text-xs font-bold">
                    {selectedImage
                      ? "Choose a different image"
                      : "Upload property image"}
                  </span>

                  <span className="text-[10px] text-[#77746d]">
                    JPG, PNG or WebP
                  </span>

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    disabled={saving}
                    onChange={(event) => {
                      const file = event.target.files?.[0]

                      if (!file) return

                      const allowedTypes = [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                      ]

                      if (!allowedTypes.includes(file.type)) {
                        setError("Please select a JPG, PNG or WebP image.")
                        event.target.value = ""
                        return
                      }

                      setError("")
                      setSelectedImage(file)
                    }}
                  />
                </label>

                {selectedImage && (
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="self-start text-xs font-semibold text-red-600 hover:text-red-800"
                  >
                    Remove selected image
                  </button>
                )}
              </div>

              <label className={labelClass}>
                Property status

                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className={inputClass}
                >
                  <option value="available">Available</option>
                  <option value="under offer">Under offer</option>
                  <option value="sold">Sold</option>
                  <option value="rented">Rented</option>
                </select>
              </label>

              <label className="flex cursor-pointer items-center gap-3 border border-[#d8d3c8] bg-white p-4 text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      is_published: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-[#b58b20]"
                />

                Publish this property
              </label>

              <div className="flex flex-col-reverse justify-end gap-3 border-t border-[#d8d3c8] pt-5 sm:flex-row">
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={primaryButton}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Add property"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}
