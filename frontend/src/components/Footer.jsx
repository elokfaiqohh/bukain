export default function Footer() {
  return (
    <footer className="py-10 border-t shadow-lg border-slate-200 bg-white/70 border-bukain-gold/30">
      <div className="max-w-6xl px-4 mx-auto text-sm text-slate-600">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="flex items-center justify-center w-8 h-8 text-white rounded-xl bg-bukain-green">B</span>
              Bukain
            </div>
            <p className="max-w-md mt-2">AI-powered Ramadan meal planner that helps you pre-order iftar packages from partner restaurants.</p>
          </div>

          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <div>
              <div className="font-semibold text-slate-900">Company</div>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>About</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <div className="font-semibold text-slate-900">Support</div>
              <ul className="mt-2 space-y-1 text-slate-600">
                <li>Help Center</li>
                <li>Terms</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 mt-10 text-xs text-center border-t border-slate-200 text-slate-500">
          © {new Date().getFullYear()} Bukain. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
