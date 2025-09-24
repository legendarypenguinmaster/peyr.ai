import Image from "next/image";

export default function Header() {
  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <div className="flex items-center">
              <Image src="/logo.png" alt="Peyr.ai" width={100} height={40} className="mr-3 rounded-lg dark:invert dark:brightness-125 transition" />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/auth/sign-in"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors cursor-pointer"
            >
              Sign In
            </a>
            <a
              href="/auth/sign-up"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
            >
              Get Started
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
