
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

      {/* COMPANY STORY */}
      <section className="section light-section py-16 sm:py-20 lg:py-28">
        <div className="shell grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
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

          <div className="rich-copy space-y-5 text-sm leading-7 sm:text-base sm:leading-8">
            <p>
              Gong Managements exists to turn raw ideas and raw talent into
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

      {/* MISSION, VISION AND VALUES */}
      <section className="section dark-section py-16 sm:py-20 lg:py-24">
        <div className="shell">
          <div className="mb-10 max-w-xl sm:mb-12">
            <Eyebrow>What drives us</Eyebrow>
            <Heading>
              OUR PURPOSE.
              <br />
              OUR DIRECTION.
            </Heading>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
            <article className="border border-white/15 p-6 sm:p-8">
              <span className="text-sm font-bold tracking-widest text-[#d6aa33]">
                01
              </span>
              <h3 className="mt-6 text-2xl font-bold">Mission</h3>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                Amplify Ghanaian sound through unforgettable live experiences
                and fearless artist development.
              </p>
            </article>

            <article className="border border-white/15 p-6 sm:p-8">
              <span className="text-sm font-bold tracking-widest text-[#d6aa33]">
                02
              </span>
              <h3 className="mt-6 text-2xl font-bold">Vision</h3>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                Become Ghana's most trusted bridge between raw talent and
                global stages.
              </p>
            </article>

            <article className="border border-white/15 p-6 sm:p-8 sm:col-span-2 lg:col-span-1">
              <span className="text-sm font-bold tracking-widest text-[#d6aa33]">
                03
              </span>
              <h3 className="mt-6 text-2xl font-bold">Values</h3>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
                For the Culture. For the Artist. For the Crowd.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="section light-section py-16 sm:py-20 lg:py-28">
        <div className="shell grid grid-cols-1 items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <img
              src="/assets/founder-navy.jpg"
              alt="Gong Management founder portrait"
              loading="lazy"
              decoding="async"
              width="900"
              height="1100"
              className="aspect-[4/5] w-full object-cover object-top"
            />
          </div>

          <div>
            <Eyebrow dark>Leadership</Eyebrow>
            <Heading>
              BUILT ON TRUST.
              <br />
              DRIVEN BY SOUND.
            </Heading>

            <p className="mt-5 max-w-xl text-sm leading-7 text-black/70 sm:text-base sm:leading-8">
              Strong management starts with trust, clear communication and a
              commitment to doing things right. Gong Management brings that
              approach to every artist, client and event we work with.
            </p>

            <div className="mt-7">
              <ButtonLink to="/contact">Connect with the team</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="final-cta py-16 sm:py-20 lg:py-28">
        <div className="shell">
          <Eyebrow>Why Gong</Eyebrow>
          <Heading>
            LOCAL KNOWLEDGE.
            <br />
            <span>WORLD-CLASS INTENT.</span>
          </Heading>

          <div className="mt-7">
            <ButtonLink to="/booking">Work with us</ButtonLink>
          </div>
        </div>
      </section>
    </>
  )
}
