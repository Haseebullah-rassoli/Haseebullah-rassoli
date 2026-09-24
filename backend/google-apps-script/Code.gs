/**
 * Verified Digital Hub — owner-managed Google Apps Script form backend.
 * Never put the destination folder/sheet IDs or private data in GitHub.
 * Run setupOnce_() manually in your OWN Apps Script editor before deployment.
 */
const HUB_OWNER_EMAIL = 'rassolihaseebullah24@gmail.com';
const HUB_MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const HUB_MAX_DAILY_SUBMISSIONS = 100;
const HUB_CATEGORIES = [
  'Suspicious email or message', 'Job or interview offer',
  'Scholarship or youth program', 'Website or URL', 'Other online claim'
];
const HUB_SERVICES = [
  'Premium Research & Verification', 'Digital Media Services',
  'Social Media Management', 'Content Creation',
  'Advertising & Sponsored Content', 'Partnerships', 'Other'
];

/** Run this one time while signed in to the correct Google account. */
function setupOnce_() {
  const props = PropertiesService.getScriptProperties();
  if (props.getProperty('HUB_SHEET_ID') && props.getProperty('HUB_FOLDER_ID')) {
    return 'Already configured. Do not create duplicate storage.';
  }
  const folder = DriveApp.createFolder('Verified Digital Hub - Private Reports');
  const sheetFile = SpreadsheetApp.create('Verified Digital Hub - Private Submissions');
  const sheet = sheetFile.getSheets()[0];
  sheet.setName('Submissions');
  sheet.appendRow([
    'Timestamp UTC', 'Reference', 'Kind', 'Category / Service',
    'Organization / Claim', 'Source URL', 'Description / Message',
    'Reply Email', 'Screenshot Drive URL', 'Screenshot MIME', 'Notification'
  ]);
  sheet.setFrozenRows(1);
  props.setProperties({
    HUB_SHEET_ID: sheetFile.getId(),
    HUB_FOLDER_ID: folder.getId(),
    HUB_OWNER_EMAIL: HUB_OWNER_EMAIL
  });
  Logger.log('Setup completed. Private Sheet: ' + sheetFile.getUrl());
  Logger.log('Private screenshot folder: ' + folder.getUrl());
  return 'Setup complete. Check the execution log for your private Sheet and folder.';
}

function doGet(e) {
  const props = PropertiesService.getScriptProperties();
  const ready = Boolean(props.getProperty('HUB_SHEET_ID') && props.getProperty('HUB_FOLDER_ID'));
  const kind = e && e.parameter && e.parameter.kind === 'business' ? 'business' : 'review';
  const template = HtmlService.createTemplateFromFile('Form');
  template.kind = kind;
  template.ready = ready;
  return template.evaluate()
    .setTitle(kind === 'business' ? 'Business Inquiry | Verified Digital Hub' : 'Submit for Review | Verified Digital Hub')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function hubSafeText_(value, max) {
  return String(value === undefined || value === null ? '' : value).trim().slice(0, max);
}
function hubSafeCell_(value) {
  const text = String(value || '');
  // Prevent user input being interpreted as a Sheets formula.
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}
function hubHash_(value) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value);
  return Utilities.base64EncodeWebSafe(digest).slice(0, 44);
}

/**
 * Optional private WhatsApp notification.
 * Requires an approved WhatsApp Business Platform message template with TWO
 * body text variables in this order: submission kind, submission reference.
 * E.g. "New {{1}} submission saved. Reference: {{2}}. Check your private dashboard."
 * Configure token, phone-number ID, recipient, template name/language/version
 * ONLY in Apps Script Script properties. Never put them in GitHub or HTML.
 * A failed WhatsApp request must NEVER cause a saved report to be retried.
 */
function hubNotifyWhatsApp_(kind, reference) {
  const props = PropertiesService.getScriptProperties();
  const token = props.getProperty('HUB_WA_ACCESS_TOKEN');
  const senderId = props.getProperty('HUB_WA_PHONE_NUMBER_ID');
  const recipient = props.getProperty('HUB_WA_RECIPIENT');
  const templateName = props.getProperty('HUB_WA_TEMPLATE_NAME');
  const language = props.getProperty('HUB_WA_TEMPLATE_LANGUAGE') || 'en_US';
  const version = props.getProperty('HUB_WA_GRAPH_VERSION');
  if (![token, senderId, recipient, templateName, version].every(Boolean)) {
    return { configured: false, accepted: false };
  }
  if (!/^\\d{7,15}$/.test(recipient) || !/^\\d+$/.test(senderId) ||
      !/^v\\d+\\.\\d+$/.test(version) ||
      !/^[a-z0-9_]+$/.test(templateName) ||
      !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(language)) {
    throw new Error('WhatsApp configuration format is invalid.');
  }
  const endpoint = 'https://graph.facebook.com/' + version + '/' + senderId + '/messages';
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: recipient,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      components: [{
        type: 'body',
        parameters: [
          { type: 'text', text: kind },
          { type: 'text', text: reference }
        ]
      }]
    }
  };
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  const code = response.getResponseCode();
  const result = JSON.parse(response.getContentText() || '{}');
  if (code < 200 || code >= 300 || !result.messages || !result.messages.length) {
    // Do not log the bearer token, raw response or any private submission fields.
    throw new Error('WhatsApp API did not accept the notification (HTTP ' + code + ').');
  }
  // API acceptance is not a guarantee of WhatsApp delivery; use delivery webhooks
  // for confirmed delivered/read status if needed in the future.
  return { configured: true, accepted: true };
}

/** Called ONLY by the Google-hosted HTML form through google.script.run. */
function submitHubForm(form) {
  const props = PropertiesService.getScriptProperties();
  const sheetId = props.getProperty('HUB_SHEET_ID');
  const folderId = props.getProperty('HUB_FOLDER_ID');
  if (!sheetId || !folderId) throw new Error('The form is not activated yet.');
  if (!form || hubSafeText_(form.website, 100)) throw new Error('Submission was rejected.');
  const kind = hubSafeText_(form.kind, 20);
  if (kind !== 'review' && kind !== 'business') throw new Error('Invalid form type.');
  const category = hubSafeText_(form.category, 110);
  const allowed = kind === 'review' ? HUB_CATEGORIES : HUB_SERVICES;
  if (allowed.indexOf(category) < 0) throw new Error('Please select a valid category.');
  const details = hubSafeText_(form.message, 3501);
  if (details.length < 20 || details.length > 3500) throw new Error('Please provide 20–3,500 characters.');
  const email = hubSafeText_(form.email, 180);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Please enter a valid email address.');
  if (hubSafeText_(form.consent, 5) !== 'yes') throw new Error('Consent is required.');
  const subject = hubSafeText_(form.subject, 160);
  const source = hubSafeText_(form.source, 500);
  const raw = form.attachment;
  let attachment = null, mime = '';
  if (kind === 'review' && raw && typeof raw.getBytes === 'function') {
    const bytes = raw.getBytes();
    if (bytes.length) {
      mime = hubSafeText_(raw.getContentType(), 80);
      // Verify both MIME and file signature; do not trust the extension.
      const png = bytes.length >= 8 && bytes[0] === -119 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71 && bytes[4] === 13 && bytes[5] === 10 && bytes[6] === 26 && bytes[7] === 10;
      const jpg = bytes.length >= 3 && bytes[0] === -1 && bytes[1] === -40 && bytes[2] === -1;
      if (bytes.length > HUB_MAX_IMAGE_BYTES) throw new Error('Screenshot must be 2 MB or smaller.');
      if (!((png && mime === 'image/png') || (jpg && mime === 'image/jpeg'))) throw new Error('Only PNG or JPEG screenshots are accepted.');
      attachment = Utilities.newBlob(bytes, mime, 'redacted-screenshot.' + (png ? 'png' : 'jpg'));
    }
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw new Error('The service is busy. Please try again.');
  let imageFile = null;
  let saved = false;
  let reference = '';
  try {
    const cache = CacheService.getScriptCache();
    const dayKey = 'daily_' + Utilities.formatDate(new Date(), 'UTC', 'yyyyMMdd');
    const count = Number(cache.get(dayKey) || 0);
    if (count >= HUB_MAX_DAILY_SUBMISSIONS) throw new Error('Daily capacity reached. Please try again tomorrow.');
    const fingerprint = hubHash_([kind,category,subject,source,details,email].join('|'));
    const duplicateKey = 'dup_' + fingerprint;
    if (cache.get(duplicateKey)) throw new Error('This report was already received recently. Please do not submit it again.');
    reference = 'VDH-' + Utilities.getUuid().slice(0, 8).toUpperCase();
    let imageUrl = '';
    if (attachment) {
      imageFile = DriveApp.getFolderById(folderId).createFile(attachment);
      imageFile.setName(reference + '-redacted-screenshot.' + (mime === 'image/png' ? 'png' : 'jpg'));
      // File stays private; do not call setSharing.
      imageUrl = imageFile.getUrl();
    }
    const sheet = SpreadsheetApp.openById(sheetId).getSheetByName('Submissions');
    if (!sheet) throw new Error('The storage sheet is unavailable.');
    sheet.appendRow([
      new Date().toISOString(), reference, kind, hubSafeCell_(category),
      hubSafeCell_(subject), hubSafeCell_(source), hubSafeCell_(details),
      hubSafeCell_(email), imageUrl, mime, 'Pending'
    ]);
    saved = true;
    cache.put(duplicateKey, '1', 3600);
    cache.put(dayKey, String(count + 1), 86400);
  } catch (err) {
    if (imageFile && !saved) {
      try { imageFile.setTrashed(true); } catch (_) {}
    }
    throw err;
  } finally {
    lock.releaseLock();
  }
  let notified = false;
  try {
    // Email is a notification, not the database. It deliberately omits the private report content.
    MailApp.sendEmail({
      to: HUB_OWNER_EMAIL,
      subject: 'Verified Digital Hub: New ' + kind + ' submission (' + reference + ')',
      body: 'A new submission ' + reference + ' was saved to your private Google Sheet. Open the private sheet from your Google Drive. Do not publish personal details.'
    });
    notified = true;
  } catch (err) {
    // The report is already saved in the private sheet; do not make the user submit twice.
    console.error('Notification unavailable for ' + reference + ': ' + err);
  }
  try {
    const sh = SpreadsheetApp.openById(sheetId).getSheetByName('Submissions');
    const row = sh.getLastRow();
    if (sh.getRange(row, 2).getValue() === reference) {
      sh.getRange(row, 11).setValue(notified ? 'Sent' : 'Unavailable - check Sheet');
    }
  } catch (_) {}
  let whatsappAccepted = false;
  try {
    // Only the report type and reference are sent; NEVER the message, email,
    // private Sheet URL, Drive link or screenshot.
    whatsappAccepted = hubNotifyWhatsApp_(kind, reference).accepted;
  } catch (err) {
    console.error('WhatsApp notification unavailable for ' + reference + ': ' + err.message);
  }
  return { saved: true, reference: reference, notified: notified, whatsappAccepted: whatsappAccepted };
}
