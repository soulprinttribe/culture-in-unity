// ============================================================
// TRIBE APPRECIATION BOARD
// The creators we supported at CREATORS DAY.
// Add a person: copy a block, fill it in. That is the whole job.
//
//   slug     -> the URL. /board/eli   (lowercase, no spaces)
//   name     -> shown under the sketch
//   craft    -> one short line. "Musician", "Painter & muralist"
//   instagram-> handle WITHOUT the @
//   sketch   -> file in /public. e.g. "/board/eli.jpg"  (leave "" if not up yet)
//   videos   -> YouTube, Vimeo, Instagram or direct .mp4 links. Any number.
//   message  -> a few words about them. Leave "" and the page just skips it.
//   onBoard  -> true if their frame is physically on the plywood right now
// ============================================================

export const CREATORS = [
  {
    slug: "eli",
    name: "Eli",
    craft: "",
    instagram: "",
    sketch: "/board/eli.jpg",
    videos: [],
    message: "",
    onBoard: true,
  },
  {
    slug: "creator-two",
    name: "Creator Two",
    craft: "",
    instagram: "",
    sketch: "",
    videos: [],
    message: "",
    onBoard: true,
  },
  {
    slug: "creator-three",
    name: "Creator Three",
    craft: "",
    instagram: "",
    sketch: "",
    videos: [],
    message: "",
    onBoard: true,
  },
  {
    slug: "creator-four",
    name: "Creator Four",
    craft: "",
    instagram: "",
    sketch: "",
    videos: [],
    message: "",
    onBoard: false,
  },
];

export function getCreator(slug) {
  return CREATORS.find(function (c) { return c.slug === slug; }) || null;
}

// Turn any video link into something we can actually show.
// Returns { kind: "iframe" | "video" | "link", src, label }
export function videoEmbed(url) {
  const u = String(url || "").trim();
  if (!u) return null;

  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if (yt) {
    return { kind: "iframe", src: "https://www.youtube.com/embed/" + yt[1], label: "Watch" };
  }

  const vm = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) {
    return { kind: "iframe", src: "https://player.vimeo.com/video/" + vm[1], label: "Watch" };
  }

  const ig = u.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/);
  if (ig) {
    return { kind: "iframe", src: "https://www.instagram.com/reel/" + ig[1] + "/embed", label: "Watch on Instagram" };
  }

  if (/\.(mp4|webm|mov)(\?|$)/i.test(u)) {
    return { kind: "video", src: u, label: "Watch" };
  }

  return { kind: "link", src: u, label: "Watch the video" };
}
