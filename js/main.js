// Entry-only bootstrap. Cache-bust this file in index.html — never import it
// from other modules. Importing app.js with ?v= from the script tag used to
// create a second module instance (bare ./app.js vs app.js?v=N) and double-bind
// every Today listener (supplements toggles appeared broken).
import { startApp } from './app.js';

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startApp();
  });
} else {
  startApp();
}
