"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const VALUES = {
  mn: [
    { icon: "✦", title: "Сурагчдын дуу хоолой", body: "Энэ платформ бол Амжилт Кибер Сургуулийн сурагчдынх. Бид сурагчдын санаа бодол, туршлага, бүтээлийг олон нийтэд хүргэдэг." },
    { icon: "◈", title: "Хоёр хэлний мэдээлэл", body: "Бид монгол болон англи хэл дээр нийтэлдэг — энэ нь сурагчдын хоёр хэлний чадварыг хөгжүүлэхэд тусалдаг." },
    { icon: "◇", title: "Мэргэжлийн стандарт", body: "Сургуулийн сонин ч гэсэн мэргэжлийн стандартыг сахина. Бид мэдээ бичих, эрхлэн гаргахдаа үнэн зөв байдлыг эрхэмлэдэг." },
    { icon: "◉", title: "Суралцах орчин", body: "AmjiltPressAgency бол сурагчдад сэтгүүл зүй, контент бүтээлт, медиа ажиллагааны дадлага олгодог бодит орчин юм." },
  ],
  en: [
    { icon: "✦", title: "Student-Powered", body: "This platform belongs to the students of Amjilt Cyber School. We amplify student voices, ideas, experiences and creative work." },
    { icon: "◈", title: "Bilingual Publishing", body: "We publish in both Mongolian and English — helping students develop strong communication skills in two languages." },
    { icon: "◇", title: "Professional Standards", body: "Even as a school publication, we hold ourselves to professional standards — accuracy, fairness and clarity in every article." },
    { icon: "◉", title: "A Space to Learn", body: "AmjiltPressAgency is a real-world environment where students learn to write, edit, publish and take responsibility for their work." },
  ],
};

const DEV_TEAM = {
  mn: [
    { name: "Бат-Эрдэнэ", role: "Вэб хөгжүүлэгч", initial: "Б" },
    { name: "Бат-Энх", role: "UI/UX дизайнер", initial: "Б" },
  ],
  en: [
    { name: "Bat-Erdene", role: "Web Developer", initial: "B" },
    { name: "Bat-Enkh", role: "UI/UX Designer", initial: "B" },
  ],
};

const EDITORIAL_HEADS = {
  mn: [
    { name: "Гантулга", role: "Багш — Ерөнхий зохицуулагч", initial: "Г" },
    { name: "Энгүүн", role: "Ерөнхий редактор", initial: "Э" },
    { name: "Мандахнар", role: "Ерөнхий редактор", initial: "М" },
  ],
  en: [
    { name: "Gantula", role: "Teacher — Chief Supervisor", initial: "G" },
    { name: "Enguun", role: "Editor-in-Chief", initial: "E" },
    { name: "Mandakhnar", role: "Editor-in-Chief", initial: "M" },
  ],
};

const REPORTERS = [
  "Luvsankhaimchig Sarangerel",
  "Erkhembayar Emmatuguldur",
  "Ayush Ashidbat",
  "Anar Subedei",
  "Otgonragchaa Bat-Uchral",
  "Dembereldagwa Choidorj",
  "Altan-Od Enkhriimaa",
  "Munkh-Erdene Khulan",
  "Uuganbayr Khuslen",
  "Bat-Ulzii Sodbolor",
  "Enkh-Amgalan Tuguldur",
  "Munkhbat Khangerel",
  "Ganbold Enkh-Amgalan",
  "Battulga Azjargal",
];

export default function AboutPage() {
  const { locale, t } = useLanguage();

  const values        = VALUES[locale];
  const devTeam       = DEV_TEAM[locale];
  const editorialHeads = EDITORIAL_HEADS[locale];

  const isMn = locale === "mn";

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="border-b border-[--color-rule] py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[--color-accent] mb-6">
            {t("aboutHeroLabel")}
          </p>
          <h1 className="text-5xl font-black text-[--color-ink] leading-[1.05] tracking-tight mb-8"
            style={{ letterSpacing: "-0.04em" }}>
            {t("aboutHeroHeadline")}
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed max-w-2xl mx-auto">
            {t("aboutHeroSubtitle")}
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-6 border-b border-[--color-rule]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-8">
            {t("aboutMission_label")}
          </h2>
          <p className="text-2xl text-[--color-ink] leading-relaxed font-medium" style={{ letterSpacing: "-0.01em" }}>
            {t("aboutMission_p1")}
          </p>
          <p className="mt-6 text-lg text-gray-500 leading-relaxed">
            {t("aboutMission_p2")}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-6 border-b border-[--color-rule] bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-12">
            {isMn ? "Бидний баримталдаг зарчмууд" : "What We Stand For"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {values.map((v) => (
              <div key={v.title} className="flex gap-5">
                <span className="text-2xl text-[--color-accent] mt-0.5 shrink-0">{v.icon}</span>
                <div>
                  <h3 className="text-base font-bold text-[--color-ink] mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dev Team */}
      <section className="py-20 px-6 border-b border-[--color-rule]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">
            {isMn ? "Хөгжүүлэлтийн баг" : "Development Team"}
          </h2>
          <p className="text-sm text-gray-400 mb-10">
            {isMn
              ? "Платформыг бүтээж, хадгалж буй техникийн баг."
              : "The technical team that built and maintains this platform."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg">
            {devTeam.map((m) => (
              <div key={m.name} className="border border-[--color-rule] rounded-2xl p-6 bg-white">
                <div className="w-12 h-12 rounded-full bg-[--color-accent-light] flex items-center justify-center mb-4">
                  <span className="text-[--color-accent] font-black text-lg">{m.initial}</span>
                </div>
                <h3 className="font-bold text-[--color-ink] text-base">{m.name}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[--color-accent] mt-0.5">
                  {m.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Board */}
      <section className="py-20 px-6 border-b border-[--color-rule] bg-[#fafafa]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-2">
            {isMn ? "Редакцийн зөвлөл" : "Editorial Board"}
          </h2>
          <p className="text-sm text-gray-400 mb-10">
            {isMn
              ? "Мэдээний чанар, үнэн зөв байдлыг хянадаг удирдлагын баг."
              : "The leadership team overseeing editorial quality and accuracy."}
          </p>

          {/* 3 heads */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            {editorialHeads.map((m) => (
              <div key={m.name} className="border border-[--color-accent] bg-[--color-accent-light] rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-[--color-accent] flex items-center justify-center mb-4">
                  <span className="text-white font-black text-lg">{m.initial}</span>
                </div>
                <h3 className="font-bold text-[--color-ink] text-base">{m.name}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[--color-accent] mt-0.5">
                  {m.role}
                </p>
              </div>
            ))}
          </div>

          {/* Reporters */}
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-6">
            {isMn ? "Сурагч сурвалжлагчид" : "Student Reporters"}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {REPORTERS.map((name) => (
              <div key={name}
                className="border border-[--color-rule] rounded-xl px-4 py-3 bg-white flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[--color-accent-light] flex items-center justify-center shrink-0">
                  <span className="text-[--color-accent] font-bold text-xs">{name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium text-[--color-ink] leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-8">
            {isMn ? "Холбоо барих" : "Get in Touch"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-[--color-rule] rounded-2xl p-6">
              <h3 className="font-bold text-[--color-ink] mb-1">
                {isMn ? "Редакц" : "Editorial"}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {isMn
                  ? "Нийтлэлийн санал, залруулга болон бусад хүсэлтийг хүлээн авна."
                  : "Article submissions, corrections and general enquiries."}
              </p>
              <a href="mailto:amjiltpress@gmail.com"
                className="text-sm font-medium text-[--color-accent] hover:underline">
                amjiltpress@gmail.com
              </a>
            </div>
            <div className="border border-[--color-rule] rounded-2xl p-6">
              <h3 className="font-bold text-[--color-ink] mb-1">
                {isMn ? "Мэдээллийн хуудас" : "Newsletter"}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {isMn
                  ? "Сургуулийн шинэ мэдээ, нийтлэлүүдийг имэйлдээ хүлээн авна уу."
                  : "Subscribe to receive the latest school news and articles by email."}
              </p>
              <Link href="/subscribe"
                className="inline-block text-sm font-semibold text-white bg-[--color-accent] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {isMn ? "Захиалах →" : "Subscribe free →"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
