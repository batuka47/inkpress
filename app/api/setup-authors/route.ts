import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const AUTHORS = [
  { display_name: "Battulga Enguun",            email: "guunee08@gmail.com" },
  { display_name: "Luvsankhaimchig Sarangerel", email: "sarangerel.l817@gmail.com" },
  { display_name: "Erkhembayar Emmatuguldur",   email: "betname8@gmail.com" },
  { display_name: "Ayush Ashidbat",             email: "ashidbat23@gmail.com" },
  { display_name: "Anar Subedei",               email: "subedeianar@gmail.com" },
  { display_name: "Otgonragchaa Bat-Uchral",    email: "uchkau600@gmail.com" },
  { display_name: "Dembereldagwa Choidorj",     email: "dchoi2580@gmail.com" },
  { display_name: "Altan-Od Enkhriimaa",        email: "altanodenhriimaa@gmail.com" },
  { display_name: "Munkh-Erdene Khulan",        email: "xulan.munkherdene123@gmail.com" },
  { display_name: "Uuganbayr Khuslen",          email: "uuganbayrhuslen39@gmail.com" },
  { display_name: "Batbayar Bat-Enkh",          email: "batenkh0910@gmail.com" },
  { display_name: "Budkhand Bat-Erdene",        email: "b.batuka0627@gmail.com" },
  { display_name: "Bat-Ulzii Sodbolor",         email: "sodbolorbatulzii0@gmail.com" },
  { display_name: "Enkh-Amgalan Tuguldur",      email: "tenkhamgalan02@gmail.com" },
];

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const results: { name: string; status: string }[] = [];

  for (const author of AUTHORS) {
    // Get the auth user ID for this email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
      results.push({ name: author.display_name, status: `❌ ${listError.message}` });
      continue;
    }

    const authUser = users.find(u => u.email?.toLowerCase() === author.email.toLowerCase());
    if (!authUser) {
      results.push({ name: author.display_name, status: "❌ No auth user found" });
      continue;
    }

    const { error } = await supabase.from("authors").upsert({
      id: authUser.id,
      display_name: author.display_name,
      bio: null,
      avatar_url: null,
      role: "journalist",
    });

    results.push({
      name: author.display_name,
      status: error ? `❌ ${error.message}` : "✅ Created",
    });
  }

  return NextResponse.json({ results });
}
