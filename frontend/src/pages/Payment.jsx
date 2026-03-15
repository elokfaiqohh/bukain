import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchOrder, markOrderPaid } from '../utils/api';
import Loader from '../components/Loader';

export default function Payment() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!orderId) {
      setError('Missing order ID');
      setLoading(false);
      return;
    }

    fetchOrder(orderId)
      .then(setOrder)
      .catch(() => setError('Order not found'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handlePay = async () => {
    if (!orderId) return;
    setError('');
    setPaying(true);

    try {
      await markOrderPaid(orderId);
      navigate(`/confirmation?orderId=${orderId}`);
    } catch (err) {
      console.error(err);
      setError('Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return <Loader label="Loading payment details..." />;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg font-semibold text-slate-900">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 rounded-full bg-bukain-green px-6 py-3 text-sm font-semibold text-white hover:bg-bukain-green/90"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20">
      <div className="mt-10 rounded-3xl bg-white p-10 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-bukain-green/10 grid place-items-center text-2xl text-bukain-green">✓</div>
          <h1 className="text-3xl font-bold text-slate-900">Secure Payment</h1>
          <p className="max-w-md text-sm text-slate-600">
            For this prototype, payment is simulated. Click the button below to confirm your order and receive a pickup code.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-700">Order Code</p>
            <p className="mt-2 text-xl font-bold text-slate-900">{order?.code}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-700">Total</p>
            <p className="mt-2 text-xl font-bold text-slate-900">Rp{Number(order?.price).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {error ? <p className="mt-6 text-sm text-red-600">{error}</p> : null}

        <div className="mt-10 flex flex-col items-center gap-4">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full max-w-sm rounded-full bg-bukain-green px-6 py-4 text-base font-semibold text-white shadow-sm hover:bg-bukain-green/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {paying ? 'Processing...' : 'Complete Payment'}
          </button>
          <button
            onClick={() => navigate(-1)}
            className="text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
