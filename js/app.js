/* Navegación por pestañas + inicialización */
(function () {
  const ready = {};           // vistas ya dibujadas
  const plots = {
    mf: ['mf-plot'],
    os: ['os-phase', 'os-time'],
    jc: ['jc-ml', 'jc-jcurve']
  };
  const draws = { os: () => OS.draw(), jc: () => JC.draw() };

  function showView(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    if (!ready[name] && draws[name]) { draws[name](); ready[name] = true; }
    (plots[name] || []).forEach(id => {
      const el = document.getElementById(id);
      if (el) Plotly.Plots.resize(el);
    });
  }

  document.querySelectorAll('.tab').forEach(tab =>
    tab.addEventListener('click', () => showView(tab.dataset.view)));

  window.addEventListener('DOMContentLoaded', () => {
    MF.init();
    OS.init();
    JC.init();
    ready.mf = true;          // MF se dibuja en su propio init()
  });
})();
