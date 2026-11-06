
import { useEffect, useRef, useState } from "react"
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  ImagePlus,
  BriefcaseBusiness,
  Eye,
  EyeOff,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type PortfolioItem = {
  id: string
  title: string
  category: string | null
  description: string | null
  image_url: string | null
  display_order: number
  is_published: boolean
  created_at: string
}

type PortfolioForm = {
  title: string
  category: string
  description: string
  display_order: string
  is_published: boolean
}

const emptyForm: PortfolioForm = {
  title: "",
  category: "",
  description: "",
  display_order: "0",
  is_published: true,
}

const BUCKET = "portfolio-images"

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PortfolioItem | null>(null)
  const [form, setForm] = useState<PortfolioForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error">("success")

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPortfolio()
  }, [])

  async function loadPortfolio() {
    setLoading(true)

    const { data, error } = await supabase
      .from("portfolio")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      showMessage(error.message, "error")
    } else {
      setItems((data || []) as PortfolioItem[])
    }

    setLoading(false)
  }

  function showMessage(
    text: string,
    type: "success" | "error" = "success"
  ) {
    setMessage(text)
    setMessageType(type)
  }

  function openCreateModal() {
    setEditing(null)
    setForm({
      ...emptyForm,
      display_order: String(items.length),
    })
    setImageFile(null)
    setImagePreview("")
    setMessage("")
    setModalOpen(true)
  }

  function openEditModal(item: PortfolioItem) {
    setEditing(item)

    setForm({
      title: item.title,
      category: item.category || "",
      description: item.description || "",
      display_order: String(item.display_order ?? 0),
      is_published: item.is_published,
    })

    setImageFile(null)
    setImagePreview(item.image_url || "")
    setMessage("")
    setModalOpen(true)
  }

  function closeModal() {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }

    setModalOpen(false)
    setEditing(null)
    setImageFile(null)
    setImagePreview("")
    setForm(emptyForm)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  function handleImageChange(file?: File) {
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("Please select a JPG, PNG or WebP image.", "error")
      return
    }

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview)
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    showMessage("")
  }

  async function savePortfolioItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!editing && !imageFile) {
      showMessage("Please upload a project image.", "error")
      return
    }

    setSaving(true)
    showMessage("")

    let imageUrl = editing?.image_url || null
    let uploadedPath: string | null = null

    try {
      // Upload a new image only when one has been selected.
      if (imageFile) {
        const extension =
          imageFile.name.split(".").pop()?.toLowerCase() || "jpg"

        uploadedPath = `${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(uploadedPath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            contentType: imageFile.type,
          })

        if (uploadError) {
          throw new Error(`Image upload failed: ${uploadError.message}`)
        }

        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(uploadedPath)

        imageUrl = publicUrlData.publicUrl

        if (!imageUrl) {
          throw new Error("Could not generate the image URL.")
        }
      }

      const portfolioData = {
        title: form.title.trim(),
        category: form.category.trim() || null,
        description: form.description.trim() || null,
        image_url: imageUrl,
        display_order: Number(form.display_order) || 0,
        is_published: form.is_published,
      }

      if (editing) {
        const { data, error } = await supabase
          .from("portfolio")
          .update(portfolioData)
          .eq("id", editing.id)
          .select()

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error(
            "No portfolio record was updated. Check your Supabase permissions."
          )
        }
      } else {
        const { data, error } = await supabase
          .from("portfolio")
          .insert(portfolioData)
          .select()

        if (error) throw error

        if (!data || data.length === 0) {
          throw new Error("Portfolio project could not be created.")
        }
      }

      closeModal()
      await loadPortfolio()

      showMessage(
        editing
          ? "Portfolio project and image updated successfully."
          : "Portfolio project added successfully.",
        "success"
      )

    } catch (error) {
      // Remove newly uploaded image if the database operation failed.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET)
          .remove([uploadedPath])

        if (cleanupError) {
          console.error("Image cleanup failed:", cleanupError.message)
        }
      }

      showMessage(
        error instanceof Error ? error.message : "Something went wrong.",
        "error"
      )
    } finally {
      setSaving(false)
    }
  }

  async function togglePublished(item: PortfolioItem) {
    const { error } = await supabase
      .from("portfolio")
      .update({ is_published: !item.is_published })
      .eq("id", item.id)

    if (error) {
      showMessage(error.message, "error")
      return
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id
          ? { ...entry, is_published: !item.is_published }
          : entry
      )
    )

    showMessage(
      item.is_published
        ? `${item.title} is now hidden from the website.`
        : `${item.title} is now published on the website.`
    )
  }

  async function deletePortfolioItem(item: PortfolioItem) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.title}"? This cannot be undone.`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("portfolio")
      .delete()
      .eq("id", item.id)

    if (error) {
      showMessage(error.message, "error")
      return
    }

    setItems((current) => current.filter((entry) => entry.id !== item.id))
    showMessage(`${item.title} has been deleted.`)
  }

  const filteredItems = items.filter((item) => {
    const query = search.toLowerCase()

    const matchesSearch =
      item.title.toLowerCase().includes(query) ||
      (item.category || "").toLowerCase().includes(query) ||
      (item.description || "").toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "published" && item.is_published) ||
      (statusFilter === "unpublished" && !item.is_published)

    return matchesSearch && matchesStatus
  })

  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Website content</span>
          <h1>PORTFOLIO</h1>
          <p>Manage Gong Management projects and past experiences.</p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Add project
        </Button>
      </div>

      {message && (
        <div
          className={`mb-4 rounded-lg border p-3 text-sm ${
            messageType === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <BriefcaseBusiness size={17} />
            Total projects
          </div>
          <p className="mt-2 text-2xl font-semibold">{items.length}</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye size={17} />
            Published
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {items.filter((item) => item.is_published).length}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <EyeOff size={17} />
            Unpublished
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {items.filter((item) => !item.is_published).length}
          </p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm"
        >
          <option value="">All projects</option>
          <option value="published">Published</option>
          <option value="unpublished">Unpublished</option>
        </select>
      </div>

      <div className="admin-table">
        <div className="table-head">
          <span>Project</span>
          <span>Category</span>
          <span>Order</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading portfolio...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {items.length === 0
              ? "No portfolio projects yet. Add your first project."
              : "No projects match your search."}
          </div>
        ) : (
          filteredItems.map((item) => (
            <div className="table-row" key={item.id}>
              <div className="table-product">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-gray-100">
                    <ImagePlus size={18} className="text-gray-400" />
                  </div>
                )}

                <strong>{item.title}</strong>
              </div>

              <span>{item.category || "—"}</span>
              <span>{item.display_order}</span>

              <span className="table-status">
                {item.is_published ? "Published" : "Unpublished"}
              </span>

              <div className="row-actions">
                <button
                  type="button"
                  title={item.is_published ? "Unpublish project" : "Publish project"}
                  aria-label={item.is_published ? "Unpublish project" : "Publish project"}
                  onClick={() => togglePublished(item)}
                >
                  {item.is_published ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

                <button
                  type="button"
                  title="Edit project"
                  aria-label="Edit project"
                  onClick={() => openEditModal(item)}
                >
                  <Edit3 size={17} />
                </button>

                <button
                  type="button"
                  title="Delete project"
                  aria-label="Delete project"
                  onClick={() => deletePortfolioItem(item)}
                >
                  <Trash2 size={17} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-xl rounded-xl bg-white p-6 text-gray-900 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editing ? "Edit portfolio project" : "Add portfolio project"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the project details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 hover:bg-gray-100"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={savePortfolioItem} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Project title *
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  placeholder="Enter project title"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Category
                </label>
                <input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  placeholder="e.g. Concert, Festival, Artist Management"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  placeholder="Describe this project..."
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Display order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.display_order}
                    onChange={(e) =>
                      setForm({ ...form, display_order: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Lower numbers appear first.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Website visibility
                  </label>
                  <select
                    value={form.is_published ? "published" : "unpublished"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_published: e.target.value === "published",
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="published">Published</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Project image *
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm hover:bg-gray-50"
                >
                  <ImagePlus size={18} />
                  Choose project image from device
                </button>

                <p className="mt-1 text-xs text-gray-400">
                  JPG, PNG or WebP. No additional file-size restriction in this form.
                </p>

                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Project preview"
                      className="h-40 w-full rounded-lg border border-gray-200 object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Add project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
