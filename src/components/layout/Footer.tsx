import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">Peyr.ai</div>
              <div className="text-sm text-gray-600">Dream. Pair. Do.</div>
            </div>
          </div>
          <div className="text-gray-600">
            © 2025 Peyr.ai. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
