/** Download Pexels photo originals, save local copies, rewrite only new stock photo URLs.
 *  Run from repository root: npm run download:photos
 *  Requires network access on your own computer, no third-party dependencies. */
const fs=require('fs'); const path=require('path'); const https=require('https');
const root=path.resolve(__dirname,'..');
const manifest=require(path.join(root,'PHOTO-SOURCES-AND-LICENSES.json'));
const out=path.join(root,'client/public/stock'); fs.mkdirSync(out,{recursive:true});
function get(url,redirects=0){return new Promise((resolve,reject)=>{
 if(redirects>4)return reject(new Error('too many redirects'));
 const req=https.get(url,{headers:{'User-Agent':'DarwichPhotoAssetBuilder/1.0'}},res=>{
  if(res.statusCode>=300 && res.statusCode<400 && res.headers.location){res.resume();return resolve(get(new URL(res.headers.location,url).href,redirects+1));}
  if(res.statusCode!==200){res.resume();return reject(new Error('HTTP '+res.statusCode));}
  if(!(res.headers['content-type']||'').startsWith('image/')){res.resume();return reject(new Error('not image content'));}
  const chunks=[];let total=0;res.on('data',d=>{total+=d.length;if(total>20e6){req.destroy(new Error('image too large'));}else chunks.push(d)});res.on('end',()=>resolve(Buffer.concat(chunks)));res.on('error',reject);
 });req.setTimeout(25000,()=>req.destroy(new Error('timeout')));req.on('error',reject);
})}
(async()=>{const saved=[];for(const photo of manifest){const file=path.join(out,photo.slug+'.jpg');
 try{let bytes=fs.existsSync(file)?fs.readFileSync(file):await get(photo.url);
 if(bytes[0]!==0xff||bytes[1]!==0xd8)throw new Error('not JPEG');
 fs.writeFileSync(file,bytes);console.log('Downloaded',photo.slug,Math.round(bytes.length/1024)+' KB');saved.push(photo);
 }catch(e){console.error('Could not download',photo.slug,e.message)}
}
 if(!saved.length){process.exitCode=1;return;}
 for(const file of ['server/initDb.js','client/src/stockPhotos.js']){const p=path.join(root,file);let s=fs.readFileSync(p,'utf8');for(const photo of saved)s=s.split(photo.url).join(photo.local);fs.writeFileSync(p,s);}
 console.log('Saved',saved.length,'local assets; changed paths in seed + frontend. Commit images and source with Git.');
 if(saved.length<manifest.length)process.exitCode=1;
})();
