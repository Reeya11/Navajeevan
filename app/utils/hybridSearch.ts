export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  condition: 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';
  location: string;
  sellerId: string;
  images: string[];
  createdAt: Date;
}

export interface SearchResult {
  product: Product;
  score: number;
  matchType: 'semantic' | 'keyword' | 'hybrid';
}

export class PureHybridSearch {
  private products: Product[] = [];

  public setProducts(products: Product[]): void {
    this.products = products;
    console.log(`🔍 Search loaded with ${products.length} products`);
  }

  private getProductText(product: Product): string {
    return `${product.title} ${product.description} ${product.category} ${product.condition} ${product.location}`.toLowerCase();
  }

  // Condition scoring weights (higher = better)
  private getConditionScore(condition: Product['condition']): number {
    const conditionScores = {
      'New': 1.0,
      'Like New': 0.8,
      'Good': 0.6,
      'Fair': 0.4,
      'Poor': 0.2
    };
    return conditionScores[condition];
  }

  // Enhanced synonym matching with product-specific terms
  private wordsAreSimilar(word1: string, word2: string): boolean {
    // Comprehensive synonyms for marketplace context
    const universalSynonyms: { [key: string]: string[] } = {
      // Product categories - specific and strict
      'shoe': ['shoes', 'footwear', 'sneaker', 'boot', 'loafer', 'sandal'],
      'shoes': ['shoe', 'footwear', 'sneakers', 'boots'],
      'flower': ['flowers', 'rose', 'plant', 'bouquet', 'blossom'],
      'flowers': ['flower', 'plants', 'roses', 'bouquets'],
      'book': ['books', 'textbook', 'novel', 'text', 'guide'],
      'books': ['book', 'textbooks', 'novels', 'reading'],
      'headphone': ['earphone', 'earbud', 'headset', 'headphones', 'earphones'],
      'headphones': ['headphone', 'earbuds', 'headsets'],
      'phone': ['mobile', 'smartphone', 'cellphone', 'iphone'],
      'laptop': ['notebook', 'computer', 'macbook'],
      'table': ['desk', 'furniture'],
      'chair': ['seat', 'furniture'],
      'shirt': ['top', 'clothing', 't-shirt'],
      'pants': ['trousers', 'jeans', 'clothing'],
      'mouse': ['mice', 'computer mouse', 'pc mouse'],
      'statue': ['sculpture', 'figure', 'idol'],
      'river': ['water', 'stream', 'flow'],
      
      // Conditions
      'new': ['fresh', 'unused', 'sealed', 'brand new'],
      'like new': ['excellent', 'mint', 'perfect', 'almost new'],
      'good': ['nice', 'great', 'decent', 'working'],
      'fair': ['average', 'usable', 'acceptable'],
      'poor': ['bad', 'damaged', 'broken', 'worn out'],
      
      // Price related
      'cheap': ['affordable', 'inexpensive', 'lowcost', 'budget'],
      'expensive': ['costly', 'premium', 'high-end', 'luxury'],
      'free': ['gratis', 'no cost'],
      
      // Size related
      'big': ['large', 'huge', 'oversized'],
      'small': ['tiny', 'compact', 'little'],
      
      // Quality related
      'quality': ['premium', 'good', 'excellent', 'superior'],
      'durable': ['strong', 'long lasting', 'sturdy'],
      
      // Activities/Usage
      'running': ['jogging', 'exercise', 'workout', 'sports'],
      'gaming': ['games', 'esports', 'playing'],
      'study': ['learning', 'student', 'education'],
      'office': ['work', 'professional', 'business'],
      
      // Locations
      'kathmandu': ['ktm'],
      'pokhara': ['pokhara valley'],
      'lalitpur': ['patan'],
      'bhaktapur': ['bhaktapur city']
    };

    // Exact match (highest confidence)
    if (word1 === word2) return true;
    
    // Check synonyms - only if words are meaningful (length > 2)
    if (word1.length > 2 && word2.length > 2) {
      for (const [key, syns] of Object.entries(universalSynonyms)) {
        if (key === word1 && syns.includes(word2)) return true;
        if (key === word2 && syns.includes(word1)) return true;
      }
    }

    // Strict partial matching - only for longer words
    if (word1.length > 4 && word2.length > 4) {
      if (word1.includes(word2) || word2.includes(word1)) return true;
    }

    return false;
  }

  // Improved string similarity with better weighting
  private stringSimilarity(str1: string, str2: string): number {
    const words1 = str1.split(/\s+/).filter(word => word.length > 2);
    const words2 = str2.split(/\s+/).filter(word => word.length > 2);
    
    if (words1.length === 0 || words2.length === 0) return 0;
    
    let weightedMatches = 0;
    let totalPossible = 0;

    words1.forEach(word1 => {
      words2.forEach(word2 => {
        if (this.wordsAreSimilar(word1, word2)) {
          // Weight matches by word importance
          const weight = this.getWordWeight(word1);
          weightedMatches += weight;
          totalPossible += weight;
        }
      });
    });
    
    return totalPossible > 0 ? weightedMatches / totalPossible : 0;
  }

  // Give higher weight to important words (nouns, product types)
  private getWordWeight(word: string): number {
    const highWeightWords = ['shoe', 'shoes', 'flower', 'flowers', 'book', 'books', 'phone', 'laptop', 'table', 'chair', 'shirt', 'pants', 'mouse', 'statue', 'river', 'headphone', 'headphones'];
    const mediumWeightWords = ['new', 'like new', 'good', 'wireless', 'sports', 'running', 'gaming', 'formal', 'casual'];
    
    if (highWeightWords.includes(word)) return 2.0; // Double weight for product types
    if (mediumWeightWords.includes(word)) return 1.5; // Higher weight for important adjectives
    return 1.0; // Normal weight for other words
  }

  // More accurate semantic search with higher threshold
  private semanticSearch(query: string, limit: number = 20): SearchResult[] {
    if (this.products.length === 0) {
      console.log('❌ No products available for semantic search');
      return [];
    }

    const results: SearchResult[] = [];
    const queryLower = query.toLowerCase();

    console.log(`🔍 Semantic search for: "${query}"`);

    this.products.forEach((product, index) => {
      const productText = this.getProductText(product);
      const similarity = this.stringSimilarity(queryLower, productText);
      
      // Higher threshold for semantic matches to avoid irrelevant results
      if (similarity > 0.15) { // Increased from 0.05
        const conditionBoost = this.getConditionScore(product.condition);
        const finalScore = similarity * conditionBoost;
        
        console.log(`   ✅ SEMANTIC: "${product.title}" - Score: ${finalScore.toFixed(3)}`);
        
        results.push({
          product,
          score: finalScore,
          matchType: 'semantic'
        });
      }
    });

    console.log(`🎯 Semantic search found: ${results.length} matches`);
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  // Much better keyword search with intelligent scoring
  private keywordSearch(query: string, limit: number = 20): SearchResult[] {
    if (this.products.length === 0) {
      console.log('❌ No products available for keyword search');
      return [];
    }

    const results: SearchResult[] = [];
    const queryTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);

    console.log(`🔍 Keyword search for: "${query}"`);
    console.log(`📦 Search terms:`, queryTerms);

    this.products.forEach((product, index) => {
      const productText = this.getProductText(product);
      let score = 0;
      let exactMatches = 0;

      queryTerms.forEach(term => {
        let termScore = 0;

        // Exact word match in title (highest priority)
        if (new RegExp(`\\b${term}\\b`).test(product.title.toLowerCase())) {
          termScore += 2.0; // Big boost for title matches
          exactMatches++;
        }
        
        // Exact word match in category
        else if (new RegExp(`\\b${term}\\b`).test(product.category.toLowerCase())) {
          termScore += 1.5; // Boost for category matches
          exactMatches++;
        }
        
        // Exact word match in description
        else if (new RegExp(`\\b${term}\\b`).test(product.description.toLowerCase())) {
          termScore += 1.0;
          exactMatches++;
        }
        
        // Partial match in title (lower score)
        else if (product.title.toLowerCase().includes(term)) {
          termScore += 0.5;
        }
        
        // Partial match in description (lowest score)
        else if (product.description.toLowerCase().includes(term)) {
          termScore += 0.2;
        }

        score += termScore;
      });

      if (score > 0) {
        // Apply condition boost
        const conditionBoost = this.getConditionScore(product.condition);
        
        // Calculate final score with exact match bonus
        const matchRatio = exactMatches / queryTerms.length;
        const baseScore = score / queryTerms.length;
        const bonus = matchRatio * 0.5; // Bonus for matching all terms
        const normalizedScore = (baseScore + bonus) * conditionBoost;
        
        console.log(`   🎯 KEYWORD: "${product.title}" - Score: ${normalizedScore.toFixed(3)}`);
        
        results.push({
          product,
          score: normalizedScore,
          matchType: 'keyword'
        });
      }
    });

    console.log(`🎯 Keyword search found: ${results.length} matches`);
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  private applyFilters(products: Product[], filters: any): Product[] {
    return products.filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.maxPrice && product.price > filters.maxPrice) return false;
      if (filters.minPrice && product.price < filters.minPrice) return false;
      if (filters.location && !product.location.toLowerCase().includes(filters.location.toLowerCase())) return false;
      if (filters.condition && product.condition !== filters.condition) return false;
      return true;
    });
  }

  public hybridSearch(
    query: string, 
    filters?: {
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      location?: string;
      condition?: Product['condition'];
    },
    limit: number = 20
  ): SearchResult[] {

    console.log(`🚀 STARTING HYBRID SEARCH`);
    console.log(`🔍 Query: "${query}"`);
    console.log(`📦 Total products: ${this.products.length}`);

    // If no query, return filtered products with smart sorting
    if (!query.trim()) {
      console.log('ℹ️ No query - returning all filtered products');
      let filtered = this.products;
      if (filters) {
        filtered = this.applyFilters(filtered, filters);
      }
      
      const results = filtered
        .sort((a, b) => {
          const aCondition = this.getConditionScore(a.condition);
          const bCondition = this.getConditionScore(b.condition);
          if (bCondition !== aCondition) return bCondition - aCondition;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        })
        .slice(0, limit)
        .map(product => ({ 
          product, 
          score: this.getConditionScore(product.condition), 
          matchType: 'keyword' as const 
        }));

      console.log(`📊 No-query results: ${results.length} items`);
      return results;
    }

    // Apply filters first
    let filteredProducts = this.products;
    if (filters) {
      filteredProducts = this.applyFilters(filteredProducts, filters);
    }

    console.log(`📦 After filters: ${filteredProducts.length} products`);

    // Update the products for this search
    const originalProducts = this.products;
    this.products = filteredProducts;

    // Get results from both search methods
    const semanticResults = this.semanticSearch(query, limit * 3);
    const keywordResults = this.keywordSearch(query, limit * 3);

    // Restore original products
    this.products = originalProducts;

    // Combine and rerank results with intelligent boosting
    const resultsMap = new Map<string, SearchResult>();

    [...semanticResults, ...keywordResults].forEach(result => {
      const existing = resultsMap.get(result.product.id);
      
      if (existing) {
        // Bigger boost for hybrid matches (appears in both searches)
        existing.score *= 3.0; // Increased from 2.5
        existing.matchType = 'hybrid';
        console.log(`🔄 HYBRID BOOST: "${result.product.title}" - New score: ${existing.score.toFixed(3)}`);
      } else {
        resultsMap.set(result.product.id, { ...result });
      }
    });

    const finalResults = Array.from(resultsMap.values());
    
    // Final ranking with better business logic
    const sortedResults = finalResults
      .sort((a, b) => {
        // Primary: search relevance score (bigger difference)
        if (Math.abs(b.score - a.score) > 0.1) { // Increased threshold
          return b.score - a.score;
        }
        
        // Secondary: condition (better condition first)
        const aCondition = this.getConditionScore(a.product.condition);
        const bCondition = this.getConditionScore(b.product.condition);
        if (bCondition !== aCondition) {
          return bCondition - aCondition;
        }
        
        // Tertiary: recency (newer items first)
        const aRecency = new Date(a.product.createdAt).getTime();
        const bRecency = new Date(b.product.createdAt).getTime();
        if (bRecency !== aRecency) {
          return bRecency - aRecency;
        }
        
        // Final: price (lower first for affordability)
        return a.product.price - b.product.price;
      })
      .slice(0, limit);

    console.log(`🎉 FINAL RESULTS: ${sortedResults.length} items found`);
    console.log(`🏆 Top results:`, sortedResults.map(r => ({
      title: r.product.title,
      score: r.score.toFixed(3),
      matchType: r.matchType
    })));

    return sortedResults;
  }
}

// Singleton instance
let hybridSearchInstance: PureHybridSearch | null = null;

export const getSearchInstance = (): PureHybridSearch => {
  if (!hybridSearchInstance) {
    hybridSearchInstance = new PureHybridSearch();
  }
  return hybridSearchInstance;
};