/** @type {import('next').NextConfig} */
const nextConfig = {
  // El backend vive en la carpeta de arriba (../package-lock.json) y
  // confundía a Turbopack sobre cuál es la raíz real de este proyecto.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
