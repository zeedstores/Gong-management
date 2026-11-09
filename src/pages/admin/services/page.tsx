
import { useEffect, useMemo, useRef, useState } from "react"
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  ImagePlus,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"

const BUCKET = "product-images"
const MAX_IMAGE_SIZE = 15 * 1024 * 1024

type Service = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
  is_published: boolean
  display_order: number
}

type ServiceForm = {
  title: string
  slug: string
  description: string
  image_url: string
  is_published: boolean
  display_order: number
}

const emptyForm: ServiceForm = {
  title: "",
  slug: "",
  description: "",
  image_url: "",
  is_published: false,
  display_order: 1,
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadServices()
  }, [])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview("")
      return
    }

    const preview = URL.createObjectURL(imageFile)
    setImagePreview(preview)

    return () => URL.revokeObjectURL(preview)
  }, [imageFile])

  async function loadServices() {
    setLoading(true)
    setError("")

    const { data, error } = await supabase
      .from("services")
      .select(
        "id, title, slug, description, image_url, is_published, display_order"
      )
      .order("display_order", { ascending: true })

    if (error) {
      setError(error.message)
      setServices([])
    } else {
      setServices((data || []) as Service[])
    }

    setLoading(false)
  }

  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return services

    return services.filter(
      (service) =>
        service.title.toLowerCase().includes(query) ||
        service.slug.toLowerCase().includes(query)
    )
  }, [services, search])

  function openCreateModal() {
    setEditingService(null)
    setForm({
      ...emptyForm,
      display_order: services.length + 1,
    })
    setImageFile(null)
    setError("")
    setSuccess("")
    setModalOpen(true)
  }

  function openEditModal(service: Service) {
    setEditingService(service)

    setForm({
      title: service.title,
      slug: service.slug,
      description: service.description || "",
      image_url: service.image_url || "",
      is_published: service.is_published,
      display_order: service.display_order ?? 1,
    })

    setImageFile(null)
    setError("")
    setSuccess("")
    setModalOpen(true)
  }

  function closeModal() {
    if (saving) return

    setModalOpen(false)
    setEditingService(null)
    setImageFile(null)
    setImagePreview("")
    setForm(emptyForm)
    setError("")
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: createSlug(value),
    }))
  }

  function handleImageChange(file: File | undefined) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.")
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must not exceed 15MB.")
      return
    }

    setError("")
    setImageFile(file)
  }

  async function uploadImage(file: File) {
    const extension = file.name.split(".").pop() || "jpg"
    const path = `services/${crypto.randomUUID()}.${extension}`

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (error) {
      throw new Error(`Image upload failed: ${error.message}`)
    }

    const { data } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path)

    return {
      url: data.publicUrl,
      path,
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError("")
    setSuccess("")

    const title = form.title.trim()
    const slug = createSlug(form.slug)

    if (!title || !slug) {
      setError("Please enter a service title and slug.")
      return
    }

    setSaving(true)

    let uploadedPath: string | null = null

    try {
      let imageUrl = form.image_url.trim()

      // Upload a new image only when a new file has been selected.
      if (imageFile) {
        const uploaded = await uploadImage(imageFile)
        imageUrl = uploaded.url
        uploadedPath = uploaded.path
      }

      const payload = {
        title,
        slug,
        description: form.description.trim() || null,
        image_url: imageUrl || null,
        is_published: form.is_published,
        display_order: Number(form.display_order) || 1,
      }

      const result = editingService
        ? await supabase
            .from("services")
            .update(payload)
            .eq("id", editingService.id)
        : await supabase
            .from("services")
            .insert(payload)

      if (result.error) {
        throw new Error(`Saving service failed: ${result.error.message}`)
      }

      setSuccess(
        editingService
          ? "Service updated successfully."
          : "Service created successfully."
      )

      setModalOpen(false)
      setImageFile(null)
      setEditingService(null)

      await loadServices()
    } catch (err) {
      // Remove only the newly uploaded image if saving the service failed.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath])

        if (cleanupError) {
          console.error("Could not clean up uploaded image:", cleanupError)
        }
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(service: Service) {
    setError("")
    setSuccess("")

    const { error } = await supabase
      .from("services")
      .update({ is_published: !service.is_published })
      .eq("id", service.id)

    if (error) {
      setError(error.message)
      return
    }

    setSuccess(
      service.is_published
        ? "Service unpublished."
        : "Service published."
    )

    await loadServices()
  }

  async function deleteService(service: Service) {
    const confirmed = window.confirm(
      `Delete "${service.title}"? This cannot be undone.`
    )

    if (!confirmed) return

    setDeletingId(service.id)
    setError("")
    setSuccess("")

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", service.id)

    if (error) {
      setError(error.message)
    } else {
      setSuccess("Service deleted successfully.")
      await loadServices()
    }

    setDeletingId(null)
  }

  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <p className="text-sm text-gray-500">Website content</p>
          <h1>Services Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Add and manage the services displayed on your website.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-md bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-800"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>

      {error && !modalOpen && (
        <div className="my-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="my-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="my-6 flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2">
        <Search size={18} className="text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search services..."
          className="w-full border-none bg-transparent text-sm outline-none"
        />
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-500">
        <span>Total services: {services.length}</span>
        <span>
          Published: {services.filter((item) => item.is_published).length}
        </span>
        <span>
          Drafts: {services.filter((item) => !item.is_published).length}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Loading services...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white py-16 text-center">
          <ImagePlus size={32} className="mx-auto mb-3 text-gray-400" />
          <h3 className="font-semibold text-gray-800">
            {search ? "No matching services" : "No services added yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try another search term."
              : "Add your first service to display it on the website."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-4">Service</th>
                <th className="px-4 py-4">Slug</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Order</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredServices.map((service) => (
                <tr
                  key={service.id}
                  className="border-b border-gray-100 last:border-0"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          alt={service.title}
                          className="h-12 w-16 rounded-md border border-gray-200 object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center rounded-md bg-gray-100">
                          <ImagePlus size={18} className="text-gray-400" />
                        </div>
                      )}

                      <div>
                        <p className="font-semibold text-gray-900">
                          {service.title}
                        </p>
                        <p className="mt-1 max-w-[260px] truncate text-xs text-gray-500">
                          {service.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-gray-500">
                    {service.slug}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        service.is_published
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {service.is_published ? "Published" : "Draft"}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {service.display_order}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => togglePublished(service)}
                        title={service.is_published ? "Unpublish" : "Publish"}
                        className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                      >
                        {service.is_published ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditModal(service)}
                        title="Edit service"
                        className="rounded-md border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteService(service)}
                        disabled={deletingId === service.id}
                        title="Delete service"
                        className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId === service.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:items-center">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <p className="text-xs text-gray-500">
                  Manage the content shown on your website.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Service title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="e.g. Event Production"
                  className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  URL slug *
                </label>
                <input
                  required
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: event.target.value,
                    }))
                  }
                  placeholder="event-production"
                  className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-black"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Automatically generated from the title. You can edit it.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Describe this service..."
                  className="w-full resize-y rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Service image
                </label>

                {(imagePreview || form.image_url) && (
                  <img
                    src={imagePreview || form.image_url}
                    alt="Service preview"
                    className="mb-3 h-44 w-full rounded-md border border-gray-200 object-cover"
                  />
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    handleImageChange(event.target.files?.[0])
                    event.target.value = ""
                  }}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ImagePlus size={18} />
                  {imageFile ? "Choose another image" : "Change image"}
                </button>

                <p className="mt-2 text-xs text-gray-400">
                  Maximum image size: 15MB. Images are uploaded to Supabase
                  Storage.
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Display order
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={form.display_order}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        display_order: Number(event.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-gray-300 px-3 py-3 text-sm outline-none focus:border-black"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Lower numbers appear first.
                  </p>
                </div>

                <div className="flex items-center gap-3 self-center rounded-md border border-gray-200 p-3">
                  <input
                    id="service-published"
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        is_published: event.target.checked,
                      }))
                    }
                    className="h-4 w-4 accent-black"
                  />
                  <label
                    htmlFor="service-published"
                    className="text-sm font-medium text-gray-700"
                  >
                    Publish on website
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-md border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {saving && <Loader2 size={17} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingService
                      ? "Update Service"
                      : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
