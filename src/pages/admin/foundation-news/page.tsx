
import { useEffect, useState, type FormEvent } from "react"
import { Edit3, Eye, Plus, Save, X, Upload, Image as ImageIcon } from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author: string | null
  status: string
  published_at: string | null
}

const BUCKET = "foundation-news-images"
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image: "",
  author: "Gong Foundation",
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function getStoragePath(url: string | null) {
  if (!url) return null

  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = url.indexOf(marker)

  if (index === -1) return null

  return decodeURIComponent(url.slice(index + marker.length))
}

export default function AdminFoundationNewsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [originalCoverImage, setOriginalCoverImage] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState("")
  const [status, setStatus] = useState<"draft" | "published">("draft")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (!coverFile) {
      setCoverPreview(form.cover_image)
      return
    }

    const previewUrl = URL.createObjectURL(coverFile)
    setCoverPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [coverFile, form.cover_image])

  async function loadPosts() {
    setLoading(true)

    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, excerpt, content, cover_image, author, status, published_at")
      .eq("category", "foundation")
      .order("created_at", { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setPosts((data ?? []) as Post[])
      setError("")
    }

    setLoading(false)
  }

  useEffect(() => {
    void loadPosts()
  }, [])

  function resetCover() {
    setCoverFile(null)
    setCoverPreview("")
    setForm((current) => ({ ...current, cover_image: "" }))
  }

  function startNewPost() {
    setForm(emptyForm)
    setEditingId(null)
    setOriginalCoverImage(null)
    setCoverFile(null)
    setCoverPreview("")
    setStatus("draft")
    setMessage("")
    setError("")
    setShowForm(true)
  }

  function startEdit(post: Post) {
    setForm({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? "",
      content: post.content ?? "",
      cover_image: post.cover_image ?? "",
      author: post.author ?? "Gong Foundation",
    })
    setEditingId(post.id)
    setOriginalCoverImage(post.cover_image)
    setCoverFile(null)
    setCoverPreview(post.cover_image ?? "")
    setStatus(post.status === "published" ? "published" : "draft")
    setMessage("")
    setError("")
    setShowForm(true)
  }

  function handleCoverChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.")
      return
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be 5MB or smaller.")
      return
    }

    setError("")
    setCoverFile(file)
  }

  async function uploadCoverImage() {
    if (!coverFile) return form.cover_image || null

    const extension = coverFile.name.split(".").pop()?.toLowerCase() || "jpg"
    const filePath = `foundation-news/${crypto.randomUUID()}.${extension}`

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, coverFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: coverFile.type,
      })

    if (error) throw error

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(data.path)

    return publicUrlData.publicUrl
  }

  async function deleteStoredImage(url: string | null) {
    const path = getStoragePath(url)
    if (!path) return

    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([path])

    if (error) {
      console.error("Could not remove old article image:", error.message)
    }
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setMessage("")
    setError("")

    const slug = makeSlug(form.slug || form.title)

    if (!slug) {
      setError("Please enter a valid title.")
      setSaving(false)
      return
    }

    let uploadedImageUrl: string | null = null

    try {
      const coverImage = await uploadCoverImage()
      if (coverFile) uploadedImageUrl = coverImage

      const payload = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim(),
        cover_image: coverImage,
        author: form.author.trim() || "Gong Foundation",
        category: "foundation",
        status,
        published_at:
          status === "published"
            ? new Date().toISOString()
            : null,
      }

      const result = editingId
        ? await supabase
            .from("blog_posts")
            .update(payload)
            .eq("id", editingId)
            .eq("category", "foundation")
            .select("id")
            .maybeSingle()
        : await supabase
            .from("blog_posts")
            .insert(payload)
            .select("id")
            .maybeSingle()

      if (result.error) {
        if (uploadedImageUrl) await deleteStoredImage(uploadedImageUrl)
        setError(result.error.message)
      } else if (!result.data) {
        if (uploadedImageUrl) await deleteStoredImage(uploadedImageUrl)
        setError("The post was not saved. Check your Supabase permissions.")
      } else {
        if (originalCoverImage && originalCoverImage !== coverImage) {
          await deleteStoredImage(originalCoverImage)
        }

        setMessage(status === "published" ? "Article published." : "Draft saved.")
        setShowForm(false)
        setCoverFile(null)
        setCoverPreview("")
        await loadPosts()
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the cover image."
      )

      if (uploadedImageUrl) await deleteStoredImage(uploadedImageUrl)
    }

    setSaving(false)
  }

  async function changeStatus(post: Post) {
    const nextStatus = post.status === "published" ? "draft" : "published"
    setError("")
    setMessage("")

    const { data, error } = await supabase
      .from("blog_posts")
      .update({
        status: nextStatus,
        published_at:
          nextStatus === "published"
            ? new Date().toISOString()
            : null,
      })
      .eq("id", post.id)
      .eq("category", "foundation")
      .select("id")
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else if (!data) {
      setError("Status wasn't changed. Check your Supabase permissions.")
    } else {
      setMessage(nextStatus === "published" ? "Article published." : "Article moved to drafts.")
      await loadPosts()
    }
  }

  return (
    <main className="admin-page space-y-6">
      <div className="admin-title">
        <div>
          <span>Gong Foundation</span>
          <h1>FOUNDATION NEWS</h1>
          <p>Create, edit, save, and publish foundation stories.</p>
        </div>

        <Button onClick={startNewPost}>
          <Plus size={17} />
          New article
        </Button>
      </div>

      {message && (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
          {message}
        </p>
      )}

      {error && (
        <p role="alert" className="break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {showForm && (
        <form onSubmit={savePost} className="admin-panel space-y-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span>{editingId ? "Edit article" : "New article"}</span>
              <h2 className="mt-1 text-xl font-semibold">Article details</h2>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg p-2 hover:bg-neutral-100"
              aria-label="Close editor"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">
              Article title *
              <input
                required
                maxLength={180}
                value={form.title}
                onChange={(e) => setForm({
                  ...form,
                  title: e.target.value,
                  slug: editingId ? form.slug : makeSlug(e.target.value),
                })}
                className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 font-normal outline-none focus:border-neutral-900"
                placeholder="A new chapter for our community"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              URL slug *
              <input
                required
                maxLength={180}
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: makeSlug(e.target.value) })}
                className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 font-normal outline-none focus:border-neutral-900"
                placeholder="community-project-update"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Short summary
              <textarea
                rows={3}
                maxLength={400}
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 px-4 py-3 font-normal outline-none focus:border-neutral-900"
                placeholder="A short introduction shown on the Foundation page."
              />
            </label>

            <div className="grid gap-2 text-sm font-medium sm:col-span-2">
              Cover image

              {coverPreview ? (
                <div className="relative max-w-md overflow-hidden rounded-xl border border-neutral-300">
                  <img
                    src={coverPreview}
                    alt="Article cover preview"
                    className="h-52 w-full object-cover"
                  />

                  <button
                    type="button"
                    onClick={resetCover}
                    className="absolute right-3 top-3 rounded-lg bg-black/75 p-2 text-white hover:bg-black"
                    aria-label="Remove cover image"
                  >
                    <X size={17} />
                  </button>
                </div>
              ) : (
                <label className="flex min-h-36 max-w-md cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-5 text-center hover:bg-neutral-100">
                  <ImageIcon size={25} className="text-neutral-500" />
                  <span className="font-medium">Choose cover image</span>
                  <span className="text-xs font-normal text-neutral-500">
                    JPG, PNG or WebP · Maximum 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}

              {coverPreview && (
                <label className="mt-2 inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm hover:bg-neutral-50">
                  <Upload size={16} />
                  Change image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <label className="grid gap-2 text-sm font-medium">
              Author
              <input
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
                className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 font-normal outline-none focus:border-neutral-900"
              />
            </label>

            <label className="grid gap-2 text-sm font-medium">
              Publishing status
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 font-normal outline-none focus:border-neutral-900"
              >
                <option value="draft">Save as draft</option>
                <option value="published">Publish now</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium sm:col-span-2">
              Full article *
              <textarea
                required
                rows={12}
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full rounded-xl border border-neutral-300 p-4 font-normal leading-7 outline-none focus:border-neutral-900"
                placeholder="Write the full foundation story here..."
              />
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : status === "published" ? "Publish article" : "Save draft"}
            </Button>

            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="min-h-11 rounded-xl border border-neutral-300 px-5 text-sm font-medium hover:bg-neutral-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="admin-card-list">
        {loading ? (
          <div className="admin-panel p-6">Loading foundation articles...</div>
        ) : posts.length === 0 ? (
          <div className="admin-panel p-8">
            <h2 className="text-lg font-semibold">No foundation articles yet.</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Create your first article to get started.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <article key={post.id}>
              {post.cover_image ? (
                <img src={post.cover_image} alt="" loading="lazy" />
              ) : (
                <div className="flex min-h-24 items-center justify-center bg-neutral-100 px-3 text-xs text-neutral-500">
                  No cover image
                </div>
              )}

              <div className="min-w-0">
                <span>{post.status}</span>
                <h2 className="break-words">{post.title}</h2>
                <p className="break-words">/foundation/news/{post.slug}</p>
              </div>

              <div className="event-admin-actions">
                {post.status === "published" && (
                  <a
                    href={`/foundation/news/${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2"
                  >
                    <Eye size={17} />
                    View
                  </a>
                )}

                <button type="button" onClick={() => startEdit(post)}>
                  <Edit3 size={17} />
                  Edit
                </button>

                <button type="button" onClick={() => void changeStatus(post)}>
                  {post.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  )
}
