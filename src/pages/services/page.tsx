
import { useEffect, useState } from "react"
import { Check } from "lucide-react"
import { supabase } from "../../lib/supabase"
import { ButtonLink, Eyebrow, Heading, PageHero } from "../../components/ui"

type Service = {
  id: string
  title: string
  slug: string
  description: string | null
  image_url: string | null
}

const packages = [
  {
    name: "Basic",
    audience: "50–200 guests",
    description: "For smaller gatherings and private events.",
  },
  {
    name: "Standard",
    audience: "200–800 guests",
    description: "For mid-sized events that need more coordination.",
  },
  {
    name: "Premium",
    audience: "800+ guests",
    description: "For large productions and major live experiences.",
  },
]

const process = [
  "Tell us your idea.",
  "Receive a plan and quotation.",
  "Confirm your booking.",
  "We bring it to life.",
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadServices() {
      setLoading(true)
      setError(false)

      const { data, error } = await supabase
        .from("services")
        .select("id, title, slug, description, image_url")
        .eq("is_published", true)
        .order("display_order", { ascending: true })

      if (!active) return

      if (error) {
        console.error("Error loading services:", error)
        setError(true)
        setServices([])
      } else {
        setServices(data ?? [])
      }

      setLoading(false)
    }

    loadServices()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Services"
        title="WE PLAN. WE PRODUCE. WE MAKE IT EXPLODE."
        copy="One accountable team across creative direction, talent, technical production and event delivery."
        image="/assets/event-stage.jpg"
      />

      {/* SERVICES */}
      <section className="section light-section py-16 sm:py-20 lg:py-28">
        <div className="shell">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <Eyebrow dark>What we do</Eyebrow>
            <Heading>
              EVERYTHING IT TAKES.
              <br />
              ONE TEAM.
            </Heading>
            <p className="mt-5 max-w-xl text-sm leading-7 text-black/65 sm:text-base sm:leading-8">
              From the first planning conversation to the final moment of an
              event, we bring the people, production and coordination together.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse border border-black/10 bg-white p-6 sm:p-8"
                >
                  <div className="h-6 w-2/3 bg-black/10" />
                  <div className="mt-5 h-4 w-full bg-black/10" />
                  <div className="mt-3 h-4 w-4/5 bg-black/10" />
                  <div className="mt-8 aspect-[16/9] bg-black/10" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Services are unavailable</h3>
              <p className="mt-2 text-sm leading-7 text-black/60">
                We couldn't load our services right now. Please try again or
                contact our team for assistance.
              </p>
              <div className="mt-5">
                <ButtonLink to="/contact">Contact the team</ButtonLink>
              </div>
            </div>
          ) : services.length === 0 ? (
            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Services coming soon</h3>
              <p className="mt-2 text-sm leading-7 text-black/60">
                Our service information is being updated. Contact us to discuss
                your event requirements.
              </p>
              <div className="mt-5">
                <ButtonLink to="/contact">Make an enquiry</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
              {services.map((service, index) => (
                <article
                  key={service.id}
                  className="min-w-0 overflow-hidden border border-black/10 bg-white"
                >
                  {service.image_url ? (
                    <img
                      src={service.image_url}
                      alt={service.title}
                      loading="lazy"
                      decoding="async"
                      width="800"
                      height="450"
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : null}

                  <div className="p-5 sm:p-7 lg:p-8">
                    <span className="text-sm font-bold tracking-widest text-[#b58b22]">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <h2 className="mt-3 text-xl font-bold sm:text-2xl">
                      {service.title}
                    </h2>

                    {service.description && (
                      <p className="mt-3 text-sm leading-7 text-black/65 sm:text-base">
                        {service.description}
                      </p>
                    )}

                    <div className="mt-6 border-t border-black/10 pt-5">
                      <ButtonLink to="/booking">
                        Discuss this service
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* PRODUCTION PACKAGES */}
      <section className="section dark-section py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <div className="mb-10 grid grid-cols-1 gap-5 sm:mb-12 lg:grid-cols-2 lg:items-end lg:gap-12">
            <div>
              <Eyebrow>Production packages</Eyebrow>
              <Heading>
                SCALE WITHOUT
                <br />
                THE GUESSWORK.
              </Heading>
            </div>

            <p className="max-w-xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
              Choose a starting point based on your event size. We will discuss
              your requirements and provide a quotation based on the actual
              scope of work.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            {packages.map((item, index) => (
              <article
                key={item.name}
                className="border border-white/15 p-6 sm:p-8"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-[#d6aa33]">
                  0{index + 1} / Production package
                </span>

                <h3 className="mt-6 text-3xl font-bold">{item.name}</h3>

                <p className="mt-2 text-sm font-semibold text-white/85">
                  {item.audience}
                </p>

                <p className="mt-4 text-sm leading-7 text-white/60">
                  {item.description}
                </p>

                <p className="mt-7 border-t border-white/15 pt-4 text-xs text-white/50">
                  Final scope and price by quotation
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section gold-section py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <Eyebrow dark>How it works</Eyebrow>
              <Heading>
                FROM IDEA
                <br />
                TO IMPACT.
              </Heading>

              <p className="mt-5 max-w-md text-sm leading-7 text-black/70 sm:text-base">
                Every successful event starts with a clear plan. Here's how
                we'll work together.
              </p>
            </div>

            <div className="divide-y divide-black/20 border-y border-black/20">
              {process.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-5 py-5 sm:gap-7"
                >
                  <span className="shrink-0 text-sm font-bold tracking-widest">
                    0{index + 1}
                  </span>
                  <p className="text-base font-semibold sm:text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-8 max-w-2xl text-xs leading-6 text-black/60">
            A deposit may be required to secure an event booking. Payment
            terms will be clearly stated in your quotation.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink to="/booking">Request a quote</ButtonLink>
            <ButtonLink secondary to="/booking">
              Book an artist
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
