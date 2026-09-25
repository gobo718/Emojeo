const MODEL='@cf/meta/llama-3.2-11b-vision-instruct';
const SCHEMA={type:'object',properties:{
 summary:{type:'string'},
 observations:{type:'array',items:{type:'object',properties:{
  phrase:{type:'string'},dimension:{type:'string'},description:{type:'string'},
  evidence:{type:'array',items:{type:'string'}},confidence:{type:'number'}
 },required:['phrase','dimension','description','evidence','confidence'],additionalProperties:false}},
 ambiguities:{type:'array',items:{type:'string'}},rawNotes:{type:'array',items:{type:'string'}}
},required:['summary','observations','ambiguities','rawNotes'],additionalProperties:false};
const cors={'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type,x-analysis-key'};
const J=(x,s=200)=>new Response(JSON.stringify(x),{status:s,headers:{...cors,'content-type':'application/json','cache-control':'no-store'}});
const now=()=>new Date().toISOString();
const uid=p=>`${p}_${crypto.randomUUID().replaceAll('-','')}`;
const parse=x=>{if(x&&typeof x==='object')return x;let s=String(x||'').trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'');return JSON.parse(s)};
const responseValue=p=>typeof p==='string'?p:(p?.response??p?.result?.response??p?.output_text??p);
async function sha(s){const a=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(String(s||'')));return [...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function schema(env){
 await env.STEP4_DB.prepare(`CREATE TABLE IF NOT EXISTS settings(k TEXT PRIMARY KEY,v TEXT NOT NULL)`).run();
 await env.STEP4_DB.prepare(`CREATE TABLE IF NOT EXISTS jobs(id TEXT PRIMARY KEY,state TEXT NOT NULL,total INTEGER NOT NULL,completed INTEGER NOT NULL DEFAULT 0,failed INTEGER NOT NULL DEFAULT 0,created_at TEXT NOT NULL,started_at TEXT,completed_at TEXT,message TEXT NOT NULL DEFAULT '')`).run();
 await env.STEP4_DB.prepare(`CREATE TABLE IF NOT EXISTS cells(id TEXT PRIMARY KEY,job_id TEXT NOT NULL,ord INTEGER NOT NULL,state TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,payload TEXT NOT NULL,result TEXT,error TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL,updated_at TEXT NOT NULL)`).run();
 await env.STEP4_DB.prepare(`CREATE INDEX IF NOT EXISTS cells_job ON cells(job_id,ord)`).run();
}
async function auth(env,req,allowSetup=false){
 await schema(env);const row=await env.STEP4_DB.prepare("SELECT v FROM settings WHERE k='auth_hash'").first();
 const key=req.headers.get('x-analysis-key')||'';
 if(!row&&allowSetup&&key){await env.STEP4_DB.prepare("INSERT INTO settings(k,v) VALUES('auth_hash',?)").bind(await sha(key)).run();return true}
 return Boolean(row&&key&&(await sha(key))===row.v);
}
function token(raw,id){
 const texts=[raw?.summary,...(raw?.observations||[]).flatMap(o=>[o?.phrase,o?.description]),...(raw?.rawNotes||[]),...(raw?.ambiguities||[])].filter(Boolean);
 for(const t of texts){const sm=String(t).match(/\bSTATE\s*[:=]\s*(PRESENT|ABSENT|UNCERTAIN)\b/i);if(sm){const rm=String(t).match(/\bROUTE\s*[:=]\s*([A-Z_]+)/i);return{state:sm[1].toLowerCase(),route:(rm?.[1]||'UNSPECIFIED').toUpperCase()}}}
 return null;
}
async function refresh(env,id){
 const s=await env.STEP4_DB.prepare(`SELECT COUNT(*) total,SUM(state='complete') completed,SUM(state='failed') failed,SUM(state IN ('queued','processing')) active FROM cells WHERE job_id=?`).bind(id).first();
 let state=(await env.STEP4_DB.prepare('SELECT state FROM jobs WHERE id=?').bind(id).first())?.state||'running';
 if(Number(s?.active||0)===0&&Number(s?.total||0)>0)state=Number(s?.failed||0)?'completed-with-failures':'completed';
 await env.STEP4_DB.prepare('UPDATE jobs SET state=?,total=?,completed=?,failed=?,completed_at=CASE WHEN ? IN ("completed","completed-with-failures") THEN COALESCE(completed_at,?) ELSE completed_at END,message=?,started_at=COALESCE(started_at,?) WHERE id=?')
 .bind(state,Number(s?.total||0),Number(s?.completed||0),Number(s?.failed||0),state,now(),state,now(),id).run();
}
async function runCell(env,jobId,cellId){
 const row=await env.STEP4_DB.prepare('SELECT * FROM cells WHERE id=? AND job_id=?').bind(cellId,jobId).first();if(!row||row.state==='complete')return;
 const p=parse(row.payload),at=now();
 await env.STEP4_DB.prepare("UPDATE cells SET state='processing',attempts=attempts+1,error='',updated_at=? WHERE id=?").bind(at,cellId).run();
 try{
  const full=`${p.prompt}\n\nReturn JSON only with this shape: {"summary":"...","observations":[{"phrase":"...","dimension":"visual|object|expression|action|relationship|setting|symbolic|situational|structural|other","description":"...","evidence":["..."],"confidence":0.0}],"ambiguities":["..."],"rawNotes":["..."]}`;
  const out=await env.AI.run(MODEL,{prompt:full,max_tokens:2600,temperature:0.12,response_format:{type:'json_schema',json_schema:SCHEMA}});
  const raw=parse(responseValue(out)),v=token(raw,p.caseId);
  if(!v)throw new Error('Native response contained no STATE verdict token');
  const obs=Array.isArray(raw.observations)?raw.observations[0]:null;
  const result={caseId:p.caseId,subject:p.subject,assertion:p.assertion,state:v.state,route:v.route,
   confidence:Number(obs?.confidence??0),description:String(obs?.description||''),evidence:Array.isArray(obs?.evidence)?obs.evidence:[],
   ambiguities:Array.isArray(raw.ambiguities)?raw.ambiguities:[],rawNotes:Array.isArray(raw.rawNotes)?raw.rawNotes:[],
   rawDiscovery:raw,model:MODEL,completedAt:now()};
  await env.STEP4_DB.prepare("UPDATE cells SET state='complete',result=?,error='',updated_at=? WHERE id=?").bind(JSON.stringify(result),now(),cellId).run();
 }catch(e){
  const attempts=Number((await env.STEP4_DB.prepare('SELECT attempts FROM cells WHERE id=?').bind(cellId).first())?.attempts||1);
  if(attempts<8){await env.STEP4_DB.prepare("UPDATE cells SET state='queued',error=?,updated_at=? WHERE id=?").bind(String(e?.message||e),now(),cellId).run();await env.STEP4_QUEUE.send({jobId,cellId},{delaySeconds:Math.min(60,2**attempts)})}
  else await env.STEP4_DB.prepare("UPDATE cells SET state='failed',error=?,updated_at=? WHERE id=?").bind(String(e?.message||e),now(),cellId).run();
 }finally{await refresh(env,jobId)}
}
export default{
 async fetch(req,env){
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
  const u=new URL(req.url);
  if(u.pathname==='/health')return J({ok:true,service:'Emojeo Step4 Runner',d1:Boolean(env.STEP4_DB),queue:Boolean(env.STEP4_QUEUE),ai:Boolean(env.AI)});
  if(!(await auth(env,req,u.pathname==='/setup')))return J({ok:false,error:'Unauthorized or runner not initialized'},{status:401}.status);
  if(u.pathname==='/setup'&&req.method==='POST')return J({ok:true,initialized:true});
  if(u.pathname==='/jobs'&&req.method==='POST'){
   const body=await req.json(),items=Array.isArray(body.items)?body.items:[];if(!items.length||items.length>100) return J({ok:false,error:'1-100 items required'},400);
   const id=uid('step4accept'),at=now();await env.STEP4_DB.prepare("INSERT INTO jobs(id,state,total,created_at,message) VALUES(?,?,?,?,?)").bind(id,'queued',items.length,at,'Acceptance run queued').run();
   const stmts=items.map((x,i)=>{const cid=`${id}_${String(i+1).padStart(3,'0')}`;return env.STEP4_DB.prepare("INSERT INTO cells(id,job_id,ord,state,payload,result,error,created_at,updated_at) VALUES(?,?,?,?,?,NULL,'',?,?)").bind(cid,id,i,'queued',JSON.stringify(x),at,at)});
   await env.STEP4_DB.batch(stmts);const rows=await env.STEP4_DB.prepare('SELECT id FROM cells WHERE job_id=? ORDER BY ord').bind(id).all();
   await env.STEP4_QUEUE.sendBatch((rows.results||[]).map(r=>({body:{jobId:id,cellId:r.id}})));
   await env.STEP4_DB.prepare("UPDATE jobs SET state='running',started_at=?,message='Acceptance run executing on Cloudflare' WHERE id=?").bind(now(),id).run();
   return J({ok:true,jobId:id,total:items.length});
  }
  const m=u.pathname.match(/^\/jobs\/([^/]+)(?:\/results)?$/);
  if(m&&req.method==='GET'){
   const id=decodeURIComponent(m[1]);await refresh(env,id);const job=await env.STEP4_DB.prepare('SELECT * FROM jobs WHERE id=?').bind(id).first();if(!job)return J({ok:false,error:'Job not found'},404);
   if(u.pathname.endsWith('/results')){const rs=await env.STEP4_DB.prepare('SELECT ord,state,attempts,error,result FROM cells WHERE job_id=? ORDER BY ord').bind(id).all();return J({ok:true,job,results:(rs.results||[]).map(x=>({...x,result:x.result?parse(x.result):null}))})}
   return J({ok:true,job});
  }
  return J({ok:false,error:'Not found'},404)
 },
 async queue(batch,env){for(const msg of batch.messages){try{await runCell(env,msg.body.jobId,msg.body.cellId);msg.ack()}catch(e){msg.retry({delaySeconds:30})}}}
};