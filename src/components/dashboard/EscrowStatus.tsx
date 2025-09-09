import { Lock, Clock } from 'lucide-react';

export default function EscrowStatus() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Escrow Status</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">EcoTrack Project</p>
            <p className="text-sm text-gray-600">$5,000 secured</p>
          </div>
          <Lock className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">GrowthHack Platform</p>
            <p className="text-sm text-gray-600">$2,500 pending</p>
          </div>
          <Clock className="w-5 h-5 text-yellow-500" />
        </div>
      </div>
      <a href="#" className="block text-center text-blue-600 hover:text-blue-700 text-sm font-medium mt-4">
        Manage Escrow Accounts
      </a>
    </div>
  );
}
