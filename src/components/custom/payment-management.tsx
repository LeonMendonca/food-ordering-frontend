"use client";

import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apollo-client";
import { Loader2, CreditCard, ShoppingCart, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const GET_PENDING_DATA = gql`
  query GetPendingData {
    orders {
      id
      status
      totalPrice
      createdAt
      items {
        dish {
          name
        }
        quantity
        price
      }
    }
  }
`;

const GET_PAYMENT_METHODS = gql`
  query GetPaymentMethods {
    paymentMethods {
      id
      type
      provider
      last4
      expiryMonth
      expiryYear
    }
  }
`;

const CHECKOUT = gql`
  mutation Checkout($orderId: ID!, $paymentMethodId: ID!) {
    checkout(orderId: $orderId, paymentMethodId: $paymentMethodId) {
      id
      status
      amount
    }
  }
`;

const ADD_PAYMENT_METHOD = gql`
  mutation AddPaymentMethod($userId: ID!, $input: AddPaymentMethodInput!) {
    addPaymentMethod(userId: $userId, input: $input) {
      id
      type
      provider
      last4
    }
  }
`;

const UPDATE_PAYMENT_METHOD = gql`
  mutation UpdatePaymentMethod($id: ID!, $input: AddPaymentMethodInput!) {
    updatePaymentMethod(id: $id, input: $input) {
      id
      type
      provider
      last4
    }
  }
`;

export function PaymentManagement({ userId }: { userId: string }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [methods, setMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");

  // Add/Edit Method Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "CARD",
    provider: "",
    cardNumber: "",
    expiryMonth: 12,
    expiryYear: 2025
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ordersRes, methodsRes] = await Promise.all([
        client.query({ query: GET_PENDING_DATA, fetchPolicy: "network-only" }),
        client.query({ query: GET_PAYMENT_METHODS, fetchPolicy: "network-only" })
      ]) as any[];

      setOrders(ordersRes.data.orders.filter((o: any) => o.status === "PENDING"));
      const fetchedMethods = methodsRes.data.paymentMethods || [];
      setMethods(fetchedMethods);
      
      if (fetchedMethods.length > 0 && !selectedMethodId) {
        setSelectedMethodId(fetchedMethods[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchData();
  }, [userId]);

  const handleCheckout = async (orderId: string) => {
    if (!selectedMethodId) {
      alert("Please select a payment method first.");
      return;
    }

    setProcessingId(orderId);
    try {
      await client.mutate({
        mutation: CHECKOUT,
        variables: {
          orderId,
          paymentMethodId: selectedMethodId
        }
      });
      alert("Payment successful!");
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleEdit = (method: any) => {
    setEditingId(method.id);
    setFormData({
      type: method.type,
      provider: method.provider,
      cardNumber: "", // Full number usually not returned for security
      expiryMonth: method.expiryMonth || 12,
      expiryYear: method.expiryYear || 2025
    });
    setShowAddForm(true);
  };

  const handleSubmitMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      if (editingId) {
        await client.mutate({
          mutation: UPDATE_PAYMENT_METHOD,
          variables: {
            id: editingId,
            input: {
              ...formData,
              expiryMonth: parseInt(formData.expiryMonth.toString()),
              expiryYear: parseInt(formData.expiryYear.toString())
            }
          }
        });
        alert("Payment method updated!");
      } else {
        await client.mutate({
          mutation: ADD_PAYMENT_METHOD,
          variables: {
            userId,
            input: {
              ...formData,
              expiryMonth: parseInt(formData.expiryMonth.toString()),
              expiryYear: parseInt(formData.expiryYear.toString())
            }
          }
        });
        alert("Payment method added!");
      }
      
      setShowAddForm(false);
      setEditingId(null);
      setFormData({ type: "CARD", provider: "", cardNumber: "", expiryMonth: 12, expiryYear: 2025 });
      fetchData();
    } catch (err) {
      console.error(err);
      alert(editingId ? "Failed to update payment method." : "Failed to add payment method.");
    } finally {
      setAddLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center p-12 gap-3">
      <Loader2 className="size-6 animate-spin text-primary" />
      <span className="text-muted-foreground">Checking pending orders...</span>
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Payment Dashboard</h2>
        <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-yellow-500/20">
          <AlertCircle className="size-3.5" />
          {orders.length} Pending Actions
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2 space-y-4">
          {orders.length > 0 ? (
            orders.map(order => (
              <div key={order.id} className="bg-card border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/5 rounded-lg">
                        <ShoppingCart className="size-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order ID</p>
                        <p className="font-mono text-sm font-bold">#{order.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount Due</p>
                      <p className="text-xl font-black text-primary">${order.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-8">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm items-center py-1 border-b border-dashed last:border-0 border-border/50">
                        <span className="text-muted-foreground font-medium">
                          {item.quantity}x <span className="text-foreground">{item.dish.name}</span>
                        </span>
                        <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    disabled={processingId === order.id || !selectedMethodId}
                    onClick={() => handleCheckout(order.id)}
                    className="w-full flex items-center justify-center gap-2 bg-primary py-3 rounded-xl text-primary-foreground font-bold uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
                  >
                    {processingId === order.id ? <Loader2 className="size-5 animate-spin" /> : "Pay Now"}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl opacity-60">
              <CheckCircle2 className="size-12 text-primary mb-4" />
              <h3 className="text-xl font-bold">All caught up!</h3>
              <p className="text-muted-foreground">No pending payments found.</p>
            </div>
          )}
        </div>

        {/* Payment Methods Selection */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 bg-secondary/30 border rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                <h3 className="font-bold text-lg">{editingId ? "Edit Method" : "Methods"}</h3>
              </div>
              {!showAddForm && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ type: "CARD", provider: "", cardNumber: "", expiryMonth: 12, expiryYear: 2025 });
                    setShowAddForm(true);
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline bg-primary/10 px-2 py-1 rounded"
                >
                  Add +
                </button>
              )}
            </div>

            {showAddForm ? (
              <form onSubmit={handleSubmitMethod} className="space-y-4 animate-in zoom-in-95 duration-200">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Type</label>
                  <select
                    className="w-full bg-background border rounded-lg p-2 text-sm outline-none focus:border-primary"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="CARD">Card</option>
                    <option value="UPI">UPI</option>
                    <option value="WALLET">Wallet</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Provider (Visa/GPay)</label>
                  <input
                    required
                    className="w-full bg-background border rounded-lg p-2 text-sm outline-none focus:border-primary"
                    value={formData.provider}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">
                    {editingId ? "Card Number (Optional)" : "Account / Card Number"}
                  </label>
                  <input
                    required={!editingId}
                    placeholder={editingId ? "Leave blank to keep current" : ""}
                    className="w-full bg-background border rounded-lg p-2 text-sm outline-none focus:border-primary font-mono"
                    value={formData.cardNumber}
                    onChange={e => setFormData({ ...formData, cardNumber: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Month</label>
                    <input
                      type="number" min="1" max="12"
                      className="w-full bg-background border rounded-lg p-2 text-sm outline-none focus:border-primary"
                      value={formData.expiryMonth}
                      onChange={e => setFormData({ ...formData, expiryMonth: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground">Year</label>
                    <input
                      type="number" min="2024" max="2050"
                      className="w-full bg-background border rounded-lg p-2 text-sm outline-none focus:border-primary"
                      value={formData.expiryYear}
                      onChange={e => setFormData({ ...formData, expiryYear: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingId(null);
                    }}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border hover:bg-background"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50"
                  >
                    {addLoading ? <Loader2 className="size-4 animate-spin mx-auto" /> : "Save"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                {methods.length > 0 ? (
                  methods.map(method => (
                    <div
                      key={method.id}
                      onClick={() => setSelectedMethodId(method.id)}
                      className={cn(
                        "w-full flex flex-col p-4 rounded-2xl border transition-all text-left cursor-pointer relative group/item",
                        selectedMethodId === method.id
                          ? "bg-card border-primary shadow-lg ring-2 ring-primary/20"
                          : "bg-background/50 border-transparent hover:bg-card hover:border-border"
                      )}
                    >
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(method);
                        }}
                        className="absolute top-2 right-2 p-1 opacity-0 group-hover/item:opacity-100 hover:bg-primary/10 rounded-md transition-all text-primary z-10"
                        title="Edit Method"
                      >
                        <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                        </svg>
                      </button>

                      <div className="flex justify-between items-center mb-2 pr-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">
                          {method.type}
                        </span>
                        {selectedMethodId === method.id && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                      </div>
                      <p className="font-bold tracking-tight">{method.provider}</p>
                      <p className="text-sm font-mono text-muted-foreground">•••• •••• •••• {method.last4 || "0000"}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground italic">No payment methods found.</p>
                    <p
                      onClick={() => {
                        setEditingId(null);
                        setShowAddForm(true);
                      }}
                      className="text-[10px] text-primary font-bold mt-2 uppercase cursor-pointer hover:underline"
                    >
                      Add New Method +
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
