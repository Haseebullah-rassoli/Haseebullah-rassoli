'use strict';
document.getElementById('copy-post-link')?.addEventListener('click',async()=>{const output=document.getElementById('share-result');try{await navigator.clipboard.writeText(document.querySelector('link[rel="canonical"]').href);output.textContent='Post link copied. You can share it anywhere.';}catch{output.textContent='Copy the address from your browser to share this post.';}});
