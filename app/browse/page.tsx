import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"
import Link from "next/link"

// Define the item type based on your schema
interface Item {
  _id: string
  title: string
  description: string
  price: number
  category: string
  condition: string
  city: string
  area?: string
  images: string[]
  createdAt: string
}

async function getItems(): Promise<Item[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/items`, {
      cache: 'no-store'
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch items')
    }
    
    return res.json()
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export default async function BrowsePage() {
  const items = await getItems()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Marketplace</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} found
          </p>
        </div>
        
        <Button asChild className="bg-green-600 hover:bg-green-700">
          <Link href="/sell">
            Sell Your Item
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for items..."
            className="pl-10"
          />
        </div>
        
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Items Grid */}
      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No items found</p>
          <p className="text-muted-foreground">Be the first to list an item!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Link 
              key={item._id} 
              href={`/item/${item._id}`}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="bg-muted h-48 rounded-md mb-4 flex items-center justify-center overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-muted-foreground">No image</span>
                )}
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
              <p className="text-green-600 font-bold text-lg mb-1">Rs. {item.price}</p>
              <p className="text-sm text-muted-foreground capitalize mb-1">
                Condition: {item.condition}
              </p>
              <p className="text-sm text-muted-foreground">
                {item.city}{item.area ? `, ${item.area}` : ''}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}