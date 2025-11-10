// lib/recommendations/recommendationEngine.ts
import { ItemVectorizer, ItemVector } from './itemVectors';
import { SimilarityCalculator } from './similarityCalculator';

export interface Recommendation {
  itemId: string;
  similarity: number;
  title: string;
  price?: number;
  images?: string[];
  category?: string;
}

export class RecommendationEngine {
  private vectorizer: ItemVectorizer;
  private itemVectors: Map<string, ItemVector> = new Map();
  private allItems: any[] = [];

  constructor() {
    this.vectorizer = new ItemVectorizer();
  }

  // Initialize with all items (call this on app start)
  async initialize(items: any[]): Promise<void> {
    console.log('🔄 Initializing recommendation engine...');
    this.allItems = items;
    
    // Build vocabulary from all items
    this.vectorizer.buildVocabulary(items);
    
    // Create vectors for all items
    this.itemVectors.clear();
    items.forEach(item => {
      const vector = this.vectorizer.itemToVector(item);
      this.itemVectors.set(vector.itemId, vector);
    });
    
    console.log(`✅ Recommendation engine ready with ${this.itemVectors.size} items`);
  }

  // Get recommendations for a specific item
  getSimilarItems(itemId: string, limit: number = 6): Recommendation[] {
    const targetVector = this.itemVectors.get(itemId);
    if (!targetVector) {
      console.log(`❌ No vector found for item: ${itemId}`);
      return [];
    }

    const allVectors = Array.from(this.itemVectors.values());
    const similarItems = SimilarityCalculator.findSimilarItems(
      targetVector.vector,
      allVectors,
      itemId,
      limit
    );

    // Enrich with item details
    return similarItems.map(similar => {
      const item = this.allItems.find(i => (i._id || i.id) === similar.itemId);
      return {
        ...similar,
        price: item?.price,
        images: item?.images || [],
        category: item?.category
      };
    });
  }

  // Get recommendations based on user's browsing history
  getPersonalizedRecommendations(viewedItemIds: string[], limit: number = 6): Recommendation[] {
    if (viewedItemIds.length === 0) return [];

    // Average vectors of viewed items
    const viewedVectors = viewedItemIds
      .map(id => this.itemVectors.get(id))
      .filter((v): v is ItemVector => v !== undefined);

    if (viewedVectors.length === 0) return [];

    const averageVector = this.averageVectors(viewedVectors.map(v => v.vector));
    
    const allVectors = Array.from(this.itemVectors.values());
    const recommendations = SimilarityCalculator.findSimilarItems(
      averageVector,
      allVectors,
      '', // Don't exclude any specific item
      limit * 2 // Get more then filter
    );

    // Filter out already viewed items
    const filteredRecs = recommendations.filter(rec => 
      !viewedItemIds.includes(rec.itemId)
    ).slice(0, limit);

    // Enrich with item details
    return filteredRecs.map(rec => {
      const item = this.allItems.find(i => (i._id || i.id) === rec.itemId);
      return {
        ...rec,
        price: item?.price,
        images: item?.images || [],
        category: item?.category
      };
    });
  }

  private averageVectors(vectors: number[][]): number[] {
    if (vectors.length === 0) return [];
    
    const result = new Array(vectors[0].length).fill(0);
    
    vectors.forEach(vector => {
      vector.forEach((value, index) => {
        result[index] += value;
      });
    });

    // Normalize the average vector
    const magnitude = Math.sqrt(result.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return result;
    
    return result.map(val => val / magnitude);
  }

  // Get trending items (most similar to many items)
  getTrendingItems(limit: number = 6): Recommendation[] {
    // Simple implementation - return random popular items
    const popularItems = this.allItems
      .filter(item => item.images && item.images.length > 0)
      .sort(() => Math.random() - 0.5) // Shuffle
      .slice(0, limit)
      .map(item => ({
        itemId: item._id || item.id,
        similarity: 0.5 + Math.random() * 0.5, // Random similarity for demo
        title: item.title,
        price: item.price,
        images: item.images,
        category: item.category
      }));

    return popularItems;
  }
}

// Singleton instance
let recommendationEngine: RecommendationEngine | null = null;

export const getRecommendationEngine = (): RecommendationEngine => {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine();
  }
  return recommendationEngine;
};