const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const state={kind:'ticket',type:'Entrada VIP',price:150,quantity:1,table:null};

const header=$('#siteHeader');
const nav=$('#mainNav');
const menuToggle=$('#menuToggle');
addEventListener('scroll',()=>header?.classList.toggle('scrolled',scrollY>36),{passive:true});
menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});
$$('#mainNav a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false')}));

$$('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.13});
$$('.reveal').forEach(el=>observer.observe(el));

const panel=$('#reservationPanel');
$$('.table:not(.occupied)').forEach(table=>table.addEventListener('click',()=>{
  $$('.table').forEach(t=>t.classList.remove('is-selected'));
  table.classList.add('is-selected');
  state.kind='table'; state.table=table.dataset.table; state.type=`Mesa ${table.dataset.table} · ${table.dataset.zone}`; state.price=Number(table.dataset.price); state.quantity=1;
  $('#selectedTable').textContent=table.dataset.table;
  $('#selectedZone').textContent=table.dataset.zone.toUpperCase();
  $('#selectedPrice').textContent=`Bs ${Number(table.dataset.price).toLocaleString('es-BO')}`;
  $('#selectedBands').textContent=table.dataset.bands;
  $('.empty-selection',panel).hidden=true; $('.active-selection',panel).hidden=false;
  if(innerWidth<900) panel.scrollIntoView({behavior:'smooth',block:'center'});
}));

$$('.choose-ticket').forEach(btn=>btn.addEventListener('click',()=>{
  const card=btn.closest('.ticket-card'); state.kind='ticket'; state.type=card.dataset.type; state.price=Number(card.dataset.price); state.quantity=1; state.table=null; openCheckout();
}));
$('#reserveButton').addEventListener('click',openCheckout);

const modal=$('#checkoutModal');
function openCheckout(){
  $('#orderType').textContent=state.type; $('#orderPrice').textContent=formatBs(state.price);
  $('#quantityRow').style.display=state.kind==='ticket'?'block':'none';
  if(state.kind==='table') $('#quantityRow select').value='1';
  showStep(1); modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; setTimeout(()=>$('input',modal)?.focus(),100);
}
function closeCheckout(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.body.style.overflow='';$('#customerForm').reset();resetUpload()}
$$('[data-close]').forEach(el=>el.addEventListener('click',closeCheckout));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('open'))closeCheckout()});
function showStep(num){
  $$('.checkout-step').forEach(s=>s.classList.toggle('active',Number(s.dataset.step)===num));
  $$('.checkout-progress span').forEach((s,i)=>s.classList.toggle('active',i<num));
  $('.modal-dialog').scrollTop=0;
}
function formatBs(value){return `Bs ${Number(value).toLocaleString('es-BO')}`}
$('#customerForm').addEventListener('submit',e=>{
  e.preventDefault(); const data=new FormData(e.target); state.quantity=state.kind==='ticket'?Number(data.get('quantity')):1; const total=state.price*state.quantity;
  $('#paymentTotal').textContent=formatBs(total); createFakeQr(`${state.type}-${total}`); showStep(2);
});
$('#paidButton').addEventListener('click',()=>showStep(3));
$$('[data-prev]').forEach(btn=>btn.addEventListener('click',()=>showStep(Number(btn.dataset.prev))));
const upload=$('#receiptUpload');
upload.addEventListener('change',()=>{
  const file=upload.files[0]; if(!file)return resetUpload();
  if(file.size>10*1024*1024){alert('El archivo supera los 10 MB.');upload.value='';return resetUpload()}
  $('#uploadTitle').textContent=file.name; $('#uploadHint').textContent=`${(file.size/1024/1024).toFixed(2)} MB · Listo para enviar`; $('.upload-box').classList.add('has-file'); $('#confirmButton').disabled=false;
});
function resetUpload(){upload.value='';$('#uploadTitle').textContent='Seleccionar comprobante';$('#uploadHint').textContent='JPG, PNG o PDF · Máx. 10 MB';$('.upload-box').classList.remove('has-file');$('#confirmButton').disabled=true}
$('#confirmButton').addEventListener('click',()=>showStep(4));

function createFakeQr(seed){
  const qr=$('#fakeQr'); qr.innerHTML=''; let hash=[...seed].reduce((a,c)=>a+c.charCodeAt(0),0);
  for(let r=0;r<13;r++)for(let c=0;c<13;c++){
    const cell=document.createElement('i'); const finder=(r<4&&c<4)||(r<4&&c>8)||(r>8&&c<4); const dark=finder?((r+c)%3!==1):((r*7+c*11+hash)%5<2); if(dark)cell.className='dark'; qr.appendChild(cell);
  }
}
createFakeQr('diana');
