/* ============================================================
   Curva J  y  condición de Marshall–Lerner
   Partiendo de comercio equilibrado (TB=0), una depreciación d:
     ΔTB(t) ≈ [ η_x(t) + η_m(t) - 1 ] · d
   con elasticidades que crecen con el rezago comercial:
     η_j(t) = η_j (1 - e^{-t/τ})
   En t=0 los volúmenes no reaccionan ⇒ impacto = -d (efecto valoración).
   Largo plazo ⇒ signo = sign(η_x + η_m - 1)  (Marshall–Lerner).
   ============================================================ */

const JC = (() => {
  const $ = id => document.getElementById(id);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function readParams() {
    return { d: +$('jc-d').value, ex: +$('jc-ex').value, em: +$('jc-em').value, tau: +$('jc-tau').value };
  }

  function tb(t, p) {
    if (t < 0) return 0;
    const adj = 1 - Math.exp(-t / p.tau);
    return (p.ex * adj + p.em * adj - 1) * p.d;
  }

  function drawML(p) {
    const MAX = 3;
    const ml = p.ex + p.em > 1;
    const traces = [
      // región "empeora": triángulo bajo la recta η_x+η_m=1
      { x: [0, 1, 0], y: [0, 0, 1], fill: 'toself', mode: 'none',
        fillcolor: 'rgba(255,107,107,0.16)', name: 'Empeora', hoverinfo: 'skip' },
      // región "mejora": resto del cuadrado
      { x: [1, MAX, MAX, 0, 0], y: [0, 0, MAX, MAX, 1], fill: 'toself', mode: 'none',
        fillcolor: 'rgba(81,207,102,0.14)', name: 'Mejora', hoverinfo: 'skip' },
      // frontera de Marshall–Lerner
      { x: [0, 1], y: [1, 0], mode: 'lines', name: 'η_x+η_m = 1',
        line: { color: css('--accent-2'), width: 2.5, dash: 'dash' }, hoverinfo: 'skip' },
      // punto actual
      { x: [p.ex], y: [p.em], mode: 'markers+text', name: 'Tu economía',
        text: ['  (η_x, η_m)'], textposition: 'top right', textfont: { color: '#000' },
        marker: { color: ml ? css('--bp') : css('--lm'), size: 15, line: { color: '#000', width: 2 } },
        hovertemplate: `η_x=${p.ex.toFixed(2)}, η_m=${p.em.toFixed(2)}<br>suma=${(p.ex + p.em).toFixed(2)}<extra></extra>` }
    ];
    const layout = {
      title: { text: 'Condición de Marshall–Lerner' },
      xaxis: { title: 'Elasticidad exportaciones  η_x', range: [0, MAX], zeroline: false },
      yaxis: { title: 'Elasticidad importaciones  η_m', range: [0, MAX], zeroline: false },
      showlegend: true,
      annotations: [
        { x: 0.34, y: 0.34, text: 'empeora', showarrow: false, font: { color: css('--lm'), size: 12 } },
        { x: 2.1, y: 2.1, text: 'mejora', showarrow: false, font: { color: css('--bp'), size: 12 } }
      ]
    };
    Plotly.react('jc-ml', traces, layout, { responsive: true, displayModeBar: false });
  }

  function drawJ(p) {
    const lr = (p.ex + p.em - 1) * p.d;
    const Tmax = Math.max(10, 5 * p.tau);
    const t = [], y = [];
    const tPre = -0.15 * Tmax;
    const N = 240;
    for (let s = 0; s <= N; s++) {
      const tau = tPre + (Tmax - tPre) * s / N;
      t.push(tau); y.push(tb(tau, p));
    }
    const traces = [
      { x: [tPre, Tmax], y: [0, 0], mode: 'lines', showlegend: false,
        line: { color: '#5a6b7a', width: 1 }, hoverinfo: 'skip' },
      { x: [0, Tmax], y: [lr, lr], mode: 'lines', name: 'Largo plazo',
        line: { color: '#8a97a6', width: 1, dash: 'dot' }, hoverinfo: 'skip' },
      { x: t, y: y, mode: 'lines', name: 'Balanza comercial',
        line: { color: css('--accent'), width: 3 },
        hovertemplate: 't=%{x:.1f}: ΔTB=%{y:.3f}<extra></extra>' },
      { x: [0], y: [tb(0, p)], mode: 'markers+text', name: 'Impacto',
        text: ['  impacto'], textposition: 'bottom right', textfont: { color: css('--lm') },
        marker: { color: css('--lm'), size: 11 }, hoverinfo: 'skip' }
    ];
    const layout = {
      title: { text: 'Curva J: balanza comercial en el tiempo' },
      xaxis: { title: 'tiempo tras la depreciación', zeroline: false, range: [tPre, Tmax] },
      yaxis: { title: 'Δ balanza comercial', zeroline: false },
      showlegend: true,
      shapes: [{ type: 'line', x0: 0, x1: 0, yref: 'paper', y0: 0, y1: 1, line: { color: '#000', width: 1, dash: 'dot' } }]
    };
    Plotly.react('jc-jcurve', traces, layout, { responsive: true, displayModeBar: false });
  }

  function pct(z) { return (z >= 0 ? '+' : '−') + Math.abs(z * 100).toFixed(1) + '%'; }

  function draw() {
    const p = readParams();
    drawML(p); drawJ(p);
    const sum = p.ex + p.em, ml = sum > 1;
    const impact = tb(0, p), lr = (sum - 1) * p.d;

    $('jc-out-sum').textContent = sum.toFixed(2);
    $('jc-out-ml').textContent = ml ? 'Se cumple' : 'No se cumple';
    $('jc-out-ml').style.color = ml ? css('--bp') : css('--lm');
    $('jc-out-impact').textContent = pct(impact);
    $('jc-out-lr').textContent = pct(lr);
  }

  function syncLabels() {
    $('jc-d-v').textContent = '+' + Math.round(+$('jc-d').value * 100) + '%';
    $('jc-ex-v').textContent = (+$('jc-ex').value).toFixed(2);
    $('jc-em-v').textContent = (+$('jc-em').value).toFixed(2);
    $('jc-tau-v').textContent = (+$('jc-tau').value).toFixed(1);
  }

  function reset() {
    document.querySelectorAll('#view-jc input').forEach(el => { el.value = el.defaultValue; });
    syncLabels(); draw();
  }

  function init() {
    ['jc-d', 'jc-ex', 'jc-em', 'jc-tau'].forEach(id =>
      $(id).addEventListener('input', () => { syncLabels(); draw(); }));
    $('jc-reset').addEventListener('click', reset);
    syncLabels();
  }

  return { init, draw };
})();
