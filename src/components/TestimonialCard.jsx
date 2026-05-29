import React from 'react';
import { Quote, Star, StarHalf } from 'lucide-react';

/**
 * Reusable, data-driven testimonial card.
 * Mobile-first and fully responsive. Matches the Nutrigabrielare design system
 * (rounded-[2rem] surfaces, nutri rose palette, font-heading / font-body).
 *
 * @param {Object}  props
 * @param {string}  props.name      - Full name of the person.
 * @param {string}  props.role      - Plan / service taken.
 * @param {string=} props.location  - Optional city / "Online".
 * @param {number}  props.rating    - 0–5, supports half steps (e.g. 4.5).
 * @param {string}  props.quote     - Testimonial text.
 */
export default function TestimonialCard({ name, role, location, rating = 5, quote }) {
  // Initials for the avatar (first + last word), e.g. "Andrea Martínez" -> "AM".
  const initials = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() || '')
    .join('');

  // Build a 5-slot star row supporting half stars.
  const stars = Array.from({ length: 5 }, (_, i) => {
    const value = rating - i;
    if (value >= 1) return 'full';
    if (value >= 0.5) return 'half';
    return 'empty';
  });

  return (
    <figure className="testi-card group relative flex h-full flex-col rounded-[2rem] border border-nutri-line bg-white p-7 md:p-8 shadow-[0_10px_30px_-18px_rgba(40,40,40,0.25)] transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/30 hover:shadow-[0_22px_45px_-22px_rgba(213,22,99,0.35)]">
      {/* Decorative quote mark */}
      <Quote
        aria-hidden="true"
        className="absolute right-6 top-6 h-9 w-9 rotate-180 fill-nutri-rose-soft text-nutri-rose-soft transition-colors duration-300 group-hover:fill-highlight/40 group-hover:text-highlight/40"
      />

      {/* Rating */}
      <div
        role="img"
        aria-label={`Calificación: ${rating} de 5 estrellas`}
        className="mb-5 flex items-center gap-1"
      >
        {stars.map((kind, i) =>
          kind === 'half' ? (
            <StarHalf key={i} aria-hidden="true" className="h-4 w-4 fill-accent text-accent" />
          ) : (
            <Star
              key={i}
              aria-hidden="true"
              className={`h-4 w-4 ${kind === 'full' ? 'fill-accent text-accent' : 'fill-nutri-line text-nutri-line'}`}
            />
          )
        )}
      </div>

      {/* Quote */}
      <blockquote className="flex-1">
        <p className="font-body text-base md:text-[1.0625rem] leading-relaxed text-primary/80">
          “{quote}”
        </p>
      </blockquote>

      {/* Author */}
      <figcaption className="mt-7 flex items-center gap-4 border-t border-nutri-line-soft pt-6">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-highlight to-accent font-heading text-sm font-bold text-white shadow-sm"
        >
          {initials}
        </span>
        <span className="min-w-0">
          <span className="block font-heading text-base font-bold leading-tight text-primary">
            {name}
          </span>
          <span className="block font-body text-sm text-primary/55">
            {role}
            {location ? ` · ${location}` : ''}
          </span>
        </span>
      </figcaption>
    </figure>
  );
}
