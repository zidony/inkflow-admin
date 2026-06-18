import { describe, it, expect } from 'vitest';
import { request } from '../../src/assets/js/services/http.js';
import { api } from '../../src/assets/js/services/api.js';

/* The mock transport resolves after `latency` ms with mockResult ?? {ok:true}.
   The api object groups thin wrappers that all funnel through request(). */

describe('services/http request() (mock transport)', () => {
  it('resolves to { ok: true } by default', async () => {
    await expect(request('/x', { latency: 0 })).resolves.toEqual({ ok: true });
  });

  it('resolves to a provided mockResult', async () => {
    await expect(request('/x', { latency: 0, mockResult: { id: 7 } })).resolves.toEqual({ id: 7 });
  });

  it('returns a Promise (async seam) regardless of method', () => {
    expect(request('/x', { method: 'DELETE', latency: 0 })).toBeInstanceOf(Promise);
  });

  it('honors the latency timing', async () => {
    const start = Date.now();
    await request('/x', { latency: 40 });
    expect(Date.now() - start).toBeGreaterThanOrEqual(30);
  });
});

describe('services/api domain methods', () => {
  it('exposes the expected domain groups', () => {
    for (const group of [
      'posts',
      'comments',
      'users',
      'links',
      'tags',
      'media',
      'notifications',
      'maintenance',
      'auth'
    ]) {
      expect(api[group], `api.${group}`).toBeTypeOf('object');
    }
    expect(api.remove).toBeTypeOf('function');
  });

  it('every domain method returns a Promise (consistent async contract)', async () => {
    const calls = [
      api.remove('posts', 1),
      api.posts.publish({}),
      api.posts.saveDraft({}),
      api.posts.setStatus(1, 'draft'),
      api.comments.setStatus(1, 'spam'),
      api.users.setBanned(1, true),
      api.users.forceLogout(1),
      api.links.validate('https://x.test'),
      api.tags.import(['a']),
      api.media.regenerateThumbnails(1),
      api.notifications.markAllRead(),
      api.maintenance.clearCache(),
      api.auth.login({ user: 'a', pass: 'b' })
    ];
    calls.forEach(c => expect(c).toBeInstanceOf(Promise));
    const settled = await Promise.all(calls);
    settled.forEach(r => expect(r).toEqual({ ok: true }));
  });
});
