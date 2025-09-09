export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Peyr.ai helped me find the perfect technical co-founder. We've since raised $2M and launched successfully.",
      name: "Sarah Johnson",
      title: "CEO, TechStart"
    },
    {
      quote: "The matching algorithm is incredibly accurate. I found my business partner within a week of joining.",
      name: "Alex Chen",
      title: "CTO, GrowthLab"
    },
    {
      quote: "The collaboration tools made it easy to work together from day one. Highly recommend for any entrepreneur.",
      name: "Maria Rodriguez",
      title: "CMO, ScaleUp"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">
          Trusted by Successful Entrepreneurs
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg p-8 shadow-sm">
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
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
