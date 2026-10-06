import {COOKIE,json} from '@/lib/auth';
export async function POST(){return json({ok:true},200,{'Set-Cookie':`${COOKIE}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`});}
