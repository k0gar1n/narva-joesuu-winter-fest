import {readFile,writeFile,readdir,mkdir,copyFile,rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const source=path.resolve(process.argv[2]||'../website/dist');
const destination=fileURLToPath(new URL('../docs/',import.meta.url));
const base='/narva-joesuu-winter-fest';
const origin='https://k0gar1n.github.io'+base;
const previousOrigin='https://narva-joesuu-winter-fest-2027.mimimisha565.chatgpt.site';
if(source===destination||source.startsWith(destination+path.sep))throw Error('Source must be outside the output directory');
await readFile(path.join(source,'index.html'),'utf8');
await rm(destination,{recursive:true,force:true});
await mkdir(destination,{recursive:true});

function siteUrl(value,relativeFile){
 if(!value||value.startsWith('#')||/^(?:[a-z]+:|\/\/)/i.test(value))return value;
 const local=new URL(value,'https://local.invalid/'+relativeFile);
 return base+local.pathname+local.search+local.hash;
}
let count=0;
async function exportDirectory(relative=''){
 for(const entry of await readdir(path.join(source,relative),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const file=path.posix.join(relative,entry.name);
  const from=path.join(source,file),to=path.join(destination,file);
  if(entry.isDirectory()){await mkdir(to,{recursive:true});await exportDirectory(file);continue;}
  if(!entry.isFile())continue;
  if(/\.(html|js|css|xml|ics)$/.test(file)){
   let body=(await readFile(from,'utf8')).replaceAll(previousOrigin,origin);
   if(file.endsWith('.html')){
    body=body.replace(/\b(href|src)="([^"]*)"/g,(_,attr,value)=>`${attr}="${siteUrl(value,file)}"`);
    body=body.replace(/\b(srcset|imagesrcset)="([^"]*)"/g,(_,attr,value)=>`${attr}="${value.split(',').map(item=>{const [ref,...size]=item.trim().split(/\s+/);return [siteUrl(ref,file),...size].join(' ');}).join(', ')}"`);
   }
   if(file==='config.js')body=`window.WF_BASE=${JSON.stringify(base)};\n`+body;
   if(file==='app.js'){
    const before="a.href=(lang==='ru'?'':'/'+lang)+a.dataset.siteRoute";
    if(!body.includes(before))throw Error('Homepage route expression changed; update exporter');
    body=body.replace(before,"a.href=(window.WF_BASE||'')+(lang==='ru'?'':'/'+lang)+a.dataset.siteRoute");
   }
   await writeFile(to,body);
  }else await copyFile(from,to);
  count++;
 }
}
await exportDirectory();
await writeFile(path.join(destination,'.nojekyll'),'');
console.log(`Exported ${count} website files for ${origin}/`);
