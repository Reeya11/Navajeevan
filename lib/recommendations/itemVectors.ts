// lib/recommendations/itemVectors.ts
export interface ItemVector {
  itemId: string;
  vector: number[];
  title: string;
  category: string;
}

export class ItemVectorizer {
  private vocabulary: Map<string, number> = new Map();
  private vectorSize: number = 100; // Reduced for performance

  // Build vocabulary from all items
  buildVocabulary(items: any[]): void {
    const allText: string[] = [];
    
    items.forEach(item => {
      const text = this.getTextFromItem(item).toLowerCase();
      const words = text.split(/\s+/).filter(word => word.length > 2);
      allText.push(...words);
    });

    // Get most common words
    const wordFreq = new Map<string, number>();
    allText.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
    });

    // Take top N words for vocabulary
    const sortedWords = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, this.vectorSize);

    sortedWords.forEach(([word], index) => {
      this.vocabulary.set(word, index);
    });
  }

  // Convert item to vector
  itemToVector(item: any): ItemVector {
    const text = this.getTextFromItem(item).toLowerCase();
    const words = text.split(/\s+/).filter(word => word.length > 2);
    
    const vector = new Array(this.vectorSize).fill(0);
    
    words.forEach(word => {
      const index = this.vocabulary.get(word);
      if (index !== undefined) {
        vector[index] += 1; // TF (Term Frequency)
      }
    });

    return {
      itemId: item._id || item.id,
      vector: this.normalizeVector(vector),
      title: item.title,
      category: item.category
    };
  }

  private getTextFromItem(item: any): string {
    return `${item.title} ${item.description} ${item.category} ${item.condition}`.toLowerCase();
  }

  private normalizeVector(vector: number[]): number[] {
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude === 0) return vector;
    return vector.map(val => val / magnitude);
  }
}