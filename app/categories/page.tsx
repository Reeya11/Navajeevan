// app/categories/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import CategoryButton from '@/components/category/categoryButton';
import CategoryItems from '@/components/category/categoryItems';
import CategoryOverview from '@/components/category/categoryOverview';
import { Category, getCategoriesWithCounts } from '@/lib/categories';

export default function CategoriesPage() {
  const searchParams = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories with real counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const categoriesWithCounts = await getCategoriesWithCounts();
        setCategories(categoriesWithCounts);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Initialize from URL params
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam && categories.some(cat => cat.id === categoryParam)) {
      setSelectedCategory(categoryParam);
    }
  }, [searchParams, categories]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setIsMobileMenuOpen(false);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (categoryId) {
      url.searchParams.set('category', categoryId);
    } else {
      url.searchParams.delete('category');
    }
    window.history.pushState({}, '', url.toString());
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Menu Button */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4 sticky top-0 z-30">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-3 text-gray-700 font-semibold text-lg"
        >
          <span className="text-2xl">☰</span>
          <div>
            <div>Categories</div>
            <div className="text-sm text-gray-500 font-normal">
              {selectedCategory 
                ? categories.find(cat => cat.id === selectedCategory)?.name 
                : 'Browse all categories'
              }
            </div>
          </div>
        </button>
      </div>

      <div className="flex relative">
        {/* Fixed Vertical Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white shadow-xl lg:shadow-lg border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          h-screen lg:h-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 bg-white sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-2xl">📂</span>
              <div>
                <div>Categories</div>
                <div className="text-sm text-gray-500 font-normal mt-1">
                  {categories.length} categories available
                </div>
              </div>
            </h2>
          </div>

          {/* Categories List */}
          <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-120px)] sidebar-scroll">
            {/* All Categories Option */}
            <button
              onClick={() => handleCategorySelect('')}
              className={`
                w-full text-left p-4 rounded-lg transition-all duration-200
                flex items-center justify-between group mb-2
                ${!selectedCategory 
                  ? 'bg-green-100 border-l-4 border-green-600 text-green-800 font-semibold' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏠</span>
                <div className="flex flex-col items-start">
                  <span className="font-medium">All Categories</span>
                  <span className={`text-xs ${!selectedCategory ? 'text-green-600' : 'text-gray-500'}`}>
                    {categories.reduce((sum, cat) => sum + cat.itemCount, 0)} total items
                  </span>
                </div>
              </div>
              {!selectedCategory && (
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              )}
            </button>

            {/* Category List */}
            <div className="space-y-1">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isActive={selectedCategory === category.id}
                  onClick={() => handleCategorySelect(category.id)}
                />
              ))}
            </div>
          </nav>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 min-h-screen p-6 lg:ml-0 lg:border-l-0">
          <div className="max-w-7xl mx-auto">
            {selectedCategory ? (
              <CategoryItems categoryId={selectedCategory} />
            ) : (
              <CategoryOverview categories={categories} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}