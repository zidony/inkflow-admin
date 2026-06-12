/* ============================================================
   InkFlow Admin — Central Action Bus

   A single delegated click/change listener for the whole page. Modules
   register their `data-action` handlers here instead of each attaching their
   own document-level listener, so "central delegation" is literally one bus.

   Usage:
     import { registerActions } from './action-bus.js';
     registerActions({
       'do-something': ({ event, element }) => { ... }
     });
     // change events:
     registerActions({ 'toggle-pref': ({ element }) => { ... } }, 'change');
   ============================================================ */

const handlerMaps = {
  click: new Map(),
  change: new Map()
};

/**
 * Register one or more `data-action` handlers.
 * @param {Record<string, (ctx: {event: Event, element: Element}) => void>} actionMap
 * @param {'click' | 'change'} [type]
 */
export function registerActions(actionMap, type = 'click') {
  const target = handlerMaps[type];
  if (!target) return;

  for (const [action, handler] of Object.entries(actionMap)) {
    target.set(action, handler);
  }
}

function dispatch(type, event) {
  const element = event.target.closest('[data-action]');
  if (!element) return;

  const handler = handlerMaps[type].get(element.getAttribute('data-action'));
  if (!handler) return;

  handler({ event, element });
}

let started = false;

/** Attach the single click/change listeners. Safe to call more than once. */
export function startActionBus() {
  if (started) return;
  started = true;

  document.body.addEventListener('click', event => dispatch('click', event));
  document.body.addEventListener('change', event => dispatch('change', event));
}
