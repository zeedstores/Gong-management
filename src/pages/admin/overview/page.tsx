import { useEffect, useState } from "react"
import {
  ArrowRight,
  CalendarDays,
  HeartHandshake,
  MessageSquare,
  Newspaper,
  Wallet,
  Ticket,
} from "lucide-react"
import { Link } from "react-router"
import { supabase } from "../../../lib/supabase"

const shortcuts = [
  { title: "Events & tickets", path: "/admin/events", Icon: CalendarDays },
  { title: "Ticket orders", path: "/admin/orders", Icon: Ticket },
  { title: "Foundation news", path: "/admin/foundation-news", Icon: Newspaper },
  { title: "Foundation campaigns", path: "/admin/foundation-campaigns", Icon: HeartHandshake },
  { title: "Donations", path: "/admin/donations", Icon: Wallet },
  { title: "Enquiries", path: "/admin/enquiries", Icon: MessageSquare },
]

type Activity = {
  id: string
  title: string
  category: string
  createdAt: string
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState([
    { label: "Events", value: 0, Icon: CalendarDays },
    { label: "Foundation news", value: 0, Icon: Newspaper },
    { label: "Campaigns", value: 0, Icon: HeartHandshake },
    { label: "Donations", value: 0, Icon: Wallet },
    { label: "Ticket orders", value: 0, Icon: Ticket },
  ])

  const [activities, setActivities] = useState<Activity[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      const [events, news, campaigns, donations, ticketOrders] =
        await Promise.all([
          supabase.from("events").select("id", { count: "exact", head: true }),
          supabase.from("blog_posts").select("id", { count: "exact", head: true }),
          supabase.from("foundation_campaigns").select("id", { count: "exact", head: true }),
          supabase.from("donations").select("id", { count: "exact", head: true }),
          supabase.from("ticket_orders").select("id", { count: "exact", head: true }),
        ])

      setStats([
        { label: "Events", value: events.count ?? 0, Icon: CalendarDays },
        { label: "Foundation news", value: news.count ?? 0, Icon: Newspaper },
        { label: "Campaigns", value: campaigns.count ?? 0, Icon: HeartHandshake },
        { label: "Donations", value: donations.count ?? 0, Icon: Wallet },
        { label: "Ticket orders", value: ticketOrders.count ?? 0, Icon: Ticket },
      ])

      const [eventData, newsData, campaignData, donationData, orderData] =
        await Promise.all([
          supabase
            .from("events")
            .select("id, title, created_at")
            .order("created_at", { ascending: false })
            .limit(6),

          supabase
            .from("blog_posts")
            .select("id, title, created_at")
            .order("created_at", { ascending: false })
            .limit(6),

          supabase
            .from("foundation_campaigns")
            .select("id, title, created_at")
            .order("created_at", { ascending: false })
            .limit(6),

          supabase
            .from("donations")
            .select("id, donor_name, amount, currency, created_at")
            .order("created_at", { ascending: false })
            .limit(6),

          supabase
            .from("ticket_orders")
            .select("id, order_reference, buyer_name, created_at")
            .order("created_at", { ascending: false })
            .limit(6),
        ])

      const recentActivities: Activity[] = [
        ...(eventData.data ?? []).map((item) => ({
          id: `event-${item.id}`,
          title: item.title,
          category: "Event",
          createdAt: item.created_at,
        })),

        ...(newsData.data ?? []).map((item) => ({
          id: `news-${item.id}`,
          title: item.title,
          category: "Foundation news",
          createdAt: item.created_at,
        })),

        ...(campaignData.data ?? []).map((item) => ({
          id: `campaign-${item.id}`,
          title: item.title,
          category: "Campaign",
          createdAt: item.created_at,
        })),

        ...(donationData.data ?? []).map((item) => ({
          id: `donation-${item.id}`,
          title: `${item.donor_name || "Anonymous donor"} donated ${item.currency} ${Number(item.amount).toLocaleString()}`,
          category: "Donation",
          createdAt: item.created_at,
        })),

        ...(orderData.data ?? []).map((item) => ({
          id: `order-${item.id}`,
          title: `${item.buyer_name} placed ticket order ${item.order_reference}`,
          category: "Ticket order",
          createdAt: item.created_at,
        })),
      ]

      recentActivities.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )

      setActivities(recentActivities.slice(0, 6))
      setLoadingActivity(false)
    }

    loadDashboard().catch((error) => {
      console.error("Dashboard loading error:", error)
      setLoadingActivity(false)
    })
  }, [])

  return (
    <main className="admin-page space-y-8">
      <header className="flex flex-col gap-2">
        <span className="text-[10px] font-bold tracking-[0.2em] text-[#80610e]">
          DASHBOARD
        </span>
        <h1 className="font-['Anton'] text-5xl font-normal leading-none">
          Overview
        </h1>
        <p className="text-sm text-neutral-500">
          Manage Gong Management in one place.
        </p>
      </header>

      <section
        aria-label="Catalogue summary"
        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
      >
        {stats.map(({ label, value, Icon }) => (
          <article
            key={label}
            className="flex items-center justify-between border border-[#ddd9cf] bg-white p-5"
          >
            <div>
              <p className="text-xs text-neutral-500">{label}</p>
              <strong className="mt-2 block font-['Anton'] text-4xl font-normal">
                {value}
              </strong>
            </div>
            <div className="flex h-10 w-10 items-center justify-center bg-[#f4f0e5] text-[#9b7410]">
              <Icon size={20} />
            </div>
          </article>
        ))}
      </section>

      <section className="border border-[#ddd9cf] bg-white p-5 sm:p-7">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-base font-bold">Quick access</h2>
          <span className="text-xs text-neutral-400">Manage your website</span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shortcuts.map(({ title, path, Icon }) => (
            <Link
              to={path}
              key={path}
              className="group flex min-h-16 items-center gap-3 border border-neutral-200 p-4 transition-colors hover:border-[#b18a27] hover:bg-[#faf8f2]"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-[#f4f0e5] text-[#9b7410]">
                <Icon size={18} />
              </span>
              <span className="flex-1 text-sm font-semibold">{title}</span>
              <ArrowRight
                size={16}
                className="text-neutral-400 transition-transform group-hover:translate-x-1 group-hover:text-[#9b7410]"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="border border-[#ddd9cf] bg-white p-5 sm:p-7">
        <h2 className="mb-5 text-base font-bold">Recent activity</h2>

        {loadingActivity ? (
          <p className="py-10 text-center text-sm text-neutral-400">
            Loading recent activity...
          </p>
        ) : activities.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center text-center">
            <MessageSquare size={24} className="mb-3 text-neutral-400" />
            <p className="text-sm font-semibold text-neutral-700">
              No recent activity
            </p>
            <p className="mt-1 max-w-sm text-xs leading-5 text-neutral-500">
              New events, news, campaigns, donations and ticket orders will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-neutral-800">
                    {activity.title}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {activity.category}
                  </p>
                </div>

                <time className="text-xs text-neutral-400">
                  {new Date(activity.createdAt).toLocaleString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}