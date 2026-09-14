export const brand = {
  name: "Pocket Reels 360",
  shortName: "Pocket Reels",
  handle: "@pocketreels360",
  instagramUrl: "https://www.instagram.com/pocketreels360/",
  youtubeUrl: "https://www.youtube.com/@PocketReels360/shorts",
  description:
    "A reel-maker crew that shoots on iPhone, edits, and delivers hassle-free.",
  locations: ["Dallas", "New York City", "Chicago", "Charlotte"],
  locationLine: "Dallas · NYC · Chicago · Charlotte",
} as const;

export const navigation = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Services", href: "/#services" },
  { label: "Work", href: "/#work" },
  { label: "Reels", href: "/#reels" },
  { label: "Contact", href: "/#contact" },
] as const;

export const reelProcess = [
  {
    index: "01",
    name: "Shoot",
    title: "Shot on iPhone.",
    description:
      "Pocket Reels captures vertical footage where the moment is happening.",
    image: "/media/reel-kiran-dallas.jpg",
    alt: "Temporary placeholder for a colorful night event reel"
  },
  {
    index: "02",
    name: "Edit",
    title: "Built to move.",
    description:
      "Captured moments are shaped into concise, pace-led social reels.",
    image: "/media/reel-anirudh.jpg",
    alt: "Temporary placeholder for a concert lighting reel"
  },
  {
    index: "03",
    name: "Deliver",
    title: "Hassle-free handoff.",
    description:
      "A finished reel, delivered by the same crew that followed the story.",
    image: "/media/reel-henna.jpg",
    alt: "Temporary placeholder for a jewelry still-life reel"
  },
] as const;

export type WorkCategory =
  | "Live & events"
  | "Brands"
  | "Portrait moments"
  | "Real estate";

export type WorkItem = {
  id: string;
  title: string;
  category: WorkCategory;
  image: string;
  alt: string;
  instagramUrl: string;
  featured?: boolean;
};

export const workItems: readonly WorkItem[] = [
  {
    id: "live-stage",
    title: "Live from the stage",
    category: "Live & events",
    image: "/media/reel-concert-aug28.jpg",
    alt: "Temporary placeholder for a live stage reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DcnRv6bJNs6/",
    featured: true,
  },
  {
    id: "ata-moment",
    title: "A moment at ATA",
    category: "Live & events",
    image: "/media/reel-ata.jpg",
    alt: "Temporary placeholder for an event hall reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DbBgeuoJUE4/",
  },
  {
    id: "traditional-detail",
    title: "In the details",
    category: "Portrait moments",
    image: "/media/reel-henna.jpg",
    alt: "Temporary placeholder for a portrait-moment reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DdK0Knbuab6/",
  },
  {
    id: "dallas-night",
    title: "Thank you, Dallas",
    category: "Live & events",
    image: "/media/reel-kiran-dallas.jpg",
    alt: "Temporary placeholder for a Dallas night event reel"
    instagramUrl: "https://www.instagram.com/kiranvocals/reel/DdNyEW4NYIN/",
  },
  {
    id: "aurum-arrival",
    title: "Aurum arrival",
    category: "Brands",
    image: "/media/reel-real-estate.jpg",
    alt: "Temporary placeholder for a real-estate interior reel"
    instagramUrl:
      "https://www.instagram.com/theaurumreality/reel/DdLPGYMoWY8/",
  },
  {
    id: "aurum-room",
    title: "The Wealth Room",
    category: "Brands",
    image: "/media/reel-aurum.jpg",
    alt: "Temporary placeholder for a luxury venue reel"
    instagramUrl:
      "https://www.instagram.com/theaurumreality/reel/DdKuS7FCbdU/",
  },
  {
    id: "signature-moment",
    title: "Signature India Grocery",
    category: "Brands",
    image: "/media/reel-grocery.jpg",
    alt: "Temporary placeholder for a grocery brand reel"
    instagramUrl:
      "https://www.instagram.com/signatureindiagrocery/reel/DdFrlyVizu3/",
  },
  {
    id: "jersey-stage",
    title: "Back in Jersey",
    category: "Live & events",
    image: "/media/reel-jersey.jpg",
    alt: "Temporary placeholder for a live music stage reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DdFqDc4Og6l/",
  },
  {
    id: "hyderabad-conversation",
    title: "The Hyderabad conversation",
    category: "Real estate",
    image: "/media/reel-hyderabad.jpg",
    alt: "Temporary placeholder for an outdoor conversation reel"
    instagramUrl:
      "https://www.instagram.com/sravanthi_prattipati/reel/Dc9RncYpCK8/",
  },
  {
    id: "mass-jathara",
    title: "Mass Jathara",
    category: "Live & events",
    image: "/media/reel-paradise.jpg",
    alt: "Temporary placeholder for a concert spotlight reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DcpSDiMO_AN/",
  },
  {
    id: "anirudh-magic",
    title: "Anirudh's Magic",
    category: "Live & events",
    image: "/media/reel-anirudh.jpg",
    alt: "Temporary placeholder for a red concert lighting reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/Dc535GIptzb/",
  },
  {
    id: "behind-moment",
    title: "Behind the moment",
    category: "Portrait moments",
    image: "/media/reel-shawl.jpg",
    alt: "Temporary placeholder for a candid indoor reel"
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DcPg9YDuG-O/",
  },
];

export const feedItems = workItems.slice(0, 6);

export const highlights = [
  {
    label: "Prabudeva & Noel",
    image: "/media/highlight-prabudeva.jpg",
  },
  {
    label: "Orange Band",
    image: "/media/highlight-orange-band.jpg",
  },
  {
    label: "Varanasi",
    image: "/media/highlight-varanasi.jpg",
  },
] as const;

export const primaryService = {
  id: "reel-production",
  name: "Reel production",
  description: "Shoot, edit, and delivery by the Pocket Reels crew.",
} as const;
