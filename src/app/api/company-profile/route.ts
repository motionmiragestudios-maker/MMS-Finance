import { auth } from "@/auth";
import { db } from "@/lib/db";
import { defaultCompanyProfile } from "@/lib/workspace";
import type { CompanyProfile } from "@/types/finance";
import { NextResponse } from "next/server";

const profileFields: (keyof CompanyProfile)[] = [
  "name", "tagline", "address", "phone", "email", "website", "gstNumber", "panNumber", "bankDetails",
  "bankAccountName", "bankName", "bankAccountNumber", "bankBranch", "bankIfsc", "upiDetails", "paymentTerms", "invoiceNotes", "quotationTerms",
];

function imageData(value: unknown, maxLength: number) {
  if (value === "" || value === null || value === undefined) return null;
  if (typeof value !== "string" || value.length > maxLength || !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(value)) return undefined;
  return value;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await db.companyProfile.findUnique({ where: { id: "company" } });
  const profile = Object.fromEntries(profileFields.map((field) => [field, saved?.[field] ?? defaultCompanyProfile[field] ?? ""])) as unknown as CompanyProfile;
  return NextResponse.json({ profile, logoData: saved?.logoData ?? "", faviconData: saved?.faviconData ?? "", legacySettingsMigrated: saved?.legacySettingsMigrated ?? false });
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "owner") return NextResponse.json({ error: "Only the owner can update company details." }, { status: 403 });

  try {
    const body = await request.json();
    const submitted = body.profile && typeof body.profile === "object" ? body.profile as Record<string, unknown> : {};
    const profile = Object.fromEntries(profileFields.map((field) => [field, typeof submitted[field] === "string" ? (submitted[field] as string).trim() : defaultCompanyProfile[field] ?? ""])) as unknown as CompanyProfile;
    const logoData = imageData(body.logoData, 3_000_000);
    const faviconData = imageData(body.faviconData, 750_000);
    if (logoData === undefined || faviconData === undefined) return NextResponse.json({ error: "Upload PNG images within the allowed file size." }, { status: 400 });
    if (profile.phone && !/^\+91\d{10}$/.test(profile.phone.replace(/\s+/g, ""))) return NextResponse.json({ error: "Phone must use +91 followed by 10 digits." }, { status: 400 });

    const saved = await db.companyProfile.upsert({
      where: { id: "company" },
      create: { id: "company", ...profile, logoData, faviconData, legacySettingsMigrated: true },
      update: { ...profile, logoData, faviconData, legacySettingsMigrated: true },
    });
    return NextResponse.json({ profile, logoData: saved.logoData ?? "", faviconData: saved.faviconData ?? "", legacySettingsMigrated: saved.legacySettingsMigrated });
  } catch {
    return NextResponse.json({ error: "Unable to save shared company details." }, { status: 400 });
  }
}