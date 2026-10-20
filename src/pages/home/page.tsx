import { ArrowDown, ArrowRight, Music2 } from "lucide-react"
import { Link } from "react-router"
import {
  equipment,
  events,
  portfolio,
  products,
  properties,
  services,
} from "../../data/mockData"
import { ButtonLink, Eyebrow, Heading, Status } from "../../components/ui"

export default function HomePage() {
  return (
    <>
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

      <section className="trust-strip">
        <div className="shell">
          {[
            "Trusted by Artists",
            "Trusted by Sponsors",
            "Born in Tema",
            "Built for the World",
          ].map((item) => (
            <span key={item}>
              <Music2 size={15} />
              {item}
            </span>
          ))}
        </div>
      </section>

      <section id="story" className="section light-section">
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
          {services.map((service, i) => (
            <Link to="/services" className="service-card" key={service.title}>
              <img src={service.image} alt="" loading="lazy" />
              <div>
                <span>0{i + 1}</span>
                <h3>{service.title}</h3>
                <p>{service.copy}</p>
                <ArrowRight />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section gold-section">
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
          {events.map((event, i) => (
            <article className="event-row" key={event.id}>
              <span className="event-number">0{i + 1}</span>
              <img src={event.image} alt="" loading="lazy" />
              <div>
                <Status>{event.status}</Status>
                <h3>{event.title}</h3>
                <p>{event.tagline}</p>
                <Link to={`/events/${event.id}/register`}>
                  Event details <ArrowRight size={16} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section light-section">
        <div className="shell section-heading">
          <div>
            <Eyebrow dark>Shop the culture</Eyebrow>
            <Heading>
              FROM THE
              <br />
              GONG STORE.
            </Heading>
          </div>
          <ButtonLink secondary to="/shop">
            Visit the shop
          </ButtonLink>
        </div>
        <div className="shell product-preview">
          {products.map((product) => (
            <Link to="/shop" key={product.id}>
              <div className="product-image">
                <img src={product.image} alt="" loading="lazy" />
                <span>{product.availability}</span>
              </div>
              <h3>{product.name}</h3>
              <p>GHS {product.price.toFixed(2)}</p>
            </Link>
          ))}
        </div>
      </section>

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
              {equipment.length} production categories are currently in the demo
              catalogue.
            </p>
            <ButtonLink to="/equipment">Request equipment quote</ButtonLink>
          </div>
          <div className="preview-photo">
            <img
              src="/assets/event-stage.jpg"
              alt="Live event stage production"
              loading="lazy"
            />
          </div>
          <div className="mini-list">
            <Eyebrow>Property desk</Eyebrow>
            {properties.map((item) => (
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

      <section className="section light-section portfolio-home">
        <div className="shell section-heading">
          <div>
            <Eyebrow dark>Selected work</Eyebrow>
            <Heading>
              PROOF.
              <br />
              NOT PROMISES.
            </Heading>
          </div>
          <ButtonLink secondary to="/portfolio">
            See the portfolio
          </ButtonLink>
        </div>
        <div className="shell portfolio-strip">
          {portfolio.slice(0, 3).map((item, i) => (
            <figure className={i === 1 ? "tall" : ""} key={item.title}>
              <img src={item.image} alt="" loading="lazy" />
              <figcaption>
                <span>{item.category}</span>
                <h3>{item.title}</h3>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

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
          <ButtonLink to="/booking">Start a project</ButtonLink>
        </div>
      </section>
    </>
  )
}
