import { useEffect, useMemo, useState } from "react"
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Ticket,
  X,
} from "lucide-react"
import { supabase } from "../../../lib/supabase"
import { Button } from "../../../components/ui"

type Order = {
  id: string
  event_id: string
  ticket_type_id: string
  order_reference: string
  buyer_name: string
  buyer_email: string
  buyer_phone: string
  quantity: number
  unit_price: number
  total_amount: number
  currency: string
  status: string
  payment_reference: string | null
  payment_receipt_url: string | null
  admin_note: string | null
  reserved_until: string | null
  verified_at: string | null
  created_at: string
}

type EventInfo = {
  id: string
  title: string
}

type TicketType = {
  id: string
  name: string
}

type IssuedTicket = {
  id: string
  ticket_number: string
  ticket_index: number
  attendee_name: string | null
  attendee_email: string | null
  status: string
}

const statusLabels: Record<string, string> = {
  pending_payment: "Pending payment",
  confirmed: "Confirmed",
  rejected: "Rejected",
  cancelled: "Cancelled",
  expired: "Expired",
}

const statusStyles: Record<string, string> = {
  pending_payment: "bg-amber-50 text-amber-700",
  confirmed: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
  cancelled: "bg-gray-100 text-gray-600",
  expired: "bg-orange-50 text-orange-700",
}

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: currency || "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0))

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  })

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<EventInfo[]>([])
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([])
  const [tickets, setTickets] = useState<IssuedTicket[]>([])

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [paymentReference, setPaymentReference] = useState("")
  const [saving, setSaving] = useState(false)

  const [notice, setNotice] = useState("")

  const loadOrders = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    else setLoading(true)

    const [ordersResult, eventsResult, typesResult] = await Promise.all([
      supabase
        .from("ticket_orders")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("events").select("id, title"),
      supabase.from("event_ticket_types").select("id, name"),
    ])

    if (ordersResult.error) {
      console.error(ordersResult.error)
      setNotice(ordersResult.error.message)
    } else {
      setOrders((ordersResult.data || []) as Order[])
    }

    if (!eventsResult.error) setEvents(eventsResult.data || [])
    if (!typesResult.error) setTicketTypes(typesResult.data || [])

    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const eventName = (id: string) =>
    events.find((event) => event.id === id)?.title || "Unknown event"

  const ticketName = (id: string) =>
    ticketTypes.find((type) => type.id === id)?.name || "Unknown ticket"

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase().trim()

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter

      const matchesSearch =
        !term ||
        order.buyer_name?.toLowerCase().includes(term) ||
        order.buyer_email?.toLowerCase().includes(term) ||
        order.order_reference?.toLowerCase().includes(term) ||
        order.buyer_phone?.toLowerCase().includes(term)

      return matchesStatus && matchesSearch
    })
  }, [orders, search, statusFilter])

  const pendingCount = orders.filter(
    (order) => order.status === "pending_payment"
  ).length

  const confirmedCount = orders.filter(
    (order) => order.status === "confirmed"
  ).length

  const confirmedRevenue = orders
    .filter((order) => order.status === "confirmed")
    .reduce((total, order) => total + Number(order.total_amount || 0), 0)

  const openOrder = async (order: Order) => {
    setSelectedOrder(order)
    setAdminNote(order.admin_note || "")
    setPaymentReference(order.payment_reference || "")
    setTickets([])

    if (order.status === "confirmed") {
      const { data, error } = await supabase
        .from("issued_tickets")
        .select("*")
        .eq("order_id", order.id)
        .order("ticket_index", { ascending: true })

      if (!error) setTickets((data || []) as IssuedTicket[])
    }
  }

  const updateOrderStatus = async (
    status: "confirmed" | "rejected"
  ) => {
    if (!selectedOrder) return

    if (selectedOrder.status !== "pending_payment") {
      setNotice("Only pending orders can be verified.")
      return
    }

    if (status === "rejected" && !adminNote.trim()) {
      setNotice("Please add a note explaining why this payment was rejected.")
      return
    }

    setSaving(true)
    setNotice("")

    const updateData: Record<string, unknown> = {
      status,
      admin_note: adminNote.trim() || null,
      payment_reference: paymentReference.trim() || null,
    }

    if (status === "confirmed") {
      updateData.verified_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from("ticket_orders")
      .update(updateData)
      .eq("id", selectedOrder.id)
      .eq("status", "pending_payment")

    if (error) {
      setNotice(error.message)
      setSaving(false)
      return
    }

    await loadOrders(true)

    if (status === "confirmed") {
      const { data, error: ticketError } = await supabase
        .from("issued_tickets")
        .select("*")
        .eq("order_id", selectedOrder.id)
        .order("ticket_index", { ascending: true })

      if (ticketError) {
        setNotice(
          "Order confirmed, but tickets could not be loaded: " +
            ticketError.message
        )
      } else {
        setTickets((data || []) as IssuedTicket[])
        setNotice("Payment confirmed and tickets issued successfully.")
      }
    } else {
      setNotice("Order rejected.")
      setTickets([])
    }

    setSelectedOrder({
      ...selectedOrder,
      status,
      admin_note: adminNote.trim() || null,
      payment_reference: paymentReference.trim() || null,
      verified_at:
        status === "confirmed"
          ? new Date().toISOString()
          : selectedOrder.verified_at,
    })

    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Ticket Orders
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Review ticket purchases and verify bank transfers.
          </p>
        </div>

        <Button onClick={() => loadOrders(true)} disabled={refreshing}>
          <RefreshCw
            size={16}
            className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {notice && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total orders"
          value={orders.length}
          icon={<Ticket size={20} />}
        />
        <SummaryCard
          label="Awaiting verification"
          value={pendingCount}
          icon={<Clock size={20} />}
        />
        <SummaryCard
          label="Confirmed orders"
          value={confirmedCount}
          icon={<CheckCircle2 size={20} />}
        />
        <SummaryCard
          label="Confirmed revenue"
          value={
            confirmedCount
              ? formatMoney(
                  confirmedRevenue,
                  orders.find((order) => order.status === "confirmed")
                    ?.currency || "NGN"
                )
              : "—"
          }
          icon={<Ticket size={20} />}
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search buyer, email or reference..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gray-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none"
          >
            <option value="all">All orders</option>
            <option value="pending_payment">Pending payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading ticket orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Ticket size={30} className="mx-auto mb-3 text-gray-300" />
            <p className="font-medium text-gray-700">No orders found</p>
            <p className="mt-1 text-sm text-gray-500">
              Orders will appear here when visitors book tickets.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Buyer</th>
                  <th className="px-5 py-3 font-medium">Event / Ticket</th>
                  <th className="px-5 py-3 font-medium">Reference</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-gray-900">
                        {order.buyer_name}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {order.buyer_email}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-800">
                        {eventName(order.event_id)}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {ticketName(order.ticket_type_id)} · {order.quantity}{" "}
                        ticket(s)
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-700">
                        {order.order_reference}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-900">
                      {formatMoney(order.total_amount, order.currency)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={order.status} />
                    </td>

                    <td className="px-5 py-4 text-xs text-gray-500">
                      {formatDate(order.created_at)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => openOrder(order)}
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-auto w-full max-w-2xl rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">Order details</h2>
                <p className="mt-1 font-mono text-xs text-gray-500">
                  {selectedOrder.order_reference}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">Order status</p>
                  <div className="mt-2">
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total amount</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900">
                    {formatMoney(
                      selectedOrder.total_amount,
                      selectedOrder.currency
                    )}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Buyer name" value={selectedOrder.buyer_name} />
                <Detail label="Email" value={selectedOrder.buyer_email} />
                <Detail label="Phone" value={selectedOrder.buyer_phone} />
                <Detail
                  label="Event"
                  value={eventName(selectedOrder.event_id)}
                />
                <Detail
                  label="Ticket type"
                  value={ticketName(selectedOrder.ticket_type_id)}
                />
                <Detail
                  label="Quantity"
                  value={String(selectedOrder.quantity)}
                />
                <Detail
                  label="Unit price"
                  value={formatMoney(
                    selectedOrder.unit_price,
                    selectedOrder.currency
                  )}
                />
                <Detail
                  label="Order date"
                  value={formatDate(selectedOrder.created_at)}
                />
                <Detail
                  label="Reservation expires"
                  value={
                    selectedOrder.reserved_until
                      ? formatDate(selectedOrder.reserved_until)
                      : "—"
                  }
                />
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-900">
                  Payment verification
                </h3>

                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Payment reference (optional)
                </label>
                <input
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  disabled={selectedOrder.status !== "pending_payment"}
                  placeholder="Bank transfer reference"
                  className="mb-4 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
                />

                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Admin note
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  disabled={selectedOrder.status !== "pending_payment"}
                  rows={3}
                  placeholder="Add verification notes..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-gray-400 disabled:bg-gray-50"
                />

                {selectedOrder.status === "pending_payment" && (
                  <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <Button
                      onClick={() => updateOrderStatus("rejected")}
                      disabled={saving}
                    >
                      <XCircle size={15} className="mr-2" />
                      Reject payment
                    </Button>

                    <Button
                      onClick={() => updateOrderStatus("confirmed")}
                      disabled={saving}
                    >
                      <CheckCircle2 size={15} className="mr-2" />
                      {saving ? "Processing..." : "Confirm payment"}
                    </Button>
                  </div>
                )}

                {selectedOrder.status === "confirmed" && (
                  <p className="mt-3 text-xs text-green-700">
                    Payment verified. Tickets should have been issued
                    automatically.
                  </p>
                )}

                {selectedOrder.status === "rejected" && (
                  <p className="mt-3 text-xs text-red-700">
                    This order has been rejected.
                  </p>
                )}
              </div>

              {selectedOrder.status === "confirmed" && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-gray-900">
                    Issued tickets
                  </h3>

                  {tickets.length ? (
                    <div className="space-y-2">
                      {tickets.map((ticket) => (
                        <div
                          key={ticket.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3"
                        >
                          <div>
                            <p className="font-mono text-sm font-semibold text-gray-900">
                              {ticket.ticket_number}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              Ticket {ticket.ticket_index}
                            </p>
                          </div>
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">
                            {ticket.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No issued tickets were returned. Refresh this order to
                      check again.
                    </p>
                  )}
                </div>
              )}

              {selectedOrder.payment_receipt_url && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-900">
                    Payment receipt
                  </p>
                  <a
                    href={selectedOrder.payment_receipt_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Open receipt
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        statusStyles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {statusLabels[status] || status}
    </span>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-gray-800">
        {value || "—"}
      </p>
    </div>
  )
}