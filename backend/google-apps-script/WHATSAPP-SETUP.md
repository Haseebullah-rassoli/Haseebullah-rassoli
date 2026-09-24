# WhatsApp integration — Verified Digital Hub

Status: **code prepared, not activated.** Neither a public contact number nor Meta credentials are committed to GitHub. The existing Google Sheet and Drive storage stays unchanged. The owner must confirm which WhatsApp number may be public and connect an authorized WhatsApp Business Platform account before notifications can be sent.

## A. Public "WhatsApp Contact" button

The website uses [WhatsApp click to chat](https://faq.whatsapp.com/5913398998672934). The number is public to every visitor when enabled.

1. Confirm the exact WhatsApp-enabled contact number that you consent to publish.
2. In the website's `whatsapp-contact-config.js`, enter the international number as **digits only**, without `+`, whitespace, hyphens or a leading domestic zero. Set `HUB_WHATSAPP_CONTACT_NUMBER` to that number. The prefilled text can also be edited there.
3. The contact link appears automatically on the site's pages. Until the number is provided, it remains hidden and no unverified contact number is published.
4. Click it from a mobile device and desktop browser to check the intended WhatsApp account opens.

The click-to-chat link opens a conversation only; it is **not** an automatic alert system.

## B. Owner-only notification after each saved submission

The Google Apps Script source is in `backend/google-apps-script/Code.gs`; it includes an **optional**, disabled-by-default WhatsApp Cloud API sender. After a report or business inquiry has been saved to the private Google Sheet, it can send a WhatsApp template containing only the submission kind (review/business) and the VDH reference. It sends **no report content, email, source URL, screenshot, Sheet link or Drive link**.

Prerequisites:
- A Meta developer/business setup with an authorized WhatsApp Business Platform (Cloud API) sender and its **Phone Number ID**.
- A valid, securely held access token permitted to send WhatsApp messages from that sender.
- The intended recipient number in international digits-only format. Use a recipient you own or have permission to notify, and satisfy WhatsApp's applicable messaging/opt-in rules.
- A Meta-approved message template, language code and any other applicable template requirements. The code expects exactly **two body text placeholders**: `{{1}}` = kind and `{{2}}` = reference. Example: "New {{1}} submission saved. Reference: {{2}}. Open your private Google Sheet to review." This is an example for submission to Meta; approval is not assumed.
- The supported Graph API version supplied in the Meta developer dashboard, for example `vXX.X` (replace with the real version, **never** use the example text).

In the **owner's Apps Script editor**, open **Project Settings → Script properties**, and add the following properties there. Never add access tokens to `Code.gs`, `Form.html`, `whatsapp-contact-config.js`, a screenshot, or a chat message.

| Script property | Private value |
| --- | --- |
| `HUB_WA_ACCESS_TOKEN` | Meta access token |
| `HUB_WA_PHONE_NUMBER_ID` | Cloud API sender phone-number ID |
| `HUB_WA_RECIPIENT` | Authorized recipient's international digits-only number |
| `HUB_WA_TEMPLATE_NAME` | Approved template name, lowercase with underscores |
| `HUB_WA_TEMPLATE_LANGUAGE` | Approved language code such as `en_US` |
| `HUB_WA_GRAPH_VERSION` | Supported `vXX.X` Graph API version |

No public URL or OAuth token from the client-side site is used to send alerts. The owner must copy the updated **Code.gs** into the existing Google Apps Script project and use **Deploy → Manage deployments → Edit → New version → Deploy**. Re-deploying is necessary; changing the GitHub source alone does **not** update the existing deployed Apps Script. The project's private Sheet and folder configuration remains in its Script properties if working within the same project; do **not** run setup again.

When any required WhatsApp property is missing, the sender is disabled. On a WhatsApp API error, the report stays saved, the normal receipt still displays, and the private execution log records a generic error. API acceptance is not proof that the message was delivered; delivery/read status would need the appropriate webhook status handling.

Test with a **redacted synthetic report** only. Confirm the VDH reference in the private Sheet, that the WhatsApp text contains only type and reference, and that a screenshot is never forwarded. Check Meta's messaging costs and policies before activating. Do not share any screenshots containing credentials, the private sheet or any user's reports.

## C. Changing or disabling the feature

- To hide the public button, clear `HUB_WHATSAPP_CONTACT_NUMBER` in the public config file.
- To disable backend WhatsApp notifications, remove `HUB_WA_ACCESS_TOKEN` from the private Apps Script Script properties. Existing Sheet/email intake will continue.
- If the sender or recipient changes, update the properties privately and send another synthetic test before relying on notifications.
