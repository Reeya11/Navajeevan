// app/api/recommendations/route.ts - COMPLETE SINGLE FILE
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/lib/models/Item';

// Simple cosine similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
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

  return magnitudeA === 0 || magnitudeB === 0 ? 0 : dotProduct / (magnitudeA * magnitudeB);
}

// Text to vector conversion
function textToVector(text: string, vocabulary: Map<string, number>): number[] {
  const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const vector = new Array(vocabulary.size).fill(0);
  
  words.forEach(word => {
    const index = vocabulary.get(word);
    if (index !== undefined) vector[index] += 1;
  });

  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return magnitude === 0 ? vector : vector.map(val => val / magnitude);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const type = searchParams.get('type') || 'similar';
    const limit = parseInt(searchParams.get('limit') || '6');

    await connectDB();

    // Get active items
    const allItems = await Item.find({ 
      $or: [{ status: 'active' }, { status: { $exists: false } }]
    }).limit(300);

    if (allItems.length === 0) {
      return NextResponse.json({ success: true, recommendations: [], count: 0 });
    }

    // Build vocabulary from item texts
    const allText: string[] = [];
    allItems.forEach((item: any) => {
      const text = `${item.title} ${item.description} ${item.category}`.toLowerCase();
      allText.push(...text.split(/\s+/).filter(word => word.length > 2));
    });

    const vocabulary = new Map([...new Set(allText)].slice(0, 50).map((word, i) => [word, i]));

    // Convert items to vectors
    const itemVectors = allItems.map((item: any) => ({
      itemId: item._id.toString(),
      vector: textToVector(`${item.title} ${item.description} ${item.category}`, vocabulary),
      title: item.title,
      price: item.price,
      images: item.images,
      category: item.category
    }));

    let recommendations: any[] = [];

    if (type === 'similar' && itemId) {
      const targetItem = itemVectors.find(v => v.itemId === itemId);
      if (targetItem) {
        recommendations = itemVectors
          .filter(v => v.itemId !== itemId)
          .map(otherItem => ({
            ...otherItem,
            similarity: cosineSimilarity(targetItem.vector, otherItem.vector)
          }))
          .filter(rec => rec.similarity > 0.1)
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, limit);
      }
    } else {
      // Trending - random items with images
      recommendations = allItems
        .filter((item: any) => item.images?.length > 0)
        .sort(() => Math.random() - 0.5)
        .slice(0, limit)
        .map((item: any) => ({
          itemId: item._id.toString(),
          similarity: 0.5 + Math.random() * 0.3,
          title: item.title,
          price: item.price,
          images: item.images,
          category: item.category
        }));
    }

    return NextResponse.json({
      success: true,
      recommendations: recommendations,
      count: recommendations.length
    });

  } catch (error) {
    console.error('Recommendation API error:', error);
    
    // Fallback to random items
    try {
      await connectDB();
      const fallbackItems = await Item.find().limit(6).select('title price images category');
      const fallbackRecs = fallbackItems.map((item: any) => ({
        itemId: item._id.toString(),
        similarity: 0.7,
        title: item.title,
        price: item.price,
        images: item.images,
        category: item.category
      }));

      return NextResponse.json({
        success: true,
        recommendations: fallbackRecs,
        count: fallbackRecs.length,
        fallback: true
      });
    } catch {
      return NextResponse.json({
        success: true,
        recommendations: [],
        count: 0
      });
    }
  }
}