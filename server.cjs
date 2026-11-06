const http=require('http'),fs=require('fs'),p=require('path');const root=p.join(__dirname,'dist');http.createServer((req,res)=>{
 if (new URL(req.url, 'http://localhost').pathname === '/cover.jpg') {
  return fs.readFile(__dirname + '/cover.jpg', (error, cover) => {
   res.writeHead(error ? 404 : 200, {'Content-Type': error ? 'text/plain' : 'image/jpeg'});
   res.end(error ? 'Not found' : cover);
  });
 }
 const f=p.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!f.startsWith(root)){res.writeHead(403);res.end();return}const file=f===root?p.join(f,'index.html'):f;fs.readFile(file,(e,b)=>{if(e){res.writeHead(404);res.end();return}res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css'})[p.extname(file)]||'application/octet-stream');res.end(b)})}).listen(8790,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:8790/'));
