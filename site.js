document.addEventListener("DOMContentLoaded",()=>{const toggle=document.querySelector(".mobile-toggle"),nav=document.querySelector(".nav-links");if(toggle&&nav){toggle.addEventListener("click",()=>{const show=nav.classList.toggle("is-open");toggle.setAttribute("aria-expanded",String(show));toggle.innerHTML=show?'<svg class="nav-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg><span class="nav-action-label">Close</span>':'<svg class="nav-action-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><span class="nav-action-label">Menu</span>'});}document.querySelectorAll(".nav-drop").forEach(d=>{d.addEventListener("toggle",()=>{if(d.open)document.querySelectorAll(".nav-drop").forEach(other=>{if(other!==d)other.open=false;});});});document.addEventListener("click",event=>{if(!event.target.closest(".nav-drop"))document.querySelectorAll(".nav-drop").forEach(d=>d.open=false);});const s=document.querySelector("#opportunity-search"),cat=document.querySelector("#opportunity-filter");function apply(){document.querySelectorAll("[data-search]").forEach(card=>{card.hidden=!!((s&&!card.dataset.search.includes(s.value.toLowerCase()))||(cat&&cat.value&&cat.value!==card.dataset.category));});}if(s)s.addEventListener("input",apply);if(cat)cat.addEventListener("change",apply);
// Owner-approved WhatsApp Business short link; do not expose or infer a phone number.
const waUrl=typeof window.HUB_WHATSAPP_CONTACT_URL==="string"?window.HUB_WHATSAPP_CONTACT_URL.trim():"";
const waNumber=typeof window.HUB_WHATSAPP_CONTACT_NUMBER==="string"?window.HUB_WHATSAPP_CONTACT_NUMBER.trim():"";
const waMessage=typeof window.HUB_WHATSAPP_CONTACT_MESSAGE==="string"?window.HUB_WHATSAPP_CONTACT_MESSAGE:"Hello, I would like to contact Verified Digital Hub.";
const waHref=/^https:\/\/wa\.me\/message\/[A-Za-z0-9]+\/?$/.test(waUrl)?waUrl:(/^\d{7,15}$/.test(waNumber)?"https://wa.me/"+waNumber+"?text="+encodeURIComponent(waMessage):"");
if(waHref){const contact=document.createElement("a");contact.className="hub-whatsapp-contact";contact.href=waHref;contact.target="_blank";contact.rel="noopener noreferrer";contact.setAttribute("aria-label","Contact Verified Digital Hub on WhatsApp Business");contact.innerHTML='<svg class="hub-wa-icon" aria-hidden="true" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M16 .8A15.1 15.1 0 0 0 3.1 23.7L1 31l7.5-2A15.2 15.2 0 1 0 16 .8Zm0 27.5a12.3 12.3 0 0 1-6.3-1.7l-.5-.3-4.5 1.2 1.2-4.4-.3-.5a12.4 12.4 0 1 1 10.4 5.7Zm6.8-9.3c-.4-.2-2.2-1.1-2.6-1.2-.3-.1-.6-.2-.8.2-.3.4-1 1.2-1.2 1.4-.2.2-.4.3-.8.1-.4-.2-1.6-.6-3.1-1.9-1.2-1-2-2.3-2.2-2.7-.2-.4 0-.6.2-.8l.6-.7.4-.6c.1-.2 0-.5 0-.7l-1.2-2.8c-.3-.7-.6-.6-.8-.6h-.7c-.3 0-.7.1-1 .5-.4.4-1.3 1.3-1.3 3.1s1.3 3.5 1.5 3.7c.2.2 2.6 4 6.3 5.6.9.4 1.6.6 2.2.7.9.3 1.7.2 2.4.2.7-.1 2.2-.9 2.5-1.8.3-.9.3-1.7.2-1.8-.1-.2-.3-.3-.7-.5Z"/></svg><span>WhatsApp Business</span><span class="hub-wa-arrow" aria-hidden="true">↗</span>';document.body.append(contact);document.querySelectorAll("[data-whatsapp-contact]").forEach(link=>{link.href=waHref;link.target="_blank";link.rel="noopener noreferrer";link.hidden=false;});}
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