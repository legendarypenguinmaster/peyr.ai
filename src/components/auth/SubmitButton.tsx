interface SubmitButtonProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
}

import { Loader2 } from "lucide-react";

export default function SubmitButton({
  text,
  loading = false,
  disabled = false,
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {loading ? (
        <div className="flex items-center">
          <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
          Loading...
        </div>
      ) : (
        text
      )}
    </button>
  );
}
