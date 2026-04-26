"use client";

import { useState, useEffect } from "react";
import { SelectDemo } from "@/components/custom/select-demo";
import { SelectRole } from "@/components/custom/select-role";
import { SelectUser } from "@/components/custom/select-user";
import { RestaurantList } from "@/components/custom/restaurant-list";
import { RestaurantOrder } from "@/components/custom/restaurant-order";
import { PaymentManagement } from "@/components/custom/payment-management";
import { PaymentHistory } from "@/components/custom/payment-history";
import { gql } from "@apollo/client";
import client, { setUserId } from "@/lib/apollo-client";
import { cn } from "@/lib/utils";

const GET_USERS = gql`
  query GetUsers($country: Country, $role: Role) {
    users(country: $country, role: $role) {
      id
      firstName
      lastName
      email
    }
  }
`;

export function HomeClient({ distinctCountries, distinctRoles }: { distinctCountries: string[], distinctRoles: string[] }) {
  const [country, setCountry] = useState<string>(distinctCountries[0] || "");
  const [role, setRole] = useState<string>(distinctRoles[0] || "");
  const [user, setUser] = useState<string>("");
  const [selectedRestId, setSelectedRestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"restaurants" | "payments" | "history">("restaurants");

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Sync user ID to Apollo Client headers
  useEffect(() => {
    setUserId(user || null);
  }, [user]);

  useEffect(() => {
    if (!country || !role) {
      setUsers([]);
      return;
    }

    let isMounted = true;
    setLoading(true);

    const fetchUsers = async () => {
      try {
        const { data } = await client.query({
          query: GET_USERS,
          variables: {
            country: country || undefined,
            role: role || undefined
          },
          fetchPolicy: "network-only"
        }) as any;
        if (isMounted) {
          setUsers(data.users || []);
          setUser(""); // reset user selection when list changes
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [country, role]);

  if (selectedRestId) {
    return (
      <div className="w-full">
        <RestaurantOrder
          restaurantId={selectedRestId}
          onBack={() => setSelectedRestId(null)}
          customerId={user}
          country={country}
        />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-12">
      {/* Top Filter & Selection Bar */}
      <div className="w-full flex flex-col items-center gap-8 bg-card border rounded-3xl p-10 shadow-sm">
        <div className="flex gap-4 flex-wrap justify-center">
          <SelectDemo countries={distinctCountries} value={country} onChange={setCountry} />
          <SelectRole roles={distinctRoles} value={role} onChange={setRole} />
        </div>

        {loading && <p className="text-sm text-muted-foreground animate-pulse">Loading users...</p>}

        {!loading && users.length > 0 && (
          <SelectUser users={users} value={user} onChange={setUser} />
        )}

        {!loading && users.length === 0 && country && role && (
          <p className="text-sm text-muted-foreground">No users found for this selection.</p>
        )}
      </div>

      {user && (
        <div className="w-full space-y-12 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Tab Switcher */}
          <div className="flex items-center justify-center gap-1 bg-secondary/50 p-1 rounded-2xl w-fit mx-auto border shadow-inner">
            <button
              onClick={() => setActiveTab("restaurants")}
              className={cn(
                "px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                activeTab === "restaurants" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Explore
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={cn(
                "px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                activeTab === "payments" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Payments
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={cn(
                "px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                activeTab === "history" ? "bg-background shadow-md text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              History
            </button>
          </div>

          <div className="w-full mt-4">
            {activeTab === "restaurants" && (
              <RestaurantList userId={user} onSelect={setSelectedRestId} />
            )}
            {activeTab === "payments" && (
              <PaymentManagement userId={user} />
            )}
            {activeTab === "history" && (
              <PaymentHistory userId={user} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
