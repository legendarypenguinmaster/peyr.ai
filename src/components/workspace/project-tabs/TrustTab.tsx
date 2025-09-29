"use client";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

export default function TrustTab() {
  return (
    <Card>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Trust Ledger</h3>
      <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
        <li>Project created • Trust +5</li>
        <li>Task completions will increase trust automatically</li>
        <li>File signatures and NDAs will be logged here</li>
      </ul>
    </Card>
  );
}


