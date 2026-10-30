
import { useEffect, useRef, useState } from "react"
import {
  Edit3,
  Plus,
  Search,
  Trash2,
  X,
  ImagePlus,
  Users,
  Eye,
  EyeOff,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type TeamMember = {
  id: string
  name: string
  position: string
  image_url: string
  display_order: number
  is_active: boolean
  created_at: string
}

type TeamForm = {
  name: string
  position: string
  display_order: string
  is_active: boolean
}

const emptyForm: TeamForm = {
  name: "",
  position: "",
  display_order: "0",
  is_active: true,
}

const BUCKET = "team-images"

export default function AdminTeamPage() {
  const [items, setItems] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [form, setForm] = useState<TeamForm>(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [message, setMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadTeam()
  }, [])

  async function loadTeam() {
    setLoading(true)

    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) {
      setMessage(error.message)
    } else {
      setItems((data || []) as TeamMember[])
    }

    setLoading(false)
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

  function openEditModal(member: TeamMember) {
    setEditing(member)
    setForm({
      name: member.name,
      position: member.position,
      display_order: String(member.display_order),
      is_active: member.is_active,
    })
    setImageFile(null)
    setImagePreview(member.image_url)
    setMessage("")
    setModalOpen(true)
  }

  function closeModal() {
    setModalOpen(false)
    setEditing(null)
    setImageFile(null)
    setImagePreview("")
    setForm(emptyForm)
  }

  function handleImageChange(file?: File) {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5MB.")
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setMessage("")
  }

  async function saveMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!editing && !imageFile) {
      setMessage("Please upload a photograph for this team member.")
      return
    }

    setSaving(true)
    setMessage("")

    let imageUrl = editing?.image_url || ""
    let uploadedPath = ""

    try {
      if (imageFile) {
        const extension = imageFile.name.split(".").pop() || "jpg"
        const path = `${crypto.randomUUID()}.${extension}`

        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(path, imageFile, {
            cacheControl: "3600",
            upsert: false,
          })

        if (uploadError) throw uploadError

        uploadedPath = path

        const { data } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(path)

        imageUrl = data.publicUrl
      }

      const memberData = {
        name: form.name.trim(),
        position: form.position.trim(),
        image_url: imageUrl,
        display_order: Number(form.display_order) || 0,
        is_active: form.is_active,
      }

      let error

      if (editing) {
        const result = await supabase
          .from("team_members")
          .update(memberData)
          .eq("id", editing.id)

        error = result.error
      } else {
        const result = await supabase
          .from("team_members")
          .insert(memberData)

        error = result.error
      }

      if (error) {
        if (uploadedPath) {
          await supabase.storage.from(BUCKET).remove([uploadedPath])
        }
        throw error
      }

      closeModal()
      await loadTeam()

      setMessage(
        editing
          ? "Team member updated successfully."
          : "Team member added successfully."
      )
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      )
    } finally {
      setSaving(false)
    }
  }

  async function toggleMember(member: TeamMember) {
    const { error } = await supabase
      .from("team_members")
      .update({ is_active: !member.is_active })
      .eq("id", member.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === member.id
          ? { ...item, is_active: !item.is_active }
          : item
      )
    )

    setMessage(
      member.is_active
        ? `${member.name} is now hidden from the website.`
        : `${member.name} is now visible on the website.`
    )
  }

  async function deleteMember(member: TeamMember) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${member.name}? This cannot be undone.`
    )

    if (!confirmed) return

    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", member.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setItems((current) =>
      current.filter((item) => item.id !== member.id)
    )

    setMessage(`${member.name} has been deleted.`)
  }

  const filteredItems = items.filter((member) => {
    const query = search.toLowerCase()

    const matchesSearch =
      member.name.toLowerCase().includes(query) ||
      member.position.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === "" ||
      (statusFilter === "active" && member.is_active) ||
      (statusFilter === "inactive" && !member.is_active)

    return matchesSearch && matchesStatus
  })

  return (
    <main className="admin-page">
      <div className="admin-title">
        <div>
          <span>Website content</span>
          <h1>TEAM MEMBERS</h1>
          <p>Manage the people behind Gong Management.</p>
        </div>

        <Button onClick={openCreateModal}>
          <Plus size={17} />
          Add team member
        </Button>
      </div>

      {message && (
        <div className="mb-4 rounded-lg border border-gray-200 p-3 text-sm">
          {message}
        </div>
      )}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={17} />
            Total members
          </div>
          <p className="mt-2 text-2xl font-semibold">{items.length}</p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Eye size={17} />
            Visible on website
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {items.filter((item) => item.is_active).length}
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <EyeOff size={17} />
            Hidden from website
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {items.filter((item) => !item.is_active).length}
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
            placeholder="Search team members..."
            className="w-full rounded-lg border border-gray-200 bg-transparent py-2.5 pl-10 pr-3 text-sm outline-none"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-200 bg-transparent px-3 py-2.5 text-sm"
        >
          <option value="">All members</option>
          <option value="active">Visible on website</option>
          <option value="inactive">Hidden from website</option>
        </select>
      </div>

      <div className="admin-table">
        <div className="table-head">
          <span>Team member</span>
          <span>Position</span>
          <span>Order</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500">
            Loading team members...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {items.length === 0
              ? "No team members yet. Add your first team member."
              : "No team members match your search."}
          </div>
        ) : (
          filteredItems.map((member) => (
            <div className="table-row" key={member.id}>
              <div className="table-product">
                <img
                  src={member.image_url}
                  alt={member.name}
                  className="object-cover"
                />
                <strong>{member.name}</strong>
              </div>

              <span>{member.position}</span>
              <span>{member.display_order}</span>

              <span className="table-status">
                {member.is_active ? "Visible" : "Hidden"}
              </span>

              <div className="row-actions">
                <button
                  type="button"
                  title={member.is_active ? "Hide member" : "Show member"}
                  aria-label={member.is_active ? "Hide member" : "Show member"}
                  onClick={() => toggleMember(member)}
                >
                  {member.is_active ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>

                <button
                  type="button"
                  title="Edit member"
                  aria-label="Edit member"
                  onClick={() => openEditModal(member)}
                >
                  <Edit3 size={17} />
                </button>

                <button
                  type="button"
                  title="Delete member"
                  aria-label="Delete member"
                  onClick={() => deleteMember(member)}
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
                  {editing ? "Edit team member" : "Add team member"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the member's details below.
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

            <form onSubmit={saveMember} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Full name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Position *
                </label>
                <input
                  required
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-500"
                  placeholder="e.g. Chief Executive Officer"
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
                    value={form.is_active ? "active" : "inactive"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_active: e.target.value === "active",
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm"
                  >
                    <option value="active">Visible</option>
                    <option value="inactive">Hidden</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Photograph *
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(e.target.files?.[0])}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 p-4 text-sm hover:bg-gray-50"
                >
                  <ImagePlus size={18} />
                  Choose photograph from device
                </button>

                <p className="mt-1 text-xs text-gray-400">
                  Maximum image size: 5MB.
                </p>

                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Team member preview"
                      className="h-36 w-36 rounded-lg border border-gray-200 object-cover"
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
                      : "Add team member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
