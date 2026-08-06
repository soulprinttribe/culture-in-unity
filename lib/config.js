// ============================================================
// EVENT CONFIG - SOULPRINT can edit these values, no code needed
// ============================================================

export const EVENT = {
    name: "SOULS IN THE PARK",
    host: "SOULPRINT COLLECTIVE",
    tagline: "Walk in a stranger. Leave with a tribe.",
    tagline2: "Community over vision",
    frame: "A free gathering in the grass",
    dateLabel: "Sunday, August 9",
    timeLabel: "3:00-8:00 PM",
    dateISO: "2026-08-09",
    venueName: "The Peristyle, Prospect Park",
    venueAddress: "Prospect Park, Brooklyn, NY",
    mapUrl: "https://maps.google.com/?q=The+Peristyle+Prospect+Park+Brooklyn",
};

// Free gathering in a public park - no cap, no door.
export const TOTAL_CAP = 0;

// No ticketing. This gathering is free - RSVP only, no checkout.
// (Left as an empty object so the inventory/checkout routes still compile
//  and safely refuse any request. To sell tickets again, add tiers here.)
export const TIERS = {};

export const ADDONS = {};

export function addonList() {
    return Object.values(ADDONS);
}

// What to bring - shown on the site and the flyer.
export const BRING = [
    "a blanket",
    "water",
    "your instrument",
    "your art",
    "someone you love",
];

// ============================================================
// PARTICIPANT ROLES - artist / performer / vendor self-serve funnels.
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
    perform: {
          id: "perform",
          label: "Performer",
          fee: 0,
          feeLabel: "Free",
          cap: 12,
          color: "#f5e829",
          noun: "set",
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
};

export function roleList() {
    return Object.values(ROLES);
}

// The activations, in run-of-show order.
export const ACTIVATIONS = [
  { id: "arrival", name: "Arrival", time: "3:00 PM", desc: "Find us on the grass. Lay your blanket down, meet the makers, walk the art. No rush." },
  { id: "meditation", name: "Meditation", time: "3:30 PM", desc: "We open the way we mean to go on - together, in stillness. A grounding meditation to arrive and set the intention for the day." },
  { id: "soul_circle", name: "Soul Circle Session", time: "4:00 PM", desc: "We sit in circle and speak honestly - about culture, separation, and what it actually takes to be one people. Open floor. Every voice welcome." },
  { id: "drum_circle", name: "Drum Circle", time: "4:45 PM", desc: "Rhythm is the oldest language we have. Bring your drum, bring your hands, bring whatever makes a sound." },
  { id: "dance", name: "Cultural Dance", time: "5:20 PM", desc: "Move with us. A guided journey through rhythms from around the world, led by two teachers. No experience needed." },
  { id: "performances", name: "Live Performances", time: "6:10 PM", desc: "Live sets from conscious performers - sound as ceremony, frequency as medicine. Want the stage? Sign up through the performer portal." },
  { id: "closing", name: "Sound Healing", time: "7:20 PM", desc: "We close the way we opened - in sound and stillness. A final sound bath to integrate the day and carry it out with you." },
  { id: "art", name: "Art Showcase", time: "All day", desc: "Original works from community artists, out in the open air. Want to show your work or perform? Both doors are open." },
  { id: "market", name: "Art & Vendors", time: "All day", desc: "A small circle of conscious makers - wear it, read it, gift it, take it home." },
];

export function tierList() {
    return Object.values(TIERS);
}
