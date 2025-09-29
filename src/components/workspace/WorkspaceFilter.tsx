"use client";

type FilterType = "all" | "personal" | "shared";

interface WorkspaceFilterProps {
  onFilterChange: (filter: FilterType) => void;
  activeFilter: FilterType;
}

export default function WorkspaceFilter({ onFilterChange, activeFilter }: WorkspaceFilterProps) {
  const filters = [
    { key: "all" as FilterType, label: "All", count: null },
    { key: "personal" as FilterType, label: "Personal Sandbox", count: null },
    { key: "shared" as FilterType, label: "Shared Workspace", count: null },
  ];

  return (
    <div className="flex items-center space-x-2 mb-6">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter:</span>
      <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeFilter === filter.key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
