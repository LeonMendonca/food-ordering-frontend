"use client";

import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import client from "@/lib/apollo-client";
import { Loader2, History, Receipt, ArrowUpRight, Calendar, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const GET_PAYMENT_HISTORY = gql`
  query GetPaymentHistory {
    payments {
      id
      amount
      status
      createdAt
      method {
        type
        provider
        last4
      }
      order {
        id
        status
        items {
          dish {
            name
          }
          quantity
          price
        }
      }
    }
  }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!) {
    cancelOrder(orderId: $orderId) {
      id
      status
    }
  }
`;

export function PaymentHistory({ userId }: { userId: string }) {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data } = await client.query({
        query: GET_PAYMENT_HISTORY,
        fetchPolicy: "network-only"
      }) as any;
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Error fetching payment history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    
    setCancellingId(orderId);
    try {
      await client.mutate({
        mutation: CANCEL_ORDER,
        variables: { orderId }
      });
      alert("Order cancelled successfully!");
      fetchHistory();
    } catch (err) {
      console.error("Error cancelling order:", err);
      alert("Failed to cancel order.");
    } finally {
      setCancellingId(null);
    }
  };

  useEffect(() => {
    if (userId) fetchHistory();
  }, [userId]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-muted-foreground animate-pulse">Retrieving transaction logs...</p>
    </div>
  );

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Transaction History</h2>
        <div className="flex items-center gap-1.5 bg-primary/5 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/10">
          <History className="size-3.5" />
          {payments.length} Records
        </div>
      </div>

      <div className="grid gap-4">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div key={payment.id} className="group bg-card border rounded-2xl p-6 transition-all hover:shadow-md hover:border-primary/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                {/* ID & Date */}
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-secondary rounded-xl group-hover:bg-primary/10 transition-colors">
                    <Receipt className="size-6 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-muted-foreground">TXN-{payment.id.substring(0, 8).toUpperCase()}</span>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest",
                        payment.status === "SUCCESS" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                      )}>
                        {payment.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {new Date(parseInt(payment.createdAt)).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                {/* Order Summary & Status */}
                <div className="flex-1 max-w-md hidden lg:block">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Status</p>
                    <span className={cn(
                      "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                      payment.order.status === "CANCELLED" ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"
                    )}>
                      {payment.order.status}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-1 text-muted-foreground italic">
                    {payment.order.items.map((i: any) => `${i.quantity}x ${i.dish.name}`).join(", ")}
                  </p>
                </div>

                {/* Method & Amount */}
                <div className="flex items-center gap-8 text-right">
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Method</p>
                    <div className="flex items-center justify-end gap-2 text-sm font-bold">
                      <CreditCard className="size-3.5 text-primary/60" />
                      {payment.method.provider} (•••• {payment.method.last4})
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Total Paid</p>
                    <p className="text-2xl font-black tracking-tight text-primary">
                      ${payment.amount.toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Cancel Button */}
                  <div className="min-w-[120px] text-right">
                    {payment.order.status !== "CANCELLED" && (
                      <button 
                        disabled={cancellingId === payment.order.id}
                        onClick={() => handleCancelOrder(payment.order.id)} 
                        className="px-4 py-2 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-destructive hover:text-white transition-all disabled:opacity-50"
                      >
                        {cancellingId === payment.order.id ? <Loader2 className="size-3 animate-spin" /> : "Cancel Order"}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center p-20 text-center border-2 border-dashed rounded-3xl opacity-60">
            <History className="size-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-bold">No transactions yet</h3>
            <p className="text-muted-foreground">When you make payments, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
