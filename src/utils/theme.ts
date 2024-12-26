export function setThemeMode(mode: 'light' | 'dark') {
  const dark = document.querySelector(
    '#arcgis-maps-sdk-theme-dark'
  ) as HTMLLinkElement;
  dark.disabled = mode === 'light';
  const esriUiElements = document.querySelectorAll('.esri-ui');
  document.body.classList.toggle('calcite-mode-dark', mode === 'dark');
  esriUiElements.forEach((element) => {
    element.classList.toggle('calcite-mode-dark', mode === 'dark');
  });
}
