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
          price: 2000,
          priceLabel: "$20",
          includesFood: false,
          qty: 50,
          wristband: "Yellow",
          blurb: "First 50 souls through the portal.",
    },
    ga: {
          id: "ga",
          name: "General Admission",
          price: 3000,
          priceLabel: "$30",
          includesFood: false,
          qty: 100,
          wristband: "Blue",
          blurb: "Full access to every activation, 2-8 PM.",
    },
    ga_food: {
          id: "ga_food",
          name: "GA + Food",
          price: 4500,
          priceLabel: "$45",
          includesFood: true,
          qty: 50,
          wristband: "Green",
          blurb: "Full access + a cultural food plate included.",
    },
};

// The activations, in run-of-show order. Times are placeholders.
export const ACTIVATIONS = [
  { id: "meditation", name: "Meditation", time: "2:15 PM", desc: "We open the portal together - a grounding meditation to arrive, breathe, and set the intention for the day." },
  { id: "film", name: "Short Film: DYSTOPIA 2077", time: "3:00 PM", desc: "A SOULPRINT original screening - step inside the screen and see the world we're choosing not to build." },
  { id: "panel", name: "Artist Panel", time: "3:45 PM", desc: "Conscious creators in conversation - on culture, craft, and building outside the system." },
  { id: "dance", name: "Dance Class", time: "4:30 PM", desc: "Move with us. A guided dance journey through rhythms from around the world." },
  { id: "fashion", name: "Fashion Show", time: "5:15 PM", desc: "The flag-walk - designers and models carry their cultures down the runway, every flag a story." },
  { id: "performances", name: "Live Performances", time: "6:00 PM", desc: "Live sets from conscious performers - sound as ceremony." },
  { id: "art", name: "Art Showcase", time: "All day", desc: "Original works from community artists line the walls - every piece is for sale, every sale feeds a creator." },
  { id: "food", name: "Cultural Food", time: "All day", desc: "Plates from many kitchens, one table. Taste the diaspora." },
  { id: "market", name: "Marketplace & Vendors", time: "All day", desc: "A bazaar of conscious makers - wear it, read it, burn it, gift it." },
  ];

export function tierList() {
    return Object.values(TIERS);
}
