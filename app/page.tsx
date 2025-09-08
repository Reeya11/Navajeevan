import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Package, Heart, Shield, Truck, Star } from "lucide-react"
import { FeaturedItems } from "@/components/featured-items"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              Give Pre-Loved Items a
              <span className="text-accent"> New Life</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Join Nepal's trusted marketplace for buying and selling second-hand goods. Sustainable, affordable, and community-driven.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90">
                <Link href="/register">
                  Get Started - It's Free!
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/browse">
                  Browse Items
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Items Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-semibold text-foreground">Featured Items</h2>
            <p className="text-muted-foreground">Discover amazing finds from our community</p>
          </div>
          <FeaturedItems />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-16">
            Why Choose NavaJeevan?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
              <p className="text-muted-foreground">Safe and reliable payment system with buyer protection</p>
            </div>

            <div className="text-center">
              <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Truck className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Logistics</h3>
              <p className="text-muted-foreground">Seamless delivery options across Nepal</p>
            </div>

            <div className="text-center">
              <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Eco-Friendly</h3>
              <p className="text-muted-foreground">Reduce waste and promote sustainable consumption</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Join the Movement?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Thousands of users are already buying and selling on NavaJeevan. Don't miss out!
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/register">
              Create Your Account Now
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}