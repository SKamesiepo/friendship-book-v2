import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Patch to fix passive event listeners
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

// Render the React app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
