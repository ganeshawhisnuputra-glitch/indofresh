/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve the frame sequence from the public/frames directory
  // Frame files follow: public/frames/frame_NNN_delay-0.066s.webp
  images: {
    unoptimized: false,
    formats: ["image/webp"],
  },
};

export default nextConfig;
