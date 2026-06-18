/* ============================================================
   InkFlow Admin — HTTP Transport (the single backend seam)

   This is the ONE place to wire the template to a real backend.
   Every service method in api.js funnels through request() below.

   To go live, replace the MOCK body of request() with a real call, e.g.:

     const API_BASE = '';            // set to your API base URL
     export async function request(path, { method = 'GET', body } = {}) {
       const res = await fetch(API_BASE + path, {
         method,
         headers: { 'Content-Type': 'application/json' },
         body: body == null ? undefined : JSON.stringify(body)
       });
       if (!res.ok) throw new Error('Request failed: ' + res.status);
       return res.status === 204 ? { ok: true } : res.json();
     }

   The mock below resolves after a short delay so the demo keeps its
   original feel. `latency` lets each operation preserve its own timing;
   `mockResult` lets a caller shape the resolved payload.
   ============================================================ */

const MOCK_LATENCY = 600;

export function request(path, { method = 'GET', body, latency = MOCK_LATENCY, mockResult } = {}) {
  // MOCK transport — no network. Swap this body for the fetch() shown above.
  void path;
  void method;
  void body;
  return new Promise(resolve => {
    setTimeout(() => resolve(mockResult ?? { ok: true }), latency);
  });
}
