/* Reusable Engine — application-neutral analysis/report primitives. */
export class AnalysisEngine {
  constructor({getField}={}){this.getField=getField||((r,p)=>String(p||'').split('.').reduce((v,k)=>v==null?undefined:v[k],r))}
  count(records=[]){return records.length}
  distribution(records=[],field){const m=new Map();for(const r of records){const v=this.getField(r,field);for(const x of (Array.isArray(v)?v:[v]))m.set(x,(m.get(x)||0)+1)}return [...m.entries()].map(([value,count])=>({value,count,percentage:records.length?count/records.length*100:0})).sort((a,b)=>b.count-a.count)}
  numeric(records=[],field){const a=records.map(r=>Number(this.getField(r,field))).filter(Number.isFinite);return{count:a.length,min:a.length?Math.min(...a):null,max:a.length?Math.max(...a):null,sum:a.reduce((x,y)=>x+y,0),mean:a.length?a.reduce((x,y)=>x+y,0)/a.length:null}}
  group(records=[],field){const m=new Map();for(const r of records){const v=this.getField(r,field);for(const x of (Array.isArray(v)?v:[v])){if(!m.has(x))m.set(x,[]);m.get(x).push(r)}}return m}
  intersections(records=[],field,{ordered=false,includeSelf=false}={}){const m=new Map();for(const r of records){const vals=[...new Set(this.getField(r,field)||[])];for(let i=0;i<vals.length;i++)for(let j=includeSelf?i:i+1;j<vals.length;j++){if(!includeSelf&&i===j)continue;let a=vals[i],b=vals[j];if(!ordered&&String(a)>String(b))[a,b]=[b,a];const k=`${a} × ${b}`;m.set(k,(m.get(k)||0)+1)}}return [...m.entries()].map(([key,count])=>({key,count})).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key))}
  summarize(records=[],definition={}){const out={count:records.length};for(const f of definition.distributions||[])out[`distribution:${f}`]=this.distribution(records,f);for(const f of definition.numeric||[])out[`numeric:${f}`]=this.numeric(records,f);for(const x of definition.intersections||[])out[`intersections:${x.field}`]=this.intersections(records,x.field,x);return out}
}
