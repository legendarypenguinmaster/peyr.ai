export default function HeroSection() {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left side - Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 leading-tight">
              <span className="inline-block relative overflow-hidden">
                <span className="relative z-10 bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-shine">
                  Find Your Perfect Co-Founder
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></span>
              </span>
              <br />
              <span className="inline-block relative overflow-hidden">
                <span
                  className="relative z-10 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-shine"
                  style={{ animationDelay: "0.5s" }}
                >
                  with AI
                </span>
                <span
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"
                  style={{ animationDelay: "0.5s" }}
                ></span>
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Peyr.ai helps entrepreneurs connect, sign fair agreements, and
              build startups together safely.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a
                href="/auth/sign-up"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-block text-center"
              >
                Get Started
              </a>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 transform hover:scale-105">
                Learn More
              </button>
            </div>
          </div>

          {/* Right side - Search illustration */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg h-96 rounded-2xl shadow-2xl overflow-hidden">
              <img
                src="/images/search.jpg"
                alt="AI-powered co-founder matching - finding the perfect match from a diverse group of entrepreneurs"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
