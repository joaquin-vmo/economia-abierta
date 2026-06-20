/* Navegación por pestañas + inicialización */
(function () {
  let osReady = false;

  function showView(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.view === name));
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    if (name === 'os') {
      if (!osReady) { OS.draw(); osReady = true; }
      Plotly.Plots.resize(document.getElementById('os-phase'));
      Plotly.Plots.resize(document.getElementById('os-time'));
    } else {
      Plotly.Plots.resize(document.getElementById('mf-plot'));
    }
  }

  document.querySelectorAll('.tab').forEach(tab =>
    tab.addEventListener('click', () => showView(tab.dataset.view)));

  window.addEventListener('DOMContentLoaded', () => {
    MF.init();
    OS.init();
  });
})();
