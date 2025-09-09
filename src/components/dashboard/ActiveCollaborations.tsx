export default function ActiveCollaborations() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Collaborations</h3>
        <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">Manage All</a>
      </div>
      <div className="text-center py-8">
        <p className="text-gray-500">No active collaborations yet</p>
      </div>
    </div>
  );
}
