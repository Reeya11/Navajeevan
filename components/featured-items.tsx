import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

const featuredItems = [
  {
    id: 1,
    title: "Vintage Wooden Chair",
    price: "$45",
    location: "Downtown",
    image: "/placeholder-z0tp8.png",
    condition: "Good",
    category: "Furniture",
  },
  {
    id: 2,
    title: "iPhone 12 Pro",
    price: "$450",
    location: "Midtown",
    image: "/iphone-12-pro.png",
    condition: "Excellent",
    category: "Electronics",
  },
  {
    id: 3,
    title: "Designer Handbag",
    price: "$120",
    location: "Uptown",
    image: "/luxury-quilted-handbag.png",
    condition: "Like New",
    category: "Fashion",
  },
  {
    id: 4,
    title: "Mountain Bike",
    price: "$280",
    location: "Suburbs",
    image: "/mountain-bike-trail.png",
    condition: "Good",
    category: "Sports",
  },
  {
    id: 5,
    title: "Coffee Table Books",
    price: "$25",
    location: "City Center",
    image: "/coffee-table-books.png",
    condition: "Very Good",
    category: "Books",
  },
  {
    id: 6,
    title: "Ceramic Plant Pots",
    price: "$35",
    location: "Garden District",
    image: "/ceramic-plant-pots.png",
    condition: "Excellent",
    category: "Home & Garden",
  },
]

export function FeaturedItems() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {featuredItems.map((item) => (
        <Card
          key={item.id}
          className="group hover:shadow-lg transition-all duration-300 border-border bg-card overflow-hidden"
        >
          <div className="relative">
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-2 right-2 bg-background/80 hover:bg-background text-foreground"
            >
              <Heart className="h-4 w-4" />
            </Button>
            <Badge className="absolute top-2 left-2 bg-secondary text-secondary-foreground">{item.category}</Badge>
          </div>
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-foreground text-lg leading-tight">{item.title}</h3>
              <span className="text-xl font-bold text-accent">{item.price}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mb-3">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{item.location}</span>
              <span className="mx-2">•</span>
              <span>{item.condition}</span>
            </div>
            <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">View Details</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
