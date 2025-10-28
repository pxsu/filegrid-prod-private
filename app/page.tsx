// app/page.tsx

"use client";

import { useCanvas } from "@/lib/hooks/useCanvas";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {

  const router = useRouter();
  const { createCanvas, loading, error } = useCanvas();
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCanvas = async () => {
    setIsCreating(true);
    const canvas = await createCanvas({
      title: 'Untitled Canvas',
    });

    if (canvas) {
      // Navigate to the new canvas
      router.push(`/${canvas.slug}`);
    }
    setIsCreating(false);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
      <div className="text-center space-y-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Home screen
        </h1>

        <button
          onClick={handleCreateCanvas}
          disabled={isCreating || loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreating ? 'Creating...' : 'Create New Canvas'}
        </button>

        {error && (
          <p className="text-red-600 mt-4">
            Error: {error}
          </p>
        )}
      </div>
    </div>
  );
}