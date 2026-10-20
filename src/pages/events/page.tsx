import { events } from "../../data/mockData"
import {
  ButtonLink,
  Eyebrow,
  Heading,
  PageHero,
  Status,
} from "../../components/ui"

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Flagship events"
        title="THE STAGE IS WHERE WE SPEAK LOUDEST."
        copy="Three distinct experiences. Worship, encounter and festival energy — each produced with its own visual world."
        image="/assets/event-performers.jpg"
      />
      <section className="events-page">
        {events.map((event, i) => (
          <article
            className={`event-feature event-${event.tone}`}
            key={event.id}
          >
            <div className="event-feature-image">
              <img src={event.image} alt="" />
            </div>
            <div className="event-feature-content">
              <span className="big-index">0{i + 1}</span>
              <Status>{event.status}</Status>
              <Eyebrow>{event.id.replaceAll("-", " ")}</Eyebrow>
              <Heading>{event.title}</Heading>
              <p className="event-tagline">{event.tagline}</p>
              <dl>
                <div>
                  <dt>Date</dt>
                  <dd>{event.date}</dd>
                </div>
                <div>
                  <dt>Venue</dt>
                  <dd>{event.venue}</dd>
                </div>
              </dl>
              <div className="button-row">
                <ButtonLink to={`/events/${event.id}/register`}>
                  {event.id === "xplosion-live"
                    ? "View tickets"
                    : "Register free"}
                </ButtonLink>
                <ButtonLink secondary to="/contact">
                  Sponsorship enquiry
                </ButtonLink>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  )
}
