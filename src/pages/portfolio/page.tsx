import { portfolio } from "../../data/mockData"
import { Eyebrow, Heading, PageHero } from "../../components/ui"

export default function PortfolioPage() {
  return (
    <>
      <PageHero
        eyebrow="Selected work"
        title="PROOF. NOT PROMISES."
        copy="A visual archive prepared for confirmed event, production and artist work. Current items are clearly marked portfolio samples."
        image="/assets/event-vocalist.jpg"
      />
      <section className="section light-section">
        <div className="shell portfolio-masonry">
          {portfolio.map((item, i) => (
            <figure className={i % 3 === 0 ? "wide" : ""} key={item.title}>
              <img src={item.image} alt="" loading="lazy" />
              <figcaption>
                <Eyebrow dark>
                  {item.year} · {item.category}
                </Eyebrow>
                <Heading>{item.title}</Heading>
                <p>
                  Replaceable demonstration entry. Verified project details,
                  credits and media can be managed from the future dashboard.
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </>
  )
}
