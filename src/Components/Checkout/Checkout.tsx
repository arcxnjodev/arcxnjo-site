import { useParams } from "react-router-dom";

export const Checkout = () => {
  const { plan } = useParams();
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white">
      <div className="bg-gray-900 p-8 rounded-xl text-center">
        <h1 className="text-2xl font-bold mb-4">Assinatura {plan === 'pro' ? 'Pro' : 'Plano'}</h1>
        <p className="mb-6">Área de pagamento - em desenvolvimento</p>
        <button className="bg-purple-600 px-6 py-2 rounded-lg">
          Simular Pagamento
        </button>
      </div>
    </div>
  );
};