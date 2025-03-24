// Enhanced script to download your project code
// Run this in your browser console when viewing your Tempo project

async function downloadCodeAsText() {
  try {
    console.log("Starting code export process...");

    // Create a text representation of your project
    let projectText = "# Million Dollar Vibe Project\n\n";
    projectText +=
      "This is a text export of your project files. Copy each file content to create your local project.\n\n";

    // Add instructions
    projectText += "## Instructions\n\n";
    projectText += "1. Create a new folder for your project\n";
    projectText +=
      "2. For each file listed below, create the appropriate folder structure and file\n";
    projectText += "3. Copy the content between the markers into each file\n";
    projectText +=
      "4. Run `npm install` or `pnpm install` to install dependencies\n";
    projectText +=
      "5. Follow the GitHub and Netlify deployment instructions at the end\n\n";

    // Add key files content
    projectText += "## Key Files\n\n";

    // Add package.json
    projectText += "### package.json\n\n```json\n";
    projectText += JSON.stringify(
      {
        name: "million-dollar-vibe",
        private: true,
        version: "0.0.0",
        type: "module",
        scripts: {
          dev: "vite",
          build: "cross-env tsc --noEmit && vite build",
          "build-no-errors": "cross-env tsc --noEmit || true && vite build",
          lint: "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
          preview: "vite preview",
          "types:supabase":
            "npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/supabase.ts",
        },
        dependencies: {
          "@hookform/resolvers": "^3.6.0",
          "@polar-sh/sdk": "^0.32.0",
          "@radix-ui/react-accordion": "^1.1.2",
          "@radix-ui/react-alert-dialog": "^1.0.5",
          "@radix-ui/react-aspect-ratio": "^1.0.3",
          "@radix-ui/react-avatar": "^1.0.4",
          "@radix-ui/react-checkbox": "^1.0.4",
          "@radix-ui/react-collapsible": "^1.0.3",
          "@radix-ui/react-context-menu": "^2.1.5",
          "@radix-ui/react-dialog": "^1.0.5",
          "@radix-ui/react-dropdown-menu": "^2.0.6",
          "@radix-ui/react-hover-card": "^1.0.7",
          "@radix-ui/react-icons": "^1.3.0",
          "@radix-ui/react-label": "^2.0.2",
          "@radix-ui/react-menubar": "^1.0.4",
          "@radix-ui/react-navigation-menu": "^1.1.4",
          "@radix-ui/react-popover": "^1.0.7",
          "@radix-ui/react-progress": "^1.0.3",
          "@radix-ui/react-radio-group": "^1.1.3",
          "@radix-ui/react-scroll-area": "^1.0.5",
          "@radix-ui/react-select": "^2.0.0",
          "@radix-ui/react-separator": "^1.0.3",
          "@radix-ui/react-slider": "^1.1.2",
          "@radix-ui/react-slot": "^1.0.2",
          "@radix-ui/react-switch": "^1.0.3",
          "@radix-ui/react-tabs": "^1.0.4",
          "@radix-ui/react-toast": "^1.1.5",
          "@radix-ui/react-toggle": "^1.0.3",
          "@radix-ui/react-tooltip": "^1.0.7",
          "@supabase/supabase-js": "^2.45.6",
          "class-variance-authority": "^0.7.0",
          clsx: "^2.1.1",
          cmdk: "^1.0.0",
          "date-fns": "^3.6.0",
          "embla-carousel-react": "^8.1.5",
          "framer-motion": "^11.18.0",
          "lucide-react": "^0.394.0",
          react: "^18.2.0",
          "react-day-picker": "^8.10.1",
          "react-dom": "^18.2.0",
          "react-hook-form": "^7.51.5",
          "react-resizable-panels": "^2.0.19",
          "react-router": "^6.23.1",
          "react-router-dom": "^6.23.1",
          "tailwind-merge": "^2.3.0",
          "tailwindcss-animate": "^1.0.7",
          vaul: "^0.9.1",
          zod: "^3.23.8",
          zustand: "^5.0.3",
        },
        devDependencies: {
          "@swc/core": "^1.3.96",
          "@types/node": "^20.14.2",
          "@types/react": "^18.2.66",
          "@types/react-dom": "^18.2.22",
          "@vitejs/plugin-react-swc": "^3.5.0",
          autoprefixer: "^10.4.19",
          "cross-env": "^7.0.3",
          postcss: "^8.4.38",
          tailwindcss: "3.4.1",
          "tempo-devtools": "^2.0.95",
          typescript: "^5.2.2",
          vite: "^5.0.0",
        },
      },
      null,
      2,
    );
    projectText += "\n```\n\n";

    // Add vite.config.ts
    projectText += "### vite.config.ts\n\n```typescript\n";
    projectText += `import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: true,
  },
  optimizeDeps: {
    include: ["react/jsx-dev-runtime", "react-dom/client", "react-router-dom"],
  },
  base: "./",
});
`;
    projectText += "\n```\n\n";

    // Add netlify.toml
    projectText += "### netlify.toml\n\n```toml\n";
    projectText += `# Netlify configuration file

[build]
  command = "npm run build-no-errors"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Handle SPA routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Set cache headers for assets
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
`;
    projectText += "\n```\n\n";

    // Add index.html
    projectText += "### index.html\n\n```html\n";
    projectText += `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="./vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>The Million Dollar Page</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./src/main.tsx"></script>
  </body>
</html>
`;
    projectText += "\n```\n\n";

    // Add App.tsx
    projectText += "### src/App.tsx\n\n```tsx\n";
    projectText += `import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import PaymentSuccessPage from "./components/PaymentSuccessPage";
import PaymentCancelPage from "./components/PaymentCancelPage";

function App() {
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
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
`;
    projectText += "\n```\n\n";

    // Add main.tsx
    projectText += "### src/main.tsx\n\n```tsx\n";
    projectText += `import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
`;
    projectText += "\n```\n\n";

    // Add tailwind.config.js
    projectText += "### tailwind.config.js\n\n```js\n";
    projectText += `/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}`;
    projectText += "\n```\n\n";

    // Add index.css
    projectText += "### src/index.css\n\n```css\n";
    projectText += `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
 
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
 
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
 
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
 
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
 
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
 
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
 
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
 
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
 
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
 
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
 
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
 
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
    projectText += "\n```\n\n";

    // Add .env template
    projectText +=
      "### .env (create this file with your actual values)\n\n```\n";
    projectText += `VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POLAR_ACCESS_TOKEN=your_polar_access_token
`;
    projectText += "\n```\n\n";

    // Add tsconfig.json
    projectText += "### tsconfig.json\n\n```json\n";
    projectText += `{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    
    /* Paths */
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}`;
    projectText += "\n```\n\n";

    // Add deployment instructions
    projectText += "## Deployment Instructions\n\n";
    projectText += "### GitHub Deployment\n\n";
    projectText += "```bash\n";
    projectText += "# Initialize a git repository\ngit init\n\n";
    projectText += "# Add all files to git\ngit add .\n\n";
    projectText += '# Commit the files\ngit commit -m "Initial commit"\n\n';
    projectText +=
      "# Create a new repository on GitHub and add it as remote\ngit remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git\n\n";
    projectText += "# Push the code to GitHub\ngit push -u origin main\n";
    projectText += "```\n\n";

    projectText += "### Netlify Deployment\n\n";
    projectText += "1. Go to [Netlify](https://app.netlify.com/)\n";
    projectText += "2. Sign in or create an account\n";
    projectText += '3. Click "Add new site" > "Import an existing project"\n';
    projectText +=
      "4. Connect to your GitHub account and select your repository\n";
    projectText +=
      "5. Netlify will automatically detect your netlify.toml configuration\n";
    projectText +=
      "6. Add your environment variables in Site settings > Environment variables:\n";
    projectText += "   - VITE_SUPABASE_URL\n";
    projectText += "   - VITE_SUPABASE_ANON_KEY\n";
    projectText += "   - VITE_POLAR_ACCESS_TOKEN (if needed)\n";

    // Add important note about components
    projectText += "\n## Important Note\n\n";
    projectText +=
      "This export contains only the basic structure and configuration files. You'll need to manually copy your component files from the Tempo editor to your local project. The key components to copy are:\n\n";
    projectText += "- src/components/home.tsx\n";
    projectText += "- src/components/Header.tsx\n";
    projectText += "- src/components/PixelGrid.tsx\n";
    projectText += "- src/components/PurchaseDialog.tsx\n";
    projectText += "- src/components/ui/* (all UI components)\n";
    projectText += "- src/lib/* (all library files)\n\n";
    projectText +=
      "You can view these files in the Tempo editor and copy their contents to your local project.\n\n";

    console.log("Project text generated successfully!");

    // Create a blob and download it
    try {
      const blob = new Blob([projectText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "million-dollar-vibe-project.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.log("File downloaded successfully!");
    } catch (e) {
      console.error("Error downloading file:", e);
      // Fallback to clipboard
      try {
        const textarea = document.createElement("textarea");
        textarea.value = projectText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        console.log("Project code has been copied to clipboard as fallback!");
      } catch (clipboardError) {
        console.error("Clipboard fallback failed:", clipboardError);
        alert(
          "Could not download or copy. Please check console and manually copy the output.",
        );
      }
    }

    return projectText;
  } catch (error) {
    console.error("Error generating project text:", error);
    alert(
      "Error generating project text. Please check the console for details.",
    );
  }
}

// Run the function
console.log("Starting download script...");
downloadCodeAsText();
