/**
 * Comanda Aí — back-end gratuito no Google Planilhas.
 *
 * Como instalar (5 min):
 * 1. Crie uma planilha nova no Google Sheets.
 * 2. Menu Extensões → Apps Script. Apague o conteúdo e cole este arquivo.
 * 3. Clique em Implantar → Nova implantação → tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Autorize, copie a URL que termina em /exec e cole no app em Ajustes.
 * 5. No app, toque em "Enviar catálogo atual para a planilha" (cria a aba Produtos).
 *
 * Abas criadas:
 *  - Produtos: o dono edita preço, estoque, mínimo e insumos aqui. O app baixa com "Baixar produtos".
 *  - Vendas:   uma linha por conta fechada (dia, hora, comanda, total, pagamento).
 *  - Itens:    uma linha por item vendido (ótimo para tabela dinâmica).
 *  - Movimentos: cada baixa de estoque (inclui carvão/essência do narguilé).
 *
 * Coluna "baixa" em Produtos: insumos consumidos por unidade vendida, ex.: carvao:3;essencia:1
 * Deixe "estoque" vazio para itens sem controle próprio (ex.: Narguilé, que só baixa insumos).
 */

const HEAD = {
  Produtos:   ['id','nome','categoria','preco','estoque','minimo','baixa','ativo'],
  Vendas:     ['id','dia','aberta_em','fechada_em','tipo','comanda','itens','subtotal','taxa_servico','desconto','total','pagamento'],
  Itens:      ['venda_id','dia','fechada_em','comanda','produto_id','produto','qtd','preco_tabela','preco_cobrado','subtotal'],
  Movimentos: ['data','venda_id','produto_id','produto','qtd_baixada','estoque_apos'],
};

function sheet_(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(HEAD[name]);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD[name].length).setFontWeight('bold');
  }
  return sh;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  try {
    return json_({ ok: true, produtos: readProducts_() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // evita dois celulares baixando estoque ao mesmo tempo
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action === 'vendas') return json_(saveSales_(body.vendas || []));
    if (body.action === 'setup') return json_(writeProducts_(body.produtos || []));
    return json_({ ok: false, error: 'ação desconhecida' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function readProducts_() {
  const sh = sheet_('Produtos');
  const rows = sh.getDataRange().getValues().slice(1).filter(r => r[0] !== '');
  return rows.map(r => ({
    id: String(r[0]),
    nome: String(r[1]),
    cat: String(r[2] || 'Cervejas'),
    preco: Number(r[3]) || 0,
    estoque: r[4] === '' ? null : Number(r[4]),
    minimo: r[5] === '' ? null : Number(r[5]),
    baixa: String(r[6] || '').split(';').map(s => s.trim()).filter(Boolean).map(s => {
      const [id, q] = s.split(':');
      return { id: id.trim(), qtd: Number(q) || 1 };
    }),
    ativo: r[7] === '' ? true : (r[7] === true || String(r[7]).toLowerCase() === 'sim' || String(r[7]).toUpperCase() === 'TRUE'),
  }));
}

function writeProducts_(produtos) {
  const sh = sheet_('Produtos');
  sh.clearContents();
  sh.appendRow(HEAD.Produtos);
  const rows = produtos.map(p => [
    p.id, p.nome, p.cat, p.preco,
    p.estoque == null ? '' : p.estoque,
    p.minimo == null ? '' : p.minimo,
    (p.baixa || []).map(b => b.id + ':' + b.qtd).join(';'),
    p.ativo ? 'sim' : 'não',
  ]);
  if (rows.length) sh.getRange(2, 1, rows.length, HEAD.Produtos.length).setValues(rows);
  sh.getRange(1, 1, 1, HEAD.Produtos.length).setFontWeight('bold');
  return { ok: true, total: rows.length };
}

function saveSales_(vendas) {
  const shV = sheet_('Vendas'), shI = sheet_('Itens'), shM = sheet_('Movimentos'), shP = sheet_('Produtos');

  // ignora vendas já gravadas (o app pode reenviar se a internet cair no meio)
  const existing = new Set(shV.getRange(1, 1, Math.max(shV.getLastRow(), 1), 1).getValues().flat().map(String));
  const novas = vendas.filter(v => !existing.has(String(v.id)));
  if (!novas.length) return { ok: true, gravadas: 0 };

  const pData = shP.getDataRange().getValues();
  const idx = {};
  pData.forEach((r, i) => { if (i > 0) idx[String(r[0])] = i; });

  const tz = Session.getScriptTimeZone();
  const fmt = ts => Utilities.formatDate(new Date(ts), tz, 'dd/MM/yyyy HH:mm');
  const vRows = [], iRows = [], mRows = [];

  novas.forEach(v => {
    vRows.push([v.id, v.dia, fmt(v.abertaEm), fmt(v.fechadaEm), v.tipo, v.nome,
      v.itens.map(i => i.qtd + 'x ' + i.nome).join(', '), v.subtotal, v.taxa, v.desconto || 0, v.total, v.pagamento]);
    v.itens.forEach(i => iRows.push([v.id, v.dia, fmt(v.fechadaEm), v.nome, i.pid, i.nome, i.qtd, i.precoOrig != null ? i.precoOrig : i.preco, i.preco, i.qtd * i.preco]));
    Object.keys(v.baixas || {}).forEach(pid => {
      const q = v.baixas[pid], row = idx[pid];
      let after = '';
      if (row !== undefined && pData[row][4] !== '') {
        pData[row][4] = Number(pData[row][4]) - q;
        after = pData[row][4];
      }
      mRows.push([fmt(v.fechadaEm), v.id, pid, row !== undefined ? pData[row][1] : pid, q, after]);
    });
  });

  append_(shV, vRows); append_(shI, iRows); append_(shM, mRows);
  if (pData.length > 1) shP.getRange(2, 5, pData.length - 1, 1).setValues(pData.slice(1).map(r => [r[4]]));
  return { ok: true, gravadas: novas.length };
}

function append_(sh, rows) {
  if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
}
