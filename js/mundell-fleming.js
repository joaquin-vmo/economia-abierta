/* ============================================================
   Mundell–Fleming  (IS-LM-BP economía abierta)
   Notación de la Ayudantía 4:
     IS : Y = c(Y-T) + a - b i + G + x e - m Y
     LM : M/P = k Y - h i
     BP : 0 = x e - m Y + v (i - i*)
   ============================================================ */

const MF = (() => {
  const DEF = { a:100, T:0 };   // el resto de los valores base está en los sliders del HTML
  // Ejes fijos: así los desplazamientos de las curvas se ven, no se "compensan"
  const XMAX = 250, YMIN = -20, YMAX = 150;
  let frozen = null, lastNote = null, lastFlex = null;
  const typeset = els => window.MathJax && MathJax.typesetPromise && MathJax.typesetPromise(els);

  const $ = id => document.getElementById(id);
  const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();

  function readParams() {
    const perfect = $('mf-perfect').checked;
    const v = perfect ? 1e7 : Math.pow(10, parseFloat($('mf-v').value));
    return {
      c: +$('mf-c').value, m: +$('mf-m').value, b: +$('mf-b').value,
      x: +$('mf-x').value, k: +$('mf-k').value, h: +$('mf-h').value,
      a: DEF.a, T: DEF.T,
      G: +$('mf-G').value, M: +$('mf-M').value, ebar: +$('mf-ebar').value,
      istar: +$('mf-istar').value, v, perfect,
      regime: document.querySelector('#mf-regime button.active').dataset.r
    };
  }

  // resuelve el equilibrio de las tres ecuaciones
  function solve(p) {
    const { c, m, b, x, k, h, istar, v } = p;
    const A = p.a + p.G - c * p.T;            // gasto autónomo
    let Y, i, e, M;
    if (p.regime === 'flexible') {
      M = p.M;
      // (1-c)Y + (b+v)(kY-M)/h = A + v i*
      const denom = (1 - c) + (b + v) * k / h;
      Y = (A + v * istar + (b + v) * M / h) / denom;
      i = (k * Y - M) / h;
      e = ((1 - c + m) * Y - A + b * i) / x;  // desde IS (estable en v→∞)
    } else {
      e = p.ebar;
      const denom = (1 - c + m) + b * m / v;
      Y = (A + x * e * (1 + b / v) - b * istar) / denom;
      i = (m * Y - x * e) / v + istar;        // i→i* cuando v→∞
      M = k * Y - h * i;
    }
    const xn = x * e - m * Y;                 // balanza comercial
    return { Y, i, e, M, xn };
  }

  // curvas en el plano (Y, i) usando e y M de equilibrio
  function curves(p, eq, Ymax) {
    const N = 60, Y = [], is = [], lm = [], bp = [];
    const A = p.a + p.G - p.c * p.T;
    for (let n = 0; n <= N; n++) {
      const y = Ymax * n / N;
      Y.push(y);
      is.push((A + p.x * eq.e - (1 - p.c + p.m) * y) / p.b);   // i de IS
      lm.push((p.k * y - eq.M) / p.h);                          // i de LM
      bp.push(p.istar + (p.m * y - p.x * eq.e) / p.v);          // i de BP
    }
    return { Y, is, lm, bp };
  }

  function fmt(z) { return (Math.abs(z) < 1e-6 ? 0 : z).toFixed(1); }

  function explain(p) {
    const hi = p.perfect || p.v >= 12;
    if (p.regime === 'flexible') {
      if (hi) return 'Flexible + movilidad alta: la política <b>monetaria es efectiva</b>; la <b>fiscal se anula</b> por apreciación.';
      return 'Flexible + movilidad imperfecta: \\(e\\) se ajusta para equilibrar la balanza de pagos.';
    }
    if (hi) return 'Fijo + movilidad alta: la política <b>fiscal es efectiva</b>; la <b>monetaria es inefectiva</b> (pérdida de reservas).';
    return 'Fijo + movilidad imperfecta: \\(M/P\\) es endógena (reservas) para sostener \\(\\bar e\\).';
  }

  function draw() {
    const p = readParams();
    const eq = solve(p);
    const c = curves(p, eq, XMAX);

    const T = (xs, ys, name, color, dash) => ({
      x: xs, y: ys, mode: 'lines', name,
      line: { color, width: 3, dash: dash || 'solid' }, hovertemplate: name + ': Y=%{x:.1f}, i=%{y:.1f}<extra></extra>'
    });

    const traces = [
      T(c.Y, c.is, 'IS', css('--is')),
      T(c.Y, c.lm, 'LM', css('--lm')),
      T(c.Y, c.bp, 'BP', css('--bp'))
    ];

    if (frozen) {
      traces.push(T(frozen.Y, frozen.is, 'IS base', '#5a6b7a', 'dot'));
      traces.push(T(frozen.Y, frozen.lm, 'LM base', '#5a6b7a', 'dot'));
      traces.push(T(frozen.Y, frozen.bp, 'BP base', '#5a6b7a', 'dot'));
      traces.push({ x: [frozen.eq.Y], y: [frozen.eq.i], mode: 'markers', name: 'eq. base',
        marker: { color: '#5a6b7a', size: 9, symbol: 'circle-open', line: { width: 2 } }, hoverinfo: 'skip' });
    }

    traces.push({
      x: [eq.Y], y: [eq.i], mode: 'markers+text', name: 'Equilibrio',
      text: ['  E'], textposition: 'top right', textfont: { color: '#fff', size: 14 },
      marker: { color: '#ffffff', size: 12, line: { color: '#04101f', width: 2 } },
      hovertemplate: `E: Y=${fmt(eq.Y)}, i=${fmt(eq.i)}, e=${fmt(eq.e)}<extra></extra>`
    });

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#cdd8e3' },
      margin: { l: 55, r: 18, t: 10, b: 48 },
      xaxis: { title: 'Producto  Y', gridcolor: '#2c3a49', zeroline: false, range: [0, XMAX], autorange: false },
      yaxis: { title: 'Tasa de interés  i', gridcolor: '#2c3a49', zeroline: true, zerolinecolor: '#3a4a5a', range: [YMIN, YMAX], autorange: false },
      legend: { orientation: 'h', y: 1.08, x: 0, font: { size: 12 } },
      shapes: [
        { type: 'line', x0: eq.Y, x1: eq.Y, y0: 0, y1: eq.i, line: { color: '#ffffff', width: 1, dash: 'dot' } },
        { type: 'line', x0: 0, x1: eq.Y, y0: eq.i, y1: eq.i, line: { color: '#ffffff', width: 1, dash: 'dot' } }
      ]
    };

    Plotly.react('mf-plot', traces, layout, { responsive: true, displayModeBar: false });

    // readouts
    $('mf-out-Y').textContent = fmt(eq.Y);
    $('mf-out-i').textContent = fmt(eq.i);
    $('mf-out-e').textContent = fmt(eq.e);
    $('mf-out-xn').textContent = fmt(eq.xn);
    const flex = p.regime === 'flexible';
    $('mf-out-4v').textContent = fmt(eq.M) + (flex ? ' (exóg.)' : ' (endóg.)');
    if (flex !== lastFlex) { lastFlex = flex; $('mf-out-4k').innerHTML = flex ? 'Oferta \\(M/P\\)' : 'Reservas \\(\\Rightarrow M/P\\)'; lastNote = null; }

    // re-tipografiar sólo si el texto cambió (antes: en cada movimiento de slider)
    const note = explain(p);
    if (note !== lastNote) { lastNote = note; $('mf-note').innerHTML = note; typeset([$('mf-note'), $('mf-out-4k')]); }
  }

  function freeze() {
    const p = readParams(), eq = solve(p);
    const c = curves(p, eq, XMAX);
    frozen = { ...c, eq };
    draw();
  }
  function clearFreeze() { frozen = null; draw(); }

  function setRegime(r) {
    document.querySelectorAll('#mf-regime button').forEach(b => b.classList.toggle('active', b.dataset.r === r));
    $('mf-M-ctl').style.display = r === 'flexible' ? '' : 'none';
    $('mf-ebar-ctl').style.display = r === 'fijo' ? '' : 'none';
    draw();
  }

  function syncLabels() {
    $('mf-G-v').textContent = $('mf-G').value;
    $('mf-M-v').textContent = $('mf-M').value;
    $('mf-ebar-v').textContent = $('mf-ebar').value;
    $('mf-istar-v').textContent = $('mf-istar').value;
    $('mf-v-v').textContent = $('mf-perfect').checked ? '∞' : Math.pow(10, parseFloat($('mf-v').value)).toFixed(2);
    $('mf-c-v').textContent = ParseFix('mf-c'); $('mf-m-v').textContent = ParseFix('mf-m');
    $('mf-b-v').textContent = ParseFix('mf-b', 1); $('mf-x-v').textContent = ParseFix('mf-x', 1);
    $('mf-k-v').textContent = ParseFix('mf-k', 1); $('mf-h-v').textContent = ParseFix('mf-h', 1);
  }
  function ParseFix(id, d) { return (+$(id).value).toFixed(d === 1 ? 1 : 2); }

  function reset() {
    document.querySelectorAll('#view-mf input').forEach(el => { el.value = el.defaultValue; el.checked = el.defaultChecked; });
    frozen = null; syncLabels(); setRegime('flexible');
  }

  function init() {
    ['mf-G','mf-M','mf-ebar','mf-istar','mf-v','mf-c','mf-m','mf-b','mf-x','mf-k','mf-h']
      .forEach(id => $(id).addEventListener('input', () => { syncLabels(); draw(); }));
    $('mf-perfect').addEventListener('change', () => { syncLabels(); draw(); });
    document.querySelectorAll('#mf-regime button').forEach(b => b.addEventListener('click', () => setRegime(b.dataset.r)));
    $('mf-freeze').addEventListener('click', freeze);
    $('mf-clearfreeze').addEventListener('click', clearFreeze);
    $('mf-reset').addEventListener('click', reset);
    $('mf-preset-perf').addEventListener('click', () => { reset(); $('mf-perfect').checked = true; syncLabels(); draw(); });
    syncLabels(); draw();
  }

  return { init };
})();
