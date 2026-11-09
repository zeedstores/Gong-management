
import { ButtonLink, Eyebrow, Heading, PageHero } from "../../components/ui"

const packages = [
  {
    name: "Title Sponsor",
    price: "GH₵1,000,000+",
    description: "Best for one major company that wants to own the event.",
    benefits: [
      "Event named after your brand.",
      "Largest logo on all flyers, banners, tickets and stage backdrop.",
      "20 VIP tickets and 5 VVIP tables.",
      "10 minutes to speak on stage or play your advert.",
      "5 dedicated posts and 10 stories across Gong Managements pages.",
      "MC mentions every 20 minutes.",
      "Right to sell or sample products at the venue.",
      "Full event video for your marketing.",
    ],
  },
  {
    name: "Platinum Sponsor",
    price: "GH₵70,000",
    description: "Premium visibility and strong brand presence.",
    benefits: [
      "Large logo on all flyers, banners and stage backdrop.",
      "10 VIP tickets and 2 VVIP tables.",
      "5 minutes to speak or play your advert.",
      "3 dedicated posts and 7 stories.",
      "MC mention every hour.",
      "Exhibition stand at the venue.",
    ],
  },
  {
    name: "Gold Sponsor",
    price: "GH₵50,000",
    description: "Strong visibility for brands looking to reach our audience.",
    benefits: [
      "Medium logo on flyers, banners and backdrop.",
      "5 VIP tickets.",
      "2 dedicated posts and 5 stories.",
      "MC mention 3 times during the event.",
      "Exhibition stand at the venue.",
    ],
  },
  {
    name: "Silver Sponsor",
    price: "GH₵30,000",
    description: "A practical sponsorship option for growing brands.",
    benefits: [
      "Small logo on flyer and backdrop.",
      "2 VIP tickets.",
      "1 dedicated post and 3 stories.",
      "MC mention 2 times during the event.",
    ],
  },
  {
    name: "Bronze Sponsor",
    price: "GH₵20,000",
    description: "Support the experience and get your brand noticed.",
    benefits: [
      "Logo on flyer and backdrop.",
      "2 regular event tickets.",
      "1 group post and 2 stories.",
      "MC mention once during the event.",
    ],
  },
]

function PackageCard({
  name,
  price,
  description,
  benefits,
}: {
  name: string
  price: string
  description: string
  benefits: string[]
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b58b26]">
          Sponsorship package
        </p>
        <h3 className="mt-3 text-2xl font-bold text-neutral-950">{name}</h3>
        <p className="mt-3 text-3xl font-bold text-neutral-950">{price}</p>
        <p className="mt-3 text-sm leading-7 text-neutral-600">
          {description}
        </p>
      </div>

      <div className="my-6 border-t border-neutral-200" />

      <h4 className="text-sm font-bold text-neutral-950">
        What you receive
      </h4>

      <ul className="mt-4 flex-1 space-y-3">
        {benefits.map((benefit) => (
          <li
            key={benefit}
            className="flex gap-3 text-sm leading-6 text-neutral-600"
          >
            <span className="font-bold text-[#b58b26]">✓</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <ButtonLink
          to={`/contact?type=sponsorship&package=${encodeURIComponent(name)}`}
        >
          Choose this package
        </ButtonLink>
      </div>
    </article>
  )
}

export default function SponsorshipPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHero
        eyebrow="Partner with Gong Managements"
        title="PUT YOUR BRAND ON THE BIG STAGE."
        copy="Reach audiences, build brand recognition and become part of experiences people will remember."
        image="/assets/event.jpeg"
      />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <Eyebrow dark>Gong Managements</Eyebrow>
          <Heading>Sponsorship packages</Heading>
          <p className="mt-5 leading-8 text-neutral-600">
            Your brand in front of our audience — on stage, on social media,
            on flyers and on the day of the event. Choose a package that
            matches your brand's goals.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {packages.map((item) => (
            <PackageCard key={item.name} {...item} />
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-10">
          <Eyebrow dark>Partnership opportunity</Eyebrow>
          <h3 className="mt-3 text-2xl font-bold text-neutral-950">
            Media / In-kind Partner
          </h3>
          <p className="mt-3 text-xl font-bold text-neutral-950">
            Value-based contribution
          </p>
          <p className="mt-3 max-w-2xl leading-7 text-neutral-600">
            Designed for radio stations, television stations, bloggers,
            drinks companies, food companies and sound companies.
          </p>

          <ul className="mt-6 space-y-3 text-sm leading-6 text-neutral-600">
            <li>✓ Logo on flyer as Media Partner or Supported By.</li>
            <li>✓ 1 dedicated post and 2 stories.</li>
            <li>✓ 2 event tickets.</li>
          </ul>

          <div className="mt-8">
            <ButtonLink to="/contact?type=sponsorship&package=Media%20%2F%20In-kind%20Partner">
              Discuss a partnership
            </ButtonLink>
          </div>
        </div>

        <div className="mt-14 text-center">
          <h3 className="text-2xl font-bold text-neutral-950">
            Have a different partnership idea?
          </h3>
          <p className="mt-3 text-neutral-600">
            Speak with our team about a sponsorship arrangement that fits
            your organisation.
          </p>
          <div className="mt-6">
            <ButtonLink to="/contact">Contact our team</ButtonLink>
          </div>
        </div>
      </section>
    </div>
  )
}
