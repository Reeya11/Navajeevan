// lib/categories.ts
export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  itemCount: number;
}

// Base categories structure
export const baseCategories = [
  {
    id: 'furniture',
    name: 'Furniture',
    description: 'Sofas, chairs, tables, beds and home furniture',
    icon: '🛋️',
    itemCount: 0
  },
  {
    id: 'electronics',
    name: 'Electronics',
    description: 'Mobile phones, laptops, gadgets and accessories',
    icon: '📱',
    itemCount: 0
  },
  {
    id: 'clothing',
    name: 'Clothing',
    description: 'Men, women and kids clothing, shoes and accessories',
    icon: '👕',
    itemCount: 0
  },
  {
    id: 'books',
    name: 'Books',
    description: 'Textbooks, novels, academic books and stationery',
    icon: '📚',
    itemCount: 0
  },
  {
    id: 'home-decor',
    name: 'Home Decor',
    description: 'Home decoration items, art, and interior accessories',
    icon: '🏠',
    itemCount: 0
  },
   {
    id: 'sports', // ← ADDED SPORTS CATEGORY
    name: 'Sports',
    description: 'Sports equipment, fitness gear, and outdoor activities',
    icon: '⚽',
    itemCount: 0
  },
  {
    id: 'other',
    name: 'Other',
    description: 'Other items and miscellaneous categories',
    icon: '📦',
    itemCount: 0
  }
];

export const getCategoryById = (id: string): Category | undefined => {
  return baseCategories.find(cat => cat.id === id);
};

// Function to get categories with real counts from API
export const getCategoriesWithCounts = async (): Promise<Category[]> => {
  try {
    const response = await fetch('/api/categories', {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.categories || baseCategories;
    }
    
    // Fallback to base categories if API fails
    return baseCategories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return baseCategories;
  }
};