"use client";

import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const VALUES = {
  mn: [
    { icon: "✦", title: "Бие даасан & Тэнцвэртэй", body: "Бид уншигчиддаа хариуцлагатай, зар сурталчилагч эсвэл улс төрийн ашиг сонирхолд биш. Редакцийн шийдвэрүүд маань зөвхөн үнэн ба нийтийн ашиг сонирхолд үйлчилнэ." },
    { icon: "◈", title: "Хурдаас илүү гүнзгий", body: "Хурдан мэдэгдэх нь хялбар. Зөв мэдэгдэх нь хариуцлага шаарддаг. Бид нийтлэхийн өмнө баталгаажуулдаг, мөн нийтлэл нь бүрэн ойлгогдоход хэрэгтэй зайг авдаг." },
    { icon: "◇", title: "Дизайн бол хүндэтгэл", body: "Сайн бичвэр, өргөн цагаан зай, зохистой загвар — энэ бол чимэглэл биш, уншигчийн цаг хугацаа, анхаарлыг хүндэтгэх арга юм." },
    { icon: "◉", title: "Хариуцлага", body: "Бид алдаагаа олон нийтэд засдаг, эх сурвалжийг холбодог, зохиолчдоо нэрлэдэг. Ил тод байдал бол итгэлцлийн суурь юм." },
  ],
  en: [
    { icon: "✦", title: "Independent & Unbiased", body: "We answer to our readers, not advertisers or political interests. Our editorial decisions are made solely in service of truth and public interest." },
    { icon: "◈", title: "Depth Over Speed", body: "Breaking fast is easy. Breaking right takes discipline. We verify before we publish, and we take the space a story needs to be fully understood." },
    { icon: "◇", title: "Design as Respect", body: "Good typography, generous whitespace, and deliberate layout aren't decoration — they are a form of respect for the reader's time and attention." },
    { icon: "◉", title: "Accountability", body: "We correct mistakes publicly, link to primary sources, and name our writers. Transparency is the foundation of trust." },
  ],
};

const TEAM = {
  mn: [
    { name: "Амжилт Б.", role: "Үүсгэн байгуулагч & Ерөнхий редактор", bio: "Хэвлэлийн арван жилийн туршлагатай редактор. Хамгийн сайн сэтгүүл зүй нь яриа шиг санагддаг гэж үздэг." },
    { name: "Редакцийн баг", role: "Сурвалжлагчид & Хувь нэмэр оруулагчид", bio: "Улс төр, технологи, соёл, дэлхийн мэдээг хамарсан штатын болон бие даасан сурвалжлагчдын баг." },
    { name: "Дизайн студи", role: "Визуал & Бүтээгдэхүүн", bio: "Нарийн төвөгтэй мэдээллийг тодорхой, уншлагын туршлага бүрийг боломгийн болгоход дуртай дотоод дизайнерууд." },
  ],
  en: [
    { name: "Amjilt B.", role: "Founder & Editor-in-Chief", bio: "Former print editor with a decade in digital media. Believes the best journalism feels like a conversation." },
    { name: "Editorial Desk", role: "Reporters & Contributors", bio: "A rotating team of staff writers and independent contributors covering politics, technology, culture, and the world." },
    { name: "Design Studio", role: "Visual & Product", bio: "In-house designers obsessed with making complex information clear and every reading experience feel considered." },
  ],
};

export default function AboutPage() {
  const { locale, t } = useLanguage();

  const values = VALUES[locale];
  const team   = TEAM[locale];

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
            {locale === "mn" ? "Бидний баримталдаг зүйлс" : "What We Stand For"}
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

      {/* Team */}
      <section className="py-20 px-6 border-b border-[--color-rule]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-12">
            {locale === "mn" ? "Баг" : "The Team"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.name} className="border border-[--color-rule] rounded-2xl p-6 bg-white">
                <div className="w-10 h-10 rounded-full bg-[--color-accent-light] flex items-center justify-center mb-4">
                  <span className="text-[--color-accent] font-bold text-sm">
                    {member.name.charAt(0)}
                  </span>
                </div>
                <h3 className="font-bold text-[--color-ink] text-base">{member.name}</h3>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[--color-accent] mt-0.5 mb-3">
                  {member.role}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-gray-400 mb-8">
            {locale === "mn" ? "Холбоо барих" : "Get in Touch"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="border border-[--color-rule] rounded-2xl p-6">
              <h3 className="font-bold text-[--color-ink] mb-1">
                {locale === "mn" ? "Редакци" : "Editorial"}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {locale === "mn"
                  ? "Мэдээний дохио, засвар, хэвлэлийн асуулга, редакцийн санал хүсэлт."
                  : "Story tips, corrections, press inquiries, and editorial feedback."}
              </p>
              <a href="mailto:editorial@amjiltpress.com"
                className="text-sm font-medium text-[--color-accent] hover:underline">
                editorial@amjiltpress.com
              </a>
            </div>
            <div className="border border-[--color-rule] rounded-2xl p-6">
              <h3 className="font-bold text-[--color-ink] mb-1">
                {locale === "mn" ? "Мэдээллийн хуудас" : "Newsletter"}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                {locale === "mn"
                  ? "Шилдэг мэдээнүүдийг имэйлдээ хүлээн авна уу — spam илгээхгүй."
                  : "Get our best stories delivered to your inbox — no noise, no spam."}
              </p>
              <Link href="/subscribe"
                className="inline-block text-sm font-semibold text-white bg-[--color-accent] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {locale === "mn" ? "Үнэгүй захиалах →" : "Subscribe free →"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
