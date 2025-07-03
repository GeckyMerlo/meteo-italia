import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Ignorare gli errori ESLint durante il build per il deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Ignorare gli errori TypeScript durante il build per il deploy  
    ignoreBuildErrors: true,
  },
  // Configurazioni per migliorare la compatibilità con Vercel
  serverExternalPackages: ['puppeteer'],
};

export default nextConfig;
