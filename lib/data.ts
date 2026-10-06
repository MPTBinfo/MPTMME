export const ACTIVITY_INFO=[
 {name:'Heritage Walk',place:'Kamla Park',time:'06:00 AM – 08:00 AM',dates:'8, 9 & 10 October 2026',color:'#1c7c74',note:'Start point: Kamla Park, Bhopal.'},
 {name:'Shikara Boat Ride',place:'MPT Boat Club',time:'06:00 AM – 08:00 AM',dates:'8, 9 & 10 October 2026',color:'#2581b7',note:'Meet at MPT Boat Club, Bhopal.'},
 {name:'Bird Walk',place:'Van Vihar Gate 2',time:'06:00 AM – 08:00 AM',dates:'8, 9 & 10 October 2026',color:'#ad7a31',note:'Reporting point: Van Vihar Gate 2, Sair Sapata.'},
 {name:'Yoga',place:'Respective hotels',time:'06:00 AM – 08:00 AM',dates:'8, 9 & 10 October 2026',color:'#95649a',note:'Join the session at your respective hotel.'},
 {name:'Helicopter Joy Ride',place:'BHEL Ground',time:'10:00 AM – 04:00 PM',dates:'7–10 October 2026',color:'#da754e',note:'Helicopter rides take place at BHEL Ground.'}
];
export type Participant={id:string;row:number;name:string;contact:string;hotel:string;room:string;timestamp:string;email:string;fields:Record<string,string>};
export type Selection={key:string;date:string;activity:string;person:Participant};
export type LiveData={participants:Participant[];responses:Participant[];selections:Selection[];submissions:number;invalidDates:number;sourceUpdatedAt:string;headers:string[];sourceName:string};
export function parseCSV(input:string):string[][]{
 const rows:string[][]=[];let row:string[]=[],field='',quoted=false;
 for(let i=0;i<input.length;i++){const c=input[i];if(c==='"'){if(quoted&&input[i+1]==='"'){field+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(field);field='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&input[i+1]==='\n')i++;row.push(field);if(row.length>1||row.some(Boolean))rows.push(row);row=[];field='';}else field+=c;}
 row.push(field);if(row.some(Boolean))rows.push(row);return rows;
}
export function activityFor(header:string){const h=header.toUpperCase();if(/HERITAGE.*WALK/.test(h))return 'Heritage Walk';if(/SHIKARA/.test(h))return 'Shikara Boat Ride';if(/BIRD.*WALK|BIRD.*WATCH/.test(h))return 'Bird Walk';if(/YOGA/.test(h))return 'Yoga';if(/HELICOPTER/.test(h))return 'Helicopter Joy Ride';return null;}
export function activityDate(text:string):string|null{
 const v=text.trim();let y=0,m=0,d=0;let p;
 if((p=v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){y=+p[1];m=+p[2];d=+p[3];}
 else if((p=v.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/))){d=+p[1];m=+p[2];y=+p[3];}
 else if((p=v.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/))){d=+p[1];m=['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(p[2].toLowerCase().slice(0,3))+1;y=+p[3];}
 else if(/^\d{5}(\.\d+)?$/.test(v)){const date=new Date(Date.UTC(1899,11,30)+Math.floor(+v)*86400000);return date.toISOString().slice(0,10);}
 else return null;
 const date=new Date(Date.UTC(y,m-1,d));if(!m||date.getUTCFullYear()!==y||date.getUTCMonth()!==m-1||date.getUTCDate()!==d)return null;
 return date.toISOString().slice(0,10);
}
export function normalize(rows:string[][]):LiveData{
 if(rows.length<1)throw Error('The source sheet is empty.');
 const headers=rows[0].map(h=>h.trim()),find=(rx:RegExp)=>headers.findIndex(h=>rx.test(h.toUpperCase()));
 const ts=find(/^TIMESTAMP$/),nm=find(/^NAME$|PARTICIPANT.*NAME|FULL NAME/),ct=find(/CONTACT.*NUMBER|PHONE|MOBILE/),ht=find(/HOTEL/),rm=find(/ROOM/),em=find(/EMAIL/);
 const cols=headers.flatMap((h,i)=>{const a=activityFor(h);return a?[{i,a}]:[];});
 if(ts<0||nm<0||!cols.length)throw Error('The source must contain Timestamp, Name and activity response columns.');
 const responses:Participant[]=[];const people=new Map<string,Participant>(),selections=new Map<string,Selection>();let submissions=0,invalidDates=0;
 rows.slice(1).forEach((r,ix)=>{
  const get=(i:number)=>i<0?'':(r[i]||'').trim();if(!get(ts))return;submissions++;
  const name=get(nm),contact=get(ct),email=get(em);const id=(name||contact||email)?`${name.toLowerCase().replace(/\s+/g,' ')}|${contact.replace(/\D/g,'')}${contact?'':'|'+email.toLowerCase()}`:`ROW:${ix+2}`;
  const fields:Record<string,string>={};headers.forEach((h,i)=>{if(h){let key=h;let n=2;while(key in fields)key=`${h} (${n++})`;fields[key]=get(i);}});
  const person={id,row:ix+2,name:name||'Name not provided',contact,hotel:get(ht),room:get(rm),email,timestamp:get(ts),fields};people.set(id,person);responses.push(person);
  cols.forEach(({i,a})=>{if(!get(i))return;get(i).split(/[,;\n]+/).forEach(token=>{if(!token.trim())return;const date=activityDate(token);if(!date){invalidDates++;return;}const key=JSON.stringify([id,date,a]);selections.set(key,{key,date,activity:a,person});});});
 });
 return {participants:[...people.values()],responses,selections:[...selections.values()].sort((a,b)=>a.date.localeCompare(b.date)||a.activity.localeCompare(b.activity)),submissions,invalidDates,sourceUpdatedAt:new Date().toISOString(),headers,sourceName:'Form Responses 1'};
}
