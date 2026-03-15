import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchOrdersByCustomer } from '../utils/api';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

const statusOrder = ['pending', 'preparing', 'ready', 'completed'];

const statusStyles = {
  pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700' },
  paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800' },
  preparing: { label: 'Preparing', color: 'bg-amber-100 text-amber-800' },
  ready: { label: 'Ready', color: 'bg-purple-100 text-purple-800' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Cancelled', color: 'bg-rose-100 text-rose-800' }
};

function OrderProgress({ status }) {
  const currentIndex = statusOrder.indexOf(status);

  return (
    <div className="flex items-center gap-2">
      {statusOrder.map((step, index) => {
        const isActive = index <= currentIndex;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                isActive ? 'bg-bukain-green text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {index + 1}
            </div>
            <span className={`text-xs font-semibold ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>
              {step}
            </span>
            {index < statusOrder.length - 1 ? <span className="h-px w-8 bg-slate-200" /> : null}
          </div>
        );
      })}
    </div>
  );
}

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('tracking');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    if (!user) {
      setError('Please log in to view your orders.');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchOrdersByCustomer(user.id);
      console.log('User orders fetched:', { customerId: user.id, count: data.length });
      setOrders(data);
    } catch {
      setError('Unable to load your orders.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user, loadOrders]);

  const activeOrders = useMemo(
    () => orders.filter((order) => order.status !== 'completed' && order.status !== 'cancelled'),
    [orders]
  );

  const pastOrders = useMemo(
    () => orders.filter((order) => order.status === 'completed' || order.status === 'cancelled'),
    [orders]
  );

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Orders</h1>
          <p className="mt-2 text-sm text-slate-600">Track your order progress and view history.</p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('tracking')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'tracking' ? 'bg-bukain-green text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Order Tracking
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'history' ? 'bg-bukain-green text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Order History
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'profile' ? 'bg-bukain-green text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              Profile
            </button>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <Loader label="Loading orders..." />
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <>
              {activeTab === 'tracking' && (
                <div className="space-y-6">
                  {activeOrders.length === 0 ? (
                    <p className="text-sm text-slate-600">No active orders yet.</p>
                  ) : (
                    activeOrders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-start">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{order.packageName}</p>
                            <p className="text-sm text-slate-500">{order.restaurantName}</p>
                            <p className="text-sm text-slate-500">Pickup: {order.pickupTime}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-700">Order Code: {order.code}</p>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                              statusStyles[order.status]?.color ?? 'bg-slate-100 text-slate-600'
                            }`}
                            >
                              {statusStyles[order.status]?.label ?? order.status}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <OrderProgress status={order.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-6">
                  {pastOrders.length === 0 ? (
                    <p className="text-sm text-slate-600">No past orders yet.</p>
                  ) : (
                    pastOrders.map((order) => (
                      <div key={order.id} className="rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="flex flex-col gap-2 md:flex-row md:justify-between md:items-start">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{order.packageName}</p>
                            <p className="text-sm text-slate-500">{order.restaurantName}</p>
                            <p className="text-sm text-slate-500">Pickup: {order.pickupTime}</p>
                            <p className="mt-2 text-sm font-semibold text-slate-700">Order Code: {order.code}</p>
                          </div>
                          <div className="mt-4 md:mt-0 text-right">
                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                              statusStyles[order.status]?.color ?? 'bg-slate-100 text-slate-600'
                            }`}
                            >
                              {statusStyles[order.status]?.label ?? order.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600">Profile editing is not supported in this demo.</p>
                  <p className="text-sm text-slate-600">Your orders are linked to the account you used to sign in.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
