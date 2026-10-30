import { useEffect, useState, type ReactNode, type FormEvent } from "react"
import {
  Edit3,
  Eye,
  Plus,
  Save,
  Trash2,
  X,
  Target,
  Heart,
  ImagePlus,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type Campaign = {
  id: string
  title: string
  slug: string
  description: string | null
  goal_amount: number | null
  currency: string
  cover_image: string | null
  status: "draft" | "published" | "completed" | "cancelled"
  start_date: string | null
  end_date: string | null
  created_at: string
}

type DonationTotal = {
  campaign_id: string | null
  amount: number
}

const BUCKET = "foundation-campaign-images"
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const emptyForm = {
  title: "",
  slug: "",
  description: "",
  goal_amount: "0",
  currency: "GHS",
  cover_image: "",
  start_date: "",
  end_date: "",
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

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${amount.toLocaleString()}`
  }
}

function SummaryCard({
  label,
  value,
}: {
  label: string
  value: ReactNode
}) {
  return (
    <div className={panelClass}>
      <p className="text-sm !text-neutral-400">{label}</p>
      <h2 className="mt-2 text-2xl font-semibold !text-white">{value}</h2>
    </div>
  )
}

function StatusBadge({ status }: { status: Campaign["status"] }) {
  const styles: Record<Campaign["status"], string> = {
    draft: "border-white/15 bg-white/5 text-neutral-300",
    published: "border-green-500/20 bg-green-500/10 text-green-300",
    completed: "border-blue-500/20 bg-blue-500/10 text-blue-300",
    cancelled: "border-red-500/20 bg-red-500/10 text-red-300",
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs capitalize ${styles[status]}`}
    >
      {status}
    </span>
  )
}

function getStoragePath(image: string | null) {
  if (!image) return null

  const marker = `/storage/v1/object/public/${BUCKET}/`
  const index = image.indexOf(marker)

  if (index === -1) return null

  return decodeURIComponent(image.slice(index + marker.length))
}

export default function AdminFoundationCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [donationTotals, setDonationTotals] = useState<
    Record<string, number>
  >({})
  const [form, setForm] = useState(emptyForm)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingOriginalImage, setEditingOriginalImage] = useState<
    string | null
  >(null)

  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState("")

  const [status, setStatus] = useState<
    "draft" | "published" | "completed" | "cancelled"
  >("draft")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function loadCampaigns() {
    setLoading(true)

    const [campaignResult, donationResult] = await Promise.all([
      supabase
        .from("foundation_campaigns")
        .select("*")
        .order("created_at", { ascending: false }),

      supabase
        .from("foundation_donations")
        .select("campaign_id, amount")
        .eq("payment_status", "verified"),
    ])

    if (campaignResult.error) {
      setError(campaignResult.error.message)
      setLoading(false)
      return
    }

    if (donationResult.error) {
      setError(donationResult.error.message)
      setLoading(false)
      return
    }

    const totals: Record<string, number> = {}

    ;((donationResult.data ?? []) as DonationTotal[]).forEach((donation) => {
      if (!donation.campaign_id) return

      totals[donation.campaign_id] =
        (totals[donation.campaign_id] ?? 0) +
        Number(donation.amount || 0)
    })

    setCampaigns((campaignResult.data ?? []) as Campaign[])
    setDonationTotals(totals)
    setError("")
    setLoading(false)
  }

  useEffect(() => {
    void loadCampaigns()
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
    setShowForm(false)
    setEditingOriginalImage(null)
  }

  function startNewCampaign() {
    clearCoverPreview()
    setCoverFile(null)
    setEditingOriginalImage(null)
    setForm(emptyForm)
    setEditingId(null)
    setStatus("draft")
    setMessage("")
    setError("")
    setShowForm(true)
  }

  function startEdit(campaign: Campaign) {
    clearCoverPreview()
    setCoverFile(null)

    setForm({
      title: campaign.title,
      slug: campaign.slug,
      description: campaign.description ?? "",
      goal_amount: String(campaign.goal_amount ?? 0),
      currency: campaign.currency || "GHS",
      cover_image: campaign.cover_image ?? "",
      start_date: campaign.start_date ?? "",
      end_date: campaign.end_date ?? "",
    })

    setEditingId(campaign.id)
    setEditingOriginalImage(campaign.cover_image)
    setCoverPreview(campaign.cover_image ?? "")
    setStatus(campaign.status)
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

    const { error } = await supabase.storage.from(BUCKET).remove([path])

    if (error) {
      console.error("Could not remove campaign image:", error.message)
    }
  }

  async function saveCampaign(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setSaving(true)
    setMessage("")
    setError("")

    let uploadedImagePath: string | null = null
    let coverImageUrl = form.cover_image.trim() || null

    const slug = makeSlug(form.slug || form.title)
    const goal = Number(form.goal_amount)

    if (!form.title.trim()) {
      setError("Please enter a campaign title.")
      setSaving(false)
      return
    }

    if (!slug) {
      setError("Please enter a valid campaign title.")
      setSaving(false)
      return
    }

    if (!Number.isFinite(goal) || goal < 0) {
      setError("Enter a valid fundraising goal.")
      setSaving(false)
      return
    }

    if (
      form.start_date &&
      form.end_date &&
      form.end_date < form.start_date
    ) {
      setError("The end date cannot be earlier than the start date.")
      setSaving(false)
      return
    }

    try {
      // Upload a newly selected image before saving the campaign.
      if (coverFile) {
        const uploaded = await uploadCoverImage(coverFile)
        uploadedImagePath = uploaded.path
        coverImageUrl = uploaded.url
      }

      const payload = {
        title: form.title.trim(),
        slug,
        description: form.description.trim() || null,
        goal_amount: goal,
        currency: form.currency,
        cover_image: coverImageUrl,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        status,
        updated_at: new Date().toISOString(),
      }

      const result = editingId
        ? await supabase
            .from("foundation_campaigns")
            .update(payload)
            .eq("id", editingId)
            .select("id")
            .maybeSingle()
        : await supabase
            .from("foundation_campaigns")
            .insert(payload)
            .select("id")
            .maybeSingle()

      if (result.error) {
        // Remove the newly uploaded image if the database save failed.
        if (uploadedImagePath) {
          await supabase.storage
            .from(BUCKET)
            .remove([uploadedImagePath])
        }

        setError(
          result.error.code === "23505"
            ? "This campaign URL slug is already in use."
            : result.error.message
        )
      } else if (!result.data) {
        if (uploadedImagePath) {
          await supabase.storage
            .from(BUCKET)
            .remove([uploadedImagePath])
        }

        setError("Campaign was not saved. Check your Supabase permissions.")
      } else {
        // Remove the old image only after the new campaign image is saved.
        if (coverFile && editingOriginalImage) {
          await removeStoredImage(editingOriginalImage)
        }

        setMessage(editingId ? "Campaign updated." : "Campaign created.")
        closeForm()
        await loadCampaigns()
      }
    } catch (uploadError) {
      if (uploadedImagePath) {
        await supabase.storage.from(BUCKET).remove([uploadedImagePath])
      }

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload the campaign image."
      )
    }

    setSaving(false)
  }

  async function toggleStatus(campaign: Campaign) {
    const nextStatus =
      campaign.status === "published" ? "draft" : "published"

    setError("")
    setMessage("")

    const { data, error } = await supabase
      .from("foundation_campaigns")
      .update({
        status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", campaign.id)
      .select("id")
      .maybeSingle()

    if (error) {
      setError(error.message)
    } else if (!data) {
      setError("Could not update campaign status.")
    } else {
      setMessage(
        nextStatus === "published"
          ? "Campaign published."
          : "Campaign moved to drafts."
      )
      await loadCampaigns()
    }
  }

  async function deleteCampaign(campaign: Campaign) {
    const confirmed = window.confirm(
      `Delete "${campaign.title}"? Existing donations will remain in the database but may no longer be linked to this campaign.`
    )

    if (!confirmed) return

    setDeletingId(campaign.id)
    setError("")
    setMessage("")

    const { error } = await supabase
      .from("foundation_campaigns")
      .delete()
      .eq("id", campaign.id)

    if (error) {
      setError(error.message)
    } else {
      // Remove the campaign image after successful database deletion.
      await removeStoredImage(campaign.cover_image)

      setMessage("Campaign deleted.")
      await loadCampaigns()
    }

    setDeletingId(null)
  }

  const publishedCount = campaigns.filter(
    (campaign) => campaign.status === "published"
  ).length

  // Keep currencies separate instead of adding unlike currencies together.
  const totalsByCurrency: Record<string, number> = {}

  campaigns.forEach((campaign) => {
    const currency = campaign.currency || "GHS"
    totalsByCurrency[currency] =
      (totalsByCurrency[currency] ?? 0) +
      (donationTotals[campaign.id] ?? 0)
  })

  const currencySummary = Object.entries(totalsByCurrency)
    .filter(([, amount]) => amount > 0)
    .map(([currency, amount]) => formatMoney(amount, currency))

  return (
    <main className="space-y-6 !bg-[#090909] !text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-sm !text-[#d6aa33]">Gong Foundation</span>
          <h1 className="mt-1 text-2xl font-bold !text-white">
            FOUNDATION CAMPAIGNS
          </h1>
          <p className="mt-1 text-sm !text-neutral-400">
            Manage fundraising initiatives and campaign progress.
          </p>
        </div>

        <Button onClick={startNewCampaign}>
          <Plus size={17} />
          New campaign
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
        <SummaryCard label="Total campaigns" value={campaigns.length} />

        <SummaryCard label="Published campaigns" value={publishedCount} />

        <SummaryCard
          label="Verified donations"
          value={
            currencySummary.length > 0 ? (
              <span className="flex flex-col gap-1 text-lg">
                {currencySummary.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </span>
            ) : (
              "—"
            )
          }
        />
      </div>

      {showForm && (
        <form onSubmit={saveCampaign} className={`${panelClass} space-y-5`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-sm !text-[#d6aa33]">
                {editingId ? "Edit campaign" : "New campaign"}
              </span>
              <h2 className="mt-1 text-xl font-semibold !text-white">
                Campaign details
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
              Campaign title *
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
                placeholder="Support emerging creatives"
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
                placeholder="support-emerging-creatives"
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
                placeholder="Explain the purpose of this campaign..."
              />
            </label>

            {/* Campaign image upload */}
            <div className={`${labelClass} sm:col-span-2`}>
              <span>Campaign cover image</span>

              <label
                htmlFor="campaign-cover"
                className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 !bg-[#090909] p-5 text-center transition hover:border-[#d6aa33]"
              >
                <ImagePlus size={28} className="text-[#d6aa33]" />

                <span className="font-medium !text-white">
                  {coverFile ? "Choose another image" : "Select campaign image"}
                </span>

                <span className="text-xs !text-neutral-500">
                  JPEG, PNG or WebP · Maximum 5MB
                </span>

                <input
                  id="campaign-cover"
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
                    alt="Campaign cover preview"
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
                    aria-label="Remove campaign image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <label className={labelClass}>
              Fundraising goal *
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.goal_amount}
                onChange={(e) =>
                  setForm({ ...form, goal_amount: e.target.value })
                }
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              Currency
              <select
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
                className={inputClass}
              >
                <option value="GHS">GHS — Ghana Cedi</option>
                <option value="NGN">NGN — Nigerian Naira</option>
                <option value="USD">USD — US Dollar</option>
              </select>
            </label>

            <label className={labelClass}>
              Start date
              <input
                type="date"
                value={form.start_date}
                onChange={(e) =>
                  setForm({ ...form, start_date: e.target.value })
                }
                className={inputClass}
              />
            </label>

            <label className={labelClass}>
              End date
              <input
                type="date"
                min={form.start_date || undefined}
                value={form.end_date}
                onChange={(e) =>
                  setForm({ ...form, end_date: e.target.value })
                }
                className={inputClass}
              />
            </label>

            <label className={`${labelClass} sm:col-span-2`}>
              Campaign status
              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as
                      | "draft"
                      | "published"
                      | "completed"
                      | "cancelled"
                  )
                }
                className={inputClass}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={saving}>
              <Save size={17} />
              {saving ? "Saving..." : "Save campaign"}
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
          <Target size={19} className="text-[#d6aa33]" />
          <h2 className="text-lg font-semibold !text-white">
            All campaigns
          </h2>
        </div>

        {loading ? (
          <div className={`${panelClass} !text-neutral-300`}>
            Loading campaigns...
          </div>
        ) : campaigns.length === 0 ? (
          <div className={panelClass}>
            <h2 className="text-lg font-semibold !text-white">
              No campaigns yet.
            </h2>
            <p className="mt-2 text-sm !text-neutral-400">
              Create your first fundraising campaign.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const raised = donationTotals[campaign.id] ?? 0
              const goal = Number(campaign.goal_amount ?? 0)
              const percentage =
                goal > 0 ? Math.min((raised / goal) * 100, 100) : 0

              return (
                <article
                  key={campaign.id}
                  className={`${panelClass} grid gap-4 sm:grid-cols-[120px_1fr_auto] sm:items-center`}
                >
                  {campaign.cover_image ? (
                    <img
                      src={campaign.cover_image}
                      alt=""
                      loading="lazy"
                      className="h-28 w-full rounded-xl object-cover sm:w-[120px]"
                    />
                  ) : (
                    <div className="flex h-28 items-center justify-center rounded-xl bg-white/5 !text-neutral-500">
                      <Heart size={25} />
                    </div>
                  )}

                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={campaign.status} />
                    </div>

                    <h3 className="break-words font-semibold !text-white">
                      {campaign.title}
                    </h3>

                    <p className="break-all text-xs !text-neutral-500">
                      /foundation/campaigns/{campaign.slug}
                    </p>

                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                      <p className="!text-neutral-300">
                        Raised:{" "}
                        <span className="font-semibold !text-white">
                          {formatMoney(raised, campaign.currency)}
                        </span>
                      </p>

                      <p className="!text-neutral-400">
                        Goal: {formatMoney(goal, campaign.currency)}
                      </p>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-[#d6aa33]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <p className="text-xs !text-neutral-500">
                      {percentage.toFixed(1)}% of fundraising goal
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {campaign.status === "published" && (
                      <a
                        href={`/foundation/campaigns/${campaign.slug}`}
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
                      onClick={() => startEdit(campaign)}
                      className="inline-flex items-center gap-2 text-sm !text-neutral-300 hover:!text-[#d6aa33]"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => void toggleStatus(campaign)}
                      className="text-sm !text-[#d6aa33] hover:!text-white"
                    >
                      {campaign.status === "published"
                        ? "Unpublish"
                        : "Publish"}
                    </button>

                    <button
                      type="button"
                      disabled={deletingId === campaign.id}
                      onClick={() => void deleteCampaign(campaign)}
                      className="inline-flex items-center gap-2 text-sm !text-red-400 hover:!text-red-300 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === campaign.id ? "Deleting..." : "Delete"}
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