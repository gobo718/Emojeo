/* Reusable Classification Matrix UI
   Product-neutral renderer for a Classification Matrix Engine definition.
   Applications supply vocabulary and selection behavior; this renderer supplies
   bands, axes, intersections, filtering, and the existing proven matrix shell. */
(()=>{'use strict';
function resolveTarget(target){return typeof target==='string'?document.getElementById(target):target;}
function chunkIndexes(length,size){const out=[];for(let i=0;i<length;i+=size)out.push(Array.from({length:Math.min(size,length-i)},(_,n)=>i+n));return out;}
function render(options={}){
  const target=resolveTarget(options.target),engine=options.engine||window.classificationMatrixEngine;
  if(!target||!engine)return false;
  const definition=engine.snapshot(),items=engine.items(),q=String(options.filter||'').trim().toLowerCase();
  const singleGrid=Boolean(options.singleGrid),bandSize=Math.max(1,Number(options.bandSize)||4);
  const bands=singleGrid?[items.map((_,i)=>i)]:chunkIndexes(items.length,bandSize);
  target.innerHTML='';
  bands.forEach((columnIndexes,bandIndex)=>{
    const section=document.createElement('section');
    section.className='true-primfusion-band classification-matrix-band';
    if(singleGrid)section.classList.add('single-primfusion-primFusion','single-classification-matrix');
    if(!singleGrid){
      const title=document.createElement('div');
      title.className='primfusion-band-title classification-matrix-band-title';
      title.textContent=`${options.sectionLabel||definition.label||'Classification Matrix'} ${bandIndex+1} of ${bands.length}`;
      section.appendChild(title);
    }
    const scroller=document.createElement('div');
    scroller.className='primfusion-scroller classification-matrix-scroller';
    const grid=document.createElement('div');
    grid.className='true-primfusion-grid classification-matrix-grid';
    grid.style.setProperty('--band-columns',columnIndexes.length);
    const corner=document.createElement('div');
    corner.className='primfusion-corner classification-matrix-corner';
    corner.textContent=options.emptyCorner??'×';
    grid.appendChild(corner);
    columnIndexes.forEach(ci=>grid.appendChild(axisButton(items[ci],'column',options)));
    items.forEach(row=>{
      grid.appendChild(axisButton(row,'row',options));
      columnIndexes.forEach(ci=>{
        const col=items[ci],intersection=engine.intersection(row.id,col.id);
        if(!intersection)return;
        const cell=document.createElement('button');
        cell.type='button';
        cell.className='primfusion-intersection classification-matrix-intersection';
        const same=row.id===col.id,label=intersection.label||'',symbols=same?(row.symbol||''):`${row.symbol||''}${col.symbol||''}`;
        cell.innerHTML=`<span class="primfusion-combo-symbol classification-matrix-symbol"></span><small class="primfusion-combo-label classification-matrix-label"></small>`;
        cell.querySelector('span').textContent=symbols;
        cell.querySelector('small').textContent=same?row.label:label;
        cell.title=same?row.label:label;
        cell.hidden=Boolean(q&&!`${label} ${row.label} ${col.label}`.toLowerCase().includes(q));
        cell.dataset.matrixIntersectionId=intersection.id;
        cell.addEventListener('click',()=>options.onSelectIntersection?.(intersection,row,col));
        grid.appendChild(cell);
      });
    });
    scroller.appendChild(grid);section.appendChild(scroller);target.appendChild(section);
  });
  return true;
}
function axisButton(item,axis,options){
  const button=document.createElement('button');button.type='button';
  button.className=`primfusion-axis-header primfusion-${axis}-header classification-matrix-axis classification-matrix-${axis}-header`;
  const symbol=document.createElement('span');symbol.textContent=item.symbol||'';
  const label=document.createElement('small');label.textContent=item.label;
  button.append(symbol,label);button.title=`Select ${item.label}`;button.dataset.matrixItemId=item.id;
  button.addEventListener('click',()=>options.onSelectItem?.(item));return button;
}
window.classificationMatrixUI=Object.freeze({render});
})();
