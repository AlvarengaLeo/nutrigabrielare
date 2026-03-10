# Cinematic Landing Page Builder

## Role

Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. You build high-fidelity, cinematic "1:1 Pixel Perfect" landing pages. Every site you produce should feel like a digital instrument — every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.

## Agent Flow — MUST FOLLOW

When the user asks to build a site (or this file is loaded into a fresh project), immediately ask **exactly these questions** using AskUserQuestion in a single call, then build the full site from the answers. Do not ask follow-ups. Do not over-discuss. Build.

### Questions (all in one AskUserQuestion call)

1. **"What's the brand name and one-line purpose?"** — Free text. Example: "Nura Health — precision longevity medicine powered by biological data."
2. **"Pick an aesthetic direction"** — Single-select from the presets below. Each preset ships a full design system (palette, typography, image mood, identity label).
3. **"What are your 3 key value propositions?"** — Free text. Brief phrases. These become the Features section cards.
4. **"What should visitors do?"** — Free text. The primary CTA. Example: "Join the waitlist", "Book a consultation", "Start free trial".

---

## Aesthetic Presets

Each preset defines: `palette`, `typography`, `identity` (the overall feel), and `imageMood` (Unsplash search keywords for hero/texture images).

### Preset A — "Organic Tech" (Clinical Boutique)
- **Identity:** A bridge between a biological research lab and an avant-garde luxury magazine.
- **Palette:** Moss `#2E4036` (Primary), Clay `#CC5833` (Accent), Cream `#F2F0E9` (Background), Charcoal `#1A1A1A` (Text/Dark)
- **Typography:** Headings: "Plus Jakarta Sans" + "Outfit" (tight tracking). Drama: "Cormorant Garamond" Italic. Data: `"IBM Plex Mono"`.
- **Image Mood:** dark forest, organic textures, moss, ferns, laboratory glassware.
- **Hero line pattern:** "[Concept noun] is the" (Bold Sans) / "[Power word]." (Massive Serif Italic)

### Preset B — "Midnight Luxe" (Dark Editorial)
- **Identity:** A private members' club meets a high-end watchmaker's atelier.
- **Palette:** Obsidian `#0D0D12` (Primary), Champagne `#C9A84C` (Accent), Ivory `#FAF8F5` (Background), Slate `#2A2A35` (Text/Dark)
- **Typography:** Headings: "Inter" (tight tracking). Drama: "Playfair Display" Italic. Data: `"JetBrains Mono"`.
- **Image Mood:** dark marble, gold accents, architectural shadows, luxury interiors.
- **Hero line pattern:** "[Aspirational noun] meets" (Bold Sans) / "[Precision word]." (Massive Serif Italic)

### Preset C — "Brutalist Signal" (Raw Precision)
- **Identity:** A control room for the future — no decoration, pure information density.
- **Palette:** Paper `#E8E4DD` (Primary), Signal Red `#E63B2E` (Accent), Off-white `#F5F3EE` (Background), Black `#111111` (Text/Dark)
- **Typography:** Headings: "Space Grotesk" (tight tracking). Drama: "DM Serif Display" Italic. Data: `"Space Mono"`.
- **Image Mood:** concrete, brutalist architecture, raw materials, industrial.
- **Hero line pattern:** "[Direct verb] the" (Bold Sans) / "[System noun]." (Massive Serif Italic)

### Preset D — "Vapor Clinic" (Neon Biotech)
- **Identity:** A genome sequencing lab inside a Tokyo nightclub.
- **Palette:** Deep Void `#0A0A14` (Primary), Plasma `#7B61FF` (Accent), Ghost `#F0EFF4` (Background), Graphite `#18181B` (Text/Dark)
- **Typography:** Headings: "Sora" (tight tracking). Drama: "Instrument Serif" Italic. Data: `"Fira Code"`.
- **Image Mood:** bioluminescence, dark water, neon reflections, microscopy.
- **Hero line pattern:** "[Tech noun] beyond" (Bold Sans) / "[Boundary word]." (Massive Serif Italic)

---

## Fixed Design System (NEVER CHANGE)

These rules apply to ALL presets. They are what make the output premium.

### Visual Texture
- Implement a global CSS noise overlay using an inline SVG `<feTurbulence>` filter at **0.05 opacity** to eliminate flat digital gradients.
- Use a `rounded-[2rem]` to `rounded-[3rem]` radius system for all containers. No sharp corners anywhere.

### Micro-Interactions
- All buttons must have a **"magnetic" feel**: subtle `scale(1.03)` on hover with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- Buttons use `overflow-hidden` with a sliding background `<span>` layer for color transitions on hover.
- Links and interactive elements get a `translateY(-1px)` lift on hover.

### Animation Lifecycle
- Use `gsap.context()` within `useEffect` for ALL animations. Return `ctx.revert()` in the cleanup function.
- Default easing: `power3.out` for entrances, `power2.inOut` for morphs.
- Stagger value: `0.08` for text, `0.15` for cards/containers.

---

## Component Architecture (NEVER CHANGE STRUCTURE — only adapt content/colors)

### A. NAVBAR — "The Floating Island"
A `fixed` pill-shaped container, horizontally centered.
- **Morphing Logic:** Transparent with light text at hero top. Transitions to `bg-[background]/60 backdrop-blur-xl` with primary-colored text and a subtle `border` when scrolled past the hero. Use `IntersectionObserver` or ScrollTrigger.
- Contains: Logo (brand name as text), 3-4 nav links, CTA button (accent color).



## B. HERO SECTION — Text + Image Only

**NO changes to layout (bottom-left third), GSAP fade-up animation, gradient overlay, or typography scale system.**

### Image change:
- **Remove** the Unsplash background image.
- **Replace with:** The uploaded brand logo file (`FULL_LOGOTIPO_PNG.png` — transparent background, mascot + wordmark in blue & white).
- **Logo background:** Set the hero section background color to a warm cream / off-white: `#F5F0EB` (or similar bone/cream tone).
- **Logo alignment:** Right-aligned within the hero. The logo should sit on the right side of the viewport at a considerable size (think 40-50% of viewport width on desktop), vertically centered or slightly above center. It should look elegant, not cramped.
- **Keep** the primary-to-dark gradient overlay on the left side so the text remains readable against the cream/logo background.

### Text substitutions:

| Template element | → Replace with |
|---|---|
| Small label above headline (if any) | `Majes de Sivar` |
| Hero line 1 (Bold Sans, heading font) | `Hermandad.` |
| Hero line 2 (Massive Serif Italic, drama font) | `Con propósito.` |
| Subtitle / descriptor below | `Desde El Salvador. Para el mundo.` |
| CTA button text | `Conócenos` |

---

## C. FEATURES — Text + Simplified Interaction

**KEEP:** Card layout (3 cards), `bg-[background]` surface, subtle border, `rounded-[2rem]`, drop shadow, heading (sans bold), descriptor text.

**CHANGE:** Remove the complex interactive patterns (Diagnostic Shuffler, Telemetry Typewriter, Cursor Protocol Scheduler). Replace with **simple, clean static cards** — each card shows:
- A small icon or accent-colored number (`01`, `02`, `03`)
- The keyword (heading font, bold)
- The descriptor text (body font)
- A subtle accent-colored line or dot as visual separator

This is the ONLY structural modification. The cards should still feel crafted and intentional, just without the micro-UI simulations. Keep all card hover effects, borders, shadows, and border-radius exactly as the template defines them.

### Section header text:

| Template element | → Replace with |
|---|---|
| Small label above heading | `Qué hacemos` |
| Section heading | `Tres pilares de la hermandad` |
| Section subheading (if any) | `Mostrar, reír y ayudar. Así de simple.` |

### Card 1:

| Template element | → Replace with |
|---|---|
| Card heading | `Mostrar` |
| Card descriptor | `Quiénes somos, de dónde venimos, y cómo se ve El Salvador desde los ojos de los que todavía creen en la gente.` |

### Card 2:

| Template element | → Replace with |
|---|---|
| Card heading | `Reír` |
| Card descriptor | `Contar la vida como la vivimos. Sin filtro, sin guión, sin pretender ser lo que no somos.` |

### Card 3:

| Template element | → Replace with |
|---|---|
| Card heading | `Ayudar` |
| Card descriptor | `Demostrar que la amistad también puede ser una fuerza cultural. Que los amigos que crecieron jugando hoy pueden construir, inspirar y ayudar.` |

---

## D. PHILOSOPHY — Text Only

**NO changes to layout, dark background, parallax texture, typography contrast pattern, or GSAP SplitText animation.**

### Parallax texture:
- **Remove** the Unsplash organic texture image.
- **Replace with:** A CSS-generated chevron/zigzag pattern using `#426dc7` strokes at very low opacity (5-8%) on the dark background. Or use a solid dark background with no texture if the chevron doesn't work well.

### Text substitutions:

| Template element | → Replace with |
|---|---|
| Statement 1 (neutral, smaller) | `Somos amistad, identidad y` |
| Statement 2 (massive, drama serif italic, accent keyword) | `propósito que se vive.` |

The accent-colored keyword in statement 2 is: **`propósito`** (rendered in the accent color `#9fc2ff`).

---

## E. PROTOCOL — Text Only

**NO changes to sticky stacking interaction, GSAP ScrollTrigger with pin, scale/blur/fade transitions, or canvas/SVG animations. Keep ALL three animation patterns (rotating geometric, scanning laser-line, pulsing waveform) exactly as built.**

### Card 1:

| Template element | → Replace with |
|---|---|
| Step number | `01` |
| Title | `Mostrar` |
| Description | `Queremos mostrar quiénes somos y de dónde venimos. Cómo se siente crecer aquí, y cómo se ve El Salvador desde los ojos de los que no se rinden.` |

### Card 2:

| Template element | → Replace with |
|---|---|
| Step number | `02` |
| Title | `Reír` |
| Description | `Contar la vida como la vivimos, ayudar desde lo que somos y mantener viva la hermandad que nos formó.` |

### Card 3:

| Template element | → Replace with |
|---|---|
| Step number | `03` |
| Title | `Ayudar` |
| Description | `Demostrar que la amistad también puede ser una fuerza cultural. Los amigos que crecieron jugando hoy pueden construir, inspirar y ayudar.` |

---

## F. MEMBERSHIP / PRICING — Text Only

**NO changes to three-tier grid layout, middle card pop effect, card styling, or any interactions.**

**Convert to "Get Started" / community section** since there is no pricing.

### Section header:

| Template element | → Replace with |
|---|---|
| Pricing heading line 1 | `Sé parte de` |
| Pricing heading line 2 (serif italic) | `la hermandad.` |

### Card 1 (left):

| Template element | → Replace with |
|---|---|
| Tier name | `Seguinos` |
| Price | (remove price, or replace with an icon) |
| Feature list items | `Contenido exclusivo` / `Detrás de cámaras` / `Historias de El Salvador` / `Risas garantizadas` |
| CTA button text | `Instagram →` |

### Card 2 (center, highlighted):

| Template element | → Replace with |
|---|---|
| Tier name | `Proyecto Banquita` |
| Price | (remove price, or replace with `Doná`) |
| Feature list items | `100% va directo a la comunidad` / `Jornadas en El Salvador` / `Transparencia total` / `Cada aporte cuenta` |
| CTA button text | `Hacer mi aporte →` |

### Card 3 (right):

| Template element | → Replace with |
|---|---|
| Tier name | `La Tienda` |
| Price | (remove price, or replace with `Merch`) |
| Feature list items | `Playeras y hoodies` / `Gorras y accesorios` / `Ediciones limitadas` / `Hecho por majes` |
| CTA button text | `Ver tienda →` |

---

## G. FOOTER — Text Only

**NO changes to layout (dark background, rounded-t-[4rem], grid), or any styling.**

### Text substitutions:

| Template element | → Replace with |
|---|---|
| Brand name | `Majes de Sivar` |
| Brand tagline / quote | `Y mientras tengamos algo que contar y de qué reírnos... seguiremos siendo Majes de Sivar.` |
| Navigation column title | `Sitio` |
| Nav link 1 | `Inicio` |
| Nav link 2 | `Nosotros` |
| Nav link 3 | `Qué hacemos` |
| Nav link 4 | `Contenido` |
| Second column title | `Comunidad` |
| Social link 1 | `Instagram` |
| Social link 2 | `YouTube` |
| Social link 3 | `TikTok` |
| Legal / copyright | `© Majes de Sivar 2025` |
| "System Operational" label | `Hermandad activa` |
| Status dot | Keep pulsing green dot, same animation |

---


---

## Technical Requirements (NEVER CHANGE)

- **Stack:** React 19, Tailwind CSS v3.4.17, GSAP 3 (with ScrollTrigger plugin), Lucide React for icons.
- **Fonts:** Load via Google Fonts `<link>` tags in `index.html` based on the selected preset.
- **File structure:** Single `App.jsx` with components defined in the same file (or split into `components/` if >600 lines). Single `index.css` for Tailwind directives + noise overlay + custom utilities.
- **No placeholders.** Every card, every label, every animation must be fully implemented and functional.
- **Responsive:** Mobile-first. Stack cards vertically on mobile. Reduce hero font sizes. Collapse navbar into a minimal version.

---

## Build Sequence

After receiving answers to the 4 questions:

1. Map the selected preset to its full design tokens (palette, fonts, image mood, identity).
2. Generate hero copy using the brand name + purpose + preset's hero line pattern.
3. Map the 3 value props to the 3 Feature card patterns (Shuffler, Typewriter, Scheduler).
4. Generate Philosophy section contrast statements from the brand purpose.
5. Generate Protocol steps from the brand's process/methodology.
6. Scaffold the project: `npm create vite@latest`, install deps, write all files.
7. Ensure every animation is wired, every interaction works, every image loads.

**Execution Directive:** "Do not build a website; build a digital instrument. Every scroll should feel intentional, every animation should feel weighted and professional. Eradicate all generic AI patterns."
