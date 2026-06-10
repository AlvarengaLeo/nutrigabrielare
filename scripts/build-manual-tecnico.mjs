// Regenera docs/manuales/manual-tecnico.html desde manual-tecnico.md
// con el diseño brandeado de los demás manuales.
// Uso: node scripts/build-manual-tecnico.mjs
import { readFileSync, writeFileSync } from 'fs';
import { marked } from 'marked';

const SRC = 'docs/manuales/manual-tecnico.md';
const OUT = 'docs/manuales/manual-tecnico.html';

const md = readFileSync(SRC, 'utf8');

// Slugger estilo GitHub para que funcionen los anchors del índice
function slug(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-');
}

const renderer = new marked.Renderer();
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const raw = tokens.map((t) => t.raw ?? '').join('');
  return `<h${depth} id="${slug(raw)}">${text}</h${depth}>\n`;
};

marked.setOptions({ renderer, gfm: true, breaks: false });

let body = marked.parse(md);

// Quitar los <hr> separadores (las cards ya separan visualmente)
body = body.replace(/<hr\s*\/?>/g, '');

// Partir por <h2> y envolver cada sección en una card
const parts = body.split(/(?=<h2 )/);
const intro = parts.shift() ?? ''; // título h1 + blockquote de metadatos
const cards = parts.map((p) => `<section class="card">\n${p}\n</section>`).join('\n');

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Manual Técnico · Nutrigabrielare</title>
<link rel="icon" href="manual-usuario/img/logo.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Outfit:wght@300;400;600&family=Cormorant+Garamond:ital@1&display=swap" rel="stylesheet" />
<style>
  :root{
    --rose:#EE7699; --rose-deep:#D6517B; --mist:#FDF1F4; --soft:#FBE4EB;
    --ink:#3A1A22; --ink-soft:#6A3E48; --ink-mute:#8A6068; --line:#F7D7DE;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--mist);color:var(--ink);font-family:'Outfit',sans-serif;line-height:1.65;font-size:15.5px}
  .wrap{max-width:920px;margin:0 auto;padding:0 24px 80px}
  header.cover{text-align:center;padding:72px 24px 40px}
  header.cover img{width:84px;height:84px;display:block;margin:0 auto 16px}
  header.cover .brand{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:28px}
  header.cover h1{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:44px;margin:18px 0 6px;letter-spacing:-.02em}
  header.cover h1 em{font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:400;color:var(--rose-deep)}
  .divider{width:56px;height:4px;background:var(--rose);border-radius:99px;margin:22px auto}

  .intro{background:#fff;border:1px solid var(--line);border-radius:24px;padding:30px 44px;margin:0 0 26px}
  .intro h1{display:none}
  .intro blockquote{margin:0 0 6px;border-left:4px solid var(--rose);background:var(--mist);border-radius:12px;padding:14px 18px;color:var(--ink-soft)}
  .intro blockquote p{margin:4px 0}

  section.card{background:#fff;border:1px solid var(--line);border-radius:24px;padding:36px 44px;margin:26px 0;overflow-x:auto}
  h2{font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:25px;margin:0 0 12px;letter-spacing:-.01em}
  h3{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:18px;margin:30px 0 8px}
  h3::before{content:"";display:inline-block;width:10px;height:10px;border-radius:99px;background:var(--rose);margin-right:10px}
  h4{font-family:'Plus Jakarta Sans',sans-serif;font-weight:700;font-size:15.5px;margin:22px 0 6px;color:var(--rose-deep)}
  p{margin:10px 0;color:var(--ink-soft)}
  strong{color:var(--ink)}
  a{color:var(--rose-deep)}
  ul,ol{color:var(--ink-soft);padding-left:24px}
  li{margin:5px 0}
  blockquote{border-left:4px solid var(--rose);background:var(--mist);border-radius:12px;padding:12px 18px;margin:14px 0;color:var(--ink-soft)}
  blockquote p{margin:4px 0}

  table{width:100%;border-collapse:collapse;margin:14px 0;font-size:14px}
  th{font-family:'Plus Jakarta Sans',sans-serif;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:var(--rose-deep);padding:9px 11px;border-bottom:2px solid var(--line);white-space:nowrap}
  td{padding:9px 11px;border-bottom:1px solid var(--line);color:var(--ink-soft);vertical-align:top}

  code{background:var(--soft);color:var(--rose-deep);padding:2px 7px;border-radius:8px;font-size:13px;font-family:Consolas,'Courier New',monospace}
  pre{background:#2A1218;color:#F7D7DE;border-radius:16px;padding:18px 22px;overflow-x:auto;font-size:13px;line-height:1.5}
  pre code{background:none;color:inherit;padding:0;font-size:inherit}

  footer{text-align:center;color:var(--ink-mute);font-size:13px;padding:30px 0 0}
  footer a{color:var(--rose-deep)}
  @media print{body{background:#fff}section.card,.intro{border:none;padding:18px 0;margin:0}pre{white-space:pre-wrap}}
</style>
</head>
<body>

<header class="cover">
  <img src="manual-usuario/img/logo.png" alt="Nutrigabrielare" />
  <div class="brand">Nutrigabrielare</div>
  <div class="divider"></div>
  <h1>Manual <em>Técnico</em></h1>
</header>

<div class="wrap">
<div class="intro">
${intro}
</div>
${cards}
<footer>
  <p>Manual técnico · <strong>nutrigabrielare.com</strong> · Fuente: <code>docs/manuales/manual-tecnico.md</code></p>
  <p>Soporte técnico: <a href="mailto:bryanquezadap@gmail.com">bryanquezadap@gmail.com</a></p>
</footer>
</div>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf8');
console.log(`${OUT} regenerado (${(html.length / 1024).toFixed(0)} KB)`);
