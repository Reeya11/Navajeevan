import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

export default function BrowsePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Browse Marketplace</h1>
          <p className="text-muted-foreground">Discover amazing second-hand finds</p>
        </div>
        
        <Button className="bg-accent hover:bg-accent/90">
          Sell Your Item
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Item cards will go here */}
        <div className="border rounded-lg p-4">
          <div className="bg-muted h-48 rounded-md mb-4"></div>
          <h3 className="font-semibold">Vintage Camera</h3>
          <p className="text-accent font-bold">Rs. 1,500</p>
          <p className="text-sm text-muted-foreground">Kathmandu</p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="bg-muted h-48 rounded-md mb-4"></div>
          <h3 className="font-semibold">Wooden Chair</h3>
          <p className="text-accent font-bold">Rs. 2,000</p>
          <p className="text-sm text-muted-foreground">Pokhara</p>
        </div>

        <div className="border rounded-lg p-4">
          <div className="bg-muted h-48 rounded-md mb-4"></div>
          <h3 className="font-semibold">Smartphone</h3>
          <p className="text-accent font-bold">Rs. 15,000</p>
          <p className="text-sm text-muted-foreground">Lalitpur</p>
        </div>
      </div>
    </div>
  )
}