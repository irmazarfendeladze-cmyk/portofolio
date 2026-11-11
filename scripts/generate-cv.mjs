// Start Chrome with --remote-debugging-port=9223, then run: node scripts/generate-cv.mjs
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const headings = {
  ka: { summary: 'ჩემ შესახებ', experience: 'გამოცდილება და განვითარება', skills: 'ტექნიკური უნარები', projects: 'პროექტები' },
  en: { summary: 'Profile', experience: 'Experience & development', skills: 'Technical skills', projects: 'Selected projects' },
  it: { summary: 'Profilo', experience: 'Esperienza e formazione', skills: 'Competenze tecniche', projects: 'Progetti selezionati' }
};
const projects = [
  ['marmenio', 'https://irmazarfendeladze-cmyk.github.io/-3/'],
  ['marmenio2', 'https://irmazarfendeladze-cmyk.github.io/Figma-Marmerino-2-/'],
  ['shop', 'https://onlineshop-ashy.vercel.app/'],
  ['trainTicket', 'https://train-ticket2.vercel.app/search']
];

const target = await (await fetch('http://localhost:9223/json/new?about:blank', { method: 'PUT' })).json();
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let id = 0;
const pending = new Map();
ws.onmessage = ({ data }) => {
  const message = JSON.parse(data);
  if (!message.id) return;
  const handler = pending.get(message.id);
  pending.delete(message.id);
  if (message.error) handler?.reject(new Error(JSON.stringify(message.error)));
  else handler?.resolve(message.result);
};
function call(method, params = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
}

try {
  await call('Page.enable');
  for (const language of ['ka', 'en', 'it']) {
    const dictionary = JSON.parse(await fs.readFile(path.join(root, `src/assets/i18n/${language}.json`), 'utf8'));
    const labels = headings[language];
    const html = `<!doctype html><html lang="${language}"><head><meta charset="utf-8"><title>${escape(dictionary.footer.title)} — CV</title>
      <style>
        @page { size: A4; margin: 16mm 18mm; }
        * { box-sizing: border-box; }
        body { margin: 0; color: #182a36; font: 10pt/1.45 Arial, 'Sylfaen', sans-serif; }
        h1 { font-size: 25pt; line-height: 1.2; margin: 0 0 3mm; }
        .role { font-size: 12pt; font-weight: bold; color: #126b70; margin: 0 0 4mm; }
        header { border-bottom: 2px solid #126b70; padding-bottom: 5mm; }
        .contacts { font-size: 9pt; display: flex; gap: 2mm 5mm; flex-wrap: wrap; }
        a { color: #125e76; text-decoration: none; }
        h2 { font-size: 11pt; margin: 5mm 0 2mm; color: #126b70; }
        p { margin: 0; }
        ul { margin: 0; padding-left: 5mm; }
        .project { margin: 0 0 3mm; break-inside: avoid; }
        .project a { font-weight: bold; }
        .project p { font-size: 9.5pt; }
        .skills { font-size: 9.5pt; }
      </style></head><body>
      <header><h1>${escape(dictionary.footer.title)}</h1><p class="role">${escape(dictionary.footer.role)}</p>
      <div class="contacts"><a href="mailto:irma.zarf.endeladze@gmail.com">irma.zarf.endeladze@gmail.com</a>
      <a href="tel:+393889817989">+39 388 981 7989</a>
      <a href="https://github.com/irmazarfendeladze-cmyk">github.com/irmazarfendeladze-cmyk</a></div></header>
      <section><h2>${labels.summary}</h2><p>${escape(dictionary.about.intro)}</p></section>
      <section><h2>${labels.experience}</h2><ul>${dictionary.about.items.slice(0, 4).map(item => `<li>${escape(item)}</li>`).join('')}</ul></section>
      <section><h2>${labels.skills}</h2><p class="skills">${dictionary.skills.items.map(escape).join(' · ')}</p></section>
      <section><h2>${labels.projects}</h2>${projects.map(([key, url]) => `<article class="project"><a href="${escape(url)}">${escape(dictionary.projects[key].title)}</a><p>${escape(dictionary.projects[key].description)}</p></article>`).join('')}</section>
      </body></html>`;
    const { frameTree } = await call('Page.getFrameTree');
    await call('Page.setDocumentContent', { frameId: frameTree.frame.id, html });
    await call('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
    // Keep an HTML preview outside the assets directory for reviewing and editing the CV.
    const previewDirectory = path.join(root, 'tmp/cv');
    await fs.mkdir(previewDirectory, { recursive: true });
    await fs.writeFile(path.join(previewDirectory, `${language}.html`), html);
    const pdf = await call('Page.printToPDF', { printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false, generateTaggedPDF: true });
    const filename = `Irma-Endeladze-CV${language === 'en' ? '' : `-${language}`}.pdf`;
    const data = Buffer.from(pdf.data, 'base64');
    await fs.writeFile(path.join(root, 'src/assets/files', filename), data);
    console.log(`${filename}: ${data.length} bytes`);
  }
} finally {
  ws.close();
  await fetch(`http://localhost:9223/json/close/${target.id}`);
}
