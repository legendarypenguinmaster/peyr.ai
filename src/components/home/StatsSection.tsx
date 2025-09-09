export default function StatsSection() {
  const stats = [
    { value: "10,000+", label: "Entrepreneurs" },
    { value: "2,500+", label: "Successful Matches" },
    { value: "500+", label: "Active Projects" },
    { value: "$50M+", label: "Funding Raised" }
  ];

  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-blue-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
