
import { useEffect, useState } from "react"
import { ArrowDown, ArrowRight, Music2 } from "lucide-react"
import { Link } from "react-router"
import { supabase } from "../../lib/supabase"
import { ButtonLink, Eyebrow, Heading, Status } from "../../components/ui"

type Service = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  slug: string
}

type Event = {
  id: string
  title: string
  slug: string
  description: string | null
  status: string
  cover_image: string | null
  is_free: boolean
}

type Product = {
  id: string
  name: string
  price: number
  availability: string
  image_url: string | null
}

type Equipment = {
  id: string
  name: string
  category: string | null
  description: string | null
}

type Property = {
  id: string
  title: string
  type: string
  location: string
  description: string | null
  price: number | null
}

type PortfolioItem = {
  id: string
  title: string
  category: string
  image_url: string | null
}

type FoundationCampaign = {
  id: string
  title: string
  slug: string
  description: string | null
  cover_image: string | null
  goal_amount: number | null
  currency: string | null
}

type TeamMember = {
  id: string
  name: string
  position: string
  image_url: string
}

type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author: string | null
  published_at: string | null
  category: string | null
}

type HomeData = {
  services: Service[]
  events: Event[]
  products: Product[]
  equipment: Equipment[]
  properties: Property[]
  portfolio: PortfolioItem[]
  campaigns: FoundationCampaign[]
  team: TeamMember[]
  blogPosts: BlogPost[]
}

const emptyHomeData: HomeData = {
  services: [],
  events: [],
  products: [],
  equipment: [],
  properties: [],
  portfolio: [],
  campaigns: [],
  team: [],
  blogPosts: [],
}

function formatDate(date: string | null) {
  if (!date) return ""

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

export default function HomePage() {
  const [data, setData] = useState<HomeData>(emptyHomeData)

  useEffect(() => {
    let active = true

    async function loadHomepage() {
      const [
        servicesResult,
        eventsResult,
        productsResult,
        equipmentResult,
        propertiesResult,
        portfolioResult,
        campaignsResult,
        teamResult,
        blogResult,
      ] = await Promise.all([
        supabase
          .from("services")
          .select("id, title, description, image_url, slug")
          .eq("is_published", true)
          .order("display_order")
          .limit(4),

        supabase
          .from("events")
          .select("id, title, slug, description, status, cover_image, is_free")
          .eq("status", "published")
          .order("start_date", { ascending: true, nullsFirst: false })
          .limit(3),

        supabase
          .from("products")
          .select("id, name, price, availability, image_url")
          .neq("availability", "Draft")
          .limit(3),

        supabase
          .from("equipment")
          .select("id, name, category, description")
          .eq("is_published", true)
          .limit(3),

        supabase
          .from("properties")
          .select("id, title, type, location, description, price")
          .eq("is_published", true)
          .limit(2),

        supabase
          .from("portfolio")
          .select("id, title, category, image_url")
          .eq("is_published", true)
          .order("display_order")
          .limit(3),

        supabase
          .from("foundation_campaigns")
          .select("id, title, slug, description, cover_image, goal_amount, currency")
          .eq("status", "active")
          .limit(2),

        supabase
          .from("team_members")
          .select("id, name, position, image_url")
          .eq("is_active", true)
          .order("display_order")
          .limit(10),

        supabase
          .from("blog_posts")
          .select("id, title, slug, excerpt, cover_image, author, published_at, category")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(3),
      ])

      const results = [
        ["services", servicesResult.error],
        ["events", eventsResult.error],
        ["products", productsResult.error],
        ["equipment", equipmentResult.error],
        ["properties", propertiesResult.error],
        ["portfolio", portfolioResult.error],
        ["foundation campaigns", campaignsResult.error],
        ["team members", teamResult.error],
        ["blog posts", blogResult.error],
      ] as const

      results.forEach(([table, error]) => {
        if (error) {
          console.error(`Homepage ${table} query failed:`, error.message)
        }
      })

      if (!active) return

      setData({
        services: servicesResult.data ?? [],
        events: eventsResult.data ?? [],
        products: productsResult.data ?? [],
        equipment: equipmentResult.data ?? [],
        properties: propertiesResult.data ?? [],
        portfolio: portfolioResult.data ?? [],
        campaigns: campaignsResult.data ?? [],
        team: teamResult.data ?? [],
        blogPosts: blogResult.data ?? [],
      })
    }

    loadHomepage()

    return () => {
      active = false
    }
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="home-hero">
        <div className="hero-noise" />

        <div className="shell hero-content">
          <Eyebrow>Event & artist management · Tema, Ghana</Eyebrow>

          <h1 className="display">
            WE CREATE
            <br />
            <span>XPLOSIONS.</span>
          </h1>

          <p>
            Ghana's leading Event & Artist Management company bridging Afrobeat,
            Reggae and Dancehall from Tema to the World.
          </p>

          <div className="button-row">
            <ButtonLink to="/booking">Book an artist</ButtonLink>
            <ButtonLink secondary to="/events">
              Explore events
            </ButtonLink>
          </div>
        </div>

        <div className="hero-index">
          <span>01</span>
          <div />
          <span>Sound becomes power</span>
        </div>

        <a className="scroll-cue" href="#story">
          <ArrowDown size={18} />
          Scroll to feel it
        </a>
      </section>

    {/* TRUST STRIP */}
<section className="trust-strip overflow-hidden">
  <div className="shell !block overflow-hidden">
    <div className="trust-marquee flex w-max flex-nowrap items-center">
      {[1, 2].map((group) => (
        <div
          key={group}
          aria-hidden={group === 2}
          className="flex shrink-0 flex-nowrap items-center gap-14 px-2"
        >
          {[
            "Trusted by Artists",
            "Trusted by Sponsors",
            "Born in Tema",
            "Built for the World",
          ].map((item) => (
            <span
              key={`${group}-${item}`}
              className="!inline-flex !w-auto shrink-0 flex-nowrap items-center  whitespace-nowrap"
            >
              <Music2 size={15} className="shrink-0" />
              {item}
            </span>
          ))}
        </div>
      ))}
    </div>
  </div>
</section>


      {/* ABOUT */}
      <section id="story" className="section light-section text-[#090909]">
        <div className="shell split-story">
          <div>
            <Eyebrow dark>Our story</Eyebrow>
            <Heading>
              BORN IN TEMA.
              <br />
              BUILT FOR
              <br />
              THE WORLD.
            </Heading>
          </div>

          <div className="story-copy">
            <p>
              Gong Management amplifies culture, elevates talent and produces
              unforgettable live experiences. We connect artists, audiences and
              opportunities through professional event and artist management.
            </p>

            <ButtonLink to="/about">Discover our story</ButtonLink>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      {data.services.length > 0 && (
        <section className="section dark-section">
          <div className="shell section-heading">
            <div>
              <Eyebrow>What we do</Eyebrow>
              <Heading>
                THE WORK
                <br />
                BEHIND THE ROAR.
              </Heading>
            </div>

            <p>
              From first idea to final encore, our team brings strategy,
              production and cultural fluency into one room.
            </p>
          </div>

          <div className="shell service-grid">
            {data.services.map((service, i) => (
              <Link to="/services" className="service-card" key={service.id}>
                {service.image_url && (
                  <img
                    src={service.image_url}
                    alt={service.title}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="480"
                  />
                )}

                <div>
                  <span>0{i + 1}</span>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <ArrowRight />
                </div>
              </Link>
            ))}
          </div>

          <div className="shell mt-8">
            <ButtonLink secondary to="/services">
              Explore all services
            </ButtonLink>
          </div>
        </section>
      )}

      {/* EVENTS */}
      {data.events.length > 0 && (
        <section className="section gold-section text-[#090909]">
          <div className="shell section-heading">
            <div>
              <Eyebrow dark>Flagship experiences</Eyebrow>
              <Heading>
                THREE EVENTS.
                <br />
                ONE POWERFUL
                <br />
                SOUND.
              </Heading>
            </div>

            <ButtonLink secondary to="/events">
              View all events
            </ButtonLink>
          </div>

          <div className="shell event-stack">
            {data.events.map((event, i) => (
              <article className="event-row" key={event.id}>
                <span className="event-number">0{i + 1}</span>

                {event.cover_image && (
                  <img
                    src={event.cover_image}
                    alt={event.title}
                    loading="lazy"
                    decoding="async"
                    width="640"
                    height="480"
                  />
                )}

                <div>
                  <Status>
                    {event.is_free ? "Free registration" : "Ticketed event"}
                  </Status>

                  <h3>{event.title}</h3>
                  <p>{event.description}</p>

                  <Link to={`/events/${event.id}/register`}>
                    {event.is_free ? "Register for free" : "Get tickets"}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      
{/* SHOP */}
{data.products.length > 0 && (
  <section className="section light-section text-[#090909]">
    <div className="shell">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow dark>Official Gong Store</Eyebrow>
          <Heading>
            WEAR THE
            <br />
            CULTURE.
          </Heading>
          <p className="mt-3 max-w-md text-sm text-black/65">
            Explore official Gong merchandise and get your favourites.
          </p>
        </div>

        <Link
          to="/shop"
          className="inline-flex items-center gap-2 border border-[#090909]  px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d6aa33] hover:text-[#090909]"
        >
          Visit the shop <ArrowRight size={16} />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
        {data.products.map((product) => (
          <Link
            to="/shop"
            key={product.id}
            className="group min-w-0 overflow-hidden border border-black/10 bg-white"
          >
            <div className="relative overflow-hidden bg-[#f3f0e8]">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  loading="lazy"
                  decoding="async"
                  width="640"
                  height="640"
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center">
                  <Music2 size={32} className="text-black/20" />
                </div>
              )}

              <span className="absolute left-2 top-2 bg-[#090909] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white sm:left-3 sm:top-3 sm:text-xs">
                {product.availability}
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <h3 className="truncate text-sm font-bold sm:text-base">
                {product.name}
              </h3>

              <p className="mt-1 text-sm font-semibold text-black/65">
                GHS {Number(product.price).toFixed(2)}
              </p>

              <span className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-[#d6aa33] px-3 py-2.5 text-xs font-bold text-[#090909] transition group-hover:bg-[#090909] group-hover:text-white sm:text-sm">
                Order now <ArrowRight size={14} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-7 text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm font-bold underline underline-offset-4"
        >
          Explore all products <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  </section>
)}


      {/* EQUIPMENT AND PROPERTIES */}
      {(data.equipment.length > 0 || data.properties.length > 0) && (
        <section className="section dark-section compact-section">
          <div className="shell three-preview">
            <div>
              <Eyebrow>Equipment</Eyebrow>
              <Heading>
                THE GEAR
                <br />
                TO GO BIG.
              </Heading>

              <p>
                {data.equipment.length} production categories available in our
                equipment catalogue.
              </p>

              <ButtonLink to="/equipment">Request equipment quote</ButtonLink>
            </div>

            <div className="preview-photo">
              <img
                src="/assets/event-stage.jpg"
                alt="Live event stage production"
                loading="lazy"
                decoding="async"
                width="800"
                height="1000"
              />
            </div>

            <div className="mini-list">
              <Eyebrow>Property desk</Eyebrow>

              {data.properties.map((item) => (
                <Link key={item.id} to="/properties">
                  <span>
                    {item.type} · {item.location}
                  </span>
                  <strong>{item.title}</strong>
                  <ArrowRight size={18} />
                </Link>
              ))}

              <ButtonLink secondary to="/properties">
                Explore properties
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      
{/* PORTFOLIO */}
{data.portfolio.length > 0 && (
  <section className="section light-section text-[#090909] portfolio-home">
    <div className="shell mb-8 flex flex-wrap items-end justify-between gap-5">
      <div>
        <Eyebrow dark>Selected work</Eyebrow>
        <Heading>
          PROOF.
          <br />
          NOT PROMISES.
        </Heading>
      </div>

      <Link
        to="/portfolio"
        className="inline-flex items-center gap-2  px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d6aa33] hover:text-[#090909]"
      >
        See the portfolio <ArrowRight size={16} />
      </Link>
    </div>

    <div className="shell grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {data.portfolio.map((item) => (
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
            <div className="aspect-[4/5] bg-[#e8e4da]" />
          )}

          <figcaption className="p-3 sm:p-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-black/55 sm:text-xs">
              {item.category}
            </span>
            <h3 className="mt-1 text-sm font-bold sm:text-base">
              {item.title}
            </h3>
          </figcaption>
        </figure>
      ))}
    </div>
  </section>
)}


      {/* FOUNDATION */}
      <section className="section light-section text-[#090909]">
        <div className="shell section-heading">
          <div>
            <Eyebrow dark>Gong Foundation</Eyebrow>
            <Heading>
              CULTURE
              <br />
              WITH PURPOSE.
            </Heading>

            <p className="mt-4 max-w-xl">
              Beyond entertainment, we believe in creating opportunities,
              supporting communities and making a lasting difference.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  <ButtonLink to="/foundation">Explore the foundation</ButtonLink>

  <ButtonLink
    secondary
    to="/foundation"
     className="!border-black !text-black hover:!border-[#d6aa33]"
  >
    Donate now
  </ButtonLink>
</div>
        </div>

        {data.campaigns.length > 0 && (
          <div className="shell grid gap-6 md:grid-cols-2">
            {data.campaigns.map((campaign) => (
              <article
                key={campaign.id}
                className="group overflow-hidden rounded-lg border border-black/10 bg-white"
              >
                {campaign.cover_image && (
                  <img
                    src={campaign.cover_image}
                    alt={campaign.title}
                    loading="lazy"
                    decoding="async"
                    width="800"
                    height="500"
                    className="aspect-[16/9] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}

                <div className="p-5">
                  <h3 className="text-xl font-bold">{campaign.title}</h3>

                  {campaign.description && (
                    <p className="mt-2 line-clamp-3 text-sm text-black/65">
                      {campaign.description}
                    </p>
                  )}

                  <Link
                    to="/foundation"
                    className="mt-4 inline-flex items-center gap-2 font-semibold"
                  >
                    Support this campaign <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* TEAM */}
      {data.team.length > 0 && (
        <section className="section dark-section">
          <div className="shell section-heading">
            <div>
              <Eyebrow>The people behind Gong</Eyebrow>
              <Heading>
                MEET THE
                <br />
                TEAM.
              </Heading>
            </div>

            <p>
              The people, creativity and coordination behind every experience
              we bring to life.
            </p>
          </div>

          <div className="shell grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {data.team.map((member) => (
              <article key={member.id} className="min-w-0">
                <div className="overflow-hidden rounded-lg bg-white/10">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    loading="lazy"
                    decoding="async"
                    width="600"
                    height="720"
                    className="aspect-[5/6] w-full object-cover"
                  />
                </div>

                <div className="pt-4">
                  <h3 className="text-xl font-bold text-white">
                    {member.name}
                  </h3>
                  <p className="mt-1 text-sm text-white/65">
                    {member.position}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* BLOG / JOURNAL */}
      {data.blogPosts.length > 0 && (
        <section
          id="journal"
          className="section light-section text-[#090909]"
        >
          <div className="shell section-heading">
            <div>
              <Eyebrow dark>Stories and updates</Eyebrow>
              <Heading>
                THE GONG
                <br />
                JOURNAL.
              </Heading>
            </div>

            <p>
              News, perspectives, event stories and updates from the Gong
              Management community.
            </p>
          </div>

          <div className="shell grid gap-6 md:grid-cols-3">
            {data.blogPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-lg border border-black/10 bg-white"
              >
                {post.cover_image && (
                  <img
                    src={post.cover_image}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    width="700"
                    height="480"
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-black/55">
                    {post.category && <span>{post.category}</span>}
                    {post.published_at && (
                      <>
                        <span>·</span>
                        <time dateTime={post.published_at}>
                          {formatDate(post.published_at)}
                        </time>
                      </>
                    )}
                  </div>

                  <h3 className="mt-3 text-xl font-bold">{post.title}</h3>

                  {post.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-black/65">
                      {post.excerpt}
                    </p>
                  )}

                  {post.author && (
                    <p className="mt-4 text-xs font-medium text-black/55">
                      By {post.author}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ENQUIRY CTA */}
      <section className="section gold-section text-[#090909]">
        <div className="shell grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <Eyebrow dark>Let's work together</Eyebrow>
            <Heading>
              HAVE A
              <br />
              PROJECT IN MIND?
            </Heading>
          </div>

          <div>
            <p className="mb-6 max-w-lg">
              Planning an event, looking for an artist, seeking production
              support or exploring a partnership? Tell us what you have in mind.
            </p>

            <ButtonLink to="/contact">Submit an enquiry</ButtonLink>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta">
        <div className="shell">
          <Eyebrow>Have an idea?</Eyebrow>
          <Heading>
            LET'S MAKE
            <br />
            SOMETHING
            <br />
            <span>UNFORGETTABLE.</span>
          </Heading>

          <div className="button-row">
            <ButtonLink to="/booking">Start a project</ButtonLink>
            <ButtonLink secondary to="/contact">
              Contact us
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
