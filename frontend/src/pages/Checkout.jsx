import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createOrder, markOrderPaid } from '../utils/api';
import { usePackages } from '../contexts/PackagesContext';
import useAuth from '../hooks/useAuth';
import Loader from '../components/Loader';

export default function Checkout() {
  const { selectedPackage, clear } = usePackages();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const [customerName, setCustomerName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState('');
  const [pickupTime, setPickupTime] = useState('17:45');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!selectedPackage && !isSubmitted) {
      navigate('/');
    }
  }, [selectedPackage, isSubmitted, navigate]);

  if (!selectedPackage) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!user) {
      navigate('/login', { state: { from: location } });
      return;
    }

    setLoading(true);
    setIsSubmitted(true);

    try {
      const data = await createOrder({
        customer_id: user.id,
        customer_name: customerName,
        phone,
        restaurant_id: selectedPackage.restaurantId,
        restaurant_name: selectedPackage.restaurantName,
        package_name: selectedPackage.name,
        items: selectedPackage.items,
        pickup_time: pickupTime,
        total_price: selectedPackage.totalPrice,
        notes
      });

      await markOrderPaid(data.id);
      clear();
      navigate(`/confirmation?orderId=${data.id}`);
    } catch (err) {
      console.error(err);
      const serverMessage = err?.response?.data?.error;
      setError(serverMessage || 'Unable to create order. Please try again.');
      setIsSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl px-4 pb-20 mx-auto">
      <div className="flex flex-col gap-6 mt-10 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
          <p className="mt-2 text-sm text-slate-600">Review your order and complete payment to confirm pickup.</p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-sm font-semibold bg-white border rounded-full border-slate-200 text-slate-700 hover:bg-slate-50"
        >
          Back
        </button>
      </div>

      <div className="grid gap-8 mt-8 md:grid-cols-2">
        <section className="p-8 bg-white shadow-sm rounded-3xl">
          <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Package</span>
              <span className="text-sm text-slate-600">{selectedPackage.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Restaurant</span>
              <span className="text-sm text-slate-600">{selectedPackage.restaurantName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Total</span>
              <span className="text-lg font-semibold text-slate-900">Rp{Number(selectedPackage.totalPrice).toLocaleString('id-ID')}</span>
            </div>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="p-8 bg-white shadow-sm rounded-3xl">
          <h2 className="text-lg font-semibold text-slate-900">Customer Information</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full name</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-3 mt-2 text-sm bg-white border shadow-sm rounded-2xl border-slate-200 focus:border-bukain-green focus:outline-none"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Phone number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 mt-2 text-sm bg-white border shadow-sm rounded-2xl border-slate-200 focus:border-bukain-green focus:outline-none"
                placeholder="0812-XXXX-XXXX"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Pickup time</label>
              <input
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full px-4 py-3 mt-2 text-sm bg-white border shadow-sm rounded-2xl border-slate-200 focus:border-bukain-green focus:outline-none"
                type="time"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">Optional notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-24 px-4 py-3 mt-2 text-sm bg-white border shadow-sm resize-none rounded-2xl border-slate-200 focus:border-bukain-green focus:outline-none"
                placeholder="Any special requests?"
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 mt-8 text-base font-semibold text-white shadow-sm rounded-2xl bg-bukain-green hover:bg-bukain-green/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Creating order...' : 'Pay Now'}
          </button>
        </form>
      </div>

      <section className="p-8 mt-12 bg-white shadow-sm rounded-3xl">
        <div className="flex items-start gap-3">
          <div className="grid w-8 h-8 mt-1 rounded-full bg-bukain-green/10 text-bukain-green place-items-center">
            i
          </div>
          <div className="text-sm text-slate-600">
          Payment is simulated for the prototype. After clicking Pay Now, your order will be confirmed and you will receive a pickup code.
          </div>
        </div>
      </section>
    </main>
  );
}
