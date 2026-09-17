import { companyProfile } from "@/lib/mock-data";

export default function SettingsPage() {
  return (
    <main className="p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Configuration</p>
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Company profile</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div><label className="text-sm text-slate-500">Company name</label><div className="mt-1 text-lg font-medium">{companyProfile.name}</div></div>
          <div><label className="text-sm text-slate-500">Tagline</label><div className="mt-1 text-lg font-medium">{companyProfile.tagline}</div></div>
          <div className="md:col-span-2"><label className="text-sm text-slate-500">Address</label><div className="mt-1 text-lg font-medium">{companyProfile.address}</div></div>
          <div><label className="text-sm text-slate-500">Phone</label><div className="mt-1 text-lg font-medium">{companyProfile.phone}</div></div>
          <div><label className="text-sm text-slate-500">Email</label><div className="mt-1 text-lg font-medium">{companyProfile.email}</div></div>
          <div><label className="text-sm text-slate-500">Website</label><div className="mt-1 text-lg font-medium">{companyProfile.website}</div></div>
          <div><label className="text-sm text-slate-500">GST number</label><div className="mt-1 text-lg font-medium">{companyProfile.gstNumber}</div></div>
        </div>
      </div>
    </main>
  );
}
