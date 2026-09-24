document.addEventListener("DOMContentLoaded",()=>{const toggle=document.querySelector(".mobile-toggle"),nav=document.querySelector(".nav-links");if(toggle&&nav){toggle.addEventListener("click",()=>{const show=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(show));toggle.textContent=show?"✕ Close":"☰ Menu"});}document.querySelectorAll(".nav-drop").forEach(d=>{d.addEventListener("toggle",()=>{if(d.open)document.querySelectorAll(".nav-drop").forEach(other=>{if(other!==d)other.open=false;});});});document.addEventListener("click",event=>{if(!event.target.closest(".nav-drop"))document.querySelectorAll(".nav-drop").forEach(d=>d.open=false);});const s=document.querySelector("#opportunity-search"),cat=document.querySelector("#opportunity-filter");function apply(){document.querySelectorAll("[data-search]").forEach(card=>{card.hidden=!!((s&&!card.dataset.search.includes(s.value.toLowerCase()))||(cat&&cat.value&&cat.value!==card.dataset.category));});}if(s)s.addEventListener("input",apply);if(cat)cat.addEventListener("change",apply);
// Owner-approved WhatsApp Business short link; do not expose or infer a phone number.
const waUrl=typeof window.HUB_WHATSAPP_CONTACT_URL==="string"?window.HUB_WHATSAPP_CONTACT_URL.trim():"";
const waNumber=typeof window.HUB_WHATSAPP_CONTACT_NUMBER==="string"?window.HUB_WHATSAPP_CONTACT_NUMBER.trim():"";
const waMessage=typeof window.HUB_WHATSAPP_CONTACT_MESSAGE==="string"?window.HUB_WHATSAPP_CONTACT_MESSAGE:"Hello, I would like to contact Verified Digital Hub.";
const waHref=/^https:\/\/wa\.me\/message\/[A-Za-z0-9]+\/?$/.test(waUrl)?waUrl:(/^\d{7,15}$/.test(waNumber)?"https://wa.me/"+waNumber+"?text="+encodeURIComponent(waMessage):"");
if(waHref){const contact=document.createElement("a");contact.className="hub-whatsapp-contact";contact.href=waHref;contact.target="_blank";contact.rel="noopener noreferrer";contact.setAttribute("aria-label","Contact Verified Digital Hub on WhatsApp Business");contact.innerHTML='<span class="hub-wa-dot" aria-hidden="true">●</span><span>WhatsApp Business</span><span class="hub-wa-arrow" aria-hidden="true">↗</span>';document.body.append(contact);document.querySelectorAll("[data-whatsapp-contact]").forEach(link=>{link.href=waHref;link.target="_blank";link.rel="noopener noreferrer";link.hidden=false;});}
// WhatsApp-first forms: prepare text locally, then the visitor explicitly sends it in WhatsApp.
document.querySelectorAll("[data-wa-form]").forEach(form=>{
 const status=form.querySelector("[data-wa-status]");
 const fallback=form.querySelector("[data-wa-fallback]");
 form.addEventListener("submit",event=>{
  event.preventDefault();
  if(!form.reportValidity())return;
  const number=typeof window.HUB_WHATSAPP_CONTACT_NUMBER==="string"?window.HUB_WHATSAPP_CONTACT_NUMBER.trim():"";
  if(!/^[0-9]{7,15}$/.test(number)){
   if(status)status.textContent="WhatsApp is temporarily unavailable. Please use the official WhatsApp contact button.";
   return;
  }
  const kind=form.dataset.waForm==="business"?"Business Inquiry":"Community Review Report";
  const lines=["Verified Digital Hub — "+kind,""];
  new FormData(form).forEach((value,key)=>{if(typeof value!=="string")return;const v=value.trim();if(v)lines.push(key+": "+v);});
  lines.push("","Sent from Verified Digital Hub website.");
  const url="https://wa.me/"+number+"?text="+encodeURIComponent(lines.join(String.fromCharCode(10)));
  if(fallback){fallback.href=url;fallback.hidden=false;}
  if(status)status.textContent="Prepared. WhatsApp will open next. Review the message, attach a redacted screenshot there if needed, then tap Send. This form does not upload files or submit to Google Sheets.";
  window.location.href=url;
 });
});
const backend=typeof window.HUB_FORM_BACKEND_URL==="string"?window.HUB_FORM_BACKEND_URL.trim():"";const configured=/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\/?$/.test(backend);
document.querySelectorAll("[data-hub-form]").forEach(mount=>{const kind=mount.dataset.hubForm==="business"?"business":"review";if(!configured)return;const url=backend.replace(/\/$/,"")+"?kind="+kind;mount.textContent="";const note=document.createElement("p");note.className="hub-form-privacy-note";note.textContent="This form is securely hosted by Google Apps Script. Reports are processed in the owner's private Google Sheet and Drive. Never include passwords, verification codes or unredacted ID documents.";mount.append(note);const iframe=document.createElement("iframe");iframe.className="hub-form-frame";iframe.title=kind==="business"?"Google-hosted business inquiry form":"Google-hosted private report form";iframe.src=url;iframe.loading="eager";iframe.referrerPolicy="strict-origin-when-cross-origin";mount.append(iframe);const fallback=document.createElement("p");fallback.className="hub-form-open";fallback.append("If the embedded form is not visible on your device, ");const link=document.createElement("a");link.href=url;link.target="_blank";link.rel="noopener noreferrer";link.textContent="open the official Google-hosted form in a new tab";fallback.append(link,".");mount.append(fallback);});
});