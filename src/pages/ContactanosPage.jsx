import React, { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ChevronDown, Send } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const subjectOptions = [
  'Colaboraciones',
  'Prensa',
  'Voluntariado',
  'Propuesta comercial',
  'Solo quiero saludar',
];

const faqs = [
  {
    q: '¿Cómo puedo agendar una consulta con Nutrigabrielare?',
    a: 'Podés escribirnos directamente usando el formulario de arriba o contactarnos por redes. Estamos abiertos a ideas, proyectos y alianzas que tengan sentido con nuestra identidad.',
  },
  {
    q: '¿Cómo funciona Proyecto Banquita?',
    a: 'Es nuestra iniciativa social. Recaudamos fondos a través de aportes voluntarios y los destinamos directamente a jornadas comunitarias en El Salvador. Todo con transparencia total.',
  },
  {
    q: '¿Puedo proponer una causa o iniciativa?',
    a: 'Claro. Si tenés una causa que creés que conecta con lo que hacemos, mandanos tu propuesta. La revisamos y si tiene sentido, la sumamos.',
  },
  {
    q: '¿Tienen tienda o productos disponibles?',
    a: 'Sí. Nuestra tienda incluye recursos y guías diseñadas científicamente desde la metodología de Nutrigabrielare.',
  },
  {
    q: '¿Cómo puedo contactarlos para prensa o alianzas?',
    a: 'Usá el formulario de contacto seleccionando "Prensa" o "Propuesta comercial" en el asunto y te responderemos lo antes posible.',
  },
  {
    q: '¿En cuánto tiempo responden los mensajes?',
    a: 'Generalmente respondemos en 24 a 48 horas. A veces tardamos un poco más, pero siempre contestamos.',
  },
];

export default function ContactanosPage() {
  const heroRef = useRef(null);
  const formRef = useRef(null);
  const faqRef = useRef(null);

  const [formData, setFormData] = useState({ nombre: '', correo: '', asunto: '', mensaje: '' });
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    let ctx = gsap.context(() => {
      gsap.from('.contact-hero-el', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        stagger: 0.15,
        ease: 'power3.out',
        delay: 0.1,
      });

      gsap.from('.form-el', {
        scrollTrigger: { trigger: formRef.current, start: 'top 80%' },
        y: 30,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: 'power3.out',
      });

      gsap.from('.faq-item', {
        scrollTrigger: { trigger: faqRef.current, start: 'top 80%' },
        y: 20,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out',
      });
    });
    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // placeholder – wire to backend or email service later
    alert('¡Gracias por tu mensaje! Te responderemos pronto.');
    setFormData({ nombre: '', correo: '', asunto: '', mensaje: '' });
  };

  return (
    <>
      {/* ── Hero ── */}
      <section ref={heroRef} className="min-h-[60vh] flex items-end pb-20 pt-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="contact-hero-el inline-block px-3 py-1 mb-6 rounded-full border border-primary/20 text-xs font-semibold uppercase tracking-widest text-primary/70">
            Contacto
          </div>
          <h1 className="contact-hero-el font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl tracking-tighter text-primary mb-6 max-w-2xl">
            Contáctanos
          </h1>
          <p className="contact-hero-el font-body text-lg md:text-xl text-primary/60 max-w-xl leading-relaxed">
            Respondemos todos los mensajes. A veces tardamos, pero siempre contestamos.
          </p>
        </div>
      </section>

      {/* ── Form ── */}
      <section ref={formRef} className="py-24 bg-[#F7F4EE] relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-el">
              <label className="block font-heading font-bold text-sm text-primary/70 mb-2 uppercase tracking-widest">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 font-body text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="Tu nombre"
              />
            </div>

            <div className="form-el">
              <label className="block font-heading font-bold text-sm text-primary/70 mb-2 uppercase tracking-widest">Correo</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 font-body text-primary focus:outline-none focus:border-accent transition-colors"
                placeholder="tucorreo@ejemplo.com"
              />
            </div>

            <div className="form-el relative">
              <label className="block font-heading font-bold text-sm text-primary/70 mb-2 uppercase tracking-widest">Asunto</label>
              <div className="relative">
                <select
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 font-body text-primary focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer"
                >
                  <option value="" disabled>Seleccioná un asunto</option>
                  {subjectOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40 pointer-events-none" />
              </div>
            </div>

            <div className="form-el">
              <label className="block font-heading font-bold text-sm text-primary/70 mb-2 uppercase tracking-widest">Mensaje</label>
              <textarea
                name="mensaje"
                value={formData.mensaje}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-6 py-4 rounded-2xl bg-white border border-primary/10 font-body text-primary focus:outline-none focus:border-accent transition-colors resize-none"
                placeholder="Contanos lo que tenés en mente..."
              />
            </div>

            <div className="form-el pt-4">
              <button
                type="submit"
                className="magnetic-btn inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-background font-bold font-body text-lg w-full md:w-auto"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Enviar mensaje <Send className="w-5 h-5" />
                </span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section ref={faqRef} className="py-24 bg-background relative z-10 w-full overflow-hidden">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-primary tracking-tighter mb-4">
              Preguntas frecuentes
            </h2>
            <div className="w-16 h-1 bg-accent rounded-full"></div>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="faq-item rounded-2xl border border-primary/10 overflow-hidden transition-colors hover:border-primary/20"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-heading font-bold text-primary text-base md:text-lg"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-primary/40 shrink-0 ml-4 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-300 ${openFaq === idx ? 'max-h-40 pb-5 px-6' : 'max-h-0'}`}>
                  <p className="font-body text-primary/70 text-base leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
