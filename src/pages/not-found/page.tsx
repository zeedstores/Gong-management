import { ButtonLink, Heading } from "../../components/ui"

export default function NotFoundPage() {
  return (
    <section className="not-found">
      <span>404</span>
      <Heading>THE BEAT DROPPED OUT.</Heading>
      <p>The page you requested does not exist.</p>
      <ButtonLink to="/">Back home</ButtonLink>
    </section>
  )
}
