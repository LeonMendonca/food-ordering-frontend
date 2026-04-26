"use client";

import * as React from "react";
import { Star, MapPin, ChevronDown, ChevronUp, Clock, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface Dish {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

interface Menu {
  id: string;
  name: string;
  dishes: Dish[];
}

interface Restaurant {
  id: string;
  name: string;
  address: string;
  rating?: number | null;
  imageUrl?: string | null;
  menus: Menu[];
}

export function RestaurantCard({ restaurant, onSelect }: { restaurant: Restaurant, onSelect?: (id: string) => void }) {
  const [showMenu, setShowMenu] = React.useState(false);

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md h-fit">
      {/* Header Image Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted shrink-0">
        {restaurant.imageUrl ? (
          <img
            src={restaurant.imageUrl}
            alt={restaurant.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/30">
            <span className="text-muted-foreground uppercase font-bold tracking-tighter text-4xl opacity-20">
              {restaurant.name.substring(0, 2)}
            </span>
          </div>
        )}
        
        {/* Rating Badge */}
        {restaurant.rating && (
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/80 px-2 py-1 text-xs font-semibold backdrop-blur-sm shadow-sm border border-white/20">
            <Star className="size-3 fill-yellow-400 text-yellow-400" />
            <span>{restaurant.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Featured Badge (Mock logic) */}
        {restaurant.rating && restaurant.rating > 4.5 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary/90 px-2 py-1 text-[10px] uppercase font-bold text-primary-foreground backdrop-blur-sm shadow-sm border border-primary/20">
            <BadgeCheck className="size-3" />
            <span>Top Rated</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-lg leading-tight tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {restaurant.name}
          </h3>
        </div>
        
        <div className="flex items-start gap-1.5 text-sm text-muted-foreground mb-4">
          <MapPin className="size-3.5 mt-0.5 shrink-0 opacity-70" />
          <p className="line-clamp-2 leading-snug">{restaurant.address}</p>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto flex gap-2 pt-4">
          <button
            onClick={() => onSelect?.(restaurant.id)}
            className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
          >
            Order Now
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={cn(
              "flex items-center justify-center rounded-lg px-3 transition-all",
              showMenu 
                ? "bg-secondary text-secondary-foreground" 
                : "bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border"
            )}
            title={showMenu ? "Close Menu" : "Browse Menu"}
          >
            {showMenu ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>

        {/* Expanded Menu Section */}
        {showMenu && (
          <div className="mt-4 space-y-4 border-t pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
            {restaurant.menus.length > 0 ? (
              restaurant.menus.map((menu) => (
                <div key={menu.id} className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 after:h-px after:flex-1 after:bg-border">
                    {menu.name}
                  </h4>
                  <div className="space-y-1.5">
                    {menu.dishes.map((dish) => (
                      <div key={dish.id} className="flex items-center justify-between group/dish py-0.5">
                        <div className="flex flex-col">
                          <span className={cn(
                            "text-sm font-medium transition-colors",
                            dish.isAvailable ? "text-foreground" : "text-muted-foreground/60 line-through"
                          )}>
                            {dish.name}
                          </span>
                          {!dish.isAvailable && (
                            <span className="text-[10px] text-destructive/80 font-semibold italic">Sold Out</span>
                          )}
                        </div>
                        <span className="text-xs font-mono font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md self-start mt-1">
                          ${dish.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-muted-foreground italic py-4">
                No menus available for this restaurant.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
