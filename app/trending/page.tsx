// app/trending/page.tsx - FIXED
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRecommendations } from '@/hooks/useRecommendations';
import { TrendingUp, Zap, Flame, Star } from 'lucide-react'; // Changed Fire to Flame/Star

export default function TrendingPage() {
  const { recommendations, loading, error } = useRecommendations(undefined, 'trending', 12);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-orange-500" />
            <h1 className="text-4xl font-bold text-gray-900">Trending Now</h1>
            <Zap className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular and trending items on NavaJeevan right now
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Failed to load trending items</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Trending Items Grid */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((item, index) => (
              <Link 
                key={item.itemId} 
                href={`/item/${item.itemId}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all duration-300 group relative"
              >
                {/* Trending Badge for Top 3 */}
                {index < 3 && (
                  <div className={`absolute -top-2 -left-2 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    index === 1 ? 'bg-gradient-to-r from-gray-500 to-gray-700' :
                    'bg-gradient-to-r from-amber-700 to-amber-900'
                  }`}>
                    {index === 0 ? '🔥 Hot' : index === 1 ? '⚡ Trending' : '⭐ Popular'}
                  </div>
                )}
                
                <div className="relative h-48 bg-gray-100 rounded-t-lg overflow-hidden">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <span className="text-4xl">📦</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-green-600 font-bold text-lg mb-2">Rs. {item.price}</p>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span className="capitalize bg-gray-100 px-2 py-1 rounded">{item.category}</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      {(item.similarity * 100).toFixed(0)}% match
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
              <TrendingUp className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Trending Items Yet</h3>
              <p className="text-yellow-700 mb-4">
                Items will appear here as they gain popularity. Be the first to list something!
              </p>
              <Link 
                href="/sell"
                className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                List Your Item
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}