import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3100", "10.0.0.118:3100", "0.0.0.0:3100", "*.ngrok-free.app", "*.trycloudflare.com"]
    }
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Em produção, restrinja isso
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      },
      {
        source: "/:path*",
        headers: [
          // Segurança e compatibilidade de APIs do navegador
          // Permite geolocalização, câmera e microfone quando a página é acessada diretamente (não restringimos aqui)
          { key: "Permissions-Policy", value: "geolocation=(self), microphone=(self), camera=(self)" },
          // CSP permissivo para homologação; em produção, ajuste domínios específicos
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; connect-src 'self' https: wss:; frame-src 'self' https:;" },
          // Headers adicionais
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" }
        ]
      }
    ]
  }
};

export default nextConfig;
