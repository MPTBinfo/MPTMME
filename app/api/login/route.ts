import {COOKIE,correctLogin,createSession,json} from '@/lib/auth';
export const dynamic='force-dynamic';
const attempts=new Map<string,{n:number;until:number}>();
export async function POST(req:Request){
 if(req.headers.get('sec-fetch-site')==='cross-site')return json({error:'Please sign in from the dashboard.'},403);
 const ip=req.headers.get('cf-connecting-ip')||req.headers.get('oai-authenticated-user-id')||'viewer';const prev=attempts.get(ip);
 if(prev&&prev.until>Date.now()&&prev.n>=10)return json({error:'Too many attempts. Try again in 10 minutes.'},429);
 try{const body=await req.json() as {id?:unknown;password?:unknown};if(typeof body.id!=='string'||typeof body.password!=='string')return json({error:'Enter your ID and password.'},400);
  if(!(await correctLogin(body.id.trim(),body.password))){attempts.set(ip,{n:prev&&prev.until>Date.now()?prev.n+1:1,until:Date.now()+600000});return json({error:'The ID or password is incorrect.'},401);}
  attempts.delete(ip);const session=await createSession();return json({ok:true},200,{'Set-Cookie':`${COOKIE}=${session}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`});
 }catch{return json({error:'Sign-in is temporarily unavailable. Please retry.'},503);}
}
