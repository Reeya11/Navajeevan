import { Button } from "@/components/ui/button"

const categories = ["All Items", "Electronics", "Furniture", "Clothing", "Books", "Sports", "Home & Garden", "Toys"]

export function CategoryFilters() {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {categories.map((category, index) => (
        <Button
          key={category}
          variant={index === 0 ? "default" : "outline"}
          size="sm"
          className={`rounded-full px-4 py-2 transition-all ${
            index === 0
              ? "bg-accent hover:bg-accent/90 text-accent-foreground"
              : "border-border hover:bg-secondary hover:text-secondary-foreground"
          }`}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
