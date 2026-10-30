
import { useEffect, useState } from "react"
import { Link, useParams } from "react-router"
import { supabase } from "../../../lib/supabase"
import { ButtonLink, Eyebrow, Heading } from "../../../components/ui"

type FoundationPost = {
  title: string
  slug: string
  excerpt: string | null
  content: string
  cover_image: string | null
  author: string | null
  published_at: string | null
}

export default function FoundationNewsPage() {
  const { slug } = useParams()
  const [post, setPost] = useState<FoundationPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    async function loadPost() {
      if (!slug) {
        setError(true)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("blog_posts")
        .select("title, slug, excerpt, content, cover_image, author, published_at")
        .eq("slug", slug)
        .eq("category", "foundation")
        .eq("status", "published")
        .maybeSingle()

      if (!active) return

      if (error || !data) {
        setError(true)
      } else {
        setPost(data as FoundationPost)
      }

      setLoading(false)
    }

    loadPost()

    return () => {
      active = false
    }
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl animate-pulse space-y-5">
          <div className="h-4 w-32 rounded bg-neutral-200" />
          <div className="h-10 w-4/5 rounded bg-neutral-200" />
          <div className="aspect-[16/9] rounded-2xl bg-neutral-200" />
          <div className="h-4 rounded bg-neutral-200" />
          <div className="h-4 w-5/6 rounded bg-neutral-200" />
        </div>
      </main>
    )
  }

  if (error || !post) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4 py-16">
        <div className="max-w-lg text-center">
          <Eyebrow>Foundation news</Eyebrow>
          <div className="mt-4">
            <Heading>Story not found.</Heading>
          </div>
          <p className="mt-4 leading-7 text-neutral-600">
            This story may have been removed or is not published yet.
          </p>
          <div className="mt-6">
            <ButtonLink to="/foundation">Back to Foundation</ButtonLink>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <article className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <Link
          to="/foundation#foundation-news"
          className="inline-flex min-h-11 items-center text-sm font-medium text-neutral-600 hover:text-neutral-950"
        >
          ← Back to foundation news
        </Link>

        <header className="mt-8 sm:mt-10">
          <Eyebrow>Gong Foundation · News</Eyebrow>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-lg leading-8 text-neutral-600 sm:text-xl">
              {post.excerpt}
            </p>
          )}

          <p className="mt-5 text-sm text-neutral-500">
            {post.author ? `By ${post.author}` : "Gong Foundation"}
            {post.published_at && ` · ${new Date(post.published_at).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`}
          </p>
        </header>

        {post.cover_image && (
          <div className="mt-8 overflow-hidden rounded-2xl bg-neutral-100 sm:mt-10 sm:rounded-3xl">
            <img
              src={post.cover_image}
              alt={post.title}
              className="max-h-[520px] w-full object-cover"
            />
          </div>
        )}

        <div className="mx-auto mt-8 max-w-3xl sm:mt-12">
          <div className="whitespace-pre-wrap break-words text-base leading-8 text-neutral-700 sm:text-lg sm:leading-9">
            {post.content}
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-neutral-50 p-6 sm:mt-16 sm:p-8">
          <h2 className="text-xl font-semibold">Support the work.</h2>
          <p className="mt-3 text-sm leading-7 text-neutral-600 sm:text-base">
            Interested in supporting a Gong Foundation initiative?
            Reach out to our team to learn more.
          </p>
          <div className="mt-5">
            <ButtonLink to="/contact">Contact the foundation</ButtonLink>
          </div>
        </div>
      </article>
    </main>
  )
}
