import type { NextConfig } from 'next'

const config: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@node-rs/argon2', '@node-rs/bcrypt'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default config