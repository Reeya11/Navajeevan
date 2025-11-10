// components/RecommendationsSection.tsx
'use client';

import { useRecommendations } from '@/hooks/useRecommendations';
import Link from 'next/link';

interface RecommendationsSectionProps {
  itemId?: string;
  title?: string;
  type?: 'similar' | 'trending';
  limit?: number;
}

export default function RecommendationsSection({ 
  itemId, 
  title = "You might also like",
  type = 'similar',
  limit = 6 
}: RecommendationsSectionProps) {
  const { recommendations, loading, error } = useRecommendations(itemId, type, limit);

  if (loading) {
    return (
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-lg mb-2"></div>
              <div className="bg-gray-200 h-4 rounded mb-1"></div>
              <div className="bg-gray-200 h-3 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {recommendations.map((item) => (
          <Link 
            key={item.itemId} 
            href={`/item/${item.itemId}`}
            className="border rounded-lg p-2 hover:shadow-md transition-shadow"
          >
            <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
              {item.images && item.images.length > 0 ? (
                <img 
                  src={item.images[0]} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400">📦</span>
              )}
            </div>
            <p className="font-semibold text-sm line-clamp-2 mb-1">{item.title}</p>
            <p className="text-green-600 font-bold text-sm">Rs. {item.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}