// Seed a handful of demo blog posts so the public pages have real content.
// Idempotent: upserts by slug.

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const env = Object.fromEntries(
  fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8')
    .split(/\r?\n/)
    .map((l) => l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2].replace(/^['"]|['"]$/g, '')]),
);

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const now = new Date();
function daysAgo(n) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const posts = [
  {
    slug: 'sincronizar-nutricion-con-tu-ciclo',
    title: 'Cómo sincronizar tu nutrición con las fases de tu ciclo',
    excerpt: 'Tu cuerpo no necesita la misma alimentación durante todo el mes. Aprendé a leer las fases y ajustar lo que comés con ellas.',
    category_id: 'hormonas',
    reading_minutes: 6,
    cover_image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1600&q=80',
    published_at: daysAgo(2),
    body_md: `Durante años nos enseñaron a comer igual los 365 días del año. Pero tu cuerpo cambia. Tus hormonas cambian. Y tu nutrición puede cambiar con ellas.

## Las cuatro fases en una idea

- **Menstrual (días 1–5):** necesitás minerales. Hierro, magnesio, descanso.
- **Folicular (días 6–13):** tu energía sube. Es momento de comer liviano y moverte más.
- **Ovulatoria (días 14–17):** picos de estrógeno. Las antioxidantes brillan acá.
- **Lútea (días 18–28):** el cuerpo pide carbohidratos complejos. No es ansiedad: es química.

## Qué evitar (y por qué no es "moral")

Comer "perfecto" no existe. Comer **alineado** sí.

> "Cuando una mujer aprende a leer su ciclo, deja de pelearse con su cuerpo."

### Lista práctica

1. Lleva un registro mínimo: día de tu ciclo y cómo te sentís
2. Asegurate proteína en cada comida — no es opcional para tu balance hormonal
3. Hidratación: 30 ml por kilo de peso, no menos
4. Magnesio antes de dormir en fase lútea

---

Si querés un acompañamiento personalizado, mirá los **servicios** de Nutrigabriela o reservá una primera consulta.
`,
    seo_title: 'Cómo sincronizar tu nutrición con tu ciclo · Fluir Femenino',
    seo_description: 'Guía práctica para alinear lo que comés con las fases de tu ciclo menstrual. Salud hormonal sin reglas rígidas.',
  },
  {
    slug: 'pupusas-saludables-receta-base',
    title: 'Pupusas saludables: la receta base que cambia todo',
    excerpt: 'Sí, podés comer pupusas y cuidar tu salud al mismo tiempo. Receta base + 3 rellenos altos en proteína.',
    category_id: 'recetas',
    reading_minutes: 4,
    cover_image_url: 'https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=1600&q=80',
    published_at: daysAgo(5),
    body_md: `La pupusa no es el problema. El problema es comerla con tres más, frita en aceite reusado y sin nada de proteína al lado.

## Masa base (rinde 8 pupusas medianas)

| Ingrediente | Cantidad |
|---|---|
| Harina de maíz nixtamalizada | 2 tazas |
| Agua tibia | 1 ½ tazas |
| Sal | ½ cucharadita |
| Aceite de coco (opcional) | 1 cdta |

Mezclar hasta obtener masa suave que no se pegue. Reposar 10 min.

## 3 rellenos altos en proteína

### 1. Pollo deshebrado + frijoles negros
Pollo cocinado con cebolla y comino, mezclado con frijoles aplastados.

### 2. Queso ricotta + loroco
Una opción más liviana que el quesillo tradicional.

### 3. Lentejas + queso campesino
Para los lunes sin carne.

## Cómo cocinarlas

- Sartén o comal de hierro a fuego medio
- **Cero aceite extra** sobre la pupusa (la masa ya tiene)
- 3 min cada lado

## Acompañamiento

- Curtido casero (siempre)
- Una proteína extra si solo comés 1–2 pupusas
- Agua, no gaseosa

---

¿Te gusta cocinar así? Mirá los **ebooks de recetas** en la tienda.
`,
    seo_title: 'Pupusas saludables · receta base con proteína',
    seo_description: 'Cómo hacer pupusas sin perder nutrición. Receta base + 3 rellenos altos en proteína.',
  },
  {
    slug: 'mitos-sobre-el-desayuno',
    title: '5 mitos sobre el desayuno que ya podés soltar',
    excerpt: 'No, no tenés que desayunar apenas te despertás. No, no es "la comida más importante". Repasamos qué dice la evidencia hoy.',
    category_id: 'nutricion',
    reading_minutes: 5,
    cover_image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1600&q=80',
    published_at: daysAgo(9),
    body_md: `Si googleás "el desayuno es la comida más importante" vas a encontrar miles de páginas que lo afirman. Y miles que lo desmienten. Vamos a lo que sí sabemos.

## Mito 1 — "Si no desayunás engordás"

**Falso.** Lo que importa es el total calórico del día y tu sensibilidad individual. Saltar el desayuno no engorda; comer mal en general sí.

## Mito 2 — "Hay que desayunar antes de las 9"

**Falso.** La hora no importa tanto como la composición. Una persona con horario nocturno puede "desayunar" a las 11 am sin problema.

## Mito 3 — "El desayuno tiene que tener cereales"

**Falso.** El desayuno occidental con cereales es invento publicitario. En Asia se desayuna sopa, en México huevos con frijoles, en India dhal. Variá.

## Mito 4 — "Saltar el desayuno baja la concentración"

**Depende.** Si dormiste mal y estás bajo estrés, sí. Si estás bien descansada y vienes de una cena nutritiva, podés rendir perfecto.

## Mito 5 — "El ayuno intermitente es para todos"

**Falso.** Mujeres en edad fértil, embarazadas, lactando o con historial de TCA deben evitarlo o hacerlo solo con supervisión.

---

> "La pregunta no es a qué hora desayunás. Es **qué** desayunás y **por qué**."

### Mi recomendación práctica

1. Esperá a tener hambre real (no impulso del celular)
2. Buscá proteína + grasa buena + algo verde
3. Evitá empezar con azúcar — te marca toda la mañana
`,
    seo_title: '5 mitos sobre el desayuno · evidencia actualizada',
    seo_description: 'Qué dice la evidencia hoy sobre el desayuno. Mitos comunes y qué realmente importa.',
  },
  {
    slug: 'no-es-pereza-es-tu-fase-lutea',
    title: 'No es pereza, es tu fase lútea',
    excerpt: 'Esa semana antes de que llegue tu período donde sentís que todo cuesta el doble. Te cuento qué pasa y cómo acompañarte.',
    category_id: 'bienestar',
    reading_minutes: 4,
    cover_image_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1600&q=80',
    published_at: daysAgo(14),
    body_md: `Si alguna vez dijiste "no sé qué me pasa, estoy hecha un desastre y me viene en cinco días" — bienvenida a la fase lútea.

## Qué está pasando hormonalmente

En esta fase, **el estrógeno cae** y **la progesterona sube**. Eso afecta:

- Tu energía
- Tu paciencia
- Tu sensibilidad emocional
- Tu apetito (sí, querer chocolate **es química**)

## Lo que tu cuerpo te pide

| Necesidad | Por qué | Cómo darle |
|---|---|---|
| Más calorías | Tu metabolismo basal sube ~10% | No restrinjas |
| Más carbohidratos complejos | Para producir serotonina | Avena, batata, arroz integral |
| Más descanso | Sueño profundo se reduce | Magnesio + dormirse temprano |
| Menos cardio intenso | Cortisol ya está alto | Cambiá a yoga o caminatas |

## No te peleés con tu cuerpo

> "La pereza de la fase lútea no es debilidad de carácter. Es tu cuerpo pidiéndote permiso para bajar el ritmo."

### Ritual mínimo para esta semana

1. Una cosa importante por día (no diez)
2. Caminata de 20 min al sol
3. Cena temprano y liviana
4. Algo dulce sin culpa (chocolate 70%, dátiles, fruta)

---

Si esto te resuena, en el **Diario de Fluir** vas a encontrar más artículos sobre cómo acompañar tu ciclo en lugar de pelearte con él.
`,
    seo_title: 'No es pereza, es tu fase lútea',
    seo_description: 'Por qué los días previos al período se sienten tan distintos y cómo acompañarte sin culpa.',
  },
  {
    slug: 'manifiesto-fluir',
    title: 'Manifiesto Fluir: por qué creamos este espacio',
    excerpt: 'Hablamos de salud hormonal sin tabúes, de comer sin culpa, de mover el cuerpo sin castigarlo. Acá te contamos por qué.',
    category_id: 'estilo-de-vida',
    reading_minutes: 3,
    cover_image_url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1600&q=80',
    published_at: daysAgo(20),
    body_md: `Fluir Femenino nació de una intuición incómoda: la mayoría de los espacios de nutrición y bienestar para mujeres están construidos sobre la culpa.

## Lo que no somos

- No vendemos dietas mágicas
- No prometemos transformaciones en 21 días
- No te hablamos desde la perfección
- No te decimos qué hacer con tu cuerpo

## Lo que sí queremos ser

Un lugar para **respirar profundo**. Para leer despacio. Para encontrar herramientas que se ajustan a tu vida (no al revés).

### Tres compromisos

1. **Información basada en evidencia**, contada en lenguaje humano
2. **Recetas reales** con ingredientes accesibles en El Salvador
3. **Acompañamiento sin juicio** — la salud hormonal no es lineal, y nosotras tampoco

> "Tu cuerpo no es un proyecto a corregir."

---

Gracias por estar acá. Si querés ir más profundo, mirá los **servicios uno a uno** o reservá una primera consulta.
`,
    seo_title: 'Manifiesto Fluir Femenino · por qué creamos este espacio',
    seo_description: 'Hablamos de salud hormonal sin tabúes, comer sin culpa, moverse sin castigo. Por qué existe Fluir Femenino.',
  },
];

(async () => {
  for (const p of posts) {
    const payload = {
      ...p,
      published: true,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await sb
      .from('posts')
      .upsert(payload, { onConflict: 'slug' })
      .select('id, slug, title')
      .single();
    if (error) console.log('[x]', p.slug, '→', error.message);
    else console.log('[ok]', data.title, '→ /fluir-femenino/articulos/' + data.slug);
  }
  console.log('\nDone.');
})();
