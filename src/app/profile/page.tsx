export default function ProfilePage() {
  return (
    <main className="p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">User access</p>
        <h1 className="text-3xl font-bold">Profile & security</h1>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-4 text-sm text-slate-600">
          <div><span className="font-medium text-slate-900">Name:</span> Atanu Roy</div>
          <div><span className="font-medium text-slate-900">Role:</span> Studio owner</div>
          <div><span className="font-medium text-slate-900">Authentication:</span> Secure private login</div>
          <div><span className="font-medium text-slate-900">Security:</span> MFA and session protection planned for V2</div>
        </div>
      </div>
    </main>
  );
}
