export default function CallToActionSection() {
  return (
    <section className="bg-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Find Your Co-Founder?
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join thousands of entrepreneurs who have found their perfect business partners
        </p>
        <a 
          href="/auth/sign-up" 
          className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Start Your Journey Today
        </a>
      </div>
    </section>
  );
}
