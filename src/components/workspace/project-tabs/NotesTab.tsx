"use client";
import { Dispatch, SetStateAction } from "react";
import { Wand2 } from "lucide-react";

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {children}
    </div>
  );
}

export default function NotesTab({ noteDraft, setNoteDraft }: { noteDraft: string; setNoteDraft: Dispatch<SetStateAction<string>> }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Shared Notes</h3>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm">
          <Wand2 className="w-4 h-4"/> AI Structure
        </button>
      </div>
      <textarea
        value={noteDraft}
        onChange={(e) => setNoteDraft(e.target.value)}
        placeholder="Write ideas, meeting notes, research..."
        className="w-full min-h-44 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 text-sm text-gray-900 dark:text-white resize-y"
      />
      <div className="mt-3 flex items-center gap-2">
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
          Convert selection to task
        </button>
        <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700">
          Generate summary
        </button>
      </div>
    </Card>
  );
}


