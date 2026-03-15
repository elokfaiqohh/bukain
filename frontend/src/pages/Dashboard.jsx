import { useCallback, useEffect, useState } from 'react';
import { fetchOrdersByRestaurant, updateOrderStatus } from '../utils/api';
import useAuth from '../hooks/useAuth';
import ActionMenu from '../components/ActionMenu';
import Loader from '../components/Loader';

const statusStyles = {
  pending: 'bg-slate-100 text-slate-700 border-slate-300',
  paid: 'bg-blue-100 text-blue-800 border-blue-300',
  preparing: 'bg-amber-100 text-amber-800 border-amber-300',
  ready: 'bg-purple-100 text-purple-800 border-purple-300',
  completed: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  cancelled: 'bg-rose-100 text-rose-800 border-rose-300'
};

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const STATUS_OPTIONS = [
    { value: 'preparing', label: 'Mark as Preparing' },
    { value: 'ready', label: 'Mark as Ready' },
    { value: 'completed', label: 'Mark as Completed' },
    { value: 'cancelled', label: 'Cancel Order' }
  ];

  const loadOrders = useCallback(() => {
    if (!user?.restaurantId) {
      setError('No restaurant assigned to this user.');
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchOrdersByRestaurant(user.restaurantId)
      .then((orders) => {
        console.log('Restaurant orders:', { restaurantId: user.restaurantId, count: orders.length });
        setOrders(orders);
      })
      .catch(() => setError('Unable to load orders'))
      .finally(() => setLoading(false));
  }, [user]);

  const closeMenu = () => {
    setOpenMenuId(null);
    setAnchorEl(null);
  };

  const activeOrder = orders.find((o) => o.id === openMenuId);

  useEffect(() => {
    if (!user) return;

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    return () => clearInterval(interval);
  }, [user, loadOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setToast('');
    setUpdatingId(orderId);

    try {
      const response = await updateOrderStatus(orderId, newStatus);
      const updatedOrder = response?.order ?? response;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
      setOpenMenuId(null);
      setAnchorEl(null);
    } catch (updateError) {
      setToast('Failed to update order status. Please try again.');
      console.error('status update error', updateError);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bukain Dashboard</h1>
          <p className="mt-2 text-sm text-slate-600">A simple view of incoming orders for restaurant partners.</p>
          {toast ? (
            <p className="mt-3 text-sm text-rose-600">{toast}</p>
          ) : null}
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Incoming Orders</h2>
        </div>

        {loading ? (
          <Loader label="Fetching orders..." />
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error}</p>
        ) : (
          <div className="mt-6 overflow-x-auto overflow-y-visible">
            <table className="w-full min-w-[680px] table-auto border-collapse">
              <thead>
                <tr className="text-left text-sm font-semibold text-slate-600">
                  <th className="pb-4 pr-6">Order Code</th>
                  <th className="pb-4 pr-6">Customer</th>
                  <th className="pb-4 pr-6">Package</th>
                  <th className="pb-4 pr-6">Pickup</th>
                  <th className="pb-4 pr-6">Status</th>
                  <th className="pb-4 pr-6">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="py-4 pr-6 text-sm font-medium text-bukain-green">{order.code}</td>
                    <td className="py-4 pr-6 text-sm text-slate-700">{order.customerName}</td>
                    <td className="py-4 pr-6 text-sm text-slate-700">{order.packageName}</td>
                    <td className="py-4 pr-6 text-sm text-slate-700">{order.pickupTime}</td>
                    <td className="py-4 pr-6">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                            statusStyles[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
                          } border`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-6">
                      <button
                        type="button"
                        onClick={(event) => {
                          const isOpen = openMenuId === order.id;
                          setOpenMenuId(isOpen ? null : order.id);
                          setAnchorEl(isOpen ? null : event.currentTarget);
                        }}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Actions
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <ActionMenu
              isOpen={!!activeOrder}
              anchorEl={anchorEl}
              options={STATUS_OPTIONS}
              onSelect={(value) => {
                if (!activeOrder) return;
                handleStatusUpdate(activeOrder.id, value);
              }}
              onClose={closeMenu}
              isDisabled={(value) =>
                !activeOrder ||
                updatingId === activeOrder.id ||
                activeOrder.status === value
              }
            />
          </div>
        )}
      </section>
    </main>
  );
}
