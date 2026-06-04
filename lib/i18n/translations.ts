export type Locale = "mn" | "en";

export const translations = {
  mn: {
    // Nav
    navPolitics:   "Улс төр",
    navTech:       "Технологи",
    navCulture:    "Соёл",
    navWorld:      "Дэлхий",
    navAbout:      "Бидний тухай",
    navMore:       "Цааш",
    navSubscribe:  "Бүртгүүлэх",
    navSearch:     "Хайх…",

    // Site tagline
    tagline: "Амжилт Кибер Сургуулийн мэдээллийн платформ.",

    // Breaking ticker
    breaking: "Шуурхай мэдээ",

    // Article / cards
    minRead:        "мин",
    readMore:       "Дэлгэрэнгүй",
    featuredLabel:  "Онцлох",

    // Section headings (home)
    latestNews:     "Сүүлийн мэдээ",

    // Newsletter signup (inline)
    newsletterLabel:   "Мэдээллийн хуудас",
    newsletterHeading: "Мэдээллээ авч байгаарай",
    newsletterBody:    "Сургуулийн хамгийн сүүлийн мэдээ, үйл явдлуудыг имэйлдээ хүлээн авна уу.",
    newsletterInput:   "your@email.com",
    newsletterBtn:     "Захиалах",
    newsletterBtnBusy: "Илгээж байна…",
    newsletterSuccess: "Амжилттай! Бид шинэ мэдээллүүдийг илгээх болно.",
    alreadySubscribed: "Та аль хэдийн бүртгүүлсэн байна!",
    errorGeneric:      "Алдаа гарлаа. Дахин оролдоно уу.",

    // Subscribe page
    subscribePage_title:    "AmjiltPressAgency захиалах",
    subscribePage_subtitle: "Амжилт Кибер Сургуулийн мэдээ, арга хэмжээний мэдээллийг имэйлдээ хүлээн авна уу.",
    subscribePage_name:     "Нэр (заавал биш)",
    subscribePage_namePh:   "Таны нэр",
    subscribePage_email:    "Имэйл *",
    subscribePage_emailPh:  "you@example.com",
    subscribePage_btn:      "Захиалах",
    subscribePage_btnBusy:  "Бүртгэж байна…",
    subscribePage_success:  "Амжилттай захиалагдлаа! Шинэ мэдээнүүдийг имэйлээр хүлээн авах болно.",

    // About page
    aboutHeroLabel:    "Бидний тухай",
    aboutHeroHeadline: "Амжилт Кибер Сургуулийн дуу хоолой.",
    aboutHeroSubtitle: "AmjiltPressAgency нь Амжилт Кибер Сургуулийн сурагчдын бичсэн мэдээ, нийтлэл, шинжилгээг монгол болон англи хэлээр хүргэдэг сургуулийн мэдээллийн платформ юм.",
    aboutMission_label: "Манай зорилго",
    aboutMission_p1: "AmjiltPressAgency нь Амжилт Кибер Сургуулийн сурагчдад сэтгүүл зүйн дадлага олгох, сургуулийн амьдрал болон нийгмийн чухал асуудлуудыг олон нийтэд хүргэх зорилгоор байгуулагдсан.",
    aboutMission_p2: "Бид сурагчдыг мэдээ бичих, эрхлэн гаргах, дэлхийд хүргэх чадвартай болгохыг зорьдог. Энэ платформ бол манай сурагчдын суралцах, бүтээх, өсөн дэвших орон зай юм.",

    // Footer
    footerCopy: "AmjiltPressAgency — Амжилт Кибер Сургууль. Бүх эрх хуулиар хамгаалагдсан.",
  },

  en: {
    // Nav
    navPolitics:   "Politics",
    navTech:       "Tech",
    navCulture:    "Culture",
    navWorld:      "World",
    navAbout:      "About Us",
    navMore:       "More",
    navSubscribe:  "Subscribe",
    navSearch:     "Search…",

    // Site tagline
    tagline: "The news platform of Amjilt Cyber School.",

    // Breaking ticker
    breaking: "Breaking",

    // Article / cards
    minRead:        "min read",
    readMore:       "Read more",
    featuredLabel:  "Featured",

    // Section headings (home)
    latestNews:     "Latest News",

    // Newsletter signup (inline)
    newsletterLabel:   "Newsletter",
    newsletterHeading: "Stay in the know",
    newsletterBody:    "Get the latest school news and stories delivered to your inbox.",
    newsletterInput:   "your@email.com",
    newsletterBtn:     "Subscribe",
    newsletterBtnBusy: "Subscribing…",
    newsletterSuccess: "You're in! We'll send you the latest articles.",
    alreadySubscribed: "You're already subscribed!",
    errorGeneric:      "Something went wrong. Try again.",

    // Subscribe page
    subscribePage_title:    "Subscribe to AmjiltPressAgency",
    subscribePage_subtitle: "Get the latest news and stories from Amjilt Cyber School delivered to your inbox.",
    subscribePage_name:     "Name (optional)",
    subscribePage_namePh:   "Your name",
    subscribePage_email:    "Email *",
    subscribePage_emailPh:  "you@example.com",
    subscribePage_btn:      "Subscribe",
    subscribePage_btnBusy:  "Subscribing…",
    subscribePage_success:  "You're subscribed! You'll receive our latest articles by email.",

    // About page
    aboutHeroLabel:    "About Us",
    aboutHeroHeadline: "The voice of Amjilt Cyber School.",
    aboutHeroSubtitle: "AmjiltPressAgency is the student-powered news platform of Amjilt Cyber School — publishing articles, analyses and school news in both Mongolian and English.",
    aboutMission_label: "Our Mission",
    aboutMission_p1: "AmjiltPressAgency was created to give Amjilt Cyber School students a real platform to practise journalism, share ideas, and cover stories that matter to their school and community.",
    aboutMission_p2: "We believe every student has a story worth telling. This platform is where they learn to write, edit, and publish — building skills that go far beyond the classroom.",

    // Footer
    footerCopy: "AmjiltPressAgency — Amjilt Cyber School. All rights reserved.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
