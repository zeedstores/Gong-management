import { ButtonLink, Eyebrow, Heading, PageHero } from "../../components/ui"

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Gong"
        title="BORN IN TEMA. BUILT FOR THE WORLD."
        copy="A Ghanaian event and artist management company connecting Gospel, Afrobeat, Reggae and Dancehall with professional production and fearless talent development."
        image="/assets/event-celebration.jpg"
      />
      <section className="section light-section">
        <div className="shell editorial-grid">
          <div>
            <Eyebrow dark>The company</Eyebrow>
            <Heading>
              CULTURE ISN'T
              <br />
              OUR THEME.
              <br />
              IT'S OUR CORE.
            </Heading>
          </div>
          <div className="rich-copy">
            <p>
              Gong Management exists to turn raw ideas and raw talent into
              experiences that move people. From Tema, we build bridges between
              artists, audiences, brands and global opportunity.
            </p>
            <p>
              Our way of working is grounded in professionalism, transparency
              and timely payment. Every artist deserves respect. Every client
              deserves clarity. Every crowd deserves a moment worth remembering.
            </p>
          </div>
        </div>
      </section>
      <section className="section dark-section">
        <div className="shell value-grid">
          <article>
            <span>01</span>
            <h3>Mission</h3>
            <p>
              Amplify Ghanaian sound through unforgettable live experiences and
              fearless artist development.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>Vision</h3>
            <p>
              Become Ghana's most trusted bridge between raw talent and global
              stages.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>Values</h3>
            <p>For the Culture. For the Artist. For the Crowd.</p>
          </article>
        </div>
      </section>
      <section className="section light-section">
        <div className="shell founder-grid">
          <img
            src="/assets/founder-navy.jpg"
            alt="Gong Management founder portrait"
          />
          <div>
            <Eyebrow dark>Leadership</Eyebrow>
            <Heading>
              BUILT ON TRUST.
              <br />
              DRIVEN BY SOUND.
            </Heading>
            <p>
              The supplied leadership portrait is presented without an invented
              name or biography. Confirmed profile details can be added through
              the future content system.
            </p>
            <ButtonLink to="/contact">Connect with the team</ButtonLink>
          </div>
        </div>
      </section>
      <section className="final-cta">
        <div className="shell">
          <Eyebrow>Why Gong</Eyebrow>
          <Heading>
            LOCAL KNOWLEDGE.
            <br />
            <span>WORLD-CLASS INTENT.</span>
          </Heading>
          <ButtonLink to="/booking">Work with us</ButtonLink>
        </div>
      </section>
    </>
  )
}
