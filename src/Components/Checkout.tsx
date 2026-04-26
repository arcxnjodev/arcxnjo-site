import { useState } from "react";
import { useParams } from "react-router-dom";

export const Checkout = () => {
  const { plan } = useParams();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session.");
      }

      if (!data.url) {
        throw new Error("The backend did not return a Stripe checkout URL.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white px-4">
      <div className="bg-gray-900 p-8 rounded-xl text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Pro Subscription</h1>

        <p className="text-3xl font-bold text-purple-400 mb-4">
          $5.99<span className="text-sm text-gray-400">/month</span>
        </p>

        <p className="text-gray-400 mb-6">
          Unlock premium customization features for your profile.
        </p>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="bg-purple-600 w-full py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {loading ? "Processing..." : "Subscribe Now"}
        </button>
      </div>
    </div>
  );
};