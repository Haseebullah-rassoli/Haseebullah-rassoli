/* Pure validation used before preparing an external message. Never renders user HTML. */
(function (root) {
  'use strict';
  const allowedFields = Object.freeze({
    review: ['Report type', 'Organization / website', 'Source link', 'Report details'],
    business: ['Name', 'Service', 'Project details', 'Reply details']
  });
  function prepareMessage(kind, entries, number) {
    if (!Object.hasOwn(allowedFields, kind)) throw new Error('Choose a valid report type.');
    if (!/^[0-9]{7,15}$/.test(number)) throw new Error('The contact number is unavailable.');
    const lines = ['Verified Digital Hub — ' + (kind === 'business' ? 'Business Inquiry' : 'Community Review Report'), ''];
    for (const [key, value] of entries) {
      if (!allowedFields[kind].includes(key) || typeof value !== 'string') continue;
      const clean = value.trim().replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
      if (clean.length > 2500) throw new Error('Please shorten your message to 2,500 characters per field.');
      if (key === 'Source link' && clean) {
        let url;
        try { url = new URL(clean); } catch { throw new Error('Enter a complete http:// or https:// source link.'); }
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Use an http:// or https:// source link without login details.');
      }
      if (clean) lines.push(key + ': ' + clean);
    }
    lines.push('', 'Sent from Verified Digital Hub website.');
    const text = lines.join('\n');
    return Object.freeze({ text, url: 'https://wa.me/' + number + '?text=' + encodeURIComponent(text) });
  }
  const api = Object.freeze({ prepareMessage });
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.defineProperty(root, 'HubSecurity', { value: api, writable: false });
})(typeof window !== 'undefined' ? window : globalThis);
