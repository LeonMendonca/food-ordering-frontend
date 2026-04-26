"use client";

import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apollo-client";
import { RestaurantCard } from "./restaurant-card";
import { Loader2, UtensilsCrossed } from "lucide-react";

const GET_RESTAURANTS = gql`
  query GetRestaurants {
    restaurants {
      id
      name
      address
      rating
      imageUrl
      menus {
        id
        name
        dishes {
          id
          name
          price
          isAvailable
        }
      }
    }
  }
`;

export function RestaurantList({ userId, onSelect }: { userId?: string, onSelect?: (id: string) => void }) {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const { data } = await client.query({
          query: GET_RESTAURANTS,
          fetchPolicy: "network-only",
        }) as any;

        if (isMounted) {
          setRestaurants(data.restaurants || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error("Error fetching restaurants:", err);
          setError("Failed to load restaurants. Please check your connection.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRestaurants();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Finding the best spots for you...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl bg-destructive/5">
        <p className="text-destructive font-medium mb-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm font-semibold underline underline-offset-4 hover:text-primary transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (restaurants.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-2xl">
        <UtensilsCrossed className="size-12 text-muted-foreground/30 mb-4" />
        <h3 className="text-xl font-semibold mb-1">No restaurants found</h3>
        <p className="text-muted-foreground">We couldn't find any restaurants at the moment.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Featured Restaurants</h2>
        <span className="text-sm font-medium text-muted-foreground">
          {restaurants.length} places available
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard 
            key={restaurant.id} 
            restaurant={restaurant} 
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
