import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { getProductBySlug } from '../services/productService';
import { createReservation, notifyReservation } from '../services/reservationService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

export default function ReservarPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const containerRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Prefill from auth user
  useEffect(() => {
    if (!user) return;
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (fullName && !contactName) setContactName(fullName);
    if (user.email && !contactEmail) setContactEmail(user.email);
  }, [user, contactName, contactEmail]);

  // GSAP entrance
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const els = containerRef.current.querySelectorAll('.reservar-el');
    gsap.set(els, { opacity: 1, y: 0 });
    const ctx = gsap.context(() => {
      gsap.fromTo(
        els,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out' }
      );
    }, containerRef);
    return () => ctx.revert();
  }, [loading, success]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen pt-32 pb-20 bg-background flex flex-col items-center justify-center text-center px-6">
        <h1 className="font-heading font-extrabold text-3xl text-primary mb-4">
          Servicio no encontrado
        </h1>
        <Link to="/pleno/servicios" className="font-heading font-bold text-accent hover:underline">
          Ver servicios disponibles
        </Link>
      </div>
    );
  }

  if (product.kind !== 'service') {
    return <Navigate to={`/producto/${product.slug}`} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const reservation = await createReservation({
        userId: user.id,
        productId: product.id,
        contactName,
        contactEmail,
        contactPhone,
        preferredDate,
        preferredTime,
        notes,
      });

      // Fire confirmation email — non-blocking failures.
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        notifyReservation(reservation.id, session.access_token).catch(() => {});
      }

      setSuccess(reservation);
    } catch (err) {
      setError(err.message || 'No pudimos guardar tu reserva. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <div className="reservar-el inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/10 mb-6">
            <CheckCircle2 className="w-8 h-8 text-accent" />
          </div>
          <h1 className="reservar-el font-heading font-extrabold text-3xl md:text-4xl text-primary mb-4">
            Recibimos tu reserva
          </h1>
          <p className="reservar-el font-body text-primary/60 leading-relaxed mb-8">
            Te vamos a contactar por correo o WhatsApp para coordinar el día y la hora final.
            Mientras tanto, podés ver el estado de tus reservas en tu cuenta.
          </p>
          <div className="reservar-el flex flex-wrap justify-center gap-3">
            <Link
              to="/cuenta"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-background font-heading font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Ir a mi cuenta
            </Link>
            <Link
              to="/pleno"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-primary/15 text-primary font-heading font-bold text-sm hover:bg-primary/5 transition-colors"
            >
              Seguir explorando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const showQuote = product.price === 0;

  return (
    <div ref={containerRef} className="min-h-screen pt-32 pb-20 bg-background">
      <div className="container mx-auto px-6 max-w-2xl">
        <Link
          to={`/producto/${product.slug}`}
          className="reservar-el inline-flex items-center gap-2 text-sm font-body text-primary/50 hover:text-accent transition-colors mb-6 w-fit"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Volver al servicio
        </Link>

        <h1 className="reservar-el font-heading font-extrabold text-3xl md:text-4xl text-primary mb-2 leading-tight">
          Reservar consulta
        </h1>
        <p className="reservar-el font-body text-primary/60 mb-8">
          Completá los datos y te contactamos para coordinar el día y la hora.
        </p>

        {/* Service summary */}
        <div className="reservar-el rounded-2xl bg-white border border-primary/10 p-6 mb-8">
          <span className="text-xs font-semibold text-rose-500 mb-1 block">Servicio</span>
          <h2 className="font-heading font-bold text-xl text-primary mb-1">{product.name}</h2>
          <p className="font-drama italic text-lg text-primary/80">
            {showQuote ? 'Cotizar' : `$${Number(product.price).toFixed(2)}`}
          </p>
        </div>

        {error && (
          <p className="reservar-el text-sm text-red-500 font-body mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="reservar-el">
            <label className="block font-body text-xs font-semibold text-primary/60 uppercase tracking-widest mb-2">
              Nombre completo
            </label>
            <input
              required
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="w-full px-5 py-3.5 rounded-xl bg-white border border-primary/10 font-body text-primary outline-none focus:border-accent transition-colors"
            />
          </div>

          <div className="reservar-el grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-semibold text-primary/60 uppercase tracking-widest mb-2">
                Correo
              </label>
              <input
                required
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-white border border-primary/10 font-body text-primary outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-semibold text-primary/60 uppercase tracking-widest mb-2">
                Teléfono / WhatsApp
              </label>
              <input
                required
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="7xxx-xxxx"
                className="w-full px-5 py-3.5 rounded-xl bg-white border border-primary/10 font-body text-primary outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="reservar-el grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-body text-xs font-semibold text-primary/60 uppercase tracking-widest mb-2">
                Fecha preferida
              </label>
              <input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full px-5 py-3.5 rounded-xl bg-white border border-primary/10 font-body text-primary outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block font-body text-xs font-semibold text-primary/60 uppercase tracking-widest mb-2">
                Horario preferido
              </label>
              <input
                type="text"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                placeholder="Mañana / 3:00 pm / etc."
                className="w-full px-5 py-3.5 rounded-xl bg-white border border-primary/10 font-body text-primary outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div className="reservar-el">
            <label className="block font-body text-xs font-semibold text-primary/60 uppercase tracking-widest mb-2">
              Notas (opcional)
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contanos brevemente qué necesitás trabajar"
              className="w-full px-5 py-3.5 rounded-xl bg-white border border-primary/10 font-body text-primary outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`reservar-el mt-2 w-full py-4 rounded-xl font-heading font-bold text-center transition-opacity ${
              submitting
                ? 'bg-primary/30 text-background/60 cursor-not-allowed'
                : 'bg-primary text-background hover:opacity-90'
            }`}
          >
            {submitting ? 'Enviando…' : 'Enviar reserva'}
          </button>

          <p className="reservar-el font-body text-xs text-primary/40 text-center">
            Al enviar, aceptás que la nutricionista te contacte por correo o WhatsApp.
          </p>
        </form>
      </div>
    </div>
  );
}
