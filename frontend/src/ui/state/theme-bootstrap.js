(function () {
  var saved;
  try { saved = localStorage.getItem('legends-field-theme'); } catch (error) {}
  var theme = saved === 'light' || saved === 'dark' ? saved : window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.documentElement.style.backgroundColor = theme === 'dark' ? '#141c17' : '#f7f6f1';
}());
