import {readFile, writeFile, readdir, mkdir, copyFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const source=fileURLToPath(new URL('../docs/',import.meta.url));
const output=fileURLToPath(new URL('../dist/',import.meta.url));
const githubBase='/narva-joesuu-winter-fest';
const githubOrigin='https://k0gar1n.github.io'+githubBase;
const siteUrl=process.env.SITE_URL||'https://www.winterfest.ee';
const parsed=new URL(siteUrl);
if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash)throw Error('SITE_URL must be a site origin such as https://example.ee');
const origin=parsed.origin;
const clarityConfig=JSON.parse(await readFile(path.join(source,'clarity-config.json'),'utf8'));
const clarityProjectId=(process.env.CLARITY_PROJECT_ID??clarityConfig.projectId??'').trim();
if(clarityProjectId&&!/^[a-z0-9]+$/i.test(clarityProjectId))throw Error('CLARITY_PROJECT_ID must contain only letters and digits');
const clarityTag=clarityProjectId?`<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", ${JSON.stringify(clarityProjectId)});
</script>`:'';
const googleTag=`<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-Y2YC35PEE2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-Y2YC35PEE2');
</script>`;
await readFile(path.join(source,'index.html'),'utf8');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
let count=0;
const assetVersions=new Map();
for(const file of await readdir(source)){
 if(/\.(css|js)$/.test(file))assetVersions.set('/'+file,createHash('sha256').update(await readFile(path.join(source,file))).digest('hex').slice(0,12));
}
async function build(relative=''){
 for(const entry of await readdir(path.join(source,relative),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const name=path.join(relative,entry.name),from=path.join(source,name),to=path.join(output,name);
  if(entry.isDirectory()){await mkdir(to,{recursive:true});await build(name);continue;}
  if(!entry.isFile())continue;
  if(/\.(html|js|css|xml|ics)$/.test(name)){
   let content=await readFile(from,'utf8');
   content=content.replaceAll(githubOrigin,origin).replaceAll(githubBase+'/','/');
   if(name.endsWith('.html')){
    if(!content.includes('<head>'))throw Error(`Missing <head> in ${name}`);
    content=content.replace('<head>',`<head>${googleTag}${clarityTag}`);
    content=content.replaceAll('href="/?lang=et"','href="/et/"').replaceAll('href="/?lang=en"','href="/en/"').replaceAll('href="/?lang=ru"','href="/"');
   }
   if(name.endsWith('.html'))content=content.replace(/((?:src|href)=")([^"?]+)(?:\?[^" ]*)?(")/g,(match,start,url,end)=>assetVersions.has(url)?`${start}${url}?v=${assetVersions.get(url)}${end}`:match);
   if(name==='config.js')content=content.replace('window.WF_BASE="'+githubBase+'";','window.WF_BASE="";');
   await writeFile(to,content);
  }else await copyFile(from,to);
  count++;
 }
}
await build();
console.log(`Built ${count} files for ${origin}`);
console.log(clarityProjectId?`Clarity enabled: ${clarityProjectId}`:'Clarity disabled: add the Winter Fest project ID to docs/clarity-config.json');
