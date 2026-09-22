import {readFile, writeFile, readdir, mkdir, copyFile, rm} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const source=fileURLToPath(new URL('../docs/',import.meta.url));
const output=fileURLToPath(new URL('../dist/',import.meta.url));
const githubBase='/narva-joesuu-winter-fest';
const githubOrigin='https://k0gar1n.github.io'+githubBase;
const siteUrl=process.env.SITE_URL||'https://www.winterfest.ee';
const parsed=new URL(siteUrl);
if(!['http:','https:'].includes(parsed.protocol)||parsed.username||parsed.password||parsed.pathname!=='/'||parsed.search||parsed.hash)throw Error('SITE_URL must be a site origin such as https://example.ee');
const origin=parsed.origin;
await readFile(path.join(source,'index.html'),'utf8');
await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
let count=0;
async function build(relative=''){
 for(const entry of await readdir(path.join(source,relative),{withFileTypes:true})){
  if(entry.name.startsWith('.'))continue;
  const name=path.join(relative,entry.name),from=path.join(source,name),to=path.join(output,name);
  if(entry.isDirectory()){await mkdir(to,{recursive:true});await build(name);continue;}
  if(!entry.isFile())continue;
  if(/\.(html|js|css|xml|ics)$/.test(name)){
   let content=await readFile(from,'utf8');
   content=content.replaceAll(githubOrigin,origin).replaceAll(githubBase+'/','/');
   if(name==='config.js')content=content.replace('window.WF_BASE="'+githubBase+'";','window.WF_BASE="";');
   await writeFile(to,content);
  }else await copyFile(from,to);
  count++;
 }
}
await build();
console.log(`Built ${count} files for ${origin}`);
