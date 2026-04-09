import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kofhsmlywrmpaymqxjgl.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvZmhzbWx5d3JtcGF5bXF4amdsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYyMjI0MCwiZXhwIjoyMDkxMTk4MjQwfQ.IwOxNL2UnPnhgggessf6q_NYc8lYusVZhdf1ObmfjTE'
);

const categories = [
  {
    id: 'suplementos',
    num: '01',
    title: 'Suplementos',
    tagline: 'Potencia tu bienestar desde adentro',
    description: 'Vitaminas, minerales y fórmulas naturales respaldadas por ciencia para optimizar tu salud diaria.',
    cta: 'Ver suplementos',
    sort_order: 1,
    active: true,
  },
  {
    id: 'superfoods',
    num: '02',
    title: 'Superfoods',
    tagline: 'Nutrición concentrada de la naturaleza',
    description: 'Polvos, semillas y superalimentos orgánicos para enriquecer tus comidas y batidos.',
    cta: 'Ver superfoods',
    sort_order: 2,
    active: true,
  },
  {
    id: 'planes-nutricionales',
    num: '03',
    title: 'Planes Nutricionales',
    tagline: 'Tu guía personalizada de alimentación',
    description: 'Guías digitales y planes alimenticios diseñados por especialistas para alcanzar tus objetivos.',
    cta: 'Ver planes',
    sort_order: 3,
    active: true,
  },
];

async function seed() {
  console.log('Insertando 3 categorías...');
  const { data, error } = await supabase
    .from('product_categories')
    .upsert(categories, { onConflict: 'id' })
    .select();

  if (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }

  console.log('✅ Categorías creadas:', data.map(c => c.title).join(', '));
}

seed();
