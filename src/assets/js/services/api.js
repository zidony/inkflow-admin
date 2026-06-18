/* ============================================================
   InkFlow Admin — Backend Service API (domain methods)

   Thin, grouped wrappers over request() from http.js. UI modules call
   these instead of inlining fake timers, so the whole template talks to
   the backend through one seam. Each method's `latency` mirrors the
   operation's original demo timing; swap http.js's request() for fetch()
   to go live (override individual methods here if your endpoints differ).
   ============================================================ */

import { request } from './http.js';

export const api = {
  // Generic delete for the shared `delete` action (resource inferred by caller).
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),

  posts: {
    publish: payload => request('/posts/publish', { method: 'POST', body: payload, latency: 1200 }),
    saveDraft: payload => request('/posts/draft', { method: 'POST', body: payload }),
    setStatus: (id, status) =>
      request(`/posts/${id}/status`, { method: 'PATCH', body: { status } }),
    remove: id => request(`/posts/${id}`, { method: 'DELETE' })
  },

  comments: {
    setStatus: (id, status) =>
      request(`/comments/${id}/status`, { method: 'PATCH', body: { status } }),
    publishReply: payload =>
      request('/comments/reply', { method: 'POST', body: payload, latency: 900 }),
    saveDraft: payload =>
      request('/comments/reply/draft', { method: 'POST', body: payload, latency: 900 })
  },

  users: {
    setBanned: (id, banned) => request(`/users/${id}/ban`, { method: 'PATCH', body: { banned } }),
    forceLogout: id => request(`/users/${id}/logout`, { method: 'POST', latency: 900 }),
    sendPasswordReset: id =>
      request(`/users/${id}/password-reset`, { method: 'POST', latency: 900 })
  },

  links: {
    validate: url => request('/links/validate', { method: 'POST', body: { url }, latency: 800 })
  },

  tags: {
    import: tags => request('/tags/import', { method: 'POST', body: { tags }, latency: 800 })
  },

  media: {
    remove: id => request(`/media/${id}`, { method: 'DELETE', latency: 800 }),
    regenerateThumbnails: id =>
      request(`/media/${id}/thumbnails`, { method: 'POST', latency: 1000 })
  },

  notifications: {
    markRead: id => request(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
    remove: id => request(`/notifications/${id}`, { method: 'DELETE' }),
    clearRead: () => request('/notifications/read', { method: 'DELETE' }),
    savePreference: preference =>
      request('/notifications/preferences', { method: 'PUT', body: preference })
  },

  maintenance: {
    clearCache: () => request('/maintenance/cache', { method: 'DELETE', latency: 1000 }),
    rebuildAssets: () => request('/maintenance/assets', { method: 'POST', latency: 1000 }),
    sendTestEmail: () => request('/maintenance/test-email', { method: 'POST', latency: 1000 })
  },

  auth: {
    login: credentials =>
      request('/auth/login', { method: 'POST', body: credentials, latency: 900 })
  }
};
