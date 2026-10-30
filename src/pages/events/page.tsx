
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import {
  ButtonLink,
  Eyebrow,
  Heading,
  PageHero,
  Status,
} from "../../components/ui"

type Event = {
  id: string
  title: string
  description: string | null
  event_type: string
  status: string
  start_date: string | null
  venue: string | null
  city: string | null
  cover_image: string | null
  registration_url: string | null
  is_free: boolean
}

function EventSkeleton() {
  return (
    <article
      className="grid animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white md:grid-cols-2"
      aria-hidden="true"
    >
      <div className="min-h-72 bg-neutral-200 md:min-h-96" />

      <div className="space-y-6 p-6 md:p-10">
        <div className="h-3 w-12 rounded bg-neutral-200" />
        <div className="h-6 w-28 rounded-full bg-neutral-200" />
        <div className="h-10 w-4/5 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-4 w-3/4 rounded bg-neutral-200" />
        <div className="h-16 w-full rounded bg-neutral-100" />
        <div className="flex gap-3">
          <div className="h-12 w-32 rounded-lg bg-neutral-200" />
          <div className="h-12 w-36 rounded-lg bg-neutral-200" />
        </div>
      </div>
    </article>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadEvents() {
      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, event_type, status, start_date, venue, city, cover_image, registration_url, is_free"
        )
        .eq("status", "published")
        .eq("event_type", "flagship")
        .order("start_date", {
          ascending: true,
          nullsFirst: false,
        })

      if (!active) return

      if (error) {
        console.error("Failed to load events:", error.message)
        setError(true)
      } else {
        setEvents(data ?? [])
      }

      setLoading(false)
    }

    loadEvents()

    return () => {
      active = false
    }
  }, [])

  return (
    <div className="min-h-screen">
      <PageHero
        eyebrow="Flagship events"
        title="THE STAGE IS WHERE WE SPEAK LOUDEST."
        copy="Three distinct experiences. Worship, encounter and festival energy — each produced with its own visual world."
        image="/assets/event-performers.jpg"
      />

      <section className="events-page mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 md:py-16 lg:px-8">
        <div className="max-w-2xl">
          <Eyebrow>Discover our experiences</Eyebrow>
          <Heading>Events worth showing up for.</Heading>
          <p className="mt-4 leading-7 text-neutral-600">
            Find your next experience, explore event details, and get in
            touch with our team about tickets or sponsorship.
          </p>
        </div>

        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <EventSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center"
            role="alert"
          >
            <Eyebrow>Please try again</Eyebrow>
            <div className="mt-3">
              <Heading>Events temporarily unavailable.</Heading>
            </div>
            <p className="mx-auto mt-4 max-w-lg leading-7 text-neutral-600">
              We couldn't load the events right now. Please refresh the
              page or contact our team for assistance.
            </p>
            <div className="mt-6">
              <ButtonLink to="/contact">Contact us</ButtonLink>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white px-6 py-16 text-center sm:px-10">
            <div className="mx-auto max-w-xl">
              <Eyebrow>Coming soon</Eyebrow>
              <div className="mt-3">
                <Heading>Something powerful is taking shape.</Heading>
              </div>
              <p className="mt-4 leading-7 text-neutral-600">
                Our next flagship experiences will appear here when
                they're announced. Check back soon or get in touch
                with our team.
              </p>
              <div className="mt-6">
                <ButtonLink to="/contact">Contact us</ButtonLink>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {events.map((event, i) => {
              const isPast =
                event.start_date !== null &&
                new Date(event.start_date).getTime() < Date.now()

              const formattedDate = event.start_date
                ? new Date(event.start_date).toLocaleDateString(
                    "en-GH",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    }
                  )
                : "To be announced"

              const venue = [
                event.venue,
                event.city,
              ]
                .filter(Boolean)
                .join(", ")

              return (
                <article
                  key={event.id}
                  className="grid overflow-hidden rounded-2xl border border-neutral-200 bg-white text-neutral-900 shadow-sm transition-shadow duration-300 hover:shadow-md md:grid-cols-2"
                >
                  <div className="relative min-h-72 overflow-hidden bg-neutral-100 md:min-h-96">
                    {event.cover_image ? (
                      <img
                        src={event.cover_image}
                        alt={event.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex min-h-72 h-full flex-col items-center justify-center gap-3 bg-neutral-100 p-8 text-center md:min-h-96">
                        <span className="text-5xl text-neutral-300">
                          ✦
                        </span>
                        <p className="text-sm text-neutral-500">
                          Event photography coming soon
                        </p>
                      </div>
                    )}

                    <span className="absolute left-5 top-5 rounded-lg bg-white/95 px-4 py-2 text-sm font-semibold text-neutral-900 shadow-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center gap-5 bg-white p-6 text-neutral-900 sm:p-8 md:p-10">
                    <div className="flex flex-wrap items-center gap-3">
                      <Status>
                        {isPast ? "Past event" : "Upcoming"}
                      </Status>
                      <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                        {event.event_type.replaceAll("-", " ")}
                      </span>
                    </div>

                    <Heading>{event.title}</Heading>

                    <p className="leading-7 text-neutral-600">
                      {event.description ||
                        "More details about this experience will be announced soon."}
                    </p>

                    <div className="grid gap-4 border-y border-neutral-200 py-5 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Date
                        </p>
                        <p className="mt-2 font-medium text-neutral-900">
                          {formattedDate}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                          Venue
                        </p>
                        <p className="mt-2 font-medium text-neutral-900">
                          {venue || "To be announced"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {event.registration_url && !isPast ? (
                        <ButtonLink to={event.registration_url}>
                          {event.is_free
                            ? "Register free"
                            : "View tickets"}
                        </ButtonLink>
                      ) : (
                        <ButtonLink to="/contact">
                          Event enquiry
                        </ButtonLink>
                      )}

                      <ButtonLink to="/contact">
                        Sponsorship enquiry
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
