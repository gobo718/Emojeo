(()=>{
'use strict';
const REQUIRED=['abstract','introduction','methodology','dataset','results','discussion','conclusion','references'];
async function validate(paperOrId){
 const paper=typeof paperOrId==='string'?await window.genreactrixPaperComposerEngine?.get?.(paperOrId):paperOrId;
 if(!paper)throw new Error('Paper not found');
 const issues=[];const sections=paper.sections||[];const kinds=new Set(sections.map(s=>s.kind));
 for(const kind of REQUIRED)if(!kinds.has(kind))issues.push({severity:'critical',type:'required-section-missing',section:kind,message:`Required section missing: ${kind}`});
 for(const s of sections)if(!String(s.body||'').trim())issues.push({severity:'attention',type:'section-empty',section:s.kind,id:s.id,message:`Section is empty: ${s.title}`});
 const kb=window.genreactrixKnowledgeBaseEngine;for(const id of paper.selectedKnowledgeIds||[])if(!(await kb?.getEntry?.(id)))issues.push({severity:'critical',type:'knowledge-link-missing',id,message:`Missing knowledge entry: ${id}`});
 const graph=await window.genreactrixCitationEvidenceEngine?.graphFor?.().catch?.(()=>({citations:[],links:[]}))||{citations:[],links:[]};const citationIds=new Set((graph.citations||[]).map(c=>c.id));for(const id of paper.selectedCitationIds||[])if(!citationIds.has(id))issues.push({severity:'critical',type:'citation-missing',id,message:`Missing citation: ${id}`});
 if(!(paper.selectedCitationIds||[]).length)issues.push({severity:'attention',type:'citations-empty',message:'No citations selected'});
 if(!paper.datasetSnapshotId)issues.push({severity:'critical',type:'dataset-snapshot-missing',message:'No frozen dataset snapshot selected'});else if(!(await window.genreactrixDatasetVersionEngine?.getSnapshot?.(paper.datasetSnapshotId)))issues.push({severity:'critical',type:'dataset-snapshot-not-found',id:paper.datasetSnapshotId,message:'Selected dataset snapshot does not exist'});
 const methods=window.genreactrixMethodologyEngine;for(const id of paper.methodologyIds||[])if(!(await methods?.get?.(id)))issues.push({severity:'attention',type:'methodology-missing',id,message:`Missing methodology record: ${id}`});
 const unresolved=issues.filter(i=>i.severity==='critical').length;
 return {paperId:paper.id,checkedAt:new Date().toISOString(),valid:unresolved===0,critical:unresolved,issues};
}
async function finalize(id){const result=await validate(id);if(!result.valid){const e=new Error(`Publication blocked by ${result.critical} critical validation issue${result.critical===1?'':'s'}`);e.validation=result;throw e}return window.genreactrixPaperComposerEngine.savePaper(id,{status:'final',finalizedAt:new Date().toISOString(),validationSummary:result})}
window.genreactrixPublicationValidatorEngine={validate,finalize,requiredSections:[...REQUIRED]};
})();
