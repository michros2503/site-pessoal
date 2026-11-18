const express = require('express');
const fs = require('fs');
const path = require('path');
const cv = require('./data/curriculo.json');

const app = express();
const PORT = process.env.PORT || 3000;
const lerPosts = () => JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'posts.json'), 'utf8'));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dataBR = (d) => new Date(d + 'T12:00:00').toLocaleDateString('pt-BR');

const pagina = (titulo, corpo, ativo) => `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titulo)} | ${esc(cv.nome)}</title>
<link rel="stylesheet" href="/style.css"></head><body>
<header><a class="marca" href="/">${esc(cv.nome)}</a>
<nav><a href="/" ${ativo === 'cv' ? 'aria-current="page"' : ''}>Currículo</a>
<a href="/blog" ${ativo === 'blog' ? 'aria-current="page"' : ''}>Blog</a></nav></header>
<main>${corpo}</main>
<footer>${esc(cv.nome)} · ${esc(cv.contato.local)}</footer></body></html>`;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const c = cv.contato;
  res.send(pagina('Currículo', `
  <section class="apresentacao"><h1>${esc(cv.nome)}</h1><p class="titulo">${esc(cv.titulo)}</p><p>${esc(cv.resumo)}</p>
  <p class="contato"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a> · <a href="${esc(c.linkedin)}" target="_blank" rel="noopener">LinkedIn</a></p></section>
  <section><h2>Experiência</h2>${cv.experiencias.map((e) => `<article class="item"><h3>${esc(e.cargo)}</h3>
  <p class="meta">${esc(e.empresa)} · ${esc(e.periodo)}</p><p>${esc(e.texto)}</p></article>`).join('')}</section>
  <section><h2>Formação acadêmica</h2>${cv.formacao.map((f) => `<article class="item"><h3>${esc(f.curso)}</h3>
  <p class="meta">${esc(f.instituicao)} · ${esc(f.periodo)}</p></article>`).join('')}</section>
  <section><h2>Habilidades técnicas</h2><ul class="tags">${cv.habilidades.map((h) => `<li>${esc(h)}</li>`).join('')}</ul></section>
  <section><h2>Contato e links</h2><p>E-mail: <a href="mailto:${esc(c.email)}">${esc(c.email)}</a><br>
  LinkedIn: <a href="${esc(c.linkedin)}" target="_blank" rel="noopener">perfil profissional</a></p></section>`, 'cv'));
});

app.get('/blog', (req, res) => {
  const posts = lerPosts().sort((a, b) => b.data.localeCompare(a.data));
  res.send(pagina('Blog', `<h1>Blog</h1>${posts.map((p) => `<article class="item"><h2><a href="/blog/${esc(p.slug)}">${esc(p.titulo)}</a></h2>
  <p class="meta">${dataBR(p.data)}</p><p>${esc(p.resumo)}</p></article>`).join('')}`, 'blog'));
});

app.get('/blog/:slug', (req, res) => {
  const p = lerPosts().find((x) => x.slug === req.params.slug);
  if (!p) return res.status(404).send(pagina('Post não encontrado', '<h1>Post não encontrado</h1><p><a href="/blog">Voltar ao blog</a></p>', 'blog'));
  res.send(pagina(p.titulo, `<article><h1>${esc(p.titulo)}</h1><p class="meta">${dataBR(p.data)}</p>
  ${p.texto.split('\n\n').map((t) => `<p>${esc(t)}</p>`).join('')}<p><a href="/blog">Voltar ao blog</a></p></article>`, 'blog'));
});

app.use((req, res) => res.status(404).send(pagina('Página não encontrada', '<h1>Página não encontrada</h1><p><a href="/">Ir para o currículo</a></p>')));

app.listen(PORT, '0.0.0.0', () => console.log(`Servidor em http://0.0.0.0:${PORT}`));
