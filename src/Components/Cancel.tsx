import { Link } from "react-router-dom";

export const Cancel = () => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center text-3xl mb-5">
          ×
        </div>

        <h1 className="text-3xl font-bold mb-3">Payment Cancelled</h1>

        <p className="text-gray-400 mb-6">
          Your payment was cancelled. You can try again whenever you are ready.
        </p>

        <div className="space-y-3">
          <Link
            to="/pricing"
            className="block w-full bg-purple-600 hover:bg-purple-700 text-black font-bold py-3 rounded-xl transition"
          >
            View Plans
          </Link>

          <Link
            to="/panel"
            className="block w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3 rounded-xl transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};