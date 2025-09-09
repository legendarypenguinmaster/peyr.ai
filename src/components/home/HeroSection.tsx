export default function HeroSection() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            <span className="text-blue-600">Dream.</span> Find Your Vision.<br />
            <span className="text-blue-600">Pair.</span> Meet Your Co-Founder.<br />
            <span className="text-blue-600">Do.</span> Build Together.
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Connect with entrepreneurs who share your vision and have complementary skills. 
            Transform your dreams into reality with AI-powered matching and collaboration tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/sign-up" 
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors inline-block text-center"
            >
              Get Started Free
            </a>
            <button className="bg-white text-gray-700 px-8 py-4 rounded-lg font-medium text-lg border border-gray-300 hover:bg-gray-50 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
