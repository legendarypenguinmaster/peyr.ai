import DashboardHeader from "@/components/layout/DashboardHeader";

export default function TestHeader() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Test Header Page
        </h1>
        <p className="text-gray-600">
          This page is to test if the header is visible.
        </p>
      </div>
    </div>
  );
}
