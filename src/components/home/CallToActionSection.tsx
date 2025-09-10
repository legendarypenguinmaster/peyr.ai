export default function CallToActionSection() {
  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-tight">
          Ready to Build Your Startup?
        </h2>
        <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of entrepreneurs who have found their perfect
          co-founders and built successful startups together
        </p>
        <a
          href="/auth/sign-up"
          className="bg-white text-gray-900 px-10 py-5 rounded-lg font-bold text-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl inline-block"
        >
          Join Peyr.ai Today
        </a>
        <p className="text-blue-200 mt-6 text-lg">
          Free to start • No credit card required
        </p>
      </div>
    </section>
  );
}
