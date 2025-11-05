// components/category/CategoryOverview.tsx
import { Category } from '@/lib/categories';
import Link from 'next/link';

interface CategoryOverviewProps {
  categories: Category[];
}

export default function CategoryOverview({ categories }: CategoryOverviewProps) {
  const totalItems = categories.reduce((sum, cat) => sum + cat.itemCount, 0);
  const popularCategories = [...categories]
    .sort((a, b) => b.itemCount - a.itemCount)
    .slice(0, 4);

  return (
    <div className="max-w-6xl">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Browse Categories</h1>
        <p className="text-gray-600 text-lg mb-6">
          Discover {totalItems} items organized across {categories.length} categories. 
          Click on any category in the sidebar to explore available items.
        </p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-800">{categories.length}</div>
            <div className="text-green-700 font-medium">Categories</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
            <div className="text-3xl font-bold text-blue-800">{totalItems}</div>
            <div className="text-blue-700 font-medium">Total Items</div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
            <div className="text-3xl font-bold text-orange-800">50+</div>
            <div className="text-orange-700 font-medium">Active Sellers</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
            <div className="text-3xl font-bold text-purple-800">24/7</div>
            <div className="text-purple-700 font-medium">Support</div>
          </div>
        </div>
      </div>

      {/* Popular Categories */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Most Popular Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {popularCategories.map((category) => (
            <Link 
              key={category.id}
              href={`/categories?category=${category.id}`}
              className="flex items-center gap-6 p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-300 group"
            >
              <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
              <div className="flex-1">
                <h3 className="font-bold text-gray-800 text-lg mb-1">{category.name}</h3>
                <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-semibold">{category.itemCount} items</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* All Categories Grid */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories?category=${category.id}`}
              className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{category.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 group-hover:text-green-700 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-500 text-xs">{category.itemCount} items</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}