import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchBar() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for items..."
            className="pl-10 pr-4 py-3 text-base rounded-lg border-border focus:ring-2 focus:ring-accent/20 focus:border-accent"
          />
        </div>
        <Button className="ml-3 px-6 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg">
          Search
        </Button>
      </div>
    </div>
  )
}
