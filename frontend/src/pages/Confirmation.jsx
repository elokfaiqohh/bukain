import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchOrder } from "../utils/api";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }

    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => setError("Order not found"));
  }, [orderId, navigate]);

  if (!orderId || error) {
    return (
      <div className="max-w-4xl px-4 py-20 mx-auto text-center">
        <p className="text-lg font-semibold text-grey-900">
          {error || "Missing order ID"}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 mt-6 text-sm font-semibold text-white rounded-full bg-bukain-green hover:bg-bukain-green/90"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-grey-600">Loading order details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-grey-900 dark:text-grey-100">
      <div className="relative flex flex-col w-full min-h-screen overflow-x-hidden">
        <div className="flex flex-col grow">
          {/* Header */}
          <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white border-b border-bukain-green/10 md:px-40 dark:bg-background-dark/50 backdrop-blur-md">
            <div className="flex items-center gap-4 text-bukain-green">
              <div className="flex items-center justify-center rounded-lg size-8 bg-bukain-green/10">
                <span className="font-bold material-symbols-outlined text-bukain-green">
                  restaurant
                </span>
              </div>
              <h2 className="text-bukain-green text-xl font-extrabold tracking-[-0.015em]">
                Bukain
              </h2>
            </div>

            <button className="flex items-center justify-center w-10 h-10 rounded-full bg-bukain-green/10 text-bukain-green hover:bg-bukain-green/20">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </header>

          <main className="flex justify-center flex-1 px-4 py-8 md:px-0">
            <div className="flex flex-col max-w-[560px] flex-1">
              {/* Success Section */}
              <div className="flex flex-col items-center pt-8 pb-6">
                <div className="flex items-center justify-center mb-6 rounded-full shadow-xl size-24 bg-bukain-green shadow-bukain-green/20">
                  <span className="text-5xl text-white material-symbols-outlined">
                    check_circle
                  </span>
                </div>

                <h1 className="text-[32px] font-bold text-center">
                  Order Successful!
                </h1>

                <p className="pt-2 font-medium text-center text-bukain-green">
                  Your meal is being prepared for Iftar
                </p>
              </div>

              {/* Order Code */}
              <div className="p-4">
                <div className="relative overflow-hidden shadow-lg bg-bukain-green rounded-xl">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  <div className="relative z-10 flex flex-col items-center p-6 border-b border-white/10">
                    <p className="mb-1 text-sm tracking-widest uppercase text-white/80">
                      Order Code
                    </p>

                    <p className="text-5xl font-extrabold tracking-tighter text-white">
                      {order.code}
                    </p>
                  </div>

                  <div className="relative z-10 flex items-center justify-center gap-2 p-4 bg-bukain-green/50 backdrop-blur-sm">
                    <span className="text-sm material-symbols-outlined text-white/80">
                      info
                    </span>

                    <p className="text-sm font-medium text-white/90">
                      Show this code during pickup
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="px-4 py-2">
                <div className="p-6 bg-white border shadow-sm dark:bg-grey-800/50 rounded-xl border-bukain-green/5">
                  <h3 className="mb-4 text-lg font-bold">Order Details</h3>

                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex items-center justify-center rounded-lg size-10 bg-background-light dark:bg-grey-700">
                        <span className="material-symbols-outlined text-bukain-green">
                          lunch_dining
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-grey-500">
                          Package
                        </p>
                        <p className="font-bold">{order.package_name}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center justify-center rounded-lg size-10 bg-background-light dark:bg-grey-700">
                        <span className="material-symbols-outlined text-bukain-green">
                          storefront
                        </span>
                      </div>

                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-grey-500">
                          Restaurant
                        </p>
                        <p className="font-bold">{order.restaurantName || order.restaurant_name}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex items-center justify-center rounded-lg size-10 bg-background-light dark:bg-grey-700">
                        <span className="material-symbols-outlined text-bukain-green">
                          schedule
                        </span>
                      </div>

                      {/* <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-grey-500">
                          Pickup Time
                        </p>
                        <p className="font-bold">{order.pickup_time}</p>
                      </div> */}
                      <div>
                        <p className="text-xs font-semibold tracking-wider uppercase text-grey-500">
                          Pickup Time
                        </p>
                        <p className="font-bold">
                          {order.pickupTime || order.pickup_time}
                        </p>

                        <p className="mt-1 text-sm text-grey-500">
                          Estimated preparation: 15–20 minutes
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-bukain-green/5">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-bukain-green/5">
                      <span className="material-symbols-outlined text-bukain-green">
                        campaign
                      </span>

                      <p className="text-sm font-medium text-bukain-green">
                        Please show this order code when picking up your meal.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Preview */}
              <div className="p-4">
                <div className="relative w-full h-32 overflow-hidden rounded-xl group">
                  <div
                    className="absolute inset-0 bg-center bg-cover bg-grey-200 dark:bg-grey-700"
                    style={{
                      backgroundImage:
                        "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBUqn-XiJ7SVQNI61gAPiJirfn52LMwXMZbZQnrwEGkAIbxKolILdJbdhzZAoxmm-YHpJX8pSc0VwJ8V3mczV6_f12YF8-fGckuSWrZd9hdPkDkuBqsl3WD-6JbmiogGq19DzP-XeoLuGjyTSjtu7UPq2biKBWQ-HmN63CBf_4zz4_qO5fmhdYhhDCNf_AvgETnGPY5NQPXQyok267u15vXNFH2_whLV2QQPdEb7lwY0C00a64EveWq3FEnvjvEDPDRyQ3v7I3tf5s')",
                    }}
                  />

                  <div className="absolute inset-0 transition-colors bg-bukain-green/10 group-hover:bg-transparent"></div>

                  <div className="absolute bottom-3 left-3 bg-white dark:bg-grey-800 px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                    <span className="text-sm material-symbols-outlined text-bukain-green">
                      location_on
                    </span>

                    <span className="text-xs font-bold uppercase">
                      View Map
                    </span>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-3 px-4 pt-6 pb-12">
                <button
                  onClick={() => navigate("/")}
                  className="w-full bg-bukain-green text-white font-bold py-4 rounded-xl shadow-lg shadow-bukain-green/20 hover:bg-bukain-green/90 active:scale-[0.98]"
                >
                  Back to Home
                </button>

                <button
                  onClick={() => navigate("/user")}
                  className="w-full py-3 font-bold text-bukain-green rounded-xl hover:bg-bukain-green/5"
                >
                  View My Orders
                </button>
              </div>
            </div>
          </main>

        </div>
      </div>
    </div>
  );
}
