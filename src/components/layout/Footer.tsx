import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and tagline */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <Image src="/logo.png" alt="Peyr.ai" width={150} height={40} className="mr-3 rounded-lg dark:invert dark:brightness-125 transition" />
            </div>
            <p className="text-gray-400 max-w-md leading-relaxed">
              The AI-powered platform that helps entrepreneurs find their
              perfect co-founders and build successful startups together.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/features"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="/pricing"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Blog
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/support"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Support
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            © 2025 Peyr.ai. All rights reserved.
          </div>

          {/* Social icons placeholder */}
          <div className="flex space-x-4">
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
              <span className="text-gray-400 text-sm">📘</span>
            </div>
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
              <span className="text-gray-400 text-sm">🐦</span>
            </div>
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
              <span className="text-gray-400 text-sm">💼</span>
            </div>
            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors cursor-pointer">
              <span className="text-gray-400 text-sm">📧</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
