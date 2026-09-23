# Verified Digital Hub — Google-hosted custom submission backend

This backend replaces FormSubmit for both **Submit for Review** and **Business Inquiry**. The website remains free on GitHub Pages. A Google account owns the Apps Script, private spreadsheet and private Drive folder.

**Current status:** The repository includes all required code, but the public form is intentionally **disabled** until the owner deploys and tests the Google web app. Do not claim that submissions work before completing the checklist.

## One-time setup (owner only)

1. While signed in to your own Google account, visit [script.google.com](https://script.google.com/) and create a new project named `Verified Digital Hub Forms`.
2. Replace the new project's `Code.gs` with the complete contents of [Code.gs](Code.gs). Use the actual code, not the GitHub page HTML.
3. In Apps Script, choose **+ → HTML** and name the HTML file exactly **Form**. Paste the complete contents of [Form.html](Form.html). Do not include `.html` in the name you type.
4. Select the function **`setupOnce_`** in the Apps Script editor and click **Run**. Approve Google's access request to create a private Google Sheet and private Google Drive folder and to send notification email. Run this ONLY in your own project; do not put private IDs or access tokens in GitHub. If the editor does not offer `setupOnce_` in its run menu, temporarily rename it `setupOnce`, run it once, then change the name back to `setupOnce_` before deploying.
5. Check the Apps Script **Execution log** for the private Sheet and folder links. Both are stored in script properties; do not publish their IDs. Verify the owner-only access permissions.
6. Choose **Deploy → New deployment → Web app**. Use **Execute as: Me** and **Who has access: Anyone** (not “Anyone with Google account” if reports should not require sign-in). Deploy, authorize if prompted, and copy the deployed URL ending in `/exec`. Google may ask for an additional authorization/verification acknowledgment.
7. Open the `/exec` URL in a private browser window, test a **redacted text-only report**, then test a small redacted PNG/JPEG. Confirm that a **VDH-...** receipt appears, a new row exists in your private Sheet, and the screenshot is private in Drive. Test `?kind=business` too. Check the email notification; saving the report, not email notification, is the success criterion.
8. Once tested, paste the exact `/exec` URL into the quotes in the public [form-backend-config.js](../../form-backend-config.js) file in `main`. Example only: `window.HUB_FORM_BACKEND_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";`. **Do not copy the example as a real URL.**
9. Wait for GitHub Pages deployment to complete. Test [Submit for Review](../../submit-review.html) and [Business](../../business.html) in both mobile and desktop browsers. If the embedded form is blocked by browser privacy restrictions, use its **open Google-hosted form in a new tab** link.

## Data flow and limits

- The HTML form is served by Google Apps Script, not hosted directly in the GitHub repository. It uses `google.script.run` to send its form data directly to the owner-run Apps Script.
- The server validates type, category, message length, optional email and the screenshot's image signature and MIME. PNG/JPEG only; **maximum 2 MB**, one file. It accepts anonymous reports, so maintain the Google security settings and monitor quotas/spam.
- The owner-created Google Sheet holds report fields and an optional private Drive file link. Neither document is shared publicly by the code. The owner should periodically review and delete old submissions and screenshots under a retention policy.
- A receipt appears only after the row has been saved. Email notification can separately fail; the receipt explicitly says if notification was unavailable. No response, case review, safety verdict or delivery guarantee is implied.
- Global soft daily cap: 100; duplicate text submissions are limited for one hour. These are basic anti-abuse safeguards, **not** a substitute for a professional abuse prevention service; Google quotas and storage limits still apply.
- To pause all public website submissions, clear `HUB_FORM_BACKEND_URL` in `form-backend-config.js`. To stop submission at the source, unpublish or restrict the Apps Script deployment. Clearing only the website setting does not disable a public backend URL already shared elsewhere.
- `HtmlService.XFrameOptionsMode.ALLOWALL` enables embedding on GitHub Pages. It also removes Google's default frame restriction, which has clickjacking implications. If you prefer not to allow embedding, remove that call and link directly to the Google-hosted form rather than using an iframe.
- Submitted content is sensitive. **Never upload raw submissions, screenshots, script properties or Sheet/Drive IDs to the public GitHub repository.** The owner, Google and any services authorized by the owner may process the data. Treat the server as independent from GitHub Pages.
- **No paid plan, service-level guarantee, or unlimited quota is promised.** Apps Script, MailApp, Sheets and Drive quotas apply.

## When testing fails

Check **Apps Script → Executions** for the failure; verify `setupOnce_` completed, deployment is the latest version, access is Anyone, and authorization is granted. A failed navigation or an error without a VDH reference is not a confirmed submission. Keep redacted test cases only; do not use genuine private documents to test.

## Files in this directory

- `Code.gs`: owner-run setup, private data storage, server validation, duplicate handling, and notification.
- `Form.html`: responsive hosted custom form and honest saved/error feedback.
- `../../form-backend-config.js`: the public deployment URL, empty until owner activation.
