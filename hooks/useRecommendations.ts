// hooks/useRecommendations.ts - UPDATED
import { useState, useEffect } from 'react';

interface Recommendation {
  itemId: string;
  similarity: number;
  title: string;
  price?: number;
  images?: string[];
  category?: string;
}

export function useRecommendations(
  itemId?: string, 
  type: 'similar' | 'trending' = 'similar', 
  limit: number = 6
) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({ type, limit: limit.toString() });
        if (itemId && type === 'similar') params.append('itemId', itemId);

        const response = await fetch(`/api/recommendations?${params}`);
        
        if (response.ok) {
          const data = await response.json();
          setRecommendations(data.recommendations || []);
        } else {
          throw new Error('Failed to load');
        }
      } catch (err) {
        setError('Error loading recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [itemId, type, limit]);

  return { recommendations, loading, error };
}