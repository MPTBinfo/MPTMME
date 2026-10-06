import {authorized,json} from '@/lib/auth';
import {parseCSV,normalize} from '@/lib/data';
export const dynamic='force-dynamic';
const url='https://docs.google.com/spreadsheets/d/1ZQs6sk8y13ZUWPlnbC3amFvSwp9ItV7yJtvxLgeMM0E/export?format=csv&gid=1537816855';
export async function GET(req:Request){
 if(!(await authorized(req)))return json({error:'Sign in to view registration data.'},401);
 try{const response=await fetch(url+'&_='+Date.now(),{redirect:'follow',cache:'no-store',signal:AbortSignal.timeout(25000)});const body=await response.text();
  if(!response.ok||/^\s*</.test(body))return json({error:'The Google Sheet is unavailable. Confirm that link viewers can read Form Responses 1, then refresh.'},502);
  return json(normalize(parseCSV(body.replace(/^\uFEFF/,''))));
 }catch{return json({error:'Could not refresh Google Sheets. Your last loaded view is retained; try again shortly.'},502);}
}
