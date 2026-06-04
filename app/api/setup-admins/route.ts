import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const ADMINS = [
  { email: "guunee08@gmail.com",             password: "88180559", name: "Battulga Enguun" },
  { email: "sarangerel.l817@gmail.com",      password: "89195406", name: "Luvsankhaimchig Sarangerel" },
  { email: "betname8@gmail.com",             password: "95456009", name: "Erkhembayar Emmatuguldur" },
  { email: "ashidbat23@gmail.com",           password: "94841303", name: "Ayush Ashidbat" },
  { email: "subedeianar@gmail.com",          password: "85168510", name: "Anar Subedei" },
  { email: "uchkau600@gmail.com",            password: "94245651", name: "Otgonragchaa Bat-Uchral" },
  { email: "dchoi2580@gmail.com",            password: "88159527", name: "Dembereldagwa Choidorj" },
  { email: "altanodenhriimaa@gmail.com",     password: "96500925", name: "Altan-Od Enkhriimaa" },
  { email: "xulan.munkherdene123@gmail.com", password: "95954324", name: "Munkh-Erdene Khulan" },
  { email: "uuganbayrhuslen39@gmail.com",    password: "88860670", name: "Uuganbayr Khuslen" },
  { email: "batenkh0910@gmail.com",          password: "80286463", name: "Batbayar Bat-Enkh" },
  { email: "b.batuka0627@gmail.com",         password: "88097359", name: "Budkhand Bat-Erdene" },
  { email: "sodbolorbatulzii0@gmail.com",    password: "94480988", name: "Bat-Ulzii Sodbolor" },
  { email: "tenkhamgalan02@gmail.com",       password: "95100905", name: "Enkh-Amgalan Tuguldur" },
];

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: { name: string; email: string; status: string }[] = [];

  for (const admin of ADMINS) {
    const { error } = await supabase.auth.admin.createUser({
      email: admin.email,
      password: admin.password,
      email_confirm: true,
    });

    results.push({
      name: admin.name,
      email: admin.email,
      status: error ? `❌ ${error.message}` : "✅ Created",
    });
  }

  const skipped = [
    "Enkhmunkh Mandakhnar — no email",
    "Munkhbat Khangerel — no email",
    "Ganbold Enkh-Amgalan — no email",
    "Buyanmunkh Bolor — no email",
    "Battulga Azjargal — no email",
  ];

  return NextResponse.json({ results, skipped });
}
