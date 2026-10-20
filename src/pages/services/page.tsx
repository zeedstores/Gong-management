import { Check } from "lucide-react"
import { services } from "../../data/mockData"
import { ButtonLink, Eyebrow, Heading, PageHero } from "../../components/ui"

const details = [
  [
    "Corporate Events",
    [
      "End-of-year parties & awards",
      "Product launches & activations",
      "Conferences, seminars & summits",
      "Team-building & retreats",
    ],
  ],
  [
    "Event Production",
    [
      "Stage design & construction",
      "Professional sound & lighting",
      "LED screens, generators & tents",
      "Logistics, décor & event staffing",
    ],
  ],
  [
    "Concerts & Festivals",
    [
      "Artist booking & negotiation",
      "Ticketing & sponsorship",
      "Security coordination",
      "Promotion & crowd management",
    ],
  ],
  [
    "Social Events",
    [
      "Weddings & birthdays",
      "Funerals & memorials",
      "Naming ceremonies",
      "Community events & carnivals",
    ],
  ],
]

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="WE PLAN. WE PRODUCE. WE MAKE IT EXPLODE."
        copy="One accountable team across creative direction, talent, technical production and event delivery."
        image="/assets/event-stage.jpg"
      />
      <section className="section light-section">
        <div className="shell detailed-services">
          {details.map(([title, items], i) => (
            <article key={title as string}>
              <div className="service-title">
                <span>0{i + 1}</span>
                <h2>{title}</h2>
                <p>{services[i].copy}</p>
              </div>
              <ul>
                {(items as string[]).map((item) => (
                  <li key={item}>
                    <Check size={18} />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section className="section dark-section">
        <div className="shell">
          <div className="section-heading">
            <div>
              <Eyebrow>Production packages</Eyebrow>
              <Heading>
                SCALE WITHOUT
                <br />
                THE GUESSWORK.
              </Heading>
            </div>
            <p>
              Illustrative package bands shown for planning. Scope, inventory
              and rates remain editable and are confirmed by quotation.
            </p>
          </div>
          <div className="package-grid">
            {[
              ["Basic", "50–200 guests"],
              ["Standard", "200–800 guests"],
              ["Premium", "800+ guests"],
            ].map(([name, size]) => (
              <article key={name}>
                <span>Production package</span>
                <h3>{name}</h3>
                <p>{size}</p>
                <small>Final scope and price by quotation</small>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section gold-section">
        <div className="shell process">
          <Eyebrow dark>How it works</Eyebrow>
          <Heading>
            FROM IDEA
            <br />
            TO IMPACT.
          </Heading>
          <div>
            {[
              "Tell us your idea.",
              "Receive a plan and quotation.",
              "Confirm your booking.",
              "We bring it to life.",
            ].map((item, i) => (
              <p key={item}>
                <span>0{i + 1}</span>
                {item}
              </p>
            ))}
          </div>
          <p className="fine-print">
            A 50% deposit may be required to secure event bookings, subject to
            the company's confirmed terms.
          </p>
          <div className="button-row">
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
