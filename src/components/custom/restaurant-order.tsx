"use client";

import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apollo-client";
import { Loader2, Plus, Minus, ShoppingBag, X, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const GET_RESTAURANT = gql`
  query GetRestaurant($id: ID!) {
    restaurant(id: $id) {
      id
      name
      address
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

const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      totalPrice
      status
    }
  }
`;

interface CartItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
}

export function RestaurantOrder({ restaurantId, onBack, customerId, country }: { 
  restaurantId: string; 
  onBack: () => void;
  customerId: string;
  country: string;
}) {
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const { data } = await client.query({
          query: GET_RESTAURANT,
          variables: { id: restaurantId }
        }) as any;
        setRestaurant(data.restaurant);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [restaurantId]);

  const updateCart = (dish: any, delta: number) => {
    setCart(prev => {
      const current = prev[dish.id] || { dishId: dish.id, name: dish.name, price: dish.price, quantity: 0 };
      const newQty = Math.max(0, current.quantity + delta);
      
      if (newQty === 0) {
        const { [dish.id]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [dish.id]: { ...current, quantity: newQty }
      };
    });
  };

  const totalPrice = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handlePlaceOrder = async () => {
    if (Object.keys(cart).length === 0) return;
    
    setOrderLoading(true);
    try {
      const items = Object.values(cart).map(item => ({
        dishId: item.dishId,
        quantity: item.quantity,
        price: item.price
      }));

      await client.mutate({
        mutation: CREATE_ORDER,
        variables: {
          input: {
            customerId,
            items,
            totalPrice,
            deliveryAddress: "Selected User's Default Address", // Placeholder or from context
            country: country.toUpperCase() as any
          }
        }
      });
      alert("Order placed successfully!");
      setCart({});
      onBack();
    } catch (err) {
      console.error(err);
      alert("Failed to place order.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="size-10 animate-spin text-primary" />
      <p className="text-muted-foreground">Preparing your menu...</p>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={onBack}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="size-6" />
        </button>
        <div>
          <h2 className="text-3xl font-black tracking-tight">{restaurant.name}</h2>
          <p className="text-muted-foreground">{restaurant.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {restaurant.menus.map((menu: any) => (
            <section key={menu.id} className="space-y-4">
              <h3 className="text-lg font-bold uppercase tracking-widest text-primary/60 flex items-center gap-3 after:h-px after:flex-1 after:bg-border">
                {menu.name}
              </h3>
              <div className="grid gap-3">
                {menu.dishes.map((dish: any) => (
                  <div key={dish.id} className="flex items-center justify-between p-4 rounded-xl border bg-card/50 hover:bg-card transition-colors group">
                    <div>
                      <h4 className="font-semibold">{dish.name}</h4>
                      <p className="text-sm font-bold text-primary">${dish.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {cart[dish.id] ? (
                        <div className="flex items-center gap-3 bg-secondary rounded-lg p-1">
                          <button onClick={() => updateCart(dish, -1)} className="p-1 hover:bg-background rounded-md transition-colors"><Minus className="size-4" /></button>
                          <span className="font-bold min-w-[1.5rem] text-center">{cart[dish.id].quantity}</span>
                          <button onClick={() => updateCart(dish, 1)} className="p-1 hover:bg-background rounded-md transition-colors"><Plus className="size-4" /></button>
                        </div>
                      ) : (
                        <button 
                          disabled={!dish.isAvailable}
                          onClick={() => updateCart(dish, 1)}
                          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                        >
                          {dish.isAvailable ? <><Plus className="size-4" /> Add</> : "Sold Out"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-8 rounded-2xl border bg-card p-6 shadow-xl border-primary/10">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <ShoppingBag className="size-5 text-primary" />
              <h3 className="font-bold text-lg">Your Order</h3>
            </div>
            
            <div className="space-y-4 mb-8 max-h-[40vh] overflow-auto pr-2 custom-scrollbar">
              {Object.values(cart).length > 0 ? (
                Object.values(cart).map(item => (
                  <div key={item.dishId} className="flex justify-between items-start text-sm">
                    <div className="flex-1">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                    </div>
                    <p className="font-black">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground italic py-8 text-sm">Your bag is empty.</p>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-primary">${totalPrice.toFixed(2)}</span>
              </div>
              <button
                disabled={Object.keys(cart).length === 0 || orderLoading}
                onClick={handlePlaceOrder}
                className="w-full flex items-center justify-center gap-2 bg-primary py-4 rounded-xl text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
              >
                {orderLoading ? <Loader2 className="size-5 animate-spin" /> : "Complete Order"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
