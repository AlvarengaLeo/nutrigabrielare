import React from 'react';
import { useLocation } from 'react-router-dom';

export default function ConfigurationErrorScreen({ missingVars = [] }) {
  const location = useLocation();

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-primary">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center justify-center">
        <section className="w-full rounded-[2rem] border border-primary/10 bg-white p-8 shadow-[0_32px_80px_rgba(0,0,0,0.08)] md:p-10">
          <div className="mb-6 inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">
            Runtime config error
          </div>

          <h1 className="font-heading text-3xl font-extrabold leading-tight md:text-4xl">
            El despliegue cargo, pero la configuracion critica no.
          </h1>

          <p className="mt-4 max-w-2xl font-body text-sm leading-6 text-primary/70 md:text-base">
            La app evito una pantalla en blanco porque detecto variables de entorno
            faltantes antes de montar Supabase. Agrega estas variables en Vercel y
            vuelve a desplegar produccion.
          </p>

          <div className="mt-6 rounded-2xl bg-[#f8f6f3] p-5">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.16em] text-primary/60">
              Variables faltantes
            </p>
            <ul className="mt-3 space-y-3">
              {missingVars.map(({ envName, impact, critical }) => (
                <li
                  key={envName}
                  className="rounded-xl border border-primary/10 bg-white px-4 py-3"
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <code className="font-mono text-sm font-semibold text-primary">
                      {envName}
                    </code>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                        critical
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {critical ? 'Bloquea arranque' : 'Bloquea pagos'}
                    </span>
                  </div>
                  <p className="mt-2 font-body text-sm text-primary/65">{impact}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-primary/10 p-4">
              <p className="font-heading text-sm font-bold text-primary">
                Ruta solicitada
              </p>
              <p className="mt-2 font-mono text-sm text-primary/65">
                {location.pathname}
                {location.search}
              </p>
            </div>

            <div className="rounded-2xl border border-primary/10 p-4">
              <p className="font-heading text-sm font-bold text-primary">
                Donde corregirlo
              </p>
              <p className="mt-2 font-body text-sm leading-6 text-primary/65">
                Vercel &gt; Project Settings &gt; Environment Variables &gt; Production
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-dashed border-primary/15 px-4 py-4 font-body text-sm leading-6 text-primary/60">
            Despues de cargar las variables, ejecuta un redeploy del commit actual
            para regenerar el bundle con la configuracion correcta.
          </div>
        </section>
      </div>
    </main>
  );
}
