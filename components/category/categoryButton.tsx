// components/CategoryButton.tsx
import { Category } from '@/lib/categories';

interface CategoryButtonProps {
  category: Category;
  isActive: boolean;
  onClick: () => void;
}

export default function CategoryButton({ category, isActive, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg transition-all duration-200 ease-in-out
        flex items-center justify-between group
        ${isActive 
          ? 'bg-green-50 border-l-4 border-green-600 text-green-800 font-semibold' 
          : 'bg-amber-30 hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
        }
      `}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{category.icon}</span>
        <div className="flex flex-col items-start">
          <span className="font-medium">{category.name}</span>
          <span className={`text-xs ${isActive ? 'text-amber-50' : 'text-gray-500'}`}>
            {category.itemCount} items
          </span>
        </div>
      </div>
      
      {/* Active indicator */}
      {isActive && (
        <div className="w-2 h-2 bg-amber-50 rounded-full"></div>
      )}
    </button>
  );
}