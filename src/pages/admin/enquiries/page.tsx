
import { useEffect, useMemo, useState } from "react"
import {
  Inbox,
  Search,
  RefreshCw,
  X,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Clock3,
  Send,
  Loader2,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"

type EnquiryStatus = "new" | "contacted" | "resolved" | "archived"

type EquipmentStatus =
  | "new"
  | "contacted"
  | "quoted"
  | "approved"
  | "completed"
  | "cancelled"

type Enquiry = {
  id: string
  source: "enquiry" | "equipment"
  type: string
  customer_name: string
  customer_email: string | null
  customer_phone: string | null
  subject: string | null
  message: string | null
  status: string
  internal_notes?: string | null
  created_at: string
  equipment_name?: string
  quantity?: number
  rental_start?: string | null
  rental_end?: string | null
}

const enquiryStatuses: EnquiryStatus[] = [
  "new",
  "contacted",
  "resolved",
  "archived",
]

const equipmentStatuses: EquipmentStatus[] = [
  "new",
  "contacted",
  "quoted",
  "approved",
  "completed",
  "cancelled",
]

const statusStyles: Record<string, string> = {
  new: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  contacted: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  quoted: "bg-purple-400/10 text-purple-400 border-purple-400/20",
  approved: "bg-green-400/10 text-green-400 border-green-400/20",
  resolved: "bg-green-400/10 text-green-400 border-green-400/20",
  completed: "bg-green-400/10 text-green-400 border-green-400/20",
  archived: "bg-white/5 text-white/50 border-white/10",
  cancelled: "bg-red-400/10 text-red-400 border-red-400/20",
}

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const titleCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [selected, setSelected] = useState<Enquiry | null>(null)
  const [filter, setFilter] = useState("all")
  const [search, setSearch] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  const loadEnquiries = async () => {
    setLoading(true)
    setError("")

    try {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (!sessionData.session) {
        throw new Error("Your admin session has expired. Please log in again.")
      }

      const [enquiryResult, equipmentResult] = await Promise.all([
        supabase
          .from("enquiries")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("equipment_quote_requests")
          .select("*")
          .order("created_at", { ascending: false }),
      ])

      if (enquiryResult.error) throw enquiryResult.error
      if (equipmentResult.error) throw equipmentResult.error

      const generalEnquiries: Enquiry[] = (enquiryResult.data || []).map(
        (item) => ({
          id: item.id,
          source: "enquiry",
          type: item.enquiry_type || "general",
          customer_name: item.customer_name,
          customer_email: item.customer_email,
          customer_phone: item.customer_phone,
          subject: item.subject,
          message: item.message,
          status: item.status,
          internal_notes: item.internal_notes,
          created_at: item.created_at,
        }),
      )

      const equipmentEnquiries: Enquiry[] = (equipmentResult.data || []).map(
        (item) => ({
          id: item.id,
          source: "equipment",
          type: "equipment",
          customer_name: item.customer_name,
          customer_email: item.customer_email,
          customer_phone: item.customer_phone,
          subject: `Equipment quote: ${item.equipment_name}`,
          message: item.message,
          status: item.status,
          created_at: item.created_at,
          equipment_name: item.equipment_name,
          quantity: item.quantity,
          rental_start: item.rental_start,
          rental_end: item.rental_end,
        }),
      )

      const combined = [...generalEnquiries, ...equipmentEnquiries].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      )

      setEnquiries(combined)

      setSelected((current) => {
        if (!current) return null

        return (
          combined.find(
            (item) => item.id === current.id && item.source === current.source,
          ) || null
        )
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load enquiries.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEnquiries()
  }, [])

  useEffect(() => {
    setNotes(selected?.internal_notes || "")
  }, [selected?.id, selected?.source])

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter((item) => {
      const matchesFilter = filter === "all" || item.type === filter

      const searchText = [
        item.customer_name,
        item.customer_email,
        item.customer_phone,
        item.subject,
        item.message,
        item.equipment_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return matchesFilter && searchText.includes(search.toLowerCase())
    })
  }, [enquiries, filter, search])

  const updateStatus = async (item: Enquiry, status: string) => {
    setSaving(true)
    setError("")

    const table =
      item.source === "equipment"
        ? "equipment_quote_requests"
        : "enquiries"

    const { error: updateError } = await supabase
      .from(table)
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", item.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setEnquiries((current) =>
      current.map((enquiry) =>
        enquiry.id === item.id && enquiry.source === item.source
          ? { ...enquiry, status }
          : enquiry,
      ),
    )

    setSelected((current) =>
      current &&
      current.id === item.id &&
      current.source === item.source
        ? { ...current, status }
        : current,
    )
  }

  const saveNotes = async () => {
    if (!selected || selected.source !== "enquiry") return

    setSaving(true)
    setError("")

    const { error: updateError } = await supabase
      .from("enquiries")
      .update({
        internal_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id)

    setSaving(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setEnquiries((current) =>
      current.map((item) =>
        item.id === selected.id && item.source === "enquiry"
          ? { ...item, internal_notes: notes }
          : item,
      ),
    )

    setSelected((current) =>
      current ? { ...current, internal_notes: notes } : current,
    )
  }

  const counts = {
    all: enquiries.length,
    contact: enquiries.filter((item) => item.type === "contact").length,
    property: enquiries.filter((item) => item.type === "property").length,
    equipment: enquiries.filter((item) => item.type === "equipment").length,
    general: enquiries.filter((item) => item.type === "general").length,
  }

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "contact", label: "Contact", count: counts.contact },
    { id: "property", label: "Properties", count: counts.property },
    { id: "equipment", label: "Equipment", count: counts.equipment },
    { id: "general", label: "General", count: counts.general },
  ]

  return (
    <main className="admin-page space-y-6 !bg-[#090909] !text-[#f3f0e8]">
      <div className="admin-title">
        <div>
          <span>Customer desk</span>
          <h1>ENQUIRIES</h1>
          <p>
            Manage customer messages, property enquiries and equipment quote
            requests.
          </p>
        </div>

        <button
          onClick={loadEnquiries}
          disabled={loading}
          className="inline-flex items-center gap-2 border border-white/15 bg-[#151515] px-4 py-3 text-sm text-[#1d1c1a] transition hover:border-[#d6aa33] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="border border-red-400/30 bg-red-950 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Total enquiries", value: counts.all, icon: Inbox },
          {
            label: "New enquiries",
            value: enquiries.filter((item) => item.status === "new").length,
            icon: Clock3,
          },
          {
            label: "Contact enquiries",
            value: counts.contact,
            icon: MessageSquare,
          },
          {
            label: "Equipment quotes",
            value: counts.equipment,
            icon: FileText,
          },
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="border border-white/10 !bg-[#151515] p-4 text-white"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs text-white/50">{stat.label}</span>
                <Icon size={17} className="text-[#d6aa33]" />
              </div>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex items-center gap-2 border px-4 py-2 text-sm transition ${
                filter === tab.id
                  ? "border-[#d6aa33] !bg-[#d6aa33] !text-black"
                  : "border-white/10 !bg-[#151515] !text-white/60 hover:border-white/30 hover:!text-white"
              }`}
            >
              {tab.label}
              <span className="text-xs opacity-70">{tab.count}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <Search
            size={17}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, email, phone or message..."
            className="w-full border border-white/10 !bg-[#151515] py-3 pl-11 pr-4 text-sm !text-white outline-none placeholder:!text-white/30 focus:border-[#d6aa33]"
          />
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <section className="admin-panel min-h-[400px] overflow-hidden !bg-[#151515] !text-[#f3f0e8]">
          <div className="flex items-center justify-between border-b border-white/10 bg-[#151515] p-4">
            <h2 className="text-sm font-semibold text-white">
              INBOX ({filteredEnquiries.length})
            </h2>
            <span className="text-xs text-white/40">Latest first</span>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center gap-3 bg-[#151515] text-sm text-white/50">
              <Loader2 size={18} className="animate-spin" />
              Loading enquiries...
            </div>
          ) : filteredEnquiries.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center bg-[#151515] px-6 text-center">
              <Inbox size={36} className="mb-4 text-white/30" />
              <h3 className="font-semibold text-white">No enquiries found</h3>
              <p className="mt-2 text-sm text-white/40">
                New customer submissions will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10 bg-[#151515]">
              {filteredEnquiries.map((item) => (
                <button
                  key={`${item.source}-${item.id}`}
                  onClick={() => setSelected(item)}
                  className={`w-full border-l-2 p-4 text-left transition hover:bg-[#202020] ${
                    selected?.id === item.id &&
                    selected?.source === item.source
                      ? "border-l-[#d6aa33] bg-[#202020]"
                      : "border-l-transparent bg-[#151515]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {item.customer_name}
                      </h3>
                      <p className="mt-1 truncate text-xs text-white/50">
                        {item.subject || item.equipment_name || "No subject"}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 border px-2 py-1 text-[10px] uppercase ${
                        statusStyles[item.status] || "border-white/10 bg-white/5 text-white/60"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-white/40">
                    {item.message || "No message provided."}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#d6aa33]">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-white/30">
                      {formatDate(item.created_at)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="admin-panel min-h-[400px] !bg-[#151515] !text-[#f3f0e8]">
          {!selected ? (
            <div className="flex min-h-[400px] flex-col items-center justify-center bg-[#151515] px-6 text-center">
              <MessageSquare size={36} className="mb-4 text-white/30" />
              <h2 className="font-semibold text-white">SELECT AN ENQUIRY</h2>
              <p className="mt-2 text-sm text-white/40">
                Choose a message from the inbox to view its details.
              </p>
            </div>
          ) : (
            <div className="bg-[#151515]">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 bg-[#151515] p-5">
                <div>
                  <span className="text-xs uppercase tracking-wider text-[#d6aa33]">
                    {selected.type} enquiry
                  </span>
                  <h2 className="mt-2 text-xl font-semibold text-white">
                    {selected.customer_name}
                  </h2>
                  <p className="mt-1 text-xs text-white/40">
                    Received {formatDate(selected.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="bg-[#202020] p-2 text-white/50 hover:text-white"
                  aria-label="Close enquiry"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5 bg-[#151515] p-5">
                <div className="space-y-3">
                  {selected.customer_email && (
                    <a
                      href={`mailto:${selected.customer_email}`}
                      className="flex items-center gap-3 text-sm text-white/70 hover:text-[#d6aa33]"
                    >
                      <Mail size={16} className="text-[#d6aa33]" />
                      {selected.customer_email}
                    </a>
                  )}

                  {selected.customer_phone && (
                    <a
                      href={`tel:${selected.customer_phone}`}
                      className="flex items-center gap-3 text-sm text-white/70 hover:text-[#d6aa33]"
                    >
                      <Phone size={16} className="text-[#d6aa33]" />
                      {selected.customer_phone}
                    </a>
                  )}
                </div>

                {selected.subject && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                      Subject
                    </p>
                    <p className="text-sm text-white">{selected.subject}</p>
                  </div>
                )}

                {selected.source === "equipment" && (
                  <div className="grid grid-cols-2 gap-3 border border-white/10 bg-[#202020] p-4">
                    <div>
                      <p className="text-xs text-white/40">Equipment</p>
                      <p className="mt-1 text-sm text-white">
                        {selected.equipment_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40">Quantity</p>
                      <p className="mt-1 text-sm text-white">
                        {selected.quantity}
                      </p>
                    </div>

                    {selected.rental_start && (
                      <div>
                        <p className="text-xs text-white/40">Rental start</p>
                        <p className="mt-1 text-sm text-white">
                          {selected.rental_start}
                        </p>
                      </div>
                    )}

                    {selected.rental_end && (
                      <div>
                        <p className="text-xs text-white/40">Rental end</p>
                        <p className="mt-1 text-sm text-white">
                          {selected.rental_end}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    Customer message
                  </p>
                  <div className="whitespace-pre-wrap border border-white/10 bg-[#202020] p-4 text-sm leading-6 text-white/70">
                    {selected.message || "No message provided."}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    Update status
                  </p>

                  <select
                    value={selected.status}
                    onChange={(event) =>
                      updateStatus(selected, event.target.value)
                    }
                    disabled={saving}
                    className="w-full border border-white/15 !bg-[#202020] p-3 text-sm !text-white outline-none focus:border-[#d6aa33] disabled:opacity-50"
                  >
                    {(selected.source === "equipment"
                      ? equipmentStatuses
                      : enquiryStatuses
                    ).map((status) => (
                      <option
                        key={status}
                        value={status}
                        className="bg-[#151515] text-white"
                      >
                        {titleCase(status)}
                      </option>
                    ))}
                  </select>
                </div>

                {selected.source === "enquiry" && (
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-white/40">
                        Internal notes
                      </p>
                      <span className="text-[10px] text-white/30">
                        Only visible to admins
                      </span>
                    </div>

                    <textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      rows={4}
                      placeholder="Add follow-up details or notes..."
                      className="w-full resize-y border border-white/10 !bg-[#202020] p-3 text-sm !text-white outline-none placeholder:!text-white/30 focus:border-[#d6aa33]"
                    />

                    <button
                      onClick={saveNotes}
                      disabled={saving}
                      className="mt-3 inline-flex items-center gap-2 !bg-[#d6aa33] px-4 py-2.5 text-sm font-semibold !text-black transition hover:!bg-[#f1c64d] disabled:opacity-50"
                    >
                      <Send size={15} />
                      Save notes
                    </button>
                  </div>
                )}

                {selected.source === "equipment" && (
                  <p className="border border-white/10 bg-[#202020] p-3 text-xs leading-5 text-white/40">
                    Equipment requests use their own status workflow. Internal
                    notes are not enabled for equipment requests yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  )
}
