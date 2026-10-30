
import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
import { ButtonLink, Eyebrow, Heading, PageHero } from "../../components/ui"

type PortfolioItem = {
  id: string
  title: string
  category: string | null
  description: string | null
  image_url: string | null
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPortfolio() {
      setLoading(true)
      setError(false)

      const { data, error } = await supabase
        .from("portfolio")
        .select("id, title, category, description, image_url")
        .eq("is_published", true)
        .order("display_order", { ascending: true })

      if (!active) return

      if (error) {
        console.error("Error loading portfolio:", error)
        setError(true)
        setPortfolio([])
      } else {
        setPortfolio(data ?? [])
      }

      setLoading(false)
    }

    loadPortfolio()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="PROOF. NOT PROMISES."
        copy="A look at the events, productions and creative experiences behind Gong Management."
        image="/assets/event-vocalist.jpg"
      />

      <section className="section light-section py-16 sm:py-20 lg:py-28">
        <div className="shell">
          <div className="mb-10 max-w-2xl sm:mb-14">
            <Eyebrow dark>Our portfolio</Eyebrow>
            <Heading>
              EXPERIENCES.
              <br />
              CAPTURED.
            </Heading>
            <p className="mt-5 text-sm leading-7 text-black/65 sm:text-base sm:leading-8">
              Every project represents an opportunity to bring people,
              creativity and culture together.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse bg-white"
                >
                  <div className="aspect-[4/5] bg-black/10" />
                  <div className="space-y-3 p-5">
                    <div className="h-3 w-1/3 bg-black/10" />
                    <div className="h-5 w-2/3 bg-black/10" />
                    <div className="h-3 w-full bg-black/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Portfolio unavailable</h3>
              <p className="mt-2 text-sm leading-7 text-black/60">
                We couldn't load our projects right now. Please try again later
                or contact our team.
              </p>
              <div className="mt-5">
                <ButtonLink to="/contact">Contact the team</ButtonLink>
              </div>
            </div>
          ) : portfolio.length === 0 ? (
            <div className="border border-black/10 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-bold">Projects coming soon</h3>
              <p className="mt-2 text-sm leading-7 text-black/60">
                We're updating our portfolio. Contact us to discuss your next
                event or production.
              </p>
              <div className="mt-5">
                <ButtonLink to="/contact">Work with us</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7">
              {portfolio.map((item) => (
                <figure
                  key={item.id}
                  className="group min-w-0 overflow-hidden bg-white"
                >
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      width="640"
                      height="800"
                      className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex aspect-[4/5] items-center justify-center bg-[#e8e4da]">
                      <span className="text-sm text-black/40">
                        Project image unavailable
                      </span>
                    </div>
                  )}

                  <figcaption className="p-5 sm:p-6">
                    {item.category && (
                      <Eyebrow dark>{item.category}</Eyebrow>
                    )}

                    <h2 className="mt-2 text-lg font-bold sm:text-xl">
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className="mt-3 text-sm leading-7 text-black/60">
                        {item.description}
                      </p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="final-cta py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <Eyebrow>Have a project in mind?</Eyebrow>
          <Heading>
            LET'S MAKE
            <br />
            <span>SOMETHING MEMORABLE.</span>
          </Heading>
          <div className="mt-7">
            <ButtonLink to="/booking">Start a project</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
