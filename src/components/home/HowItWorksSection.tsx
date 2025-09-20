import Image from "next/image";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      image: "/images/create-profile.jpg",
      title: "Sign up & create your profile",
      description:
        "Tell us about your skills, experience, and startup vision. Our AI learns what makes you unique.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "02",
      image: "/images/ai-matched-co-founder.jpg",
      title: "Get AI-matched with a co-founder",
      description:
        "Our algorithm analyzes thousands of profiles to find your perfect match based on complementary skills and shared goals.",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "03",
      image: "/images/collaborate-safely.jpg",
      title: "Start your project and collaborate safely",
      description:
        "Use our tools to create agreements, manage milestones, and build your startup with confidence and security.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            From finding your co-founder to launching your startup, we&apos;ve
            simplified the entire process into three simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-green-200"></div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex">
                {/* Step card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col w-full h-full">
                  {/* Step image */}
                  <div className="relative h-48 overflow-hidden flex-shrink-0">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <div
                        className={`w-12 h-12 bg-gradient-to-br ${step.color} rounded-lg flex items-center justify-center shadow-lg`}
                      >
                        <span className="text-white font-bold text-lg">
                          {step.number}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 leading-tight">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4 flex-grow">
                      {step.description}
                    </p>

                    {/* Decorative element */}
                    <div
                      className={`h-1 bg-gradient-to-r ${step.color} rounded-full opacity-60`}
                    ></div>
                  </div>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">↓</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to get started?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of entrepreneurs who have already found their
              perfect co-founders
            </p>
            <a
              href="/auth/sign-up"
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg inline-block cursor-pointer"
            >
              Start Your Journey
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
