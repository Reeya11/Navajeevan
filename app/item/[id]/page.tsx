// app/item/[id]/page.tsx
"use client";

import { notFound } from "next/navigation";
import { useState, useEffect } from "react";
import { MessageCircle, Heart, CreditCard } from "lucide-react";
import PaymentComponent from "@/components/PaymentComponent";
import RecommendationsSection from "@/components/RecommendationsSection";
// Define the item interface
interface Item {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  city: string;
  area?: string;
  phone: string;
  contactMethod: string;
  images: string[];
  sellerId: string;
  sellerName: string;
  createdAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ItemPage({ params }: PageProps) {
  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStartingConversation, setIsStartingConversation] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [itemId, setItemId] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isOwnItem, setIsOwnItem] = useState(false); 

  useEffect(() => {
  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        console.log('👤 User loaded:', userData);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };
  fetchUser();
}, []);
  // Await params in useEffect
  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setItemId(resolvedParams.id);
    };

    fetchParams();
  }, [params]);

  // Add this useEffect to fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  // Add this useEffect to check if it's user's own item
  useEffect(() => {
    if (user && item) {
      setIsOwnItem(user.id === item.sellerId);
      console.log('🔍 Ownership check:', {
        userId: user.id,
        sellerId: item.sellerId,
        isOwnItem: user.id === item.sellerId
      });
    }
  }, [user, item]);

  // Fetch item data when itemId is available
  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/items/${itemId}`);
        if (response.ok) {
          const itemData = await response.json();
          setItem(itemData);
        } else {
          notFound();
        }
      } catch (error) {
        console.error("Error fetching item:", error);
        notFound();
      } finally {
        setIsLoading(false);
      }
    };

    fetchItem();
  }, [itemId]);

  useEffect(() => {
    if (!item) return;

    const checkIfSaved = async () => {
      try {
        const response = await fetch("/api/dashboard/saved-items");
        if (response.ok) {
          const data = await response.json();
          const savedItemIds =
            data.savedItems?.map((saved: any) => saved._id) || [];
          setIsSaved(savedItemIds.includes(item._id));
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkIfSaved();
  }, [item]);

  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!item) return;

      try {
        const response = await fetch("/api/dashboard/saved-items");
        if (response.ok) {
          const data = await response.json();
          console.log("📋 Saved items from API:", data.savedItems);

          // Check if current item is in saved items
          const isItemSaved = data.savedItems?.some(
            (savedItem: any) => savedItem._id === item._id
          );

          console.log(`🔍 Item ${item._id} saved status:`, isItemSaved);
          setIsSaved(!!isItemSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };

    checkSavedStatus();
  }, [item]); // Run whenever item changes

  const handleContact = (contactMethod: string, phone: string) => {
    if (contactMethod === "whatsapp") {
      window.open(`https://wa.me/${phone}`, "_blank");
    } else if (contactMethod === "phone") {
      window.open(`tel:${phone}`, "_blank");
    } else {
      alert(`Contact the seller at: ${phone}`);
    }
  };

  const handleMessageSeller = async () => {
  if (!item || !user) { // ← Check if user data is loaded
    alert("Please wait while we load your information...");
    return;
  }

  setIsStartingConversation(true);

  // USE REAL USER DATA - no more mock data! 🎉
  const currentUser = {
    id: user.id,           // ← Real user ID from auth
    name: user.name,       // ← Real user name
    email: user.email      // ← Real user email
  };

  console.log('🔍 Starting conversation with real user:', currentUser);

  const initialMessage = `Hi! I'm interested in your "${item.title}". Is it still available?`;

  try {
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        itemId: item._id,
        itemTitle: item.title,
        sellerId: item.sellerId,
        sellerName: item.sellerName,
        buyerId: currentUser.id,      // ← REAL buyer ID
        buyerName: currentUser.name,  // ← REAL buyer name  
        buyerEmail: currentUser.email, // ← REAL buyer email
        initialMessage: initialMessage,
      }),
    });

    if (response.ok) {
      const conversation = await response.json();
      console.log('✅ Conversation started:', conversation);
      // Redirect to messages page
      window.location.href = `/messages`;
    } else {
      const errorData = await response.json();
      console.error('❌ Failed to start conversation:', errorData);
      alert(
        errorData.error || "Failed to start conversation. Please try again."
      );
    }
  } catch (error) {
    console.error("Error starting conversation:", error);
    alert("Error starting conversation. Please try again.");
  } finally {
    setIsStartingConversation(false);
  }
};

  const handleSaveItem = async () => {
    if (!item) return;

    try {
      if (isSaved) {
        // UNSAVE: Item is currently saved, so remove it
        console.log("🗑️ Removing item from saved:", item._id);
        const response = await fetch(`/api/saved-items/${item._id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setIsSaved(false);
          console.log("✅ Item removed from favorites");
        } else {
          const errorData = await response.json();
          console.error("❌ Failed to remove:", errorData);
          alert("❌ Failed to remove item from favorites");
        }
      } else {
        // SAVE: Item is not saved, so save it
        console.log("💾 Saving item:", item._id);
        const response = await fetch("/api/saved-items", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: item._id }),
        });

        const data = await response.json();
        console.log("📦 Save API response:", data);

        if (response.ok) {
          if (data.action === "saved" || data.action === "already_saved") {
            setIsSaved(true);
            console.log("✅ Item saved to favorites");
          }
        } else {
          console.error("❌ Save failed:", data);
          alert("❌ Failed to save item: " + (data.error || "Unknown error"));
        }
      }
    } catch (error) {
      console.error("❌ Error toggling save:", error);
      alert("❌ Error saving item. Please try again.");
    }
  };

  // REPLACE the current handlePaymentSuccess function with this:
  const handlePaymentSuccess = async (transactionId: string) => {
    console.log("Payment successful! Transaction ID:", transactionId);

    try {
      if (!item) {
        alert("❌ Item data not available");
        return;
      }

      // Mark item as sold
      const response = await fetch(`/api/items/${item._id}/sold`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId: transactionId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("✅ Item marked as sold:", data);
        alert(
          `🎉 Payment Successful!\nTransaction ID: ${transactionId}\nItem has been marked as sold and will be removed from listings.`
        );
        setShowPayment(false);

        // Redirect to browse page after a short delay
        setTimeout(() => {
          window.location.href = "/browse";
        }, 3000);
      } else {
        console.error("❌ Failed to mark item as sold:", data);
        alert(
          `🎉 Payment Successful!\nTransaction ID: ${transactionId}\nBut failed to update item status: ${data.error}\nThe seller will contact you for delivery.`
        );
        setShowPayment(false);
      }
    } catch (error) {
      console.error("❌ Error marking item as sold:", error);
      alert(
        `🎉 Payment Successful!\nTransaction ID: ${transactionId}\nThe seller will contact you for delivery.`
      );
      setShowPayment(false);
    }
  };

  const handlePaymentFailure = (error: string) => {
    console.error("Payment failed:", error);
    alert(
      `❌ Payment Failed: ${error}\nPlease try again or contact the seller directly.`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center min-h-64">
            <p>Loading item...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-8">
          <a
            href="/browse"
            className="text-muted-foreground hover:text-foreground"
          >
            Browse
          </a>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">{item.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Product Images & Details */}
          <div className="space-y-6">
            <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
              {item.images && item.images.length > 0 ? (
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-muted-foreground">No images yet</span>
              )}
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-foreground leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-3">Location</h2>
              <p className="text-foreground">
                📍 {item.city}
                {item.area ? `, ${item.area}` : ""}
              </p>
            </div>
          </div>

          {/* Right Column - Product Info & Actions */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {item.title}
              </h1>
              <p className="text-2xl font-semibold text-green-600 mb-4">
                NPR {item.price}
              </p>

              {/* Add ownership message here */}
              {isOwnItem && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-blue-700 text-sm text-center">
                    🛑 This is your own listing. You cannot purchase your own items.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span>
                  Condition:{" "}
                  <strong className="text-foreground capitalize">
                    {item.condition}
                  </strong>
                </span>
                <span>
                  Category:{" "}
                  <strong className="text-foreground capitalize">
                    {item.category}
                  </strong>
                </span>
              </div>
            </div>

            {/* Payment Section */}
            {showPayment ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">Secure Payment</h2>
                  <button
                    onClick={() => setShowPayment(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ← Back
                  </button>
                </div>
                <PaymentComponent
                  productId={item._id}
                  productName={item.title}
                  amount={item.price}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentFailure={handlePaymentFailure}
                />
              </div>
            ) : (
              /* Action Buttons */
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Purchase Options</h2>

                <div className="space-y-3">
                  {/* Buy Now Button - UPDATED */}
                  <button
                    className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-semibold transition-colors ${
                      isOwnItem
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                    onClick={() => !isOwnItem && setShowPayment(true)}
                    disabled={isOwnItem}
                  >
                    <CreditCard className="h-5 w-5" />
                    {isOwnItem ? 'Your Own Item' : 'Buy Now (Secure Payment)'}
                  </button>

                  {/* Message Seller Button */}
                  <button
                    className="w-full flex items-center justify-center gap-2 border border-green-600 text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-600 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleMessageSeller}
                    disabled={isStartingConversation}
                  >
                    <MessageCircle className="h-4 w-4" />
                    {isStartingConversation
                      ? "Starting Conversation..."
                      : "Message Seller"}
                  </button>

                  {/* Contact via Preferred Method Button */}
                  <button
                    className="w-full flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() =>
                      handleContact(item.contactMethod, item.phone)
                    }
                  >
                    Contact via {item.contactMethod}
                  </button>

                  {/* Save Item Button */}
                  <button
                    className={`w-full flex items-center justify-center gap-2 border px-6 py-3 rounded-lg font-semibold transition-colors ${
                      isSaved
                        ? "border-amber-600 bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "border-border hover:bg-accent"
                    }`}
                    onClick={handleSaveItem}
                  >
                    <Heart
                      className={`h-4 w-4 ${isSaved ? "fill-amber-600" : ""}`}
                    />
                    {isSaved ? "Saved" : "Save Item"}
                  </button>
                </div>

                {/* Quick Contact Info */}
                <div className="bg-gray-50 p-4 rounded-lg mt-4">
                  <p className="text-sm text-gray-600">
                    <strong>Seller Contact:</strong> {item.phone}
                    {item.contactMethod === "whatsapp"
                      ? " (WhatsApp)"
                      : item.contactMethod === "phone"
                      ? " (Phone Call)"
                      : " (Message)"}
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-3">📦 Delivery Information</h3>
              <p className="text-sm text-gray-600 mb-2">
                • Free pickup in {item.city}
                {item.area ? `, ${item.area}` : ""}
                <br />
                • Can arrange delivery (extra charges may apply)
                <br />• Contact seller for shipping options
              </p>

              <h3 className="font-semibold mb-2 mt-4">🔒 Secure Transaction</h3>
              <p className="text-sm text-gray-600">
                • Real eSewa sandbox integration
                <br />
                • No real money will be charged
                <br />• College project purpose only
              </p>
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold mb-2">👤 Seller Information</h3>
              <p className="text-sm text-gray-600">
                <strong>Name:</strong> {item.sellerName}
                <br />
                <strong>Location:</strong> {item.city}
                {item.area ? `, ${item.area}` : ""}
                <br />
                <strong>Contact:</strong> {item.phone} ({item.contactMethod})
              </p>
            </div>
          </div>
        </div>
      </div> {/* ADD RECOMMENDATIONS HERE */}
      <div className="mt-12">
        <RecommendationsSection 
          itemId={itemId}
          title="Similar Items You Might Like"
          type="similar"
          limit={6}
        />
      </div>

    </div>
  );
}