/* Reusable Engine — generic query/search/filter/sort/facet capability.
   Application supplies records, field accessors, predicates and vocabulary. */
export class QueryEngine {
  constructor({getField, predicates={}}={}) {
    this.getField = getField || ((record, path) => String(path||'').split('.').reduce((v,k)=>v==null?undefined:v[k], record));
    this.predicates = {...QueryEngine.defaultPredicates, ...predicates};
  }
  static defaultPredicates = {
    eq:(a,b)=>a===b, neq:(a,b)=>a!==b,
    contains:(a,b)=>Array.isArray(a)?a.includes(b):String(a??'').toLowerCase().includes(String(b??'').toLowerCase()),
    in:(a,b)=>Array.isArray(b)&&b.includes(a),
    has:(a,b)=>Array.isArray(a)?(b===undefined?a.length>0:a.includes(b)):(a&&typeof a==='object'?b in a:Boolean(a)),
    gt:(a,b)=>Number(a)>Number(b), gte:(a,b)=>Number(a)>=Number(b), lt:(a,b)=>Number(a)<Number(b), lte:(a,b)=>Number(a)<=Number(b),
    exists:a=>a!==undefined&&a!==null&&a!==''
  };
  test(record, condition={}) {
    const value=this.getField(record, condition.field);
    const fn=typeof condition.predicate==='function'?condition.predicate:this.predicates[condition.op||'eq'];
    if(!fn) throw new Error(`Unknown query operator: ${condition.op}`);
    return Boolean(fn(value, condition.value, record, condition));
  }
  filter(records=[], spec={}) {
    const conditions=spec.conditions||[]; if(!conditions.length)return [...records];
    const every=(spec.logic||'and')!=='or';
    return records.filter(r=>every?conditions.every(c=>this.test(r,c)):conditions.some(c=>this.test(r,c)));
  }
  search(records=[], text='', fields=[]) {
    const q=String(text||'').trim().toLowerCase(); if(!q)return [...records];
    return records.filter(r=>fields.some(f=>String(this.getField(r,f)??'').toLowerCase().includes(q)));
  }
  sort(records=[], specs=[]) {
    const list=Array.isArray(specs)?specs:[specs];
    return [...records].sort((a,b)=>{for(const s of list){const av=this.getField(a,s.field),bv=this.getField(b,s.field);let c=av==null&&bv!=null?-1:av!=null&&bv==null?1:av>bv?1:av<bv?-1:0;if(c)return (s.direction==='desc'?-1:1)*c}return 0});
  }
  facet(records=[], field) {
    const counts=new Map(); for(const r of records){let v=this.getField(r,field);for(const x of (Array.isArray(v)?v:[v]))counts.set(x,(counts.get(x)||0)+1)}
    return [...counts.entries()].map(([value,count])=>({value,count})).sort((a,b)=>b.count-a.count||String(a.value).localeCompare(String(b.value)));
  }
  run(records=[], spec={}) {
    let out=this.filter(records,spec.filters||spec);
    if(spec.search?.text)out=this.search(out,spec.search.text,spec.search.fields||[]);
    if(spec.sort)out=this.sort(out,spec.sort);
    return {records:out,count:out.length,facets:Object.fromEntries((spec.facets||[]).map(f=>[f,this.facet(out,f)]))};
  }
}
