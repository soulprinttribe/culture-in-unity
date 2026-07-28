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
    timeLabel: "3:00-8:00 PM (doors 3 PM)",
    dateISO: "2026-08-09",
    venueName: "Brooklyn, NY",
    venueAddress: "Exact location shared with ticket holders",
};

// Total capacity cap - intimate gathering, one space.
export const TOTAL_CAP = 100;

// Ticket tiers. One tier, one price, no friction.
export const TIERS = {
    entry: {
          id: "entry",
          name: "Entry",
          price: 555,
          priceLabel: "$5.55",
          includesFood: false,
          qty: 100,
          wristband: "Yellow",
          blurb: "One price, one tribe. Full access to every activation.",
    },
};

// Optional add-ons at checkout. Priced in cents.
export const ADDONS = {
    food: {
          id: "food",
          name: "Cultural Food Plate",
          price: 1000,
          priceLabel: "$10",
          blurb: "A plate from the collective meal - many kitchens, one table.",
    },
};

export function addonList() {
    return Object.values(ADDONS);
}

// ============================================================
// PARTICIPANT ROLES - artist / vendor / performer self-serve funnels.
// fee is in cents (0 = free, no checkout). cap = hard limit of spots.
// ============================================================
export const ROLES = {
    artist: {
          id: "artist",
          label: "Artist",
          fee: 0,
          feeLabel: "Free",
          cap: 20,
          color: "#e0403f",
          noun: "artwork",
    },
    vendor: {
          id: "vendor",
          label: "Vendor",
          fee: 4000,
          feeLabel: "$40",
          cap: 10,
          color: "#2ab7ca",
          noun: "booth",
    },
    perform: {
          id: "perform",
          label: "Performer",
          fee: 0,
          feeLabel: "Free",
          cap: 12,
          color: "#f5e829",
          noun: "set",
    },
};

export function roleList() {
    return Object.values(ROLES);
}

// The activations, in run-of-show order. Times are placeholders.
export const ACTIVATIONS = [
  { id: "meditation", name: "Meditation & Sound Healing", time: "3:15 PM", desc: "We open the portal together - a grounding meditation and live sound to arrive, breathe, and set the intention for the day." },
  { id: "film_trailer", name: "First Look: DYSTOPIA 2077", time: "3:50 PM", desc: "The trailer for our original short film - a first look at the world we're choosing not to build. The full screening gets its own night." },
  { id: "soul_circle", name: "Soul Circle: Culture & Unity", time: "4:05 PM", desc: "Straight from the trailer into circle. We speak honestly about culture, separation, and what it actually takes to be one people. Every voice welcome - this is a conversation, not a panel." },
  { id: "food", name: "Cultural Food - The Collective Meal", time: "4:45 PM", desc: "We break bread together. Plates from many kitchens at one table, because to share food is to become family." },
  { id: "dance", name: "Dance Class", time: "5:30 PM", desc: "Move with us. A guided journey through rhythms and movement from around the world. No experience needed." },
  { id: "performances", name: "Live Performances", time: "6:15 PM", desc: "Live sets from conscious performers - sound as ceremony, frequency as medicine. Want the stage? Submit your music through the performer portal." },
  { id: "closing", name: "Closing Sound Healing", time: "7:15 PM", desc: "We close the way we opened - in sound and stillness. A final sound bath to integrate the day and carry it out with you." },
  { id: "art", name: "Art Showcase", time: "All day", desc: "Original works from community artists line the walls - every piece is for sale, every sale feeds a creator. Want to show your work or perform? Both doors are open." },
  { id: "market", name: "Marketplace & Vendors", time: "All day", desc: "A bazaar of conscious makers - wear it, read it, gift it, take it home." },
];

export function tierList() {
    return Object.values(TIERS);
}
