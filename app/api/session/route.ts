import {authorized,json} from '@/lib/auth';
export const dynamic='force-dynamic';
export async function GET(req:Request){return json({authenticated:await authorized(req)});}
