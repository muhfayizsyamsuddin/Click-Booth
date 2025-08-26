import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-amber-200 bg-white py-8 text-sm text-slate-600">
      <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-slate-700 font-medium">
          © {new Date().getFullYear()} ClickBooth Studio. All rights reserved.
        </p>
        <div className="flex items-center gap-4">
          <Link
            href="#"
            className="hover:text-red-600 transition-colors duration-300"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="hover:text-red-600 transition-colors duration-300"
          >
            Terms
          </Link>
          <Link
            href="#features"
            className="hover:text-red-600 transition-colors duration-300"
          >
            Features
          </Link>
        </div>
      </div>
    </footer>
  );
}
