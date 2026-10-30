export const services = [
  {
    title: "Corporate Events",
    copy: "Conferences, launches, awards and brand experiences delivered with precision.",
    image: "/assets/event-audience.jpg",
  },
  {
    title: "Event Production",
    copy: "Stage, sound, lighting, screens, logistics and crews working as one.",
    image: "/assets/event-stage.jpg",
  },
  {
    title: "Concerts & Festivals",
    copy: "From artist booking to crowd management, built for unforgettable scale.",
    image: "/assets/event-performers.jpg",
  },
  {
    title: "Social Events",
    copy: "Culturally grounded celebrations shaped around your people and story.",
    image: "/assets/event-celebration.jpg",
  },
]

export const events = [
  {
    id: "expectant-praiz",
    title: "The Expectant Praiz",
    tagline: "A Sound of Faith for Miracles Awaiting Manifestation.",
    status: "Registration open",
    date: "Date to be announced",
    venue: "Tema, Ghana · Venue to be announced",
    image: "/assets/event-vocalist.jpg",
    tone: "gold",
  },
  {
    id: "yahweh-vigil",
    title: "Yahweh Vigil",
    tagline: "Midnight Encounter. Heaven Comes Down.",
    status: "Coming soon",
    date: "Date to be announced",
    venue: "Tema, Ghana · Venue to be announced",
    image: "/assets/event-choir.jpg",
    tone: "purple",
  },
  {
    id: "xplosion-live",
    title: "Xplosion Live",
    tagline: "Afrobeat Meets Riddim — Tema's Loudest Night.",
    status: "Coming soon",
    date: "Date to be announced",
    venue: "Tema, Ghana · Venue to be announced",
    image: "/assets/event-performers.jpg",
    tone: "black",
  },
]

export const products = [
  {
    id: "crew-tee",
    name: "Gong Crew Tee",
    category: "Apparel",
    price: 150,
    availability: "Pre-order",
    image: "/assets/event-choir.jpg",
  },
  {
    id: "event-pass",
    name: "Collector Event Pass",
    category: "Collectibles",
    price: 80,
    availability: "Available",
    image: "/assets/event-stage.jpg",
  },
  {
    id: "culture-tote",
    name: "Culture Tote",
    category: "Accessories",
    price: 95,
    availability: "Low stock",
    image: "/assets/event-audience.jpg",
  },
]

export const equipment = [
  {
    name: "Professional Audio",
    category: "Sound",
    rate: "Request price",
    copy: "PA systems, monitors and microphones configured for your venue.",
  },
  {
    name: "Stage & Lighting",
    category: "Production",
    rate: "Request price",
    copy: "Stage structures and lighting design for intimate or festival-scale events.",
  },
  {
    name: "LED & Visuals",
    category: "Visual",
    rate: "Request price",
    copy: "LED walls, projectors and event visual systems.",
  },
]

export const properties = [
  {
    id: "tema-land",
    title: "Serviced Land Opportunity",
    type: "Land",
    location: "Tema, Greater Accra",
    price: "Price on request",
    status: "Enquiries open",
    image: "/assets/event-audience.jpg",
  },
  {
    id: "family-home",
    title: "Contemporary Family Home",
    type: "House",
    location: "Location available on enquiry",
    price: "Price on request",
    status: "Preview listing",
    image: "/assets/founder-grey.jpg",
  },
]

export const portfolio = [
  {
    title: "Live Worship Production",
    year: "Portfolio sample",
    category: "Concert Production",
    image: "/assets/event-stage.jpg",
  },
  {
    title: "Artist & Choir Direction",
    year: "Portfolio sample",
    category: "Artist Management",
    image: "/assets/event-choir.jpg",
  },
  {
    title: "Community Experience",
    year: "Portfolio sample",
    category: "Event Management",
    image: "/assets/event-celebration.jpg",
  },
  {
    title: "Stage & Light Design",
    year: "Portfolio sample",
    category: "Production",
    image: "/assets/event-vocalist.jpg",
  },
]

export const navItems = [
  ["Home", "/"],
  ["About Us", "/about"],
  ["Services", "/services"],
  ["Flagship Events", "/events"],
  ["Foundation", "/foundation"],
  ["Portfolio", "/portfolio"],
  ["Shop", "/shop"],
  ["Equipment Hire", "/equipment"],
  ["Properties", "/properties"],
  ["Booking", "/booking"],
  ["Contact", "/contact"],
] as const