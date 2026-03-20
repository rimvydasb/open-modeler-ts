import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'export',
    distDir: 'dist',
    images: {
        unoptimized: true,
    },
    // Ensure 4 spaces for indentation as per GEMINI.md
    trailingSlash: true,
};

export default nextConfig;
