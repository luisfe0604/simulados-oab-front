import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fixa a raiz de tracing neste projeto (há outro package-lock.json na pasta-pai
  // que faria o Next.js inferir o workspace root errado).
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
