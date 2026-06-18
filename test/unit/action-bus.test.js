import { describe, it, expect, beforeEach, vi } from 'vitest';
import { registerActions, startActionBus } from '../../src/assets/js/modules/action-bus.js';

/* The bus attaches a single pair of body listeners and dispatches to the
   handler registered for the closest [data-action] ancestor of the target. */

describe('action-bus', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    startActionBus(); // idempotent — safe across tests
  });

  it('dispatches a click to the registered handler with event + element', () => {
    const handler = vi.fn();
    registerActions({ 'do-thing': handler });

    document.body.innerHTML = '<button data-action="do-thing" id="b">x</button>';
    document.getElementById('b').click();

    expect(handler).toHaveBeenCalledTimes(1);
    const ctx = handler.mock.calls[0][0];
    expect(ctx.element.id).toBe('b');
    expect(ctx.event.type).toBe('click');
  });

  it('resolves the action from the closest [data-action] ancestor', () => {
    const handler = vi.fn();
    registerActions({ 'row-action': handler });

    document.body.innerHTML =
      '<button data-action="row-action"><i id="icon"></i></button>';
    document.getElementById('icon').click(); // click the inner icon

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].element.getAttribute('data-action')).toBe('row-action');
  });

  it('ignores clicks with no matching handler', () => {
    document.body.innerHTML = '<button data-action="unregistered" id="u">x</button>';
    expect(() => document.getElementById('u').click()).not.toThrow();
  });

  it('keeps click and change handler maps separate', () => {
    const onClick = vi.fn();
    const onChange = vi.fn();
    registerActions({ 'shared-name': onClick }, 'click');
    registerActions({ 'shared-name': onChange }, 'change');

    document.body.innerHTML = '<input type="checkbox" data-action="shared-name" id="c">';
    const el = document.getElementById('c');

    el.click(); // fires a click (and, in jsdom, a change for checkboxes)
    expect(onClick).toHaveBeenCalledTimes(1);

    onChange.mockClear();
    el.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1); // unchanged by the change event
  });

  it('lets a later registration override an earlier handler for the same action', () => {
    const first = vi.fn();
    const second = vi.fn();
    registerActions({ 'dup-action': first });
    registerActions({ 'dup-action': second });

    document.body.innerHTML = '<button data-action="dup-action" id="d">x</button>';
    document.getElementById('d').click();

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
