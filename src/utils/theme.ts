export function setThemeMode(mode: 'light' | 'dark') {
  document.body.classList.toggle('calcite-mode-dark', mode === 'dark');
}
