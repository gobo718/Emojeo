/* Reusable Engine — report definitions and execution. Rendering/export remains application supplied. */
export class ReportEngine {
  constructor({queryEngine,analysisEngine,renderers={}}={}){this.query=queryEngine;this.analysis=analysisEngine;this.renderers={...renderers}}
  normalize(d={}){return{id:d.id||null,name:String(d.name||'Untitled report'),description:String(d.description||''),filters:d.filters||{logic:'and',conditions:[]},search:d.search||null,sort:d.sort||null,facets:[...(d.facets||[])],analysis:d.analysis||{},fields:[...(d.fields||[])],format:d.format||'data',metadata:structuredClone(d.metadata||{})}}
  run(records=[],definition={}){const d=this.normalize(definition);const q=this.query?this.query.run(records,{filters:d.filters,search:d.search,sort:d.sort,facets:d.facets}):{records:[...records],count:records.length,facets:{}};const analysis=this.analysis?this.analysis.summarize(q.records,d.analysis):{count:q.count};const result={definition:d,count:q.count,records:q.records,facets:q.facets,analysis};const renderer=this.renderers[d.format];return renderer?renderer(result,d):result}
  registerRenderer(name,fn){this.renderers[name]=fn;return this}
}
