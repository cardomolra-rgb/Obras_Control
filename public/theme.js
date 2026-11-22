// Aplica o tema (claro, escuro ou automático) antes de a página aparecer, para não piscar.
// A página pública do cliente (/acompanhar) fica sempre clara.
(function () {
  var d = document.documentElement, p = 'claro';
  try { p = localStorage.getItem('oc-theme') || 'claro'; } catch (e) {}
  var dark = p === 'escuro' || (p === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  if (location.pathname.indexOf('/acompanhar') === 0) dark = false;
  d.dataset.theme = dark ? 'dark' : 'light';
})();
