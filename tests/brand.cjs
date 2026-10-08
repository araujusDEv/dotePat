'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const check = require('./start-check.cjs');
check('Appet em todas as paginas e arquivos publicos', async () => {
  const root = path.resolve(__dirname, '..');
  const pages = fs.readdirSync(root).filter(name => name.endsWith('.html'));
  for (const page of pages) {
    const response = await fetch('http://127.0.0.1:3170/' + page);
    assert.equal(response.status, 200, page);
    const html = await response.text();
    const visibleText = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ');
    assert.doesNotMatch(visibleText, /adota\s*pet/i, page + ': marca antiga fragmentada');
    assert.doesNotMatch(html, /adotapet/i, page + ': referencia antiga');
    assert.match(html, /<title>[^<]*Appet/, page + ': titulo');
    for (const match of html.matchAll(/(?:src|href)="((?:js|css)\/[^"?]+)(?:\?[^" ]*)?"/g)) {
      assert.ok(fs.existsSync(path.join(root, match[1])), page + ': arquivo ausente ' + match[1]);
    }
  }
  for (const name of ['logo-full.png','logo-icon.png','social-preview.png']) {
    assert.equal((await fetch('http://127.0.0.1:3170/img/' + name)).status,404,name);
  }
  for (const name of ['login.html','registro.html']) {
    const html=fs.readFileSync(path.join(root,name),'utf8');
    assert.match(html, /App<em>et<\/em>/, name);
  }
  console.log('OK — '+pages.length+' paginas: titulos, marca fragmentada, referencias e imagens antigas.');
}).catch(error=>{console.error(error);process.exitCode=1;});
