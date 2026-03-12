import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container mx-auto px-6 max-w-6xl">
        <h1 className="font-heading font-extrabold text-4xl text-primary">404 — Página no encontrada</h1>
        <p className="font-body text-primary/60 mt-4">La página que buscás no existe.</p>
        <Link to="/" className="inline-block mt-8 font-body text-accent hover:underline">Volver al inicio</Link>
      </div>
    </div>
  );
}
