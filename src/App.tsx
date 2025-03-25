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

// Function to validate URL format
const isValidUrl = (urlString: string): boolean => {
  try {
    new URL(urlString);
    return true;
  } catch (err) {
    return false;
  }
};

function App() {
  // Fix for useRoutes - must be called at the component level
  const tempoRoutes =
    import.meta.env.VITE_TEMPO === "true" ? useRoutes(routes) : null;
  const [envError, setEnvError] = useState(false);
  const [errorType, setErrorType] = useState<"missing" | "invalid" | null>(
    null,
  );

  // Check if environment variables are properly loaded
  useEffect(() => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

    // Check if URL is valid
    const urlIsValid = supabaseUrl && isValidUrl(supabaseUrl);

    // Log environment status for debugging
    console.log("App environment check:", {
      hasSupabaseUrl: !!supabaseUrl,
      hasSupabaseKey: !!supabaseKey,
      urlIsValid,
      buildTime: new Date().toISOString(),
      fullUrl: supabaseUrl || "not set",
      fullKey: supabaseKey ? "[REDACTED]" : "not set",
    });

    // Set error state if environment variables are missing or invalid
    if (!supabaseUrl || !supabaseKey) {
      setEnvError(true);
      setErrorType("missing");
    } else if (!urlIsValid) {
      setEnvError(true);
      setErrorType("invalid");
    }
  }, []);

  // Show fallback UI if environment variables are missing or invalid
  if (envError) {
    return <EnvironmentErrorFallback errorType={errorType} />;
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
        {/* Fix for useRoutes - must be outside of JSX */}
      </div>
    </Suspense>
  );
}

export default App;
