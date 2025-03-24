import { Suspense, useState, useEffect } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import PaymentSuccessPage from "./components/PaymentSuccessPage";
import PaymentCancelPage from "./components/PaymentCancelPage";
import routes from "tempo-routes";
import { EnvironmentErrorFallback } from "./lib/fallback-ui";

function App() {
  const [envError, setEnvError] = useState(false);

  // Check if environment variables are properly loaded
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    // Log environment status for debugging
    console.log("App environment check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      buildTime: new Date().toISOString(),
    });

    // Set error state if environment variables are missing
    if (!supabaseUrl || !supabaseKey) {
      setEnvError(true);
    }
  }, []);

  // Show fallback UI if environment variables are missing
  if (envError) {
    return <EnvironmentErrorFallback />;
  }

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-cancel" element={<PaymentCancelPage />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={<div />} />
          )}
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </div>
    </Suspense>
  );
}

export default App;
