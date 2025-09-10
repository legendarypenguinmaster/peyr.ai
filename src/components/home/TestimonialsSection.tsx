export default function TestimonialsSection() {
  const testimonials = [
    {
      quote:
        "Peyr.ai's AI matching found me the perfect technical co-founder. We've since raised $2M and launched our product successfully.",
      name: "Sarah Johnson",
      title: "CEO, TechStart",
    },
    {
      quote:
        "The smart legal agreements saved us months of lawyer fees. The milestone escrow system gave us both confidence to move forward.",
      name: "Alex Chen",
      title: "CTO, GrowthLab",
    },
    {
      quote:
        "The collaboration tools made it seamless to work together from day one. The reputation system helped us build trust quickly.",
      name: "Maria Rodriguez",
      title: "CMO, ScaleUp",
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center mb-16">
          What Founders Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="mb-6">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 italic text-lg leading-relaxed">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
              </div>
              <div className="flex items-center">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg">
                  {testimonial.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600">{testimonial.title}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
