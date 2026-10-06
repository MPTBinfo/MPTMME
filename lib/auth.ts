import {env} from 'cloudflare:workers';
const runtime=env as unknown as Record<string,string|undefined>;
export const COOKIE='mptm_session';
function secret(){const v=runtime.MPTM_LOGIN_PASSWORD;if(!v)throw Error('Login is not configured.');return v;}
async function signingKey(){return crypto.subtle.importKey('raw',new TextEncoder().encode(secret()),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);}
function b64(bytes:ArrayBuffer){return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64(v:string){return Uint8Array.from(atob(v.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));}
export async function createSession(){const payload=b64(new TextEncoder().encode(JSON.stringify({id:runtime.MPTM_LOGIN_ID,exp:Date.now()+8*60*60*1000,nonce:crypto.randomUUID()})).buffer as ArrayBuffer);const sig=await crypto.subtle.sign('HMAC',await signingKey(),new TextEncoder().encode(payload));return `${payload}.${b64(sig)}`;}
export async function authorized(req:Request){try{const token=req.headers.get('cookie')?.split(';').map(x=>x.trim()).find(x=>x.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);if(!token)return false;const [payload,sig]=token.split('.');if(!payload||!sig)return false;const valid=await crypto.subtle.verify('HMAC',await signingKey(),unb64(sig),new TextEncoder().encode(payload));if(!valid)return false;const parsed=JSON.parse(new TextDecoder().decode(unb64(payload)));return parsed.exp>Date.now()&&parsed.id===runtime.MPTM_LOGIN_ID;}catch{return false;}}
export async function correctLogin(id:string,password:string){if(id!==(runtime.MPTM_LOGIN_ID||'MPTM2026'))return false;const a=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(password)));const b=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(secret())));let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];return diff===0;}
export function json(data:unknown,status=200,extra:Record<string,string>={}){return Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});}
