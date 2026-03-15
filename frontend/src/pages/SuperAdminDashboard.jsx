import { useEffect, useState } from 'react';
import { fetchAllOrders, fetchRestaurants, fetchUsers } from '../utils/api';
import Loader from '../components/Loader';

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, restaurantsRes, ordersRes] = await Promise.all([
        fetchUsers(),
        fetchRestaurants(),
        fetchAllOrders()
      ]);
      console.log('Super admin orders fetched:', { count: ordersRes.length });
      setUsers(usersRes);
      setRestaurants(restaurantsRes);
      setOrders(ordersRes);
    } catch {
      setError('Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20">
      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Platform Admin</h1>
          <p className="mt-2 text-sm text-slate-600">Monitor restaurants, users and orders across the platform.</p>
        </div>
      </div>

      <section className="mt-8 rounded-3xl bg-white p-8 shadow-sm">
        {loading ? (
          <Loader label="Loading dashboard..." />
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <div className="space-y-10">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Users</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto border-collapse">
                  <thead>
                    <tr className="text-left text-sm font-semibold text-slate-600">
                      <th className="pb-3 pr-6">Name</th>
                      <th className="pb-3 pr-6">Email</th>
                      <th className="pb-3 pr-6">Role</th>
                      <th className="pb-3 pr-6">Restaurant</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-4 pr-6 text-sm font-medium text-slate-900">{user.name}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{user.email}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{user.role}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{user.restaurantId ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">Restaurants</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto border-collapse">
                  <thead>
                    <tr className="text-left text-sm font-semibold text-slate-600">
                      <th className="pb-3 pr-6">Name</th>
                      <th className="pb-3 pr-6">Location</th>
                      <th className="pb-3 pr-6">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restaurants.map((restaurant) => (
                      <tr key={restaurant.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-4 pr-6 text-sm font-medium text-slate-900">{restaurant.name}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{restaurant.location}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{restaurant.active ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">Orders</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[640px] table-auto border-collapse">
                  <thead>
                    <tr className="text-left text-sm font-semibold text-slate-600">
                      <th className="pb-3 pr-6">Code</th>
                      <th className="pb-3 pr-6">Customer</th>
                      <th className="pb-3 pr-6">Restaurant</th>
                      <th className="pb-3 pr-6">Pickup</th>
                      <th className="pb-3 pr-6">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-4 pr-6 text-sm font-medium text-slate-900">{order.code}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{order.customerName}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{order.restaurantName}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{order.pickupTime}</td>
                        <td className="py-4 pr-6 text-sm text-slate-700">{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
