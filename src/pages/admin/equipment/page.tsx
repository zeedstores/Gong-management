
import { useEffect, useState, type FormEvent } from "react"
import {
  Edit3,
  Plus,
  Trash2,
  ToggleRight,
  RefreshCw,
  X,
  Package,
  MessageSquare,
  Image,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"

type Equipment = {
  id: string
  name: string
  category: string
  description: string | null
  rental_rate: number
  rate_unit: string
  image_url: string | null
  image_path: string | null
  availability: "available" | "rented" | "maintenance"
  is_published: boolean
  created_at: string
}

type QuoteRequest = {
  id: string
  equipment_id: string | null
  equipment_name: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  quantity: number
  rental_start: string | null
  rental_end: string | null
  message: string | null
  status: "new" | "contacted" | "quoted" | "approved" | "completed" | "cancelled"
  created_at: string
}

type EquipmentForm = {
  name: string
  category: string
  description: string
  rental_rate: string
  rate_unit: string
  image_url: string
  availability: "available" | "rented" | "maintenance"
  is_published: boolean
}

type UploadedImage = {
  image_url: string
  image_path: string
}

const emptyForm: EquipmentForm = {
  name: "",
  category: "",
  description: "",
  rental_rate: "",
  rate_unit: "day",
  image_url: "",
  availability: "available",
  is_published: false,
}

const quoteStatuses = [
  "new",
  "contacted",
  "quoted",
  "approved",
  "completed",
  "cancelled",
] as const

const money = (amount: number) =>
  `₦${Number(amount || 0).toLocaleString("en-NG")}`

const inputClass =
  "w-full rounded-none border border-[#d8d3c8] bg-[#fffef8] px-4 py-3 text-sm text-[#151515] outline-none transition focus:border-[#b58b20] focus:ring-1 focus:ring-[#d6aa33]"

const labelClass = "flex flex-col gap-2 text-xs font-semibold text-[#333]"

const primaryButton =
  "inline-flex items-center justify-center gap-2 bg-[#d6aa33] px-5 py-3 text-xs font-bold uppercase tracking-wide text-[#090909] transition hover:bg-[#f1c64d] disabled:cursor-not-allowed disabled:opacity-50"

const secondaryButton =
  "inline-flex items-center justify-center gap-2 border border-[#d8d3c8] bg-white px-4 py-3 text-xs font-semibold text-[#151515] transition hover:border-[#b58b20] hover:bg-[#f8f5ed] disabled:cursor-not-allowed disabled:opacity-50"

export default function AdminEquipmentPage() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [requests, setRequests] = useState<QuoteRequest[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Equipment | null>(null)

  const [form, setForm] = useState<EquipmentForm>(emptyForm)
  const [activeTab, setActiveTab] = useState<"equipment" | "requests">("equipment")

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")

  // Load equipment and quote requests
  async function loadData() {
    setLoading(true)
    setError("")

    try {
      const [equipmentResult, requestsResult] = await Promise.all([
        supabase
          .from("equipment")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("equipment_quote_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (equipmentResult.error) throw equipmentResult.error
      if (requestsResult.error) throw requestsResult.error

      setEquipment((equipmentResult.data || []) as Equipment[])
      setRequests((requestsResult.data || []) as QuoteRequest[])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load equipment data."
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Generate a temporary preview for a selected image
  useEffect(() => {
    if (!selectedImage) {
      setImagePreview("")
      return
    }

    const previewUrl = URL.createObjectURL(selectedImage)
    setImagePreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedImage])

  // Upload image to Supabase Storage
  async function uploadEquipmentImage(file: File): Promise<UploadedImage> {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
    const filePath = `${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from("equipment-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      })

    if (error) throw error

    const { data } = supabase.storage
      .from("equipment-images")
      .getPublicUrl(filePath)

    return {
      image_url: data.publicUrl,
      image_path: filePath,
    }
  }

  // Delete image from Supabase Storage
  async function removeEquipmentImage(path: string) {
    const { error } = await supabase.storage
      .from("equipment-images")
      .remove([path])

    if (error) {
      console.error("Image deletion failed:", error.message)
      return false
    }

    return true
  }

  // Open add form
  function openAddForm() {
    setEditing(null)
    setForm(emptyForm)
    setSelectedImage(null)
    setShowForm(true)
    setError("")
    setSuccess("")
  }

  // Open edit form
  function openEditForm(item: Equipment) {
    setEditing(item)
    setSelectedImage(null)

    setForm({
      name: item.name,
      category: item.category,
      description: item.description || "",
      rental_rate: String(item.rental_rate),
      rate_unit: item.rate_unit,
      image_url: item.image_url || "",
      availability: item.availability,
      is_published: item.is_published,
    })

    setShowForm(true)
    setError("")
    setSuccess("")
  }

  // Save equipment and its image
  async function saveEquipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || !form.category.trim()) {
      setError("Equipment name and category are required.")
      return
    }

    if (
      !form.rental_rate.trim() ||
      !Number.isFinite(Number(form.rental_rate)) ||
      Number(form.rental_rate) < 0
    ) {
      setError("Please enter a valid rental rate.")
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    let uploadedImage: UploadedImage | null = null

    try {
      // Upload newly selected image
      if (selectedImage) {
        uploadedImage = await uploadEquipmentImage(selectedImage)
      }

      const payload = {
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim() || null,
        rental_rate: Number(form.rental_rate),
        rate_unit: form.rate_unit,

        image_url:
          uploadedImage?.image_url ?? editing?.image_url ?? null,

        image_path:
          uploadedImage?.image_path ?? editing?.image_path ?? null,

        availability: form.availability,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      }

      const result = editing
        ? await supabase
            .from("equipment")
            .update(payload)
            .eq("id", editing.id)
        : await supabase.from("equipment").insert(payload)

      if (result.error) {
        // Remove newly uploaded image if database save fails
        if (uploadedImage) {
          await removeEquipmentImage(uploadedImage.image_path)
        }

        throw result.error
      }

      // Remove old image only after successful database update
      if (
        editing &&
        uploadedImage &&
        editing.image_path
      ) {
        await removeEquipmentImage(editing.image_path)
      }

      setSuccess(
        editing
          ? "Equipment updated successfully."
          : "Equipment added successfully."
      )

      setShowForm(false)
      setEditing(null)
      setForm(emptyForm)
      setSelectedImage(null)

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving equipment."
      )
    } finally {
      setSaving(false)
    }
  }

  // Publish or unpublish equipment
  async function togglePublished(item: Equipment) {
    setError("")

    const newValue = !item.is_published

    const { error } = await supabase
      .from("equipment")
      .update({
        is_published: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)

    if (error) {
      setError(error.message)
      return
    }

    setEquipment((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, is_published: newValue }
          : entry
      )
    )

    setSuccess(newValue ? "Equipment published." : "Equipment unpublished.")
  }

  // Update equipment availability
  async function updateAvailability(
    item: Equipment,
    availability: Equipment["availability"]
  ) {
    setError("")

    const { error } = await supabase
      .from("equipment")
      .update({
        availability,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id)

    if (error) {
      setError(error.message)
      return
    }

    setEquipment((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, availability } : entry
      )
    )
  }

  // Delete equipment and associated image
  async function deleteEquipment(item: Equipment) {
    const confirmed = window.confirm(
      `Delete "${item.name}"? This action cannot be undone.`
    )

    if (!confirmed) return

    setError("")
    setSuccess("")

    const { error } = await supabase
      .from("equipment")
      .delete()
      .eq("id", item.id)

    if (error) {
      setError(error.message)
      return
    }

    if (item.image_path) {
      const removed = await removeEquipmentImage(item.image_path)

      if (!removed) {
        setError(
          "Equipment was deleted, but its image could not be removed from Storage."
        )
      }
    }

    setEquipment((current) =>
      current.filter((entry) => entry.id !== item.id)
    )

    if (!item.image_path) {
      setSuccess("Equipment deleted successfully.")
    }
  }

  // Update quote request status
  async function updateQuoteStatus(
    request: QuoteRequest,
    status: QuoteRequest["status"]
  ) {
    setError("")

    const { error } = await supabase
      .from("equipment_quote_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", request.id)

    if (error) {
      setError(error.message)
      return
    }

    setRequests((current) =>
      current.map((entry) =>
        entry.id === request.id
          ? { ...entry, status }
          : entry
      )
    )

    setSuccess("Quote request status updated.")
  }

  const openRequests = requests.filter(
    (request) =>
      !["completed", "cancelled"].includes(request.status)
  ).length

  return (
    <main className="min-h-screen bg-[#f3f0e8] p-4 text-[#090909] sm:p-6 lg:p-8">

      {/* Page heading */}
      <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8a690f]">
            Operations
          </span>

          <h1 className="mt-2 font-['Anton'] text-4xl font-normal tracking-wide sm:text-5xl">
            EQUIPMENT
          </h1>

          <p className="mt-2 text-sm text-[#77746d]">
            Manage categories, rates, images and availability.
          </p>
        </div>

        <button className={primaryButton} onClick={openAddForm}>
          <Plus size={17} />
          Add equipment
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

      {/* Tabs */}
      <div className="mb-7 flex flex-wrap border-b border-[#d8d3c8]">
        <button
          onClick={() => setActiveTab("equipment")}
          className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition ${
            activeTab === "equipment"
              ? "border-[#d6aa33] text-[#090909]"
              : "border-transparent text-[#77746d] hover:text-[#090909]"
          }`}
        >
          <Package size={17} />
          Equipment ({equipment.length})
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`flex items-center gap-2 border-b-2 px-4 py-4 text-xs font-bold transition ${
            activeTab === "requests"
              ? "border-[#d6aa33] text-[#090909]"
              : "border-transparent text-[#77746d] hover:text-[#090909]"
          }`}
        >
          <MessageSquare size={17} />
          Quote requests ({requests.length})

          {openRequests > 0 && (
            <span className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d6aa33] px-1 text-[10px] text-black">
              {openRequests}
            </span>
          )}
        </button>
      </div>

      {/* Equipment tab */}
      {activeTab === "equipment" && (
        <section>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">
                Equipment inventory
              </h2>

              <p className="mt-1 text-xs text-[#77746d]">
                {equipment.length} items in your inventory
              </p>
            </div>

            <button
              className={secondaryButton}
              onClick={loadData}
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
              Loading equipment...
            </div>
          ) : equipment.length === 0 ? (
            <div className="flex flex-col items-center border border-[#e0dcd2] bg-white px-5 py-16 text-center">
              <Package
                size={32}
                className="mb-4 text-[#b58b20]"
              />

              <strong className="text-sm">
                No equipment added yet
              </strong>

              <p className="mt-2 text-xs text-[#77746d]">
                Add your first equipment item to get started.
              </p>

              <button
                className={`${primaryButton} mt-5`}
                onClick={openAddForm}
              >
                <Plus size={16} />
                Add equipment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {equipment.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden border border-[#e0dcd2] bg-white transition hover:border-[#c5a34b]"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-[#eae6dc] text-[#aaa397]">
                      <Package size={36} strokeWidth={1.2} />
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a690f]">
                        {item.category}
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
                      {item.name}
                    </h3>

                    <p className="mt-2 min-h-10 text-xs leading-relaxed text-[#77746d]">
                      {item.description || "No description provided."}
                    </p>

                    <div className="mt-4 border-t border-[#eeeae1] pt-4">
                      <strong className="text-base">
                        {money(item.rental_rate)}

                        <span className="ml-1 text-xs font-normal text-[#77746d]">
                          / {item.rate_unit}
                        </span>
                      </strong>
                    </div>

                    <label className="mt-4 flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wide text-[#77746d]">
                      Availability

                      <select
                        value={item.availability}
                        onChange={(event) =>
                          updateAvailability(
                            item,
                            event.target.value as Equipment["availability"]
                          )
                        }
                        className={inputClass}
                      >
                        <option value="available">Available</option>
                        <option value="rented">Rented</option>
                        <option value="maintenance">Maintenance</option>
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
                        onClick={() => deleteEquipment(item)}
                        className="flex h-10 w-10 items-center justify-center border border-[#ead1d1] text-red-600 transition hover:bg-red-50"
                        aria-label={`Delete ${item.name}`}
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
      )}

      {/* Quote requests tab */}
      {activeTab === "requests" && (
        <section className="border border-[#e0dcd2] bg-white p-4 sm:p-6">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">
                Quote requests
              </h2>

              <p className="mt-1 text-xs text-[#77746d]">
                {openRequests} open requests
              </p>
            </div>

            <button
              className={secondaryButton}
              onClick={loadData}
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
            <div className="py-12 text-center text-sm text-[#77746d]">
              Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <MessageSquare
                size={32}
                className="mb-4 text-[#b58b20]"
              />

              <strong className="text-sm">
                No equipment requests yet
              </strong>

              <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#77746d]">
                New customer submissions will appear here with trackable statuses.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <article
                  key={request.id}
                  className="border border-[#e5e1d8] p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-5 lg:flex-row">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8a690f]">
                        {request.equipment_name}
                      </span>

                      <h3 className="mt-2 text-base font-bold">
                        {request.customer_name}
                      </h3>

                      <p className="mt-1 text-xs text-[#77746d]">
                        {request.customer_email}
                      </p>

                      {request.customer_phone && (
                        <p className="mt-1 text-xs text-[#77746d]">
                          {request.customer_phone}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs lg:min-w-64">
                      <strong>
                        Quantity: {request.quantity}
                      </strong>

                      {request.rental_start && (
                        <span className="text-[#77746d]">
                          From: {request.rental_start}
                        </span>
                      )}

                      {request.rental_end && (
                        <span className="text-[#77746d]">
                          To: {request.rental_end}
                        </span>
                      )}

                      <small className="col-span-2 text-[#99958b]">
                        {new Date(request.created_at).toLocaleString()}
                      </small>
                    </div>
                  </div>

                  {request.message && (
                    <p className="mt-4 border-l-2 border-[#d6aa33] bg-[#f8f6f0] px-4 py-3 text-xs leading-relaxed text-[#555]">
                      {request.message}
                    </p>
                  )}

                  <div className="mt-5 flex flex-col justify-between gap-4 border-t border-[#eeeae1] pt-4 sm:flex-row sm:items-center">
                    <span
                      className={`w-fit px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide ${
                        request.status === "new"
                          ? "bg-blue-50 text-blue-700"
                          : request.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : request.status === "completed"
                              ? "bg-[#e8e5dc] text-[#555]"
                              : request.status === "cancelled"
                                ? "bg-red-50 text-red-700"
                                : "bg-[#f7f0db] text-[#8a690f]"
                      }`}
                    >
                      {request.status.replace("_", " ")}
                    </span>

                    <label className="flex flex-col gap-2 text-[10px] font-bold uppercase tracking-wide text-[#77746d] sm:flex-row sm:items-center">
                      Update status

                      <select
                        value={request.status}
                        onChange={(event) =>
                          updateQuoteStatus(
                            request,
                            event.target.value as QuoteRequest["status"]
                          )
                        }
                        className="min-w-40 border border-[#d8d3c8] bg-white px-3 py-2 text-xs font-normal text-[#151515] outline-none focus:border-[#b58b20]"
                      >
                        {quoteStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Add / edit equipment modal */}
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
                  Equipment management
                </span>

                <h2 className="mt-1 font-['Anton'] text-2xl font-normal uppercase">
                  {editing ? "Edit equipment" : "Add equipment"}
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
              onSubmit={saveEquipment}
              className="max-h-[75vh] space-y-5 overflow-y-auto px-5 py-6 sm:px-7"
            >
              <label className={labelClass}>
                Equipment name *

                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="e.g. Industrial Generator"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Category *

                <input
                  required
                  value={form.category}
                  onChange={(event) =>
                    setForm({ ...form, category: event.target.value })
                  }
                  placeholder="e.g. Power Equipment"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Description

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm({ ...form, description: event.target.value })
                  }
                  placeholder="Describe the equipment..."
                  className={`${inputClass} resize-y`}
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Rental rate (₦) *

                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.rental_rate}
                    onChange={(event) =>
                      setForm({ ...form, rental_rate: event.target.value })
                    }
                    placeholder="50000"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Rate unit

                  <select
                    value={form.rate_unit}
                    onChange={(event) =>
                      setForm({ ...form, rate_unit: event.target.value })
                    }
                    className={inputClass}
                  >
                    <option value="hour">Per hour</option>
                    <option value="day">Per day</option>
                    <option value="week">Per week</option>
                    <option value="month">Per month</option>
                    <option value="project">Per project</option>
                  </select>
                </label>
              </div>

              {/* Image upload */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-[#333]">
                  Equipment image
                </span>

                {(imagePreview || form.image_url) && (
                  <div className="relative overflow-hidden border border-[#d8d3c8] bg-white">
                    <img
                      src={imagePreview || form.image_url}
                      alt="Equipment preview"
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
                      : "Upload equipment image"}
                  </span>

                  <span className="text-[10px] text-[#77746d]">
                    JPG, PNG or WebP · Maximum 5MB
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

                      if (file.size > 5 * 1024 * 1024) {
                        setError("Image must not exceed 5MB.")
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
                Availability

                <select
                  value={form.availability}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      availability: event.target.value as EquipmentForm["availability"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
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

                Publish this equipment
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
                      : "Add equipment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  )
}

