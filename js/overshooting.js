/* ============================================================
   Overshooting de Dornbusch  (precios rígidos + PDI)
     m - p = phi y - lambda i           (mercado de dinero)
     e_dot = i - i*                      (paridad descubierta, previsión perfecta)
     p_dot = pi [ ubar + delta(e-p) + gamma y - sigma i - y ]
   y fijo en y_bar. Sistema lineal en (p,e): punto de silla.
   Solución de forma cerrada por el brazo estable.
   ============================================================ */

const OS = (() => {
  const $ = id => document.getElementById(id);
  const Q0 = 0.5;     // tipo de cambio real base (e-p) de largo plazo
  let anim = null;

  function readParams() {
    return {
      dm: +$('os-dm').value, lambda: +$('os-lam').value, pi: +$('os-pi').value,
      phi: +$('os-phi').value, delta: +$('os-del').value, sigma: +$('os-sig').value,
      gamma: +$('os-gam').value, istar: +$('os-istar').value, ybar: 1.0, m0: 0.0
    };
  }

  function model(p) {
    const { lambda, pi, phi, delta, sigma, gamma, istar, ybar } = p;
    const pbar = m => m - phi * ybar + lambda * istar;          // p de largo plazo
    const ubar = ybar * (1 - gamma) + sigma * istar - delta * Q0;
    const ebar = m => pbar(m) + Q0;                              // e de largo plazo

    // Jacobiano de (p_dot, e_dot) respecto a (p, e)
    const a11 = pi * (-delta - sigma / lambda);
    const a12 = pi * delta;
    const a21 = 1 / lambda;
    const tr = a11, det = -a12 * a21;
    const disc = Math.sqrt(tr * tr - 4 * det);
    const thetaS = (tr - disc) / 2;            // raíz estable (<0)
    const thetaU = (tr + disc) / 2;            // raíz inestable (>0)
    const slopeS = lambda * thetaS;            // dp/de en el brazo estable (<0)
    const slopeU = lambda * thetaU;            // dp/de en el brazo inestable (>0)

    const mNew = p.m0 + p.dm;
    const pOld = pbar(p.m0), pNew = pbar(mNew);
    const eOld = ebar(p.m0), eNew = ebar(mNew);
    // p es predeterminada: salta sólo e, hasta caer en el brazo estable nuevo
    const e0 = eNew + (pOld - pNew) / (lambda * thetaS);

    const iOf = (pp, m) => (pp - m + phi * ybar) / lambda;
    const overshoot = e0 - eNew;               // sobre el nuevo largo plazo
    const lrJump = eNew - eOld;                // salto de largo plazo
    const ratio = lrJump !== 0 ? overshoot / lrJump : 0;

    // trayectorias
    const Thalf = -Math.log(0.01) / Math.abs(thetaS);
    const T = Math.max(8, Thalf);
    return { pbar, ebar, ubar, thetaS, thetaU, slopeS, slopeU,
      mNew, pOld, pNew, eOld, eNew, e0, iOf, overshoot, lrJump, ratio, T, p };
  }

  function trajectory(M, n = 200) {
    const t = [], e = [], pp = [], ii = [];
    const tPre = -0.18 * M.T;
    for (let s = 0; s <= n; s++) {
      const tau = tPre + (M.T - tPre) * s / n;
      t.push(tau);
      if (tau < 0) {
        e.push(M.eOld); pp.push(M.pOld); ii.push(M.iOf(M.pOld, M.p.m0));
      } else {
        const dec = Math.exp(M.thetaS * tau);
        const pv = M.pNew + (M.pOld - M.pNew) * dec;
        const ev = M.eNew + (M.e0 - M.eNew) * dec;
        e.push(ev); pp.push(pv); ii.push(M.iOf(pv, M.mNew));
      }
    }
    return { t, e, p: pp, i: ii };
  }

  function drawPhase(M) {
    const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const span = Math.max(Math.abs(M.overshoot), Math.abs(M.eNew - M.eOld), 0.15);
    const eMin = Math.min(M.eOld, M.eNew) - 1.4 * span;
    const eMax = Math.max(M.e0, M.eNew) + 0.6 * span;
    const line = (x0, x1, slope, p0, e0) => {
      // p = p0 + slope*(e - e0)
      return { x: [x0, x1], y: [p0 + slope * (x0 - e0), p0 + slope * (x1 - e0)] };
    };

    // isoclinas para el NUEVO equilibrio
    // e_dot=0  ->  p = pNew (horizontal)
    // p_dot=0  ->  pendiente delta/(delta+sigma/lambda)
    const slopePdot = M.p.delta / (M.p.delta + M.p.sigma / M.p.lambda);
    const pdot0 = line(eMin, eMax, slopePdot, M.pNew, M.eNew);
    const sa = line(eMin, eMax, M.slopeS, M.pNew, M.eNew);     // brazo estable nuevo

    const tr = trajectory(M, 160);
    const path = { x: [], y: [] };
    tr.t.forEach((tt, idx) => { if (tt >= 0) { path.x.push(tr.e[idx]); path.y.push(tr.p[idx]); } });

    const traces = [
      { x: [eMin, eMax], y: [M.pNew, M.pNew], mode: 'lines', name: 'ė = 0',
        line: { color: '#8a97a6', width: 1.5, dash: 'dash' }, hoverinfo: 'skip' },
      { x: pdot0.x, y: pdot0.y, mode: 'lines', name: 'ṗ = 0',
        line: { color: '#c0b070', width: 1.5, dash: 'dash' }, hoverinfo: 'skip' },
      { x: sa.x, y: sa.y, mode: 'lines', name: 'Senda de silla',
        line: { color: css('--bp'), width: 2 }, hoverinfo: 'skip' },
      { x: path.x, y: path.y, mode: 'lines', name: 'Trayectoria',
        line: { color: css('--accent'), width: 3 }, hoverinfo: 'skip' },
      // salto inicial: e_old -> e0 con p fijo
      { x: [M.eOld, M.e0], y: [M.pOld, M.pOld], mode: 'lines+markers', name: 'Salto (t=0)',
        line: { color: css('--accent-2'), width: 2.5, dash: 'dot' },
        marker: { size: 6, color: css('--accent-2') }, hoverinfo: 'skip' },
      { x: [M.eOld], y: [M.pOld], mode: 'markers+text', name: 'A (inicial)',
        text: ['A'], textposition: 'bottom left', textfont: { color: '#fff' },
        marker: { color: '#9fb0c0', size: 11 }, hoverinfo: 'skip' },
      { x: [M.e0], y: [M.pOld], mode: 'markers+text', name: 'B (overshoot)',
        text: ['B'], textposition: 'top right', textfont: { color: css('--accent-2') },
        marker: { color: css('--accent-2'), size: 12 }, hoverinfo: 'skip' },
      { x: [M.eNew], y: [M.pNew], mode: 'markers+text', name: "C (nuevo LP)",
        text: ['C'], textposition: 'top right', textfont: { color: '#fff' },
        marker: { color: '#ffffff', size: 12, line: { color: '#04101f', width: 2 } }, hoverinfo: 'skip' },
      { x: [M.eOld], y: [M.pOld], mode: 'markers', name: '•', showlegend: false,
        marker: { color: css('--accent'), size: 14, symbol: 'circle', line: { color: '#fff', width: 1 } }, hoverinfo: 'skip' }
    ];

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#cdd8e3' }, margin: { l: 50, r: 12, t: 28, b: 44 },
      title: { text: 'Diagrama de fase (e, p)', font: { size: 13 } },
      xaxis: { title: 'Tipo de cambio  e', gridcolor: '#2c3a49', range: [eMin, eMax], zeroline: false },
      yaxis: { title: 'Nivel de precios  p', gridcolor: '#2c3a49', zeroline: false },
      legend: { font: { size: 10 }, y: 1, x: 1, xanchor: 'right', bgcolor: 'rgba(20,28,38,0.6)' },
      showlegend: true
    };
    Plotly.react('os-phase', traces, layout, { responsive: true, displayModeBar: false });
    return tr;
  }

  function drawTime(M, tr) {
    const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
    const mk = (col) => ({ x: [tr.t[0]], y: [tr.e[0]], mode: 'markers', showlegend: false,
      marker: { color: col, size: 10, line: { color: '#fff', width: 1 } }, hoverinfo: 'skip' });

    const traces = [
      { x: tr.t, y: tr.e, xaxis: 'x', yaxis: 'y', mode: 'lines', name: 'e (tipo de cambio)',
        line: { color: css('--accent'), width: 3 } },
      { x: tr.t, y: tr.p, xaxis: 'x', yaxis: 'y2', mode: 'lines', name: 'p (precios)',
        line: { color: css('--lm'), width: 3 } },
      { x: tr.t, y: tr.i, xaxis: 'x', yaxis: 'y3', mode: 'lines', name: 'i (tasa)',
        line: { color: css('--bp'), width: 3 } },
      // largo plazo (líneas punteadas)
      { x: [tr.t[0], M.T], y: [M.eNew, M.eNew], xaxis: 'x', yaxis: 'y', mode: 'lines', showlegend: false,
        line: { color: '#8a97a6', width: 1, dash: 'dot' }, hoverinfo: 'skip' },
      { x: [tr.t[0], M.T], y: [M.pNew, M.pNew], xaxis: 'x', yaxis: 'y2', mode: 'lines', showlegend: false,
        line: { color: '#8a97a6', width: 1, dash: 'dot' }, hoverinfo: 'skip' },
      { x: [tr.t[0], M.T], y: [M.p.istar, M.p.istar], xaxis: 'x', yaxis: 'y3', mode: 'lines', showlegend: false,
        line: { color: '#8a97a6', width: 1, dash: 'dot' }, hoverinfo: 'skip' },
      // marcadores animados (índices 6,7,8)
      { ...mk(css('--accent')), yaxis: 'y' },
      { x: [tr.t[0]], y: [tr.p[0]], xaxis: 'x', yaxis: 'y2', mode: 'markers', showlegend: false,
        marker: { color: css('--lm'), size: 10, line: { color: '#fff', width: 1 } }, hoverinfo: 'skip' },
      { x: [tr.t[0]], y: [tr.i[0]], xaxis: 'x', yaxis: 'y3', mode: 'markers', showlegend: false,
        marker: { color: css('--bp'), size: 10, line: { color: '#fff', width: 1 } }, hoverinfo: 'skip' }
    ];

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)',
      font: { color: '#cdd8e3' }, margin: { l: 50, r: 12, t: 28, b: 40 },
      title: { text: 'Trayectorias temporales', font: { size: 13 } },
      legend: { orientation: 'h', y: 1.12, font: { size: 10 } },
      xaxis: { gridcolor: '#2c3a49', zeroline: false, anchor: 'y3', domain: [0, 1], title: 'tiempo' },
      yaxis: { gridcolor: '#2c3a49', title: 'e', domain: [0.7, 1] },
      yaxis2: { gridcolor: '#2c3a49', title: 'p', domain: [0.37, 0.63] },
      yaxis3: { gridcolor: '#2c3a49', title: 'i', domain: [0.04, 0.30] },
      shapes: [{ type: 'line', x0: 0, x1: 0, yref: 'paper', y0: 0, y1: 1,
        line: { color: '#ffffff', width: 1, dash: 'dot' } }]
    };
    Plotly.react('os-time', traces, layout, { responsive: true, displayModeBar: false });
  }

  function setMarkers(M, tr, frac) {
    // posición sobre la trayectoria post-shock
    const post = tr.t.findIndex(t => t >= 0);
    const idx = Math.min(tr.t.length - 1, post + Math.round(frac * (tr.t.length - 1 - post)));
    const e = tr.e[idx], p = tr.p[idx], i = tr.i[idx], t = tr.t[idx];
    Plotly.restyle('os-time', { x: [[t]], y: [[e]] }, [6]);
    Plotly.restyle('os-time', { x: [[t]], y: [[p]] }, [7]);
    Plotly.restyle('os-time', { x: [[t]], y: [[i]] }, [8]);
    Plotly.restyle('os-phase', { x: [[e]], y: [[p]] }, [8]);
  }

  function stopAnim() { if (anim) { cancelAnimationFrame(anim); anim = null; } }

  function play() {
    const M = model(readParams());
    const tr = drawPhase(M); drawTime(M, tr);
    stopAnim();
    const dur = 4200; const t0 = performance.now();
    // partir del salto: marcador en B
    function step(now) {
      const f = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - f, 2);
      setMarkers(M, tr, ease);
      if (f < 1) anim = requestAnimationFrame(step); else anim = null;
    }
    anim = requestAnimationFrame(step);
  }

  function draw() {
    stopAnim();
    const M = model(readParams());
    const tr = drawPhase(M); drawTime(M, tr);
    setMarkers(M, tr, 0);

    $('os-metric').innerHTML =
      `<b>Sobrerreacción</b> = ${M.overshoot.toFixed(3)} &nbsp;|&nbsp; salto de largo plazo = ${M.lrJump.toFixed(3)}` +
      `<br>Razón <b>overshoot / LP = ${M.ratio.toFixed(2)}×</b> ` +
      (M.ratio > 1.05 ? '→ <span style="color:var(--accent-2)">el tipo de cambio se pasa de su nivel final</span>'
                      : '→ <span style="color:var(--good)">prácticamente sin sobrerreacción</span>');
    $('os-note').innerHTML =
      'Una expansión monetaria sube \\(p\\) y \\(e\\) uno a uno en el <b>largo plazo</b> (neutralidad). ' +
      'Pero \\(p\\) es <b>rígido</b> y no salta: en \\(t=0\\) baja \\(i\\) y, por la PDI \\(\\dot e=i-i^*\\), ' +
      'el tipo de cambio salta <b>por encima</b> de su nuevo nivel (A→B) para luego apreciarse hacia C (overshooting). ' +
      'Sube \\(\\pi\\) (precios flexibles) y la sobrerreacción desaparece.';
    if (window.MathJax && MathJax.typesetPromise) MathJax.typesetPromise([$('os-note'), $('os-metric')]);
  }

  function syncLabels() {
    $('os-dm-v').textContent = '+' + Math.round(+$('os-dm').value * 100) + '%';
    $('os-lam-v').textContent = (+$('os-lam').value).toFixed(2);
    $('os-pi-v').textContent = (+$('os-pi').value).toFixed(2);
    $('os-phi-v').textContent = (+$('os-phi').value).toFixed(2);
    $('os-del-v').textContent = (+$('os-del').value).toFixed(2);
    $('os-sig-v').textContent = (+$('os-sig').value).toFixed(2);
    $('os-gam-v').textContent = (+$('os-gam').value).toFixed(2);
    $('os-istar-v').textContent = (+$('os-istar').value).toFixed(2);
  }

  function reset() {
    $('os-dm').value = 0.05; $('os-lam').value = 1.0; $('os-pi').value = 0.25;
    $('os-phi').value = 0.5; $('os-del').value = 0.5; $('os-sig').value = 0.3;
    $('os-gam').value = 0.2; $('os-istar').value = 0.1;
    syncLabels(); draw();
  }

  function init() {
    ['os-dm','os-lam','os-pi','os-phi','os-del','os-sig','os-gam','os-istar']
      .forEach(id => $(id).addEventListener('input', () => { syncLabels(); draw(); }));
    $('os-play').addEventListener('click', play);
    $('os-reset').addEventListener('click', reset);
    $('os-flex').addEventListener('click', () => { $('os-pi').value = 8; syncLabels(); draw(); });
    syncLabels();
  }

  return { init, draw, redraw: draw };
})();
