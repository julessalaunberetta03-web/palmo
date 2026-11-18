(() => {
  'use strict';
  const I = {
    home: '<path d="M4 4h7v7H4zM14 4h6v4h-6zM14 11h6v2h-6zM14 16h6v4h-6zM4 14h7v6H4z"/>',
    pat: '<path d="M5 20v-7M12 20V5M19 20v-10"/>',
    bud: '<path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zM8 9l1.5 1.5L12 8M8 15l1.5 1.5L12 14M15 9.5h3M15 15.5h3"/>',
    ana: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    inv: '<path d="M4 15c2-6 7-9 15-10 0 8-4 13-10 14M4 20c3-1 5-3 7-6"/>',
    eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>',
    off: '<path d="M4 4l16 16M9.5 5.9A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-3 3.7M6.3 7.7A15 15 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.6-.7"/>',
    down: '<path d="M6 9l6 6 6-6"/>', list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    pie: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>', plus: '<path d="M12 5v14M5 12h14"/>', sync: '<path d="M4 12a8 8 0 0 1 13.7-5.6L20 9M20 4v5h-5M20 12a8 8 0 0 1-13.7 5.6L4 15M4 20v-5h5"/>',
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
    scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2M8 9h8M8 12h8M8 15h5"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${I[k]}</svg>`;
  const TABS = [['accueil', 'Accueil', 'home'], ['patrimoine', 'Patrimoine', 'pat'], ['budget', 'Budget', 'bud'], ['analyses', 'Analyses', 'ana'], ['placements', 'Placements', 'inv']];
  const IN = { ventes: 'Ventes', clients: 'Clients', salaire: 'Salaire', aide: 'Aide familiale', recupere: 'Chargebacks récupérés', autre_in: 'Autres entrées' };
  const OUT = { remboursements: 'Remboursements', chargebacks: 'Chargebacks', frais: 'Frais de paiement', agent: 'Agent et produits', pub: 'Publicité', outils: 'Outils et abonnements', logement: 'Logement', transport: 'Transport', courses: 'Courses', loisirs: 'Loisirs', impots: 'Impôts', autre_out: 'Autres dépenses' };
  const CAT = { ...IN, ...OUT, virement: 'Virement interne' };
  const ACC = { courant: 'Comptes courants', epargne: 'Épargne', invest: 'Investissements', crypto: 'Crypto', immo: 'Immobilier', autre: 'Autres actifs', dette: 'Dettes' };
  const FREQ = { mois: 'par mois', semaine: 'par semaine', an: 'par an' };
  const RANGES = { '7J': 7, '1M': 30, '3M': 91, '6M': 182, 'YTD': -1, '1A': 365, 'TOUT': 0 };
  const DEFAULT_BRANDS = [{ id: 'perso', name: 'Perso', color: '#F3EDE3' }];
  const COLORS = ['#E8C547', '#A8F85F', '#7CC7F2', '#F3EDE3', '#F2A0C4', '#B9A4F5', '#FFA866'];

  const $ = (s) => document.querySelector(s);
  const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const dayDiff = (a, b) => Math.round((parse(b) - parse(a)) / 864e5);
  const today = () => iso(new Date());
  const validDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '') && iso(parse(s)) === s;
  const dShort = (s) => parse(s).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  const dLong = (s) => parse(s).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
  const fmt = (c) => eur.format((c || 0) / 100).replace('-', '−');
  const m = (c) => `<span class="m">${fmt(c)}</span>`;
  const orig = (a, cur) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol' }).format(a).replace('-', '−');
  const sgn = (c) => (c > 0 ? '+' : '') + fmt(c);
  const num = (n) => String(n).replace('.', ',');
  function parseAmount(raw, neg) {
    const s = String(raw || '').replace(/[\s  €$]/g, '').replace(',', '.').replace('−', '-');
    if (!/^-?\d+(\.\d{1,2})?$/.test(s)) return null;
    const n = Number(s);
    return Number.isFinite(n) && (neg || n > 0) ? n : null;
  }
  const toEur = (a, cur, fx) => { const c = Math.round(a * 100); return cur === 'USD' ? Math.round(c / fx) : c; };
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* facultatif */ } } };

  const S = {
    tab: 'accueil', scope: 'all', custom: [], ready: false, msg: 'Chargement de tes comptes…', hidden: store.get('hide') === '1',
    range: '1M', period: { from: '2026-11-09', to: '2026-11-16' }, flow: 'out', showAll: false, q: '', closed: {}, valMode: 'val', pickDay: null, syncing: false, notes: [],
    brands: DEFAULT_BRANDS, settings: { fx: 1.12, feeRate: 0, roasBE: 1 }, tx: [], accounts: [], snapshots: [], recurring: [], goals: [], budgets: [], form: null,
  };
  let book = null, assets = null;
  const col = (n) => book.collection(n);
  const brand = (id) => S.brands.find((b) => b.id === id) || { id, name: id, color: '#888' };
  const scopes = () => ['all', ...S.brands.map((b) => b.id), ...(S.custom.length > 1 ? ['custom'] : [])];
  const sel = () => (S.scope === 'all' ? S.brands.map((b) => b.id) : S.scope === 'custom' ? S.custom : [S.scope]);
  const scopeName = () => (S.scope === 'all' ? 'Tout' : S.scope === 'custom' ? S.custom.map((id) => brand(id).name).join(' + ') : brand(S.scope).name);
  const defaultBrand = () => (S.scope === 'all' || S.scope === 'custom' ? S.brands[0].id : S.scope);

  // Calculs
  const dailyRate = (r) => (r.freq === 'semaine' ? r.eurCents / 7 : r.freq === 'an' ? r.eurCents / 365 : r.eurCents * 12 / 365);
  function recIn(r, from, to) {
    const a = r.start > from ? r.start : from;
    let b = to; if (r.end && addDays(r.end, -1) < b) b = addDays(r.end, -1);
    return a > b ? 0 : (dayDiff(a, b) + 1) * dailyRate(r);
  }
  function flows(from, to, ids) {
    const set = new Set(ids || sel()), res = { in: 0, out: 0, rec: 0, byCat: {}, items: [], recs: [] };
    S.tx.forEach((t) => {
      if (t.date < from || t.date > to) return;
      if (t.type === 'transfer') {
        const a = set.has(t.brand), b = set.has(t.toBrand);
        if (a && b) return;
        if (b) { res.in += t.eurCents; res.byCat.salaire = (res.byCat.salaire || 0) + t.eurCents; res.items.push({ ...t, flow: 'in' }); }
        else if (a) res.items.push({ ...t, flow: 'move' });
        return;
      }
      if (!set.has(t.brand)) return;
      res[t.type] += t.eurCents; res.byCat[t.cat] = (res.byCat[t.cat] || 0) + t.eurCents; res.items.push({ ...t, flow: t.type });
    });
    S.recurring.filter((r) => set.has(r.brand)).forEach((r) => { const v = Math.round(recIn(r, from, to)); if (v > 0) { res.rec += v; res.recs.push({ ...r, value: v }); } });
    res.profit = res.in - res.out - res.rec;
    return res;
  }
  function netWorth(date, ids) {
    const set = new Set(ids || sel());
    return S.accounts.filter((a) => set.has(a.brand)).reduce((sum, a) => sum + acctValue(a, date), 0);
  }
  function acctValue(a, date) {
    const last = S.snapshots.filter((s) => s.account === a.id && s.date <= date).sort((x, y) => x.date.localeCompare(y.date)).pop();
    const v = last ? last.eurCents : 0;
    return a.type === 'dette' ? -Math.abs(v) : v;
  }
  function rangeStart() {
    const t = today(), first = S.snapshots.map((s) => s.date).sort()[0] || t, d = RANGES[S.range];
    const s = d === 0 ? first : d === -1 ? `${t.slice(0, 4)}-01-01` : addDays(t, -d);
    return s < first ? first : s;
  }
  function series() {
    const t = today(), start = rangeStart(), n = Math.max(1, dayDiff(start, t)), step = Math.max(1, Math.ceil(n / 90)), pts = [];
    for (let i = 0; i <= n; i += step) { const d = addDays(start, i); pts.push({ d, v: netWorth(d) }); }
    if (pts[pts.length - 1].d !== t) pts.push({ d: t, v: netWorth(t) });
    return pts;
  }
  const rangeLabel = () => `${dShort(S.period.from)} au ${dShort(S.period.to)}`;

  // Éléments partagés
  function chartHtml(pts) {
    const vals = pts.map((p) => p.v), lo = Math.min(...vals), hi = Math.max(...vals), span = hi - lo || 1, n = Math.max(1, pts.length - 1);
    const X = (i) => (i / n) * 100, Y = (v) => 20 + (1 - (v - lo) / span) * 58;
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(2)} ${Y(p.v).toFixed(2)}`).join(' ') + (pts.length === 1 ? ' L100 ' + Y(pts[0].v).toFixed(2) : '');
    return `<div class="chartbox" id="chart" data-noswipe aria-label="Évolution du patrimoine"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="gf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A8F85F" stop-opacity=".26"/><stop offset="1" stop-color="#A8F85F" stop-opacity="0"/></linearGradient></defs><path d="${line} L100 100 L0 100 Z" fill="url(#gf)"/><path d="${line}" fill="none" stroke="#A8F85F" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg><span class="tag m" style="top:6%">${fmt(hi)}</span>${hi !== lo ? `<span class="tag m" style="bottom:6%">${fmt(lo)}</span>` : ''}<i class="cross" id="cross" hidden></i><div class="tip" id="tip" hidden></div></div>`;
  }
  function bindChart(pts) {
    const box = $('#chart'); if (!box) return;
    const cross = $('#cross'), tip = $('#tip');
    const show = (e) => {
      const r = box.getBoundingClientRect(), x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), i = Math.round(x * (pts.length - 1));
      const px = (i / Math.max(1, pts.length - 1)) * r.width;
      cross.hidden = tip.hidden = false; cross.style.left = px + 'px'; tip.style.left = Math.max(56, Math.min(r.width - 56, px)) + 'px';
      tip.innerHTML = `${esc(dShort(pts[i].d))}<br><span class="m">${fmt(pts[i].v)}</span>`;
    };
    const hide = () => { cross.hidden = tip.hidden = true; };
    box.addEventListener('pointerdown', show); box.addEventListener('pointermove', show); box.addEventListener('pointerleave', hide); box.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') hide(); });
  }
  const rangesHtml = () => `<div class="ranges" data-noswipe role="group" aria-label="Période du graphique">${Object.keys(RANGES).map((r) => `<button type="button" data-a="range" data-v="${r}" aria-pressed="${S.range === r}">${r === 'TOUT' ? 'Tout' : r}</button>`).join('')}</div>`;
  function heroHtml(pts) {
    const now = pts[pts.length - 1].v, diff = now - pts[0].v;
    return `<section class="hero"><button class="herolabel" type="button" data-a="combine">Patrimoine net ${svg('down')}</button><p class="big${now < 0 ? ' neg' : ''}" id="bignum" data-to="${now}"><span class="m">${fmt(now)}</span></p><div class="sub"><span class="${diff < 0 ? 'down' : diff > 0 ? 'up' : ''}"><span class="m">${sgn(diff)}</span></span><span class="scopehint">${esc(scopeName())}, ${S.range === 'TOUT' ? 'depuis le début' : 'sur ' + S.range}</span></div></section>`;
  }
  const dotsHtml = () => `<div class="dots" aria-hidden="true">${scopes().map((s) => `<i class="${s === S.scope ? 'on' : ''}"></i>`).join('')}</div>`;
  const initials = (s) => esc(String(s || '?').trim().slice(0, 2).toUpperCase());
  const brandTag = (id) => (sel().length > 1 ? `${esc(brand(id).name)}, ` : '');
  function txRow(t) {
    const pos = t.flow === 'in', sign = t.flow === 'in' ? '+' : t.flow === 'out' ? '−' : '';
    return `<li><button class="row" type="button" data-a="tx" data-id="${esc(t.id)}"><span class="ava">${initials(CAT[t.cat] || t.label)}</span><span class="rowtext"><b>${esc(t.label)}</b><small>${brandTag(t.brand)}${esc(CAT[t.cat] || 'Virement')}${t.assetId ? ', justificatif joint' : ''}</small></span><span class="rowval ${pos ? 'pos' : ''}"><span class="m">${sign}${fmt(t.eurCents)}</span>${t.currency === 'USD' ? `<small class="m">${orig(t.amount, 'USD')}</small>` : ''}</span></button></li>`;
  }
  function txList(items) {
    const days = {}; items.slice().sort((a, b) => b.date.localeCompare(a.date)).forEach((t) => { (days[t.date] = days[t.date] || []).push(t); });
    return Object.keys(days).sort().reverse().map((d) => `<p class="dayhead">${esc(dLong(d))}</p><ul class="list">${days[d].map(txRow).join('')}</ul>`).join('');
  }
  const emptyBox = (text, a, label, extra) => `<div class="empty"><p>${esc(text)}</p><button class="cta" type="button" data-a="${a}" ${extra || ''}>${esc(label)}</button></div>`;

  // Écrans
  function vHome() {
    const pts = series(), f = flows(S.period.from, S.period.to);
    const goals = S.goals.filter((g) => sel().includes(g.brand));
    const brandsCard = sel().length > 1 ? `<section class="card"><div class="cardhead"><h2>Par marque</h2><span class="note">${esc(rangeLabel())}</span></div><ul class="list">${sel().map((id) => { const x = flows(S.period.from, S.period.to, [id]); return `<li><button class="row" type="button" data-a="scope" data-v="${esc(id)}"><span class="ava" style="color:${esc(brand(id).color)}">${initials(brand(id).name)}</span><span class="rowtext"><b>${esc(brand(id).name)}</b><small class="m">${fmt(netWorth(today(), [id]))} de patrimoine</small></span><span class="rowval ${x.profit > 0 ? 'pos' : ''}"><span class="m">${sgn(x.profit)}</span></span></button></li>`; }).join('')}</ul></section>` : '';
    const goalCard = `<section class="card"><div class="cardhead"><h2>Objectifs</h2>${goals.length ? '<button class="textbtn" type="button" data-a="add" data-v="goal">Ajouter</button>' : ''}</div>${goals.length ? goals.map((g) => { const p = Math.min(100, Math.round((g.current / g.target) * 100)); return `<button class="goal" type="button" data-a="goal" data-id="${esc(g.id)}"><div><b>${esc(g.name)}</b><span>${p} %</span></div><span class="progress" style="display:block"><i style="width:${p}%"></i></span><div><span class="m">${fmt(g.current)}</span><span class="m">${fmt(g.target)}</span></div></button>`; }).join('') : '<p class="note">Fixe un montant à atteindre pour cette marque.</p><button class="cta" type="button" data-a="add" data-v="goal">Créer un objectif</button>'}</section>`;
    const recent = f.items.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return `${heroHtml(pts)}${dotsHtml()}${chartHtml(pts)}${rangesHtml()}
      <section class="card"><div class="cardhead"><h2>Résultat</h2><button class="textbtn" type="button" data-a="period">${esc(rangeLabel())}</button></div><p class="big" style="font-size:36px"><span class="${f.profit < 0 ? 'down' : 'up'}"><span class="m">${sgn(f.profit)}</span></span></p><div class="legend"><span>Entrées <span class="m">${fmt(f.in)}</span></span><span>Sorties <span class="m">${fmt(f.out + f.rec)}</span></span></div><button class="cta scanbtn" type="button" data-a="scan">${svg('scan')}Ajouter une facture ou une photo</button></section>
      ${brandsCard}${goalCard}
      <section class="card"><div class="cardhead"><h2>Dernières opérations</h2><a class="textbtn" href="#budget" style="text-decoration:none">Tout voir</a></div>${recent.length ? `<ul class="list">${recent.map((t) => txRow(t)).join('')}</ul>` : '<p class="note">Aucune opération sur cette période.</p>'}</section>`;
  }
  function vPatrimoine() {
    const pts = series(), t = today(), start = pts[0].d, acc = S.accounts.filter((a) => sel().includes(a.brand));
    const groups = Object.keys(ACC).map((k) => {
      const list = acc.filter((a) => a.type === k); if (!list.length) return '';
      const total = list.reduce((s, a) => s + acctValue(a, t), 0), open = !S.closed[k];
      const rows = list.map((a) => { const v = acctValue(a, t), d = v - acctValue(a, start); return `<li><button class="row" type="button" data-a="account" data-id="${esc(a.id)}"><span class="ava">${initials(a.institution || a.name)}</span><span class="rowtext"><b>${esc(a.name)}</b><small>${brandTag(a.brand)}${esc(a.institution || ACC[a.type])}</small></span><span class="rowval ${S.valMode === 'var' && d > 0 ? 'pos' : ''}"><span class="m">${S.valMode === 'var' ? sgn(d) : fmt(v)}</span></span></button></li>`; }).join('');
      return `<section><button class="grouphead" type="button" data-a="group" data-v="${k}" aria-expanded="${open}">${svg('down')}<b>${ACC[k]}</b><span class="count">${list.length}</span><span class="sum m">${fmt(total)}</span></button>${open ? `<ul class="list">${rows}</ul>` : ''}</section>`;
    }).join('');
    return `${heroHtml(pts)}${dotsHtml()}${chartHtml(pts)}${rangesHtml()}<div class="seg" role="group" aria-label="Affichage"><button type="button" data-a="valmode" data-v="val" aria-pressed="${S.valMode === 'val'}">Valeur</button><button type="button" data-a="valmode" data-v="var" aria-pressed="${S.valMode === 'var'}">Variation ${S.range === 'TOUT' ? '' : S.range}</button></div>
      ${acc.length ? groups : emptyBox(`Aucun compte pour ${scopeName()}. Ajoute ton premier compte ou actif.`, 'add', 'Ajouter un compte', 'data-v="account"')}`;
  }
  function vBudget() {
    const f = flows(S.period.from, S.period.to), tot = { in: f.in, out: f.out, rec: f.rec };
    let list = S.flow === 'rec' ? [] : f.items.filter((t) => t.flow === S.flow || (S.flow === 'out' && t.flow === 'move'));
    const q = S.q.trim().toLowerCase();
    if (q) list = list.filter((t) => `${t.label} ${CAT[t.cat] || ''}`.toLowerCase().includes(q));
    const shown = S.showAll || q ? list : list.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
    const recRows = f.recs.map((r) => `<li><button class="row" type="button" data-a="recurring" data-id="${esc(r.id)}"><span class="ava">${initials(r.label)}</span><span class="rowtext"><b>${esc(r.label)}</b><small>${brandTag(r.brand)}${orig(r.amount, r.currency)} ${FREQ[r.freq]}</small></span><span class="rowval m">${fmt(r.value)}</span></button></li>`).join('');
    const body = S.flow === 'rec'
      ? (f.recs.length ? `<ul class="list">${recRows}</ul>` : emptyBox('Aucun abonnement sur cette période.', 'add', 'Ajouter un abonnement', 'data-v="recurring"'))
      : (shown.length ? txList(shown) + (!S.showAll && !q && list.length > 8 ? '<button class="ghost" type="button" data-a="showall">Tout voir</button>' : '') : emptyBox('Aucune opération sur cette période.', 'add', 'Ajouter une opération', 'data-v="tx"'));
    const cats = Object.keys(OUT).filter((c) => f.byCat[c]).sort((a, b) => f.byCat[b] - f.byCat[a]);
    const days = dayDiff(S.period.from, S.period.to) + 1;
    const catCard = cats.length ? `<section class="card" id="details"><div class="cardhead"><h2>Par catégorie</h2></div>${cats.map((c) => { const b = S.budgets.find((x) => x.cat === c && sel().includes(x.brand)), limit = b ? Math.round(b.limit * 12 / 365 * days) : 0, pct = limit ? Math.min(100, Math.round(f.byCat[c] / limit * 100)) : Math.round(f.byCat[c] / f.out * 100); return `<button class="goal" type="button" data-a="budgetcat" data-v="${c}"><div><b>${OUT[c]}</b><span class="m">${fmt(f.byCat[c])}${limit ? ' sur ' + fmt(limit) : ''}</span></div><span class="progress" style="display:block"><i class="${limit && f.byCat[c] > limit ? 'over' : ''}" style="width:${pct}%"></i></span></button>`; }).join('')}</section>` : '';
    return `<div class="periodbar"><button class="iconbtn" type="button" data-a="shift" data-v="-1" aria-label="Période précédente">${svg('left')}</button><button class="pick" type="button" data-a="period">${esc(rangeLabel())} ${svg('down')}</button><button class="iconbtn" type="button" data-a="shift" data-v="1" aria-label="Période suivante">${svg('right')}</button></div>${dotsHtml()}
      <div class="tri" role="group" aria-label="Type de flux">${[['in', 'Entrées'], ['out', 'Sorties'], ['rec', 'Récurrent']].map(([k, l]) => `<button type="button" data-a="flow" data-v="${k}" aria-pressed="${S.flow === k}">${l}<b class="m">${fmt(tot[k])}</b></button>`).join('')}</div>
      <div class="quick"><button type="button" data-a="showall"><span>${svg('list')}</span>Tout voir</button><button type="button" data-a="scan"><span>${svg('scan')}</span>Facture</button><button type="button" data-a="add" data-v="tx"><span>${svg('plus')}</span>Créer</button></div>
      ${S.notes.length ? `<ul class="note">${S.notes.map((n) => `<li class="${n.bad ? 'danger' : ''}">${esc(n.text)}</li>`).join('')}</ul>` : ''}
      ${S.showAll ? `<input class="search" id="q" type="search" placeholder="Rechercher une opération" aria-label="Rechercher une opération" value="${esc(S.q)}">` : ''}
      <section>${body}</section>${catCard}`;
  }
  function vAnalyses() {
    const f = flows(S.period.from, S.period.to), sales = (f.byCat.ventes || 0) + (f.byCat.clients || 0), pub = f.byCat.pub || 0;
    const margin = f.in > 0 ? Math.round(f.profit / f.in * 100) : null, roas = pub > 0 ? sales / pub : null, solo = sel().length === 1;
    const yr = S.period.to.slice(0, 4), salYear = flows(`${yr}-01-01`, `${yr}-12-31`).byCat.salaire || 0, salPeriod = f.byCat.salaire || 0;
    const steps = [...Object.keys(IN).filter((c) => f.byCat[c]).map((c) => [IN[c], f.byCat[c], 1]), ...Object.keys(OUT).filter((c) => f.byCat[c]).map((c) => [OUT[c], f.byCat[c], -1]), ...(f.rec ? [['Récurrent', f.rec, -1]] : [])];
    let run = 0, lo = 0, hi = 0; const placed = steps.map(([l, v, s]) => { const a = run; run += s * v; lo = Math.min(lo, run); hi = Math.max(hi, run); return { l, v, s, a, b: run }; });
    const span = hi - lo || 1, pos = (v) => (v - lo) / span * 100;
    const fall = placed.map((p) => `<div class="step"><span>${esc(p.l)}</span><span class="m">${p.s > 0 ? '+' : '−'}${fmt(p.v)}</span><span class="tr"><i style="left:${pos(Math.min(p.a, p.b)).toFixed(2)}%;width:${(p.v / span * 100).toFixed(2)}%;background:${p.s > 0 ? 'var(--lime)' : 'var(--red)'}"></i></span></div>`).join('');
    const n = Math.min(62, dayDiff(S.period.from, S.period.to) + 1), daily = []; for (let i = 0; i < n; i++) { const d = addDays(S.period.from, i), x = flows(d, d); daily.push({ d, in: x.in, out: x.out + x.rec }); }
    const top = Math.max(1, ...daily.map((x) => x.in)), bot = Math.max(1, ...daily.map((x) => x.out)), share = top / (top + bot) * 100, pick = daily.find((x) => x.d === S.pickDay);
    const bars = daily.map((x) => `<button type="button" data-a="pickday" data-v="${x.d}" aria-pressed="${S.pickDay === x.d}" aria-label="${esc(dShort(x.d))}" style="--up:${share.toFixed(1)}%;--down:${(100 - share).toFixed(1)}%"><i class="a" style="height:${(x.in / top * 100).toFixed(1)}%"></i><i class="b" style="height:${(x.out / bot * 100).toFixed(1)}%"></i></button>`).join('');
    const biggest = Object.keys(OUT).filter((c) => f.byCat[c]).sort((a, b) => f.byCat[b] - f.byCat[a])[0];
    const brandsCmp = sel().length > 1 ? (() => { const rows = sel().map((id) => ({ id, p: flows(S.period.from, S.period.to, [id]).profit })), mx = Math.max(1, ...rows.map((r) => Math.abs(r.p))); return `<section class="card"><div class="cardhead"><h2>Comparer les marques</h2></div>${rows.map((r) => `<div class="step"><span>${esc(brand(r.id).name)}</span><span class="m">${sgn(r.p)}</span><span class="tr"><i style="left:0;width:${(Math.abs(r.p) / mx * 100).toFixed(1)}%;background:${r.p < 0 ? 'var(--red)' : esc(brand(r.id).color)}"></i></span></div>`).join('')}</section>`; })() : '';
    return `<div class="periodbar"><h1 class="sectiontitle">Analyses</h1><button class="textbtn" type="button" data-a="period">${esc(rangeLabel())}</button></div>${dotsHtml()}
      <div class="kpis"><div class="kpi"><span>Résultat</span><b class="${f.profit < 0 ? 'down' : 'up'} m">${sgn(f.profit)}</b><small>${esc(scopeName())}</small></div><div class="kpi"><span>Marge</span><b>${margin === null ? 'Aucune' : margin + ' %'}</b><small>sur ${fmt(f.in)} d'entrées</small></div><div class="kpi"><span>ROAS</span><b>${roas === null ? 'Aucun' : num(roas.toFixed(2))}</b><small>${solo && roas !== null ? (roas >= S.settings.roasBE ? `au-dessus du seuil de ${num(S.settings.roasBE)}` : `sous le seuil de ${num(S.settings.roasBE)}`) : 'ventes divisées par la pub'}</small></div><div class="kpi"><span>Plus gros poste</span><b style="font-size:18px">${biggest ? esc(OUT[biggest]) : 'Aucun'}</b><small>${biggest ? Math.round(f.byCat[biggest] / Math.max(1, f.out) * 100) + ' % des sorties' : 'sur cette période'}</small></div></div>
      <section class="card"><div class="cardhead"><h2>Entrées et sorties par jour</h2></div><div class="bars" data-noswipe>${bars}</div><div class="legend"><span><i class="dot" style="background:var(--lime)"></i>Entrées</span><span><i class="dot" style="background:var(--red)"></i>Sorties</span></div><p class="note">${pick ? `${esc(dLong(pick.d))} : ${fmt(pick.in)} d'entrées, ${fmt(pick.out)} de sorties.` : 'Touche une barre pour voir le détail du jour.'}</p></section>
      <section class="card"><div class="cardhead"><h2>Du chiffre au résultat</h2></div>${steps.length ? fall : '<p class="note">Aucune opération sur cette période.</p>'}<div class="step total"><span>Résultat</span><span class="m">${fmt(f.profit)}</span></div></section>
      ${brandsCmp}
      <section class="card"><div class="cardhead"><h2>Salaires</h2><button class="textbtn" type="button" data-a="add" data-v="salary">Ajouter</button></div><div class="legend"><span>Sur la période <b class="m">${fmt(salPeriod)}</b></span><span>En ${yr} <b class="m">${fmt(salYear)}</b></span></div></section>`;
  }
  function vPlacements() {
    const t = today(), list = S.accounts.filter((a) => sel().includes(a.brand) && (a.type === 'invest' || a.type === 'crypto' || a.type === 'immo'));
    const total = list.reduce((s, a) => s + acctValue(a, t), 0), paid = list.reduce((s, a) => s + (a.invested || 0), 0), pl = list.filter((a) => a.invested != null).reduce((s, a) => s + acctValue(a, t) - a.invested, 0);
    const pct = paid ? Math.round(pl / paid * 1000) / 10 : 0;
    const types = ['invest', 'crypto', 'immo'].map((k, i) => ({ k, v: list.filter((a) => a.type === k).reduce((s, a) => s + acctValue(a, t), 0), c: ['#A8F85F', '#E8C547', '#7CC7F2'][i] })).filter((x) => x.v > 0);
    const rows = list.map((a) => { const v = acctValue(a, t), p = a.invested != null ? v - a.invested : null; return `<li><button class="row" type="button" data-a="account" data-id="${esc(a.id)}"><span class="ava">${initials(a.name)}</span><span class="rowtext"><b>${esc(a.name)}</b><small>${brandTag(a.brand)}${esc(ACC[a.type])}</small></span><span class="rowval"><span class="m">${fmt(v)}</span>${p !== null ? `<small class="m ${p < 0 ? 'down' : 'up'}">${sgn(p)}</small>` : ''}</span></button></li>`; }).join('');
    return `<section class="hero"><h1 class="herolabel">Placements</h1><p class="big"><span class="m">${fmt(total)}</span></p><div class="sub"><span class="${pl < 0 ? 'down' : pl > 0 ? 'up' : ''} m">${sgn(pl)}</span><span class="scopehint">${paid ? `soit ${num(pct)} % sur ${fmt(paid)} investis` : esc(scopeName())}</span></div></section>${dotsHtml()}
      ${types.length ? `<section class="card"><div class="cardhead"><h2>Répartition</h2></div><div class="alloc">${types.map((x) => `<i style="flex:${x.v};background:${x.c}"></i>`).join('')}</div><div class="legend">${types.map((x) => `<span><i class="dot" style="background:${x.c}"></i>${ACC[x.k]} ${Math.round(x.v / total * 100)} %</span>`).join('')}</div></section>` : ''}
      ${list.length ? `<section class="card"><div class="cardhead"><h2>Positions</h2><button class="textbtn" type="button" data-a="add" data-v="invest">Ajouter</button></div><ul class="list">${rows}</ul></section>` : emptyBox('Ajoute tes actions, ETF, crypto ou biens pour suivre tes plus-values.', 'add', 'Ajouter un placement', 'data-v="invest"')}`;
  }
  function renderChrome() {
    document.body.classList.toggle('hide', S.hidden);
    $('#eye').innerHTML = svg(S.hidden ? 'off' : 'eye'); $('#eye').setAttribute('aria-label', S.hidden ? 'Afficher les montants' : 'Masquer les montants');
    $('#brandbtn').textContent = S.scope === 'all' ? 'T' : scopeName().slice(0, 1).toUpperCase();
    $('#nav').innerHTML = TABS.map(([id, l, ic]) => `<a href="#${id}" ${S.tab === id ? 'aria-current="page"' : ''}>${svg(ic)}${l}</a>`).join('');
    const chips = $('#chips'), left = chips.scrollLeft;
    chips.innerHTML = scopes().map((s) => `<button class="chip" type="button" data-a="scope" data-v="${esc(s)}" aria-pressed="${S.scope === s}">${s !== 'all' && s !== 'custom' ? `<i class="dot" style="background:${esc(brand(s).color)}"></i>` : ''}${esc(s === 'all' ? 'Tout' : s === 'custom' ? S.custom.map((i) => brand(i).name).join(' + ') : brand(s).name)}</button>`).join('') + '<button class="chip" type="button" data-a="combine">Combiner</button>';
    chips.scrollLeft = left;
    const on = chips.querySelector('[aria-pressed="true"]'); if (on) chips.scrollTo({ left: on.offsetLeft - (chips.clientWidth - on.offsetWidth) / 2, behavior: 'smooth' });
  }
  function render(dir) {
    renderChrome();
    const box = $('#view');
    if (!S.ready) { box.innerHTML = `<div class="empty" role="status">${esc(S.msg)}</div>`; return; }
    const y = window.scrollY;
    box.innerHTML = { accueil: vHome, patrimoine: vPatrimoine, budget: vBudget, analyses: vAnalyses, placements: vPlacements }[S.tab]();
    if (S.tab === 'accueil' || S.tab === 'patrimoine') bindChart(series());
    window.scrollTo(0, y);
    if (dir) { box.classList.remove('in-l', 'in-r'); void box.offsetWidth; box.classList.add(dir > 0 ? 'in-l' : 'in-r'); }
  }
  function goScope(id) { const list = scopes(), a = list.indexOf(S.scope), b = list.indexOf(id); if (b < 0 || a === b) return; S.scope = id; S.pickDay = null; render(b > a ? 1 : -1); }
  function stepScope(d) { const list = scopes(), i = list.indexOf(S.scope), n = i + d; if (n >= 0 && n < list.length) goScope(list[n]); }

  // Glisser entre les marques
  let t0 = null, dragging = false;
  document.addEventListener('touchstart', (e) => { const p = e.touches[0]; t0 = (e.touches.length > 1 || e.target.closest('[data-noswipe],dialog,.nav') || p.clientX < 22 || p.clientX > innerWidth - 22) ? null : { x: p.clientX, y: p.clientY }; dragging = false; }, { passive: true });
  document.addEventListener('touchmove', (e) => { if (!t0) return; const p = e.touches[0], dx = p.clientX - t0.x, dy = p.clientY - t0.y; if (!dragging && Math.abs(dy) > 14) { t0 = null; return; } if (!dragging && Math.abs(dx) > 14) dragging = true; if (dragging) $('#view').style.transform = `translateX(${dx * .4}px)`; }, { passive: true });
  const endDrag = (e) => { if (!t0) return; const dx = e.changedTouches[0].clientX - t0.x, was = dragging; t0 = null; dragging = false; $('#view').style.transform = ''; if (was && Math.abs(dx) > 56) stepScope(dx < 0 ? 1 : -1); };
  document.addEventListener('touchend', endDrag, { passive: true });
  document.addEventListener('keydown', (e) => { if ($('#sheet').open || /INPUT|SELECT/.test(e.target.tagName)) return; if (e.key === 'ArrowRight') stepScope(1); if (e.key === 'ArrowLeft') stepScope(-1); });

  // Fenêtres et formulaires
  const openSheet = (html) => { const d = $('#sheet'); d.innerHTML = `<div class="sheet"><div class="grab"></div>${html}</div>`; if (!d.open) d.showModal(); };
  const closeSheet = () => { S.form = null; if ($('#sheet').open) $('#sheet').close(); };
  $('#sheet').addEventListener('click', (e) => { if (e.target.id === 'sheet') closeSheet(); });
  const field = (id, label, control, hint) => `<div class="field"><label for="${id}">${label}</label>${control}${hint ? `<small>${hint}</small>` : ''}</div>`;
  const inp = (id, v, attrs) => `<input id="${id}" name="${id}" value="${esc(v == null ? '' : v)}" ${attrs || ''}>`;
  const opts = (map, cur) => Object.entries(map).map(([k, v]) => `<option value="${esc(k)}" ${k === cur ? 'selected' : ''}>${esc(v)}</option>`).join('');
  const sel_ = (id, label, map, cur) => field(id, label, `<select id="${id}" name="${id}">${opts(map, cur)}</select>`);
  const brandMap = () => Object.fromEntries(S.brands.map((b) => [b.id, b.name]));
  const amountRow = (d, label, key) => `<div class="pair">${field('f-amount', label, inp('f-amount', d[key || 'amount'] == null ? '' : num(d[key || 'amount']), 'inputmode="decimal" autocomplete="off"'))}${sel_('f-cur', 'Devise', { EUR: '€', USD: '$' }, d.currency || 'EUR')}</div>`;
  const formFoot = (save) => `<p class="formerror" id="ferr" role="alert" hidden></p><button class="cta" id="fsave" type="submit">${save || 'Enregistrer'}</button>`;
  const defDate = () => { const t = today(); return t >= S.period.from && t <= S.period.to ? t : S.period.to; };
  function formHtml(kind, d) {
    if (kind === 'tx') {
      const type = d.type || 'out';
      return `<h2>${d.id ? 'Modifier' : 'Nouvelle opération'}</h2>${d.scanNote ? `<p class="note">${esc(d.scanNote)}</p>` : ''}${sel_('f-type', 'Sens', { out: 'Sortie', in: 'Entrée' }, type)}${sel_('f-brand', 'Marque', brandMap(), d.brand || defaultBrand())}${sel_('f-cat', 'Catégorie', type === 'in' ? IN : OUT, d.cat)}${field('f-label', 'Description', inp('f-label', d.label, 'autocomplete="off" maxlength="120"'))}${field('f-date', 'Date', inp('f-date', d.date || defDate(), 'type="date"'))}${amountRow(d, 'Montant')}${assets ? field('f-file', 'Facture ou justificatif', '<input id="f-file" type="file" accept="application/pdf,image/png,image/jpeg,image/webp">', d.assetName ? `Fichier actuel : ${esc(d.assetName)}` : 'PDF ou photo, 20 Mo maximum.') : ''}${formFoot()}`;
    }
    if (kind === 'transfer') return `<h2>Virement entre marques</h2><p class="note">Il ne compte ni comme un revenu ni comme une dépense quand les deux marques sont affichées.</p>${sel_('f-brand', 'Depuis', brandMap(), d.brand || defaultBrand())}${sel_('f-to', 'Vers', brandMap(), d.toBrand || 'perso')}${field('f-label', 'Description', inp('f-label', d.label || 'Rémunération', 'maxlength="120"'))}${field('f-date', 'Date', inp('f-date', d.date || defDate(), 'type="date"'))}${amountRow(d, 'Montant')}${formFoot()}`;
    if (kind === 'recurring') return `<h2>${d.id ? 'Modifier' : 'Nouvel abonnement'}</h2>${sel_('f-brand', 'Marque', brandMap(), d.brand || defaultBrand())}${field('f-label', 'Nom', inp('f-label', d.label, 'maxlength="120"'))}${sel_('f-cat', 'Catégorie', OUT, d.cat || 'outils')}${amountRow(d, 'Montant')}${sel_('f-freq', 'Fréquence', { mois: 'Par mois', semaine: 'Par semaine', an: 'Par an' }, d.freq || 'mois')}${field('f-start', 'À partir du', inp('f-start', d.start || S.period.from, 'type="date"'))}${formFoot()}`;
    if (kind === 'account') {
      const t = d.type || 'courant';
      return `<h2>${d.id ? 'Modifier le compte' : 'Nouveau compte ou actif'}</h2>${sel_('f-brand', 'Marque', brandMap(), d.brand || defaultBrand())}${sel_('f-acc', 'Type', ACC, t)}${field('f-label', 'Nom', inp('f-label', d.name, 'maxlength="80" placeholder="Compte courant"'))}${field('f-inst', 'Banque ou plateforme', inp('f-inst', d.institution, 'maxlength="60" placeholder="Ma banque"'))}${amountRow({ amount: d.value, currency: d.currency }, 'Valeur actuelle')}${field('f-paid', 'Montant investi, en euros', inp('f-paid', d.invested != null ? num(d.invested / 100) : '', 'inputmode="decimal"'), 'Facultatif. Sert à calculer ta plus-value.')}${field('f-date', 'Date de la valeur', inp('f-date', today(), 'type="date"'))}${formFoot()}`;
    }
    if (kind === 'value') return `<h2>Mettre à jour la valeur</h2><p class="note">${esc(d.name)}</p>${amountRow({ currency: d.currency }, 'Nouvelle valeur')}${field('f-date', 'Date', inp('f-date', today(), 'type="date"'))}${formFoot()}`;
    if (kind === 'goal') return `<h2>${d.id ? 'Modifier' : 'Nouvel objectif'}</h2>${sel_('f-brand', 'Marque', brandMap(), d.brand || defaultBrand())}${field('f-label', 'Nom', inp('f-label', d.name, 'maxlength="80" placeholder="Matelas de sécurité"'))}<div class="two">${field('f-target', 'Objectif, en €', inp('f-target', d.target ? num(d.target / 100) : '', 'inputmode="decimal"'))}${field('f-now', 'Déjà mis de côté, en €', inp('f-now', d.current != null ? num(d.current / 100) : '0', 'inputmode="decimal"'))}</div>${formFoot()}`;
    if (kind === 'budget') return `<h2>Budget ${esc(OUT[d.cat])}</h2>${sel_('f-brand', 'Marque', brandMap(), d.brand || defaultBrand())}${field('f-limit', 'Limite par mois, en €', inp('f-limit', d.limit ? num(d.limit / 100) : '', 'inputmode="decimal"'))}${formFoot()}`;
    if (kind === 'brand') return `<h2>Nouvelle marque</h2>${field('f-label', 'Nom', inp('f-label', '', 'maxlength="30" placeholder="Nouveau projet"'))}${formFoot('Ajouter la marque')}`;
    if (kind === 'settings') return `<h2>Réglages</h2>${field('f-fx', 'Valeur de 1 € en dollars', inp('f-fx', num(S.settings.fx), 'inputmode="decimal"'), 'Les anciennes lignes gardent leur taux.')}${field('f-fee', 'Frais Shopify estimés, en %', inp('f-fee', num(S.settings.feeRate), 'inputmode="decimal"'))}${field('f-be', "Seuil de rentabilité du ROAS d'Onction", inp('f-be', num(S.settings.roasBE), 'inputmode="decimal"'))}${formFoot()}`;
    return `<h2>Choisir la période</h2><div class="two">${field('f-from', 'Du', inp('f-from', S.period.from, 'type="date"'))}${field('f-to', 'Au', inp('f-to', S.period.to, 'type="date"'))}</div>${formFoot('Appliquer')}`;
  }
  function openForm(kind, doc) { S.form = { kind, doc: doc || {} }; openSheet(`<form id="theform" novalidate style="display:grid;gap:14px">${formHtml(kind, S.form.doc)}</form>`); }
  const val = (id) => { const e = document.getElementById(id); return e ? e.value.trim() : ''; };
  function dbMsg(e) {
    const c = e && e.code;
    if (c === 'quota_exceeded') return "L'espace de stockage est plein. Supprime d'anciennes lignes.";
    if (c === 'too_large') return 'Ce fichier dépasse 20 Mo.';
    if (c === 'unsupported_type') return 'Choisis un PDF, un PNG, un JPEG ou un WebP.';
    if (c === 'revoked' || c === 'not_granted') return "Cette page n'a plus accès à tes comptes. Recharge-la.";
    return "L'enregistrement a échoué. Vérifie ta connexion puis réessaie.";
  }
  async function putSnapshot(accountId, date, amount, currency) {
    const fx = S.settings.fx;
    await col('snapshots').doc(`${accountId}_${date}`).set({ account: accountId, date, amount, currency, fx, eurCents: toEur(amount, currency, fx) });
  }
  async function submitForm() {
    const { kind, doc } = S.form, fx = S.settings.fx, save = $('#fsave');
    const fail = (t) => { const e = $('#ferr'); e.textContent = t; e.hidden = false; save.disabled = false; };
    const money_ = (neg) => { const a = parseAmount(val('f-amount'), neg); if (a === null) return null; const c = val('f-cur'); return { amount: a, currency: c, fx, eurCents: toEur(a, c, fx) }; };
    const BAD = 'Entre un montant valide, par exemple 12,50.';
    save.disabled = true;
    try {
      if (kind === 'tx' || kind === 'transfer') {
        const label = val('f-label'), date = val('f-date'), p = money_();
        if (!label) return fail('Ajoute une description.'); if (!validDate(date)) return fail('Choisis une date valide.'); if (!p) return fail(BAD);
        const data = kind === 'tx' ? { type: val('f-type'), brand: val('f-brand'), cat: val('f-cat'), label, date, ...p, source: doc.source || 'manuel', assetId: doc.assetId || null, assetName: doc.assetName || null } : { type: 'transfer', brand: val('f-brand'), toBrand: val('f-to'), cat: 'virement', label, date, ...p, source: 'manuel', assetId: null, assetName: null };
        if (kind === 'transfer' && data.brand === data.toBrand) return fail('Choisis deux marques différentes.');
        const f = document.getElementById('f-file') && document.getElementById('f-file').files[0];
        if (f) { const isPdf = f.type === 'application/pdf'; const up = await assets.upload(isPdf ? f : await shrinkImage(f), { type: isPdf ? f.type : 'image/jpeg' }); if (doc.assetId && !S.tx.some((x) => x.id !== doc.id && x.assetId === doc.assetId)) await assets.delete(doc.assetId).catch(() => {}); data.assetId = up.id; data.assetName = f.name; }
        await (doc.id ? col('tx').doc(doc.id) : col('tx').doc()).set(data);
      } else if (kind === 'recurring') {
        const label = val('f-label'), start = val('f-start'), p = money_();
        if (!label) return fail('Ajoute un nom.'); if (!validDate(start)) return fail('Choisis une date valide.'); if (!p) return fail(BAD);
        await (doc.id ? col('recurring').doc(doc.id) : col('recurring').doc()).set({ brand: val('f-brand'), label, cat: val('f-cat'), freq: val('f-freq'), start, end: doc.end || null, ...p });
      } else if (kind === 'account') {
        const name = val('f-label'), date = val('f-date'), a = parseAmount(val('f-amount'), true), raw = val('f-paid'), paid = raw ? parseAmount(raw, false) : null;
        if (!name) return fail('Ajoute un nom.'); if (a === null) return fail('Entre une valeur valide, par exemple 2 450,30.'); if (!validDate(date)) return fail('Choisis une date valide.'); if (raw && paid === null) return fail('Entre un montant investi valide.');
        const ref = doc.id ? col('accounts').doc(doc.id) : col('accounts').doc();
        await ref.set({ brand: val('f-brand'), type: val('f-acc'), name, institution: val('f-inst'), currency: val('f-cur'), invested: paid === null ? null : Math.round(paid * 100) });
        await putSnapshot(ref.id, date, a, val('f-cur'));
      } else if (kind === 'value') {
        const a = parseAmount(val('f-amount'), true), date = val('f-date');
        if (a === null) return fail('Entre une valeur valide.'); if (!validDate(date)) return fail('Choisis une date valide.');
        await putSnapshot(doc.id, date, a, val('f-cur'));
      } else if (kind === 'goal') {
        const name = val('f-label'), target = parseAmount(val('f-target')), cur = parseAmount(val('f-now') || '0', true);
        if (!name) return fail('Ajoute un nom.'); if (target === null) return fail('Entre un objectif valide.'); if (cur === null) return fail('Entre un montant valide.');
        await (doc.id ? col('goals').doc(doc.id) : col('goals').doc()).set({ brand: val('f-brand'), name, target: Math.round(target * 100), current: Math.round(cur * 100) });
      } else if (kind === 'budget') {
        const limit = parseAmount(val('f-limit')); if (limit === null) return fail('Entre une limite valide.');
        await col('budgets').doc(`${val('f-brand')}_${doc.cat}`).set({ brand: val('f-brand'), cat: doc.cat, limit: Math.round(limit * 100) });
      } else if (kind === 'brand') {
        const name = val('f-label'); if (!name) return fail('Ajoute un nom.');
        const id = name.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'marque';
        if (S.brands.some((b) => b.id === id)) return fail('Cette marque existe déjà.');
        await book.update({ brands: [...S.brands, { id, name, color: COLORS[S.brands.length % COLORS.length] }] });
      } else if (kind === 'settings') {
        const a = parseAmount(val('f-fx')), b = parseAmount(val('f-fee')), c = parseAmount(val('f-be'));
        if (a === null || b === null || c === null) return fail('Vérifie les trois valeurs.');
        await book.update({ fx: a, feeRate: b, roasBE: c });
      } else {
        const from = val('f-from'), to = val('f-to');
        if (!validDate(from) || !validDate(to) || from > to) return fail('Choisis une date de début avant la date de fin.');
        S.period = { from, to }; closeSheet(); render(); return;
      }
      closeSheet(); toast('Enregistré.');
    } catch (e) { fail(dbMsg(e)); }
  }
  function detail(title, rows, buttons, photo) {
    openSheet(`<h2>${esc(title)}</h2>${photo || ''}<div class="detail">${rows.filter(Boolean).map(([k, v]) => `<div><span>${esc(k)}</span><b>${v}</b></div>`).join('')}</div>${buttons}`);
    document.querySelectorAll('#sheet [data-file]').forEach(async (el) => { try { const url = await window.palmoFileUrl(el.dataset.file); if (el.tagName === 'IMG') el.src = url; else el.href = url; } catch (e) { /* le lien reste inactif hors ligne */ } });
  }
  const delBtn = (c, id) => `<button class="ghost danger" type="button" data-a="del" data-c="${c}" data-id="${esc(id)}">Supprimer</button>`;
  function openTx(id) {
    const t = S.tx.find((x) => x.id === id); if (!t) return;
    detail(t.label, [['Montant', `<span class="m">${fmt(t.eurCents)}</span>`], t.currency === 'USD' && ['Montant d’origine', `<span class="m">${orig(t.amount, 'USD')}</span>`], ['Marque', esc(brand(t.brand).name) + (t.toBrand ? ` vers ${esc(brand(t.toBrand).name)}` : '')], ['Catégorie', esc(CAT[t.cat] || '')], ['Date', esc(dLong(t.date))], t.source === 'estimation' && ['Origine', 'Estimation'], t.assetId && ['Justificatif', `<a data-file="${esc(t.assetId)}" target="_blank" rel="noopener">${esc(t.assetName || 'Ouvrir')}</a>`]],
      `<button class="cta" type="button" data-a="edit" data-c="tx" data-id="${esc(id)}">Modifier</button>${delBtn('tx', id)}`,
      t.assetId && !/\.pdf$/i.test(t.assetName || '') ? `<a data-file="${esc(t.assetId)}" target="_blank" rel="noopener"><img class="thumb" data-file="${esc(t.assetId)}" alt="Justificatif de ${esc(t.label)}"></a>` : '');
  }

  // Scanner une facture, une photo ou un relevé
  function openScan() {
    openSheet(`<h2>Ajouter un justificatif</h2><p class="note">Facture, reçu ou capture de ton relevé bancaire. Tu indiques ensuite le montant.</p><label class="cta labbtn"><input class="vh scanfile" type="file" accept="image/*" capture="environment">Prendre une photo</label><label class="ghost labbtn"><input class="vh scanfile" type="file" accept="image/*,application/pdf">Choisir une photo ou un PDF</label><button class="textbtn" type="button" data-a="add" data-v="tx">Saisir sans justificatif</button>`);
  }
  function shrinkImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement('canvas');
        c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        c.toBlob((b) => (b ? resolve(b) : reject({ code: 'unsupported_type' })), 'image/jpeg', 0.86);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject({ code: 'unsupported_type' }); };
      img.src = url;
    });
  }
  async function handleScan(file) {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    openSheet('<h2>Envoi en cours</h2><p class="note" role="status">Palmo enregistre ton justificatif.</p><span class="progress" style="display:block"><i class="pulse"></i></span>');
    let blob = file, att = { assetId: null, assetName: null };
    try {
      if (!isPdf) blob = await shrinkImage(file);
      if (assets) { const up = await assets.upload(blob, { type: isPdf ? 'application/pdf' : 'image/jpeg' }); att = { assetId: up.id, assetName: isPdf ? file.name : (file.name || 'photo.jpg') }; }
    } catch (e) {
      openSheet(`<h2>Envoi impossible</h2><p class="formerror">${esc(dbMsg(e))}</p><button class="cta" type="button" data-a="scan">Réessayer</button>`);
      return;
    }
    openForm('tx', { ...att, scanNote: 'Justificatif joint. Indique le montant.' });
  }
  function openMenu() {
    const items = [['tx', 'Opération', 'Dépense ou entrée'], ['salary', 'Salaire', 'Revenu net'], ['account', 'Compte', 'Banque ou actif'], ['invest', 'Placement', 'Action, ETF, crypto'], ['recurring', 'Abonnement', 'Frais fixe'], ['transfer', 'Virement', 'Entre deux marques'], ['goal', 'Objectif', 'Montant à atteindre'], ['brand', 'Marque', 'Nouveau projet']];
    openSheet(`<h2>Ajouter</h2><button class="cta scanbtn" type="button" data-a="scan">${svg('scan')}Ajouter une facture ou une photo</button><div class="menu">${items.map(([k, l, s]) => `<button type="button" data-a="add" data-v="${k}">${l}<small>${s}</small></button>`).join('')}</div>`);
  }
  function openCombine() {
    const cur = S.scope === 'custom' ? S.custom : sel();
    openSheet(`<h2>Combiner des marques</h2><p class="note">Coche au moins deux marques pour voir leur total.</p><div>${S.brands.map((b) => `<label class="checkrow"><input type="checkbox" value="${esc(b.id)}" ${cur.includes(b.id) ? 'checked' : ''}><i class="dot" style="background:${esc(b.color)}"></i>${esc(b.name)}</label>`).join('')}</div><p class="formerror" id="ferr" role="alert" hidden></p><button class="cta" type="button" data-a="applycombine">Voir le total</button>`);
  }
  function openBrands() {
    openSheet(`<h2>Mes marques</h2><div>${S.brands.map((b) => `<div class="checkrow"><i class="dot" style="background:${esc(b.color)}"></i>${esc(b.name)}</div>`).join('')}</div><button class="cta" type="button" data-a="add" data-v="brand">Ajouter une marque</button><button class="ghost" type="button" data-a="settings">Réglages</button><button class="ghost danger" type="button" data-a="logout">Se déconnecter</button>`);
  }
  function openPeriod() {
    const t = today(), first = `${t.slice(0, 7)}-01`, prev = parse(first); prev.setMonth(prev.getMonth() - 1); const pFirst = iso(prev), pLast = addDays(first, -1);
    S.form = { kind: 'period', doc: {} };
    openSheet(`<h2>Période</h2><div class="menu"><button type="button" data-a="preset" data-f="2026-11-09" data-t="2026-11-16">9 au 16 nov.<small>Première période</small></button><button type="button" data-a="preset" data-f="${first}" data-t="${t}">Ce mois-ci<small>Jusqu'à aujourd'hui</small></button><button type="button" data-a="preset" data-f="${pFirst}" data-t="${pLast}">Mois dernier<small>Mois complet</small></button><button type="button" data-a="preset" data-f="${t.slice(0, 4)}-01-01" data-t="${t}">Cette année<small>Depuis janvier</small></button></div><form id="theform" novalidate style="display:grid;gap:14px">${formHtml('period', {})}</form>`);
  }

  // Interactions
  let toastT;
  function toast(t) { const e = $('#toast'); e.textContent = t; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { e.hidden = true; }, 2600); }
  const COLS = { tx: 'tx', accounts: 'accounts', recurring: 'recurring', goals: 'goals' };
  document.addEventListener('click', async (ev) => {
    const el = ev.target.closest('[data-a]'); if (!el) return;
    const a = el.dataset.a, v = el.dataset.v, id = el.dataset.id;
    if (a === 'scope') { closeSheet(); goScope(v); }
    else if (a === 'eye') { S.hidden = !S.hidden; store.set('hide', S.hidden ? '1' : '0'); renderChrome(); }
    else if (a === 'range') { S.range = v; render(); }
    else if (a === 'flow') { S.flow = v; render(); }
    else if (a === 'group') { S.closed[v] = !S.closed[v]; render(); }
    else if (a === 'valmode') { S.valMode = v; render(); }
    else if (a === 'pickday') { S.pickDay = S.pickDay === v ? null : v; render(); }
    else if (a === 'showall') { S.showAll = !S.showAll; if (S.flow === 'rec') S.flow = 'out'; render(); }
    else if (a === 'scan') openScan();
    else if (a === 'shift') { const n = dayDiff(S.period.from, S.period.to) + 1, k = Number(v) * n; S.period = { from: addDays(S.period.from, k), to: addDays(S.period.to, k) }; render(); }
    else if (a === 'period') openPeriod();
    else if (a === 'preset') { S.period = { from: el.dataset.f, to: el.dataset.t }; closeSheet(); render(); }
    else if (a === 'fab') openMenu();
    else if (a === 'combine') openCombine();
    else if (a === 'brands') openBrands();
    else if (a === 'settings') openForm('settings');
    else if (a === 'logout') window.palmoSignOut();
    else if (a === 'applycombine') {
      const picks = [...document.querySelectorAll('#sheet input[type=checkbox]:checked')].map((x) => x.value);
      if (picks.length < 2) { const e = $('#ferr'); e.textContent = 'Coche au moins deux marques.'; e.hidden = false; return; }
      closeSheet(); if (picks.length === S.brands.length) { goScope('all'); return; } S.custom = picks; S.scope = 'custom'; render(1);
    }
    else if (a === 'add') {
      if (v === 'salary') openForm('tx', { type: 'in', cat: 'salaire', brand: 'perso' });
      else if (v === 'invest') openForm('account', { type: 'invest' });
      else openForm(v);
    }
    else if (a === 'tx') openTx(id);
    else if (a === 'account') openAccount(id);
    else if (a === 'recurring') { const r = S.recurring.find((x) => x.id === id); if (r) detail(r.label, [['Montant', `<span class="m">${orig(r.amount, r.currency)} ${FREQ[r.freq]}</span>`], ['Marque', esc(brand(r.brand).name)], ['Depuis le', esc(dShort(r.start))]], `<button class="cta" type="button" data-a="edit" data-c="recurring" data-id="${esc(id)}">Modifier</button>${delBtn('recurring', id)}`); }
    else if (a === 'goal') { const g = S.goals.find((x) => x.id === id); if (g) detail(g.name, [['Objectif', `<span class="m">${fmt(g.target)}</span>`], ['Mis de côté', `<span class="m">${fmt(g.current)}</span>`], ['Marque', esc(brand(g.brand).name)]], `<button class="cta" type="button" data-a="edit" data-c="goals" data-id="${esc(id)}">Modifier</button>${delBtn('goals', id)}`); }
    else if (a === 'budgetcat') openForm('budget', S.budgets.find((b) => b.cat === v && sel().includes(b.brand)) || { cat: v });
    else if (a === 'value') { const acc = S.accounts.find((x) => x.id === id); openForm('value', acc); }
    else if (a === 'edit') {
      const d = S[COLS[el.dataset.c]].find((x) => x.id === id); if (!d) return;
      if (el.dataset.c === 'tx' && d.type === 'transfer') openForm('transfer', d);
      else if (el.dataset.c === 'accounts') { const last = S.snapshots.filter((s) => s.account === id).sort((x, y) => x.date.localeCompare(y.date)).pop(); openForm('account', { ...d, value: last ? last.amount : '' }); }
      else openForm({ tx: 'tx', recurring: 'recurring', goals: 'goal' }[el.dataset.c], d);
    }
    else if (a === 'del') {
      if (!el.dataset.armed) { el.dataset.armed = '1'; el.textContent = 'Confirmer la suppression'; return; }
      const name = COLS[el.dataset.c], doc = S[name].find((x) => x.id === id);
      try {
        await col(name).doc(id).delete();
        if (name === 'accounts') for (const s of S.snapshots.filter((x) => x.account === id)) await col('snapshots').doc(s.id).delete();
        if (doc && doc.assetId && assets && !S.tx.some((x) => x.id !== id && x.assetId === doc.assetId)) await assets.delete(doc.assetId).catch(() => {});
        closeSheet(); toast('Supprimé.');
      } catch (e) { toast(dbMsg(e)); }
    }
  });
  document.addEventListener('change', (e) => { if (e.target.classList.contains('scanfile')) handleScan(e.target.files[0]); if (e.target.id === 'f-type') { const c = $('#f-cat'); c.innerHTML = opts(e.target.value === 'in' ? IN : OUT); } });
  document.addEventListener('input', (e) => { if (e.target.id === 'q') { S.q = e.target.value; const p = e.target.selectionStart; render(); const q = $('#q'); q.focus(); q.setSelectionRange(p, p); } });
  document.addEventListener('submit', (e) => { if (e.target.id === 'theform') { e.preventDefault(); submitForm(); } });
  function route() { const h = location.hash.slice(1); S.tab = TABS.some(([id]) => id === h) ? h : 'accueil'; render(); window.scrollTo(0, 0); }
  window.addEventListener('hashchange', route);

  async function boot() {
    route();
    const stop = (t) => { S.ready = false; S.msg = t; render(); };
    if (!window.claude || !window.claude.use) return stop('Connecte-toi pour accéder à tes comptes.');
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) return stop('Connecte-toi pour accéder à tes comptes.');
    const owner = await user.isOwner(), uid = await user.id();
    if (!owner || !uid) return stop('Cette page est privée.');
    window.claude.use('assets').then((x) => { assets = x; });
    book = db.doc(`data/users/${uid}/book`);
    const slow = setTimeout(() => { if (!S.ready) stop('Tes comptes mettent du temps à arriver. Vérifie ta connexion.'); }, 10000);
    const names = ['tx', 'accounts', 'snapshots', 'recurring', 'goals', 'budgets'], wait = new Set(names);
    const onErr = () => { clearTimeout(slow); stop('Impossible de charger tes comptes. Recharge la page.'); };
    book.onSnapshot((s) => { const d = s.exists ? s.data() : null; if (d) { S.settings = { fx: d.fx || 1.12, feeRate: d.feeRate == null ? 0 : d.feeRate, roasBE: d.roasBE || 1 }; if (Array.isArray(d.brands) && d.brands.length) S.brands = d.brands; } if (S.ready) render(); }, onErr);
    names.forEach((n) => col(n).onSnapshot((snap) => { S[n] = snap.docs.map((d) => ({ id: d.id, ...d.data() })); wait.delete(n); if (!wait.size) { S.ready = true; clearTimeout(slow); } if (S.ready && !$('#sheet').open) render(); else if (S.ready) renderChrome(); }, onErr));
  }
  window.palmoBoot = boot;
})();
