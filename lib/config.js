// ============================================================
// EVENT CONFIG - SOULPRINT can edit these values, no code needed
// ============================================================

export const EVENT = {
    name: "CULTURE IN UNITY",
    host: "SOULPRINT COLLECTIVE",
    tagline: "Many cultures, one soul",
    tagline2: "Unity within the difference",
    frame: "Conscious Creators Night Experience",
    dateLabel: "Sunday, August 9",
    timeLabel: "2:00-8:00 PM (doors 2 PM)",
    dateISO: "2026-08-09",
    venueName: "Absurd Conclave",
    venueAddress: "360 Jefferson St, Brooklyn, NY",
};

// Total capacity cap (confirmed: 200 - may change later)
export const TOTAL_CAP = 200;

// Ticket tiers. Early Bird: first-N cutoff (sold until qty runs out).
export const TIERS = {
    early_bird: {
          id: "early_bird",
          name: "Early Bird",
          price: 2500,
          priceLabel: "$25",
          includesFood: true,
          qty: 20,
          wristband: "Yellow",
          blurb: "First 20 souls through the portal - includes a cultural food plate.",
    },
    ga: {
          id: "ga",
          name: "General Admission",
          price: 3500,
          priceLabel: "$35",
          includesFood: false,
          qty: 100,
          wristband: "Blue",
          blurb: "Full access to every activation, 2-8 PM.",
    },
    ga_food: {
          id: "ga_food",
          name: "GA + Food",
          price: 5000,
          priceLabel: "$50",
          includesFood: true,
          qty: 50,
          wristband: "Green",
          blurb: "Full access + a cultural food plate included.",
    },
};

// ============================================================
// PARTICIPANT ROLES - artist & vendor self-serve funnels.
// fee is in cents. cap = hard limit of paid spots. color = QR + door badge.
// SOULPRINT can edit fees / caps here, no code needed.
// ============================================================
export const ROLES = {
    artist: {
          id: "artist",
          label: "Artist",
          fee: 2000,
          feeLabel: "$20",
          cap: 20,
          color: "#e0403f",
          noun: "artwork",
    },
    vendor: {
          id: "vendor",
          label: "Vendor",
          fee: 10000,
          feeLabel: "$100",
          cap: 10,
          color: "#2ab7ca",
          noun: "booth",
    },
};

export function roleList() {
    return Object.values(ROLES);
}

// The activations, in run-of-show order. Times are placeholders.
export const ACTIVATIONS = [
  {
    id: "meditation",
    name: "Meditation & Sound Healing",
    time: "2:15 PM",
    mini: "Stillness, sound & ancestors.",
    desc: "We open in stillness - a guided meditation and live sound healing to arrive, breathe, and connect to our ancestors.",
    long: "We begin the day the way our ancestors did - together, in stillness. A guided meditation woven with live sound healing to settle the body, open the heart, and call in the lineage that carried us here. This is where we set the intention for everything that follows: to remember that beneath every language and every flag, we are one people. Come as you are. Arrive fully.",
    people: [],
  },
  {
    id: "film",
    name: "Short Film: DYSTOPIA 2077",
    time: "3:00 PM",
    mini: "A SOULPRINT original screening.",
    desc: "A SOULPRINT original screening - a vision of the world we're moving through, and the one we're building beyond it.",
    long: "A screening of DYSTOPIA 2077, an original short film from the SOULPRINT collective. Step inside the screen and into a vision of the world as it could become - and the choice, still ours, to build something else. The film sets the themes we carry into the conversation that follows.",
    people: [],
  },
  {
    id: "panel",
    name: "Artist Panel",
    time: "3:45 PM",
    mini: "The creators in conversation.",
    desc: "The creators in conversation - unpacking the themes and questions raised by DYSTOPIA 2077.",
    long: "Directly after the screening, the creators sit down for a conversation about the film itself - the topics and themes it explores, the questions it raises, and the world it points toward. An open, honest dialogue about the ideas inside the story, and what they ask of us. Bring your own questions.",
    people: [],
  },
  {
    id: "food",
    name: "Cultural Food - The Collective Meal",
    time: "4:15 PM",
    mini: "One table, one family.",
    desc: "We gather at one table to share a meal - many kitchens, one family. Come hungry.",
    long: "After the conversation, we break bread together. A collective meal drawn from many cultures and served at one table - because to share food is to become family. Vegetarian and meat plates both on offer.",
    menu: [
      "Jerk chicken",
      "Steamed cabbage",
      "Vegetarian rasta pasta",
      "Rice and beans",
      "Mushroom & lentil tostadas",
      "Channa masala",
      "Lo mein with vegetables",
    ],
    drinks: ["Lemonade", "Hibiscus juice"],
    people: [],
  },
  {
    id: "fashion",
    name: "Fashion Show",
    time: "5:00 PM",
    mini: "The flag-walk runway.",
    desc: "The flag-walk - designers and models carry their cultures down the runway, every flag a story.",
    long: "The flag-walk: designers and models carrying their heritage down the runway, every look a story, every flag a nation. A celebration of culture as couture. Designers being confirmed.",
    people: [],
  },
  {
    id: "performances",
    name: "Live Performances",
    time: "5:45 PM",
    mini: "Sound as ceremony.",
    desc: "Live sets from conscious performers - sound as ceremony, frequency as medicine.",
    long: "Music and spoken word from artists whose sound carries a message - frequencies meant to activate, not just entertain. The full lineup is being confirmed.",
    people: [],
  },
  {
    id: "dance",
    name: "Dance Class",
    time: "6:15 PM",
    mini: "Move with us.",
    desc: "Move with us - a guided journey through rhythms and movement from around the world.",
    long: "A guided dance class led by our choreographers to close the arc in motion - a journey through rhythms and movement traditions from across the diaspora. No experience needed, just presence and a willingness to move. Choreographers being confirmed.",
    people: [],
  },
  {
    id: "art",
    name: "Art Showcase",
    time: "All day",
    mini: "Original works, for sale.",
    desc: "Original works from community artists line the walls - every piece for sale, every sale feeds a creator.",
    long: "Throughout the day, original works from our community of artists line the walls. Every piece is available to collect, and every sale goes directly to the creator. Want to show your work? Apply through the artist portal.",
    people: [],
  },
  {
    id: "market",
    name: "Marketplace & Vendors",
    time: "All day",
    mini: "A conscious makers' bazaar.",
    desc: "A bazaar of conscious makers - art, goods, garments, and offerings from the tribe.",
    long: "A marketplace of conscious makers open all day - art, garments, goods, and offerings from vendors across the community. Wear it, read it, gift it, take it home. Want a booth? Apply through the vendor portal.",
    people: [],
  },
];

export function tierList() {
    return Object.values(TIERS);
}
