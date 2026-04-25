import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useParams } from 'react-router-dom';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export const Checkout = () => {
  const { plan } = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      
      const session = await response.json();
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="bg-gray-900 p-8 rounded-xl text-center max-w-md">
        <h1 className="text-2xl font-bold mb-4">Assinatura Pro</h1>
        <p className="text-3xl font-bold text-purple-400 mb-4">R$29,90<span className="text-sm text-gray-400">/mês</span></p>
        <ul className="text-left text-gray-300 mb-6 space-y-2">
          <li>✅ Recursos premium exclusivos</li>
          <li>✅ Perfil personalizado</li>
          <li>✅ Suporte prioritário</li>
        </ul>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-purple-600 w-full py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? 'Processando...' : 'Assinar Agora'}
        </button>
      </div>
    </div>
  );
};