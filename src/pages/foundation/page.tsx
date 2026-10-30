
import { useEffect, useState } from "react"
import { Link } from "react-router"
import { supabase } from "../../lib/supabase"
import {
  ButtonLink,
  Eyebrow,
  Heading,
  PageHero,
} from "../../components/ui"

type Campaign = {
  id: string
  title: string
  slug: string
  description: string | null
  goal_amount: number | null
  currency: string
  cover_image: string | null
}

type FoundationPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  published_at: string | null
  author: string | null
}

function formatDate(date: string | null) {
  if (!date) return "Foundation update"

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function CampaignSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="aspect-[5/3] bg-neutral-200" />
      <div className="space-y-4 p-5 sm:p-6">
        <div className="h-5 w-3/4 rounded bg-neutral-200" />
        <div className="h-4 w-full rounded bg-neutral-200" />
        <div className="h-10 w-32 rounded-full bg-neutral-200" />
      </div>
    </div>
  )
}

export default function FoundationPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [posts, setPosts] = useState<FoundationPost[]>([])
  const [campaignsLoading, setCampaignsLoading] = useState(true)
  const [postsLoading, setPostsLoading] = useState(true)
  const [campaignsError, setCampaignsError] = useState(false)
  const [postsError, setPostsError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadCampaigns() {
      const { data, error } = await supabase
        .from("foundation_campaigns")
        .select("id, title, slug, description, goal_amount, currency, cover_image")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (!active) return

      if (error) {
        console.error("Foundation campaigns:", error.message)
        setCampaignsError(true)
      } else {
        setCampaigns(data ?? [])
      }

      setCampaignsLoading(false)
    }

    async function loadPosts() {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, cover_image, published_at, author")
        .eq("category", "foundation")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(3)

      if (!active) return

      if (error) {
        console.error("Foundation news:", error.message)
        setPostsError(true)
      } else {
        setPosts(data ?? [])
      }

      setPostsLoading(false)
    }

    loadCampaigns()
    loadPosts()

    return () => {
      active = false
    }
  }, [])

  return (
    <main className="min-h-screen overflow-hidden bg-white text-neutral-900">
      <PageHero
        eyebrow="Gong Foundation"
        title="PURPOSE THAT REACHES BEYOND THE STAGE."
        copy="Building hope, supporting communities, and turning purpose into meaningful action."
        image="/assets/foundation-hero.jpg"
      />

      {/* Introduction */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 md:grid-cols-2 md:items-center lg:px-8 lg:py-24">
        <div>
          <Eyebrow>Why we exist</Eyebrow>
          <div className="mt-3">
            <Heading>Impact that goes beyond the moment.</Heading>
          </div>
          <p className="mt-5 text-base leading-7 text-neutral-600 sm:text-lg sm:leading-8">
            The Gong Foundation extends our purpose beyond events
            through initiatives designed to support people and
            communities. Every act of support can help move that
            mission forward.
          </p>
          <div className="mt-7 flex flex-col gap-3 min-[380px]:flex-row">
            <ButtonLink to="#campaigns">Explore campaigns</ButtonLink>
            <ButtonLink to="/contact" variant="secondary">
              Partner with us
            </ButtonLink>
          </div>
        </div>

        <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 sm:rounded-3xl">
          <img
            src="/assets/foundation-hero.jpg"
            alt="Gong Foundation"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(event) => {
              event.currentTarget.style.display = "none"
            }}
          />
          <div className="absolute inset-0 bg-neutral-950/10" />
          <p className="relative rounded-full bg-white/90 px-5 py-3 text-sm font-medium text-neutral-800 shadow-sm">
            Purpose. People. Progress.
          </p>
        </div>
      </section>

      {/* Campaigns */}
      <section id="campaigns" className="scroll-mt-20 bg-neutral-50 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Make a difference</Eyebrow>
              <div className="mt-3">
                <Heading>Campaigns that matter.</Heading>
              </div>
              <p className="mt-4 leading-7 text-neutral-600">
                Discover our current initiatives and find a way to
                contribute.
              </p>
            </div>
            <a
              href="#foundation-news"
              className="w-fit text-sm font-semibold text-neutral-800 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
            >
              Read foundation news
            </a>
          </div>

          {campaignsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <CampaignSkeleton key={index} />
              ))}
            </div>
          ) : campaignsError ? (
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10">
              <h3 className="text-lg font-semibold">Campaigns couldn't load.</h3>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Please try again later or contact our team.
              </p>
              <div className="mt-5">
                <ButtonLink to="/contact">Contact us</ButtonLink>
              </div>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-12 text-center sm:px-8 sm:py-16">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100 text-xl">
                ✳
              </span>
              <h3 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
                Something meaningful starts here.
              </h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-neutral-600 sm:text-base">
                There are no active campaigns right now. Check back
                soon to discover upcoming initiatives.
              </p>
              <div className="mt-6">
                <ButtonLink to="/contact">Support the foundation</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <article
                  key={campaign.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[5/3] overflow-hidden bg-neutral-100">
                    {campaign.cover_image ? (
                      <img
                        src={campaign.cover_image}
                        alt={campaign.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        Campaign image coming soon
                      </div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-neutral-800">
                      Active campaign
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-xl font-semibold leading-snug tracking-tight">
                      {campaign.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-neutral-600 sm:text-base">
                      {campaign.description ||
                        "More information about this campaign will be available soon."}
                    </p>

                    {campaign.goal_amount !== null && (
                      <div className="mt-5 border-t border-neutral-100 pt-4">
                        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                          Fundraising goal
                        </p>
                        <p className="mt-1 text-lg font-semibold">
                          {new Intl.NumberFormat("en", {
                            style: "currency",
                            currency: campaign.currency || "GHS",
                            maximumFractionDigits: 0,
                          }).format(campaign.goal_amount)}
                        </p>
                      </div>
                    )}

                    <div className="mt-5">
                      <ButtonLink to="/contact">
                        Support this campaign
                      </ButtonLink>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Foundation news */}
      <section id="foundation-news" className="scroll-mt-20 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <Eyebrow>Stories & updates</Eyebrow>
            <div className="mt-3">
              <Heading>News from the foundation.</Heading>
            </div>
            <p className="mt-4 leading-7 text-neutral-600">
              Follow our latest announcements, community initiatives,
              and progress.
            </p>
          </div>

          {postsLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-2xl border border-neutral-200"
                >
                  <div className="aspect-[5/3] bg-neutral-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-4 w-1/3 rounded bg-neutral-200" />
                    <div className="h-5 w-4/5 rounded bg-neutral-200" />
                    <div className="h-4 w-full rounded bg-neutral-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : postsError ? (
            <p className="rounded-2xl bg-neutral-50 p-6 text-sm text-neutral-600">
              Foundation news is temporarily unavailable.
            </p>
          ) : posts.length === 0 ? (
            <div className="rounded-2xl bg-neutral-50 px-5 py-10 sm:px-8">
              <h3 className="text-lg font-semibold">Our stories are coming soon.</h3>
              <p className="mt-2 max-w-xl text-sm leading-7 text-neutral-600">
                Foundation news and impact stories published by our
                team will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:shadow-lg"
                >
                  <div className="aspect-[5/3] overflow-hidden bg-neutral-100">
                    {post.cover_image ? (
                      <img
                        src={post.cover_image}
                        alt={post.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-neutral-400">
                        Foundation update
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
                      {formatDate(post.published_at)}
                    </p>
                    <h3 className="mt-3 text-lg font-semibold leading-snug">
                      {post.title}
                    </h3>
                    <p className="mt-3 flex-1 text-sm leading-7 text-neutral-600">
                      {post.excerpt || "Read the latest update from the Gong Foundation."}
                    </p>
                    <p className="mt-4 text-xs text-neutral-500">
                      {post.author ? `By ${post.author}` : "Gong Foundation"}
                    </p>
                    <Link
                      to={`/foundation/news/${post.slug}`}
                      className="mt-5 inline-flex w-fit items-center gap-2 text-sm font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
                    >
                      Read story <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Donation call to action */}
      <section className="px-4 pb-14 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl bg-neutral-900 px-6 py-10 text-white sm:rounded-3xl sm:px-10 sm:py-14 lg:px-16">
          <div className="grid gap-7 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-300">
                Be part of the impact
              </p>
              <h2 className="mt-4 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:text-4xl">
                Your support can help move a good cause forward.
              </h2>
              <p className="mt-4 text-sm leading-7 text-neutral-300 sm:text-base">
                Interested in donating, partnering, or supporting an
                initiative? Get in touch with our team.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <ButtonLink to="/contact" variant="secondary">
                Discuss a donation
              </ButtonLink>
              <ButtonLink to="/contact">Partner with us</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
