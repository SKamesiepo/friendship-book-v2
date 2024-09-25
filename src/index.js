// Import React and ReactDOM correctly for React 17
import React from 'react';
import ReactDOM from 'react-dom'; // Use react-dom, not react-dom/client
import './index.css';
import App from './App';

// Patch to fix passive event listeners (your existing code)
(function() {
  let supportsPassive = false;
  try {
    const opts = Object.defineProperty({}, 'passive', {
      get: function() {
        supportsPassive = true;
      }
    });
    window.addEventListener('test', null, opts);
  } catch (e) {}

  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (type === 'touchstart' || type === 'touchmove') {
      if (typeof options === 'object') {
        options.passive = false;
      } else {
        options = { passive: false };
      }
    }
    originalAddEventListener.call(this, type, listener, options);
  };
})();

// Render the React app using ReactDOM.render for React 17
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
