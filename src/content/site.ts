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
    alt: "Kiran performing live on stage in Dallas, captured in vertical iPhone footage",
  },
  {
    index: "02",
    name: "Edit",
    title: "Built to move.",
    description:
      "Captured moments are shaped into concise, pace-led social reels.",
    image: "/media/reel-anirudh.jpg",
    alt: "Anirudh on stage bathed in dramatic red concert lighting",
  },
  {
    index: "03",
    name: "Deliver",
    title: "Hassle-free handoff.",
    description:
      "A finished reel, delivered by the same crew that followed the story.",
    image: "/media/reel-henna.jpg",
    alt: "Intricate henna pattern detail, shot in close-up portrait style",
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
    alt: "Artist performing on a concert stage, crowd illuminated by stage lights",
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DcnRv6bJNs6/",
    featured: true,
  },
  {
    id: "ata-moment",
    title: "A moment at ATA",
    category: "Live & events",
    image: "/media/reel-ata.jpg",
    alt: "Candid moment captured inside the ATA event hall, warm ambient lighting",
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DbBgeuoJUE4/",
  },
  {
    id: "traditional-detail",
    title: "In the details",
    category: "Portrait moments",
    image: "/media/reel-henna.jpg",
    alt: "Close-up of intricate henna art on hand, warm earthy tones",
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DdK0Knbuab6/",
  },
  {
    id: "dallas-night",
    title: "Thank you, Dallas",
    category: "Live & events",
    image: "/media/reel-kiran-dallas.jpg",
    alt: "Kiran performing at a Dallas night event, stage bathed in warm spotlights",
    instagramUrl: "https://www.instagram.com/kiranvocals/reel/DdNyEW4NYIN/",
  },
  {
    id: "aurum-arrival",
    title: "Aurum arrival",
    category: "Brands",
    image: "/media/reel-real-estate.jpg",
    alt: "Luxury real estate interior space — clean lines, natural light",
    instagramUrl:
      "https://www.instagram.com/theaurumreality/reel/DdLPGYMoWY8/",
  },
  {
    id: "aurum-room",
    title: "The Wealth Room",
    category: "Brands",
    image: "/media/reel-aurum.jpg",
    alt: "The Aurum luxury venue interior, polished surfaces and ambient lighting",
    instagramUrl:
      "https://www.instagram.com/theaurumreality/reel/DdKuS7FCbdU/",
  },
  {
    id: "signature-moment",
    title: "Signature India Grocery",
    category: "Brands",
    image: "/media/reel-grocery.jpg",
    alt: "Signature India Grocery store, vibrant produce displays and branding",
    instagramUrl:
      "https://www.instagram.com/signatureindiagrocery/reel/DdFrlyVizu3/",
  },
  {
    id: "jersey-stage",
    title: "Back in Jersey",
    category: "Live & events",
    image: "/media/reel-jersey.jpg",
    alt: "Live music performance on a New Jersey stage, artist in spotlight",
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DdFqDc4Og6l/",
  },
  {
    id: "hyderabad-conversation",
    title: "The Hyderabad conversation",
    category: "Real estate",
    image: "/media/reel-hyderabad.jpg",
    alt: "Outdoor conversation moment with Hyderabad architecture in the background",
    instagramUrl:
      "https://www.instagram.com/sravanthi_prattipati/reel/Dc9RncYpCK8/",
  },
  {
    id: "mass-jathara",
    title: "Mass Jathara",
    category: "Live & events",
    image: "/media/reel-paradise.jpg",
    alt: "Mass Jathara concert — performer under sweeping stage spotlight",
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/DcpSDiMO_AN/",
  },
  {
    id: "anirudh-magic",
    title: "Anirudh's Magic",
    category: "Live & events",
    image: "/media/reel-anirudh.jpg",
    alt: "Anirudh Ravichander performing live, surrounded by vivid red stage lighting",
    instagramUrl:
      "https://www.instagram.com/pocketreels360/reel/Dc535GIptzb/",
  },
  {
    id: "behind-moment",
    title: "Behind the moment",
    category: "Portrait moments",
    image: "/media/reel-shawl.jpg",
    alt: "Candid indoor portrait — subject draped in a colourful woven shawl",
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
