import net from 'node:net';
import {spawn} from 'node:child_process';
const check=port=>new Promise((resolve,reject)=>{const server=net.createServer();server.once('error',()=>reject(new Error(`端口 ${port} 已占用，启动失败。不会切换端口或使用 IPv6。`)));server.listen(port,'127.0.0.1',()=>server.close(resolve));});
try { await check(3301); await check(5301); } catch(error){console.error(error.message);process.exit(1);}
const children=[spawn(process.execPath,['server/index.js'],{stdio:'inherit'}),spawn(process.execPath,['node_modules/vite/bin/vite.js'],{stdio:'inherit'})];
let stopping=false;
function stop(code=0){if(stopping)return;stopping=true;children.forEach(child=>child.kill('SIGTERM'));setTimeout(()=>process.exit(code),200);}
children.forEach(child=>{child.on('error',()=>stop(1));child.on('exit',code=>stop(code||0));});
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
