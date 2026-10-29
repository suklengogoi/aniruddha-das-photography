/* Aniruddha Das Photography — site content.
   Edit this file to change albums, films or contact details. */
window.SITE = {
  contact: {
    phoneDisplay: "+91 70027 10266",
    phone: "+917002710266",
    whatsapp: "917002710266",
    email: "das.lens5@gmail.com",
    instagram: "https://www.instagram.com/aniruddhadasphotography/",
    facebook: "https://www.facebook.com/Aniruddhadasphotographyy/"
  },

  /* tint = the colour the page takes on when that album is open */
  albums: [
    { slug: "couples",    title: "Couples",          blurb: "Engagements, pre-wedding days and the quiet moments between two people.", count: 20, cover: "14", stack: ["06", "01"], tint: "#F7D2C9" },
    { slug: "bridal",     title: "Bridal portraits", blurb: "Brides in silk, gold and window light, photographed with patience.",       count: 15, cover: "04", stack: ["12", "09"], tint: "#F8DC8B" },
    { slug: "ceremony",   title: "Wedding rituals",  blurb: "Haldi, the mandap and every tradition in between, as it happened.",        count: 6,  cover: "02", stack: ["04", "01"], tint: "#F5B88E" },
    { slug: "details",    title: "Details & jewellery", blurb: "Mehendi, heirloom gold and the textures you will want to remember.",   count: 10, cover: "06", stack: ["10", "07"], tint: "#DCCBEA" },
    { slug: "monochrome", title: "Black & white",    blurb: "Light, shadow and feeling, with the colour taken away.",                  count: 11, cover: "02", stack: ["10", "05"], tint: "#E3DED7" }
  ],

  films: [
    { id: "hills-and-waterfalls", title: "Hills and waterfalls", kind: "Pre-wedding film", orientation: "landscape", duration: "2:12" },
    { id: "into-the-woods", title: "Into the woods", kind: "Pre-wedding film", orientation: "landscape", duration: "1:16" },
    { id: "bridal-morning", title: "The bridal morning", kind: "Bridal reel", orientation: "portrait", duration: "0:46" },
    { id: "red-and-gold", title: "Red and gold", kind: "Bridal portrait film", orientation: "landscape", duration: "0:22" },
    { id: "wedding-rituals", title: "Wedding rituals", kind: "Ceremony reel", orientation: "portrait", duration: "0:22" },
    { id: "the-twirl", title: "The twirl", kind: "Moment", orientation: "landscape", duration: "0:08", muted: true },
    { id: "hero", title: "Portraits after dark", kind: "Couple teaser", orientation: "landscape", duration: "0:08", src: "assets/video/hero.mp4", muted: true }
  ]
};
