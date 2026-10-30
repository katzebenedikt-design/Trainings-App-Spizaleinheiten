const { chromium } = require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const dir=path.join(__dirname,'..','app','icons');
for (const [name,size,m] of [['icon-192.png',192,0],['icon-512.png',512,0],['maskable-512.png',512,1],['maskable-192.png',192,1],['apple-touch-icon.png',180,1],['favicon-32.png',32,0]]){
 const p=await b.newPage({viewport:{width:512,height:512},deviceScaleFactor:size/512});
 await p.goto('file://'+path.join(__dirname,'icon-src.html')+(m?'?m=1':''));await p.waitForTimeout(400);
 await p.locator('#s').screenshot({path:path.join(dir,name),omitBackground:true});await p.close();}
await b.close();})();
