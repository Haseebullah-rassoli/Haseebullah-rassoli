const {test}=require('node:test');
const assert=require('node:assert/strict');
const {prepareMessage}=require('../security.js');
const number='93793582271';
test('user HTML and query characters stay encoded text on the fixed WhatsApp origin',()=>{
 const text='<img src=x onerror=alert(1)> &text=other # fragment پښتو';
 const result=prepareMessage('review',[['Report details',text]],number);
 const url=new URL(result.url);
 assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/'+number);
 assert.deepEqual([...url.searchParams.keys()],['text']);
 assert.equal(url.searchParams.get('text'),result.text);assert.ok(result.text.includes(text));
});
test('unsafe source protocols and credential-bearing links are rejected',()=>{
 for(const link of ['javascript:alert(1)','data:text/html,x','file:///etc/passwd','https://user:password@example.com'])assert.throws(()=>prepareMessage('review',[['Source link',link]],number));
 for(const link of ['http://example.com','https://example.com/path?q=a&b=c'])assert.doesNotThrow(()=>prepareMessage('review',[['Source link',link]],number));
});
test('invalid recipients, unexpected fields and oversized values fail safely',()=>{
 assert.throws(()=>prepareMessage('review',[],number+'?redirect=evil'));
 assert.throws(()=>prepareMessage('__proto__',[],number));
 assert.throws(()=>prepareMessage('review',[['Report details','x'.repeat(2501)]],number));
 assert.ok(!prepareMessage('business',[['password','secret']],number).text.includes('secret'));
});
