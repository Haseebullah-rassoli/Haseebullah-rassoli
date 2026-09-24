from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlparse
class Page(HTMLParser):
 def __init__(self):super().__init__();self.tags=[]
 def handle_starttag(self,tag,attrs):self.tags.append((tag,dict(attrs)))
root=Path('.');pages={}
for file in root.glob('*.html'):
 page=Page();page.feed(file.read_text());pages[file.name]=page
for name,page in pages.items():
 tags=page.tags
 assert any(t=='meta' and d.get('http-equiv')=='Content-Security-Policy' and "form-action 'none'" in d.get('content','') for t,d in tags), name
 for tag,d in tags:
  assert not any(k.startswith('on') or k=='style' for k in d), (name,'inline execution/style')
  if tag=='script':assert d.get('src') and not urlparse(d['src']).scheme, (name,'external/inline script')
  if tag=='a' and d.get('target')=='_blank':assert {'noopener','noreferrer'}<=set(d.get('rel','').split()), name
  for key in ('src','href'):
   ref=d.get(key,'');u=urlparse(ref)
   assert u.scheme not in ('javascript','data','http'), (name,ref)
   if ref and not u.scheme and not u.netloc:
    target=u.path or name
    assert (root/target).is_file(),(name,ref)
    if u.fragment and target in pages:assert any(x.get('id')==u.fragment for _,x in pages[target].tags),(name,ref)
 if any(t=='form' for t,d in tags):
  assert any(t=='fieldset' and 'disabled' in d for t,d in tags),name
  assert any(t=='input' and 'data-external-consent' in d and 'required' in d for t,d in tags),name
print(f'{len(pages)} pages passed CSP, local asset, safe link, consent and fail-closed form checks.')
