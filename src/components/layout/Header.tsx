export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Peyr.ai</h1>
                <p className="text-sm text-gray-600">Dream. Pair. Do.</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="/auth/sign-in"
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors cursor-pointer"
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
