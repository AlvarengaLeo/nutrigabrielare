import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug } from '../services/productService';
import { createPaymentLink } from '../services/paymentService';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const PENDING_ORDER_KEY = 'nutri-pending-order';

export default function ReservarPage() {
  const { slug } = useParams();
  const { user } = useAuth();
  const containerRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

  // Prefill opcional si hay sesión (no es requisito para reservar)
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
  }, [loading]);

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
        <Link to="/nutrigabrielare?categoria=service#nutri-catalogo" className="font-heading font-bold text-accent hover:underline">
          Ver servicios disponibles
        </Link>
      </div>
    );
  }

  if (product.kind !== 'service') {
    return <Navigate to={`/producto/${product.slug}`} replace />;
  }

  const showQuote = product.price === 0;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const checkoutPayload = {
        items: [
          {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            size: 'Único',
            color: 'Estándar',
            quantity: 1,
            image: product.images?.[0] ?? null,
          },
        ],
        contact: {
          name: contactName.trim(),
          email: contactEmail.trim(),
          phone: contactPhone.trim(),
        },
        shipping: {
          address: '',
          city: '',
          department: '',
          notes: '',
          zoneId: '',
        },
        reservation: {
          preferredDate,
          preferredTime,
          notes,
        },
      };

      // Si hay sesión activa, la orden queda asociada a la cuenta
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payment = await createPaymentLink(
        checkoutPayload,
        session?.access_token ?? null,
      );

      localStorage.setItem(
        PENDING_ORDER_KEY,
        JSON.stringify({ id: payment.orderId, key: payment.orderKey, source: 'reserva' }),
      );

      window.location.assign(payment.urlEnlace);
    } catch (err) {
      setError(err.message || 'No pudimos preparar tu pago. Intentá de nuevo.');
      setSubmitting(false);
    }
  }

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
          {showQuote
            ? 'Este servicio se cotiza según tus necesidades — escribinos y lo armamos juntas.'
            : 'Completá tus datos, pagá en línea y te contactamos para coordinar el día y la hora.'}
        </p>

        {/* Service summary */}
        <div className="reservar-el rounded-2xl bg-white border border-primary/10 p-6 mb-8">
          <span className="text-xs font-semibold text-rose-500 mb-1 block">Servicio</span>
          <h2 className="font-heading font-bold text-xl text-primary mb-1">{product.name}</h2>
          <p className="font-drama italic text-lg text-primary/80">
            {showQuote ? 'Cotizar' : `$${Number(product.price).toFixed(2)}`}
          </p>
        </div>

        {showQuote ? (
          <div className="reservar-el rounded-2xl bg-white border border-primary/10 p-6 text-center">
            <p className="font-body text-primary/60 mb-5">
              Contanos qué necesitás y te preparamos una propuesta a tu medida.
            </p>
            <a
              href={`https://wa.me/50376284719?text=${encodeURIComponent(`¡Hola! Quiero cotizar el servicio "${product.name}" 🌸`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-accent text-white font-heading font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Cotizar por WhatsApp
            </a>
          </div>
        ) : (
          <>
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
                {submitting
                  ? 'Redirigiendo a Wompi…'
                  : `Reservar y pagar $${Number(product.price).toFixed(2)}`}
              </button>

              <p className="reservar-el font-body text-xs text-primary/40 text-center">
                Pagás de forma segura con Wompi. Tu cupo queda asegurado y te
                contactamos para coordinar el día y la hora de tu consulta.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
