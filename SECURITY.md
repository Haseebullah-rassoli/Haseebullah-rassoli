# Security notes for the GitHub Pages edition

The public website is hosted at https://haseebullah-rassoli.github.io/Haseebullah-rassoli/.

- Every page includes an in-document Content Security Policy. Scripts are restricted to this project path; inline execution, automatic network fetches, embedded frames, object content and native form submissions are blocked.
- Forms start disabled until the handler is installed, require consent, and prepare an encoded message. Only a separate user click opens WhatsApp with the entered text. Sending the message is a further action inside WhatsApp.
- Input validation rejects non-HTTP(S) source URLs and URLs with embedded credentials. It does not establish whether an HTTP(S) site is trustworthy.
- External new-tab links use noopener/noreferrer; referrer metadata prevents leaking page URLs.
- No passwords, API credentials or submissions database are needed by the static site. The Google Apps Script URL is an external form endpoint, not a credential. Its backend permissions, retention and security have not been audited.
- This public deployment has no owner-only login gate. Keep sensitive files out of the repository and website.
- The Cloudflare-specific _headers file is deliberately not copied. This deployment makes no claim to configure response-only headers such as Permissions-Policy, X-Content-Type-Options or CSP frame-ancestors. Meta CSP cannot enforce frame-ancestors.
- The GitHub repository history preserves the previous website for recovery. The separate Sites version remains private.

Validation: `python tests/check-pages.py`, `node --test tests/security.test.cjs`, and JavaScript syntax checks.

References:
https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
