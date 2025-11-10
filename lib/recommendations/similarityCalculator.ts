// lib/recommendations/similarityCalculator.ts
export class SimilarityCalculator {
  // Cosine similarity between two vectors
  static cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      magnitudeA += vecA[i] * vecA[i];
      magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Get top N similar items
  static findSimilarItems(
    targetVector: number[],
    itemVectors: Array<{ itemId: string; vector: number[]; title: string }>,
    excludeItemId: string,
    limit: number = 6
  ): Array<{ itemId: string; similarity: number; title: string }> {
    const similarities: Array<{ itemId: string; similarity: number; title: string }> = [];

    itemVectors.forEach(itemVector => {
      if (itemVector.itemId !== excludeItemId) {
        const similarity = this.cosineSimilarity(targetVector, itemVector.vector);
        if (similarity > 0.1) { // Minimum similarity threshold
          similarities.push({
            itemId: itemVector.itemId,
            similarity,
            title: itemVector.title
          });
        }
      }
    });

    // Sort by similarity (highest first) and return top N
    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }
}