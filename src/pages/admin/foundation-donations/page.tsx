
import { useCallback, useEffect, useMemo, useState } from "react"
import { supabase } from "../../../lib/supabase"

type PaymentStatus = "pending" | "verified" | "rejected"

type Campaign = {
  title: string
  currency: string
}

type Donation = {
  id: string
  campaign_id: string | null
  donor_name: string
  donor_email: string | null
  donor_phone: string | null
  amount: number
  reference: string
  payment_method: string
  payment_status: PaymentStatus
  payment_proof: string | null
  donor_message: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
  campaign: Campaign | null
}

type StatusFilter = "all" | PaymentStatus

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

const formatMoney = (amount: number, currency = "GHS") => {
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${currency} ${Number(amount).toLocaleString()}`
  }
}

const statusStyles: Record<PaymentStatus, string> = {
  pending: "border-amber-400/20 !bg-amber-400/10 !text-amber-400",
  verified: "border-emerald-400/20 !bg-emerald-400/10 !text-emerald-400",
  rejected: "border-red-400/20 !bg-red-400/10 !text-red-400",
}

const panelClass =
  "rounded-xl border border-white/10 !bg-[#151515] p-5 text-white shadow-sm sm:p-6"

const buttonBase =
  "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40"

export default function AdminFoundationDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<StatusFilter>("all")
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [notice, setNotice] = useState("")
  const [error, setError] = useState("")

  const fetchDonations = useCallback(async () => {
    setLoading(true)
    setError("")

    const { data, error: fetchError } = await supabase
      .from("foundation_donations")
      .select(`
        *,
        campaign:foundation_campaigns (
          title,
          currency
        )
      `)
      .order("created_at", { ascending: false })

    if (fetchError) {
      setError(fetchError.message)
      setDonations([])
    } else {
      setDonations((data || []) as Donation[])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchDonations()
  }, [fetchDonations])

  const filteredDonations = useMemo(() => {
    const query = search.trim().toLowerCase()

    return donations.filter((donation) => {
      const matchesStatus =
        filter === "all" || donation.payment_status === filter

      const matchesSearch =
        !query ||
        donation.donor_name.toLowerCase().includes(query) ||
        (donation.donor_email || "").toLowerCase().includes(query) ||
        (donation.donor_phone || "").toLowerCase().includes(query) ||
        donation.reference.toLowerCase().includes(query) ||
        (donation.campaign?.title || "").toLowerCase().includes(query)

      return matchesStatus && matchesSearch
    })
  }, [donations, filter, search])

  const summary = useMemo(() => {
    const pending = donations.filter(
      (item) => item.payment_status === "pending"
    ).length

    const verified = donations.filter(
      (item) => item.payment_status === "verified"
    )

    const rejected = donations.filter(
      (item) => item.payment_status === "rejected"
    ).length

    const totals: Record<string, number> = {}

    verified.forEach((item) => {
      const currency = item.campaign?.currency || "GHS"
      totals[currency] = (totals[currency] || 0) + Number(item.amount)
    })

    return {
      total: donations.length,
      pending,
      verified: verified.length,
      rejected,
      totals,
    }
  }, [donations])

  const updateDonationStatus = async (
    donation: Donation,
    newStatus: PaymentStatus
  ) => {
    if (donation.payment_status === newStatus) return

    const action =
      newStatus === "verified"
        ? "verify this donation"
        : "reject this donation"

    if (!window.confirm(`Are you sure you want to ${action}?`)) return

    setUpdatingId(donation.id)
    setNotice("")
    setError("")

    const now = new Date().toISOString()

    const { error: updateError } = await supabase
      .from("foundation_donations")
      .update({
        payment_status: newStatus,
        verified_at: newStatus === "verified" ? now : null,
        updated_at: now,
      })
      .eq("id", donation.id)

    if (updateError) {
      setError(updateError.message)
    } else {
      setNotice(
        newStatus === "verified"
          ? "Donation successfully verified."
          : "Donation marked as rejected."
      )

      if (selectedDonation?.id === donation.id) {
        setSelectedDonation({
          ...donation,
          payment_status: newStatus,
          verified_at: newStatus === "verified" ? now : null,
          updated_at: now,
        })
      }

      await fetchDonations()
    }

    setUpdatingId(null)
  }

  const exportDonations = () => {
    const headers = [
      "Reference",
      "Donor",
      "Email",
      "Phone",
      "Campaign",
      "Amount",
      "Currency",
      "Payment Status",
      "Date",
    ]

    const rows = filteredDonations.map((item) => [
      item.reference,
      item.donor_name,
      item.donor_email || "",
      item.donor_phone || "",
      item.campaign?.title || "General donation",
      item.amount,
      item.campaign?.currency || "GHS",
      item.payment_status,
      formatDate(item.created_at),
    ])

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "foundation-donations.csv"
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <main className="admin-page !bg-[#090909] !text-[#f3f0e8] space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] !text-[#d6aa33]">
            Foundation management
          </p>

          <h1 className="admin-title !text-white">Donations</h1>

          <p className="mt-2 text-sm !text-white/50">
            Manage contributions and verify incoming bank transfers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchDonations}
            disabled={loading}
            className={`${buttonBase} border border-white/15 !bg-[#151515] !text-white/80 hover:!bg-[#222222]`}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            onClick={exportDonations}
            disabled={filteredDonations.length === 0}
            className={`${buttonBase} !bg-[#d6aa33] !text-black hover:!bg-[#f1c64d]`}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Notifications */}
      {notice && (
        <div className="rounded-lg border border-emerald-400/20 !bg-emerald-400/10 px-4 py-3 text-sm !text-emerald-400">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-400/20 !bg-red-400/10 px-4 py-3 text-sm !text-red-400">
          {error}
        </div>
      )}

      {/* Summary */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total submissions"
          value={summary.total.toString()}
        />

        <SummaryCard
          label="Awaiting verification"
          value={summary.pending.toString()}
          accent="!text-amber-400"
        />

        <SummaryCard
          label="Verified donations"
          value={summary.verified.toString()}
          accent="!text-emerald-400"
        />

        <SummaryCard
          label="Rejected donations"
          value={summary.rejected.toString()}
          accent="!text-red-400"
        />
      </section>

      {/* Verified totals */}
      <section className={`${panelClass} space-y-4`}>
        <div>
          <h2 className="text-base font-semibold !text-white">
            Verified funds raised
          </h2>

          <p className="mt-1 text-xs !text-white/40">
            Only confirmed donations are included. Totals are grouped by currency.
          </p>
        </div>

        {Object.keys(summary.totals).length === 0 ? (
          <p className="text-sm !text-white/40">
            No verified donations yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(summary.totals).map(([currency, amount]) => (
              <div
                key={currency}
                className="rounded-xl border border-white/10 !bg-[#090909] p-4"
              >
                <p className="text-xs uppercase tracking-wider !text-white/40">
                  {currency} received
                </p>

                <p className="mt-2 text-2xl font-semibold !text-[#f1c64d]">
                  {formatMoney(amount, currency)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Donation records */}
      <section className={`${panelClass} space-y-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold !text-white">
              Donation records
            </h2>

            <p className="mt-1 text-xs !text-white/40">
              {filteredDonations.length} record
              {filteredDonations.length === 1 ? "" : "s"} found
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search donor, campaign or reference..."
            className="w-full rounded-lg border border-white/15 !bg-[#090909] px-4 py-3 text-sm !text-white outline-none placeholder:!text-white/30 focus:border-[#d6aa33] lg:max-w-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {(["all", "pending", "verified", "rejected"] as StatusFilter[]).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-full border px-4 py-2 text-xs font-medium capitalize transition ${
                  filter === status
                    ? "!border-[#d6aa33] !bg-[#d6aa33] !text-black"
                    : "border-white/15 !bg-[#090909] !text-white/60 hover:border-white/30 hover:!text-white"
                }`}
              >
                {status === "all" ? "All donations" : status}
              </button>
            )
          )}
        </div>

        {/* Records */}
        {loading ? (
          <div className="py-16 text-center text-sm !text-white/40">
            Loading donation records...
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 !bg-[#090909] py-16 text-center">
            <p className="text-sm !text-white/60">No donations found.</p>
            <p className="mt-2 text-xs !text-white/35">
              Try another search or filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[850px] !bg-[#151515] text-left !text-white">
              <thead className="!bg-[#090909]">
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-wider !text-white/40">
                  <th className="px-4 py-4 font-medium">Donor</th>
                  <th className="px-4 py-4 font-medium">Campaign</th>
                  <th className="px-4 py-4 font-medium">Amount</th>
                  <th className="px-4 py-4 font-medium">Reference</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Date</th>
                  <th className="px-4 py-4 text-right font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="!bg-[#151515]">
                {filteredDonations.map((donation) => (
                  <tr
                    key={donation.id}
                    className="border-b border-white/[0.07] !bg-[#151515] transition hover:!bg-[#202020]"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium !text-white">
                        {donation.donor_name}
                      </p>

                      <p className="mt-1 text-xs !text-white/40">
                        {donation.donor_email ||
                          donation.donor_phone ||
                          "No contact"}
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="max-w-[180px] truncate text-sm !text-white/70">
                        {donation.campaign?.title || "General donation"}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold !text-[#f1c64d]">
                      {formatMoney(
                        Number(donation.amount),
                        donation.campaign?.currency || "GHS"
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-mono text-xs !text-white/60">
                        {donation.reference}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={donation.payment_status} />
                    </td>

                    <td className="px-4 py-4 text-xs !text-white/45">
                      {formatDate(donation.created_at)}
                    </td>

                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className={`${buttonBase} border border-white/15 !bg-transparent !px-3 !py-2 text-xs !text-white/70 hover:!border-[#d6aa33] hover:!text-[#f1c64d]`}
                      >
                        View details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Donation details modal */}
      {selectedDonation && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto !bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedDonation(null)}
        >
          <div
            className="my-auto w-full max-w-xl rounded-2xl border border-white/10 !bg-[#151515] p-6 !text-white shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] !text-[#d6aa33]">
                  Donation details
                </p>

                <h2 className="mt-2 text-xl font-semibold !text-white">
                  {selectedDonation.donor_name}
                </h2>

                <p className="mt-1 font-mono text-xs !text-white/40">
                  {selectedDonation.reference}
                </p>
              </div>

              <button
                onClick={() => setSelectedDonation(null)}
                className={`${buttonBase} border border-white/10 !bg-[#090909] !text-white/60 hover:!bg-[#222222]`}
              >
                Close
              </button>
            </div>

            <div className="my-6 rounded-xl border border-[#d6aa33]/20 !bg-[#d6aa33]/[0.06] p-5">
              <p className="text-xs !text-white/50">Donation amount</p>

              <p className="mt-2 text-3xl font-semibold !text-[#f1c64d]">
                {formatMoney(
                  Number(selectedDonation.amount),
                  selectedDonation.campaign?.currency || "GHS"
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <DetailItem
                label="Donor name"
                value={selectedDonation.donor_name}
              />

              <DetailItem
                label="Email"
                value={selectedDonation.donor_email || "Not provided"}
              />

              <DetailItem
                label="Phone"
                value={selectedDonation.donor_phone || "Not provided"}
              />

              <DetailItem
                label="Campaign"
                value={selectedDonation.campaign?.title || "General donation"}
              />

              <DetailItem
                label="Payment method"
                value={selectedDonation.payment_method.replace(/_/g, " ")}
              />

              <DetailItem
                label="Submitted"
                value={formatDate(selectedDonation.created_at)}
              />

              <DetailItem
                label="Payment status"
                value={selectedDonation.payment_status}
              />

              <DetailItem
                label="Verified at"
                value={
                  selectedDonation.verified_at
                    ? formatDate(selectedDonation.verified_at)
                    : "Not verified"
                }
              />
            </div>

            {selectedDonation.donor_message && (
              <div className="mt-5 rounded-lg border border-white/10 !bg-[#090909] p-4">
                <p className="text-[10px] uppercase tracking-wider !text-white/40">
                  Donor message
                </p>

                <p className="mt-2 text-sm leading-relaxed !text-white/70">
                  {selectedDonation.donor_message}
                </p>
              </div>
            )}

            {selectedDonation.payment_proof && (
              <div className="mt-5 rounded-lg border border-white/10 !bg-[#090909] p-4">
                <p className="mb-2 text-[10px] uppercase tracking-wider !text-white/40">
                  Payment proof
                </p>

                <a
                  href={selectedDonation.payment_proof}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm !text-[#f1c64d] underline"
                >
                  View submitted payment proof
                </a>
              </div>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {selectedDonation.payment_status !== "verified" && (
                <button
                  onClick={() =>
                    updateDonationStatus(selectedDonation, "verified")
                  }
                  disabled={updatingId === selectedDonation.id}
                  className={`${buttonBase} flex-1 !bg-emerald-500 !text-black hover:!bg-emerald-400`}
                >
                  {updatingId === selectedDonation.id
                    ? "Updating..."
                    : "Verify payment"}
                </button>
              )}

              {selectedDonation.payment_status !== "rejected" && (
                <button
                  onClick={() =>
                    updateDonationStatus(selectedDonation, "rejected")
                  }
                  disabled={updatingId === selectedDonation.id}
                  className={`${buttonBase} flex-1 border border-red-400/30 !bg-transparent !text-red-400 hover:!bg-red-400/10`}
                >
                  Reject payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function SummaryCard({
  label,
  value,
  accent = "!text-white",
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-white/10 !bg-[#151515] p-5 shadow-sm">
      <p className="text-xs !text-white/45">{label}</p>
      <p className={`mt-3 text-3xl font-semibold ${accent}`}>{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-semibold capitalize ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider !text-white/35">
        {label}
      </p>

      <p className="mt-1 break-words text-sm capitalize !text-white/80">
        {value}
      </p>
    </div>
  )
}
