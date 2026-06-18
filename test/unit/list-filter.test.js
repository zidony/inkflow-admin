import { describe, it, expect, beforeEach } from 'vitest';
import { ListFilterManager } from '../../src/assets/js/modules/list-filter.js';

/* Builds a minimal list-table + search box + filter tabs, then asserts the
   unified predicate: a row is visible only when it matches BOTH the search
   query AND the active status tab. */

function buildMarkup() {
  document.body.innerHTML = `
    <input id="list-search" />
    <div class="ink-filter-tabs">
      <button class="ink-filter-tab active" data-filter="all">All</button>
      <button class="ink-filter-tab" data-filter="published">Published</button>
      <button class="ink-filter-tab" data-filter="draft">Draft</button>
    </div>
    <table class="ink-table"><tbody>
      <tr data-status="published"><td>Alpha report</td></tr>
      <tr data-status="draft"><td>Beta notes</td></tr>
      <tr data-status="published"><td>Gamma report</td></tr>
    </tbody></table>`;
}

const rows = () => [...document.querySelectorAll('.ink-table tbody tr')];
const visible = () => rows().filter(r => r.style.display !== 'none');
const clickTab = filter =>
  document.querySelector(`.ink-filter-tab[data-filter="${filter}"]`).click();
function type(value) {
  const input = document.getElementById('list-search');
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

describe('list-filter', () => {
  beforeEach(() => {
    buildMarkup();
    new ListFilterManager();
  });

  it('shows all rows initially', () => {
    expect(visible()).toHaveLength(3);
  });

  it('search narrows to matching rows', () => {
    type('report');
    expect(visible()).toHaveLength(2);
    expect(visible().every(r => r.textContent.includes('report'))).toBe(true);
  });

  it('filter tab narrows by status', () => {
    clickTab('draft');
    expect(visible()).toHaveLength(1);
    expect(visible()[0].getAttribute('data-status')).toBe('draft');
  });

  it('#4 fix: search ∧ filter — visible rows satisfy BOTH', () => {
    type('report'); // Alpha + Gamma (both published)
    clickTab('published');
    expect(visible()).toHaveLength(2);
    type('alpha'); // now only Alpha
    const v = visible();
    expect(v).toHaveLength(1);
    expect(v[0].getAttribute('data-status')).toBe('published');
    expect(v[0].textContent.toLowerCase()).toContain('alpha');
  });

  it('#4 fix: clicking "all" after a search does NOT reveal filtered-out rows', () => {
    type('beta'); // only Beta visible
    expect(visible()).toHaveLength(1);
    clickTab('all'); // must keep the search applied
    expect(visible()).toHaveLength(1);
    expect(visible()[0].textContent.toLowerCase()).toContain('beta');
  });

  it('re-applies on inkflow:rows-changed (status toggle respects active query/tab)', () => {
    clickTab('published'); // Alpha + Gamma
    expect(visible()).toHaveLength(2);
    // Simulate a status toggle: Gamma becomes a draft, then broadcast.
    rows()[2].setAttribute('data-status', 'draft');
    document.dispatchEvent(new CustomEvent('inkflow:rows-changed'));
    const v = visible();
    expect(v).toHaveLength(1);
    expect(v[0].textContent).toContain('Alpha');
  });
});
