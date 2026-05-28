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
    tagline: "Мэдээ уншигдах ёстой байдлаар нь.",

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
    newsletterBody:    "Хамгийн сүүлийн мэдээг имэйлдээ хүлээн авна уу. Спам илгээхгүй, хэдийд ч татгалзаж болно.",
    newsletterInput:   "your@email.com",
    newsletterBtn:     "Захиалах",
    newsletterBtnBusy: "Илгээж байна…",
    newsletterSuccess: "Амжилттай! Бид шинэ мэдээллүүдийг илгээх болно.",
    alreadySubscribed: "Та аль хэдийн бүртгүүлсэн байна!",
    errorGeneric:      "Алдаа гарлаа. Дахин оролдоно уу.",

    // Subscribe page
    subscribePage_title:    "AmjiltPressAgency-д бүртгүүлэх",
    subscribePage_subtitle: "Хамгийн сүүлийн мэдээнүүдийг имэйлдээ хүлээн авна уу.",
    subscribePage_name:     "Нэр (заавал биш)",
    subscribePage_namePh:   "Таны нэр",
    subscribePage_email:    "Имэйл *",
    subscribePage_emailPh:  "you@example.com",
    subscribePage_btn:      "Бүртгүүлэх",
    subscribePage_btnBusy:  "Бүртгэж байна…",
    subscribePage_success:  "Бүртгүүлсэн! Шинэ мэдээнүүдийг имэйлээр хүлээн авах болно.",

    // About page
    aboutHeroLabel:    "Бидний тухай",
    aboutHeroHeadline: "Мэдээ уншигдах ёстой байдлаар нь.",
    aboutHeroSubtitle: "AmjiltPressAgency нь уншигчиддаа үнэнч байх, мэдээллийг гоёмсог хэлбэрээр дамжуулах зорилготой бие даасан мэдээний хэвлэл юм.",
    aboutMission_label: "Манай эрхэм зорилго",
    aboutMission_p1: "Бид AmjiltPressAgency-ийг байгуулахдаа мэдээний салбар хоёр зүйлийг буруу хийсэн гэдэгт итгэсэн: хурдны төлөө нарийвчлалаа золиослож, дарааллын товшилтын төлөө дизайнаа золиослосон. Бид хоёуланг нь дахин барьж байна.",
    aboutMission_p2: "Энэ сайт дахь мэдээ бичигдэж, эрхлэгдэж, зохиогдсоны дараа л нийтлэгдэнэ. Бид итгэлтэй болтол нийтэлдэггүй. Хардалт хайдаггүй. Уншлагыг хүндэтгэнэ.",

    // Footer
    footerCopy: "AmjiltPressAgency. Бүх эрх хуулиар хамгаалагдсан.",
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
    tagline: "News as it should be read.",

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
    newsletterBody:    "Get the latest articles delivered to your inbox. No spam, unsubscribe any time.",
    newsletterInput:   "your@email.com",
    newsletterBtn:     "Subscribe",
    newsletterBtnBusy: "Subscribing…",
    newsletterSuccess: "You're in! We'll send you the latest articles.",
    alreadySubscribed: "You're already subscribed!",
    errorGeneric:      "Something went wrong. Try again.",

    // Subscribe page
    subscribePage_title:    "Subscribe to AmjiltPressAgency",
    subscribePage_subtitle: "Get the latest articles delivered to your inbox.",
    subscribePage_name:     "Name (optional)",
    subscribePage_namePh:   "Your name",
    subscribePage_email:    "Email *",
    subscribePage_emailPh:  "you@example.com",
    subscribePage_btn:      "Subscribe",
    subscribePage_btnBusy:  "Subscribing…",
    subscribePage_success:  "You're subscribed! You'll receive our latest articles by email.",

    // About page
    aboutHeroLabel:    "About AmjiltPressAgency",
    aboutHeroHeadline: "News as it should be read.",
    aboutHeroSubtitle: "AmjiltPressAgency is an independent news publication committed to rigorous reporting, elegant presentation, and an unwavering loyalty to its readers.",
    aboutMission_label: "Our Mission",
    aboutMission_p1: "We started AmjiltPressAgency because we believe the news industry got two things badly wrong: it sacrificed accuracy for speed, and design for clicks. We are rebuilding both.",
    aboutMission_p2: "Every article on this site is written, edited, and designed to last. We do not publish until we are confident. We do not chase outrage. We respect your attention.",

    // Footer
    footerCopy: "AmjiltPressAgency. All rights reserved.",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
