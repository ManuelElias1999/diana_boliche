const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const state={kind:'ticket',type:'Entrada VIP',price:150,quantity:1,table:null,date:''};

const header=$('#siteHeader');
const nav=$('#mainNav');
const menuToggle=$('#menuToggle');
addEventListener('scroll',()=>header?.classList.toggle('scrolled',scrollY>36),{passive:true});
menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});
$$('#mainNav a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false')}));

$$('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));
$$('.event-date-button').forEach(btn=>btn.addEventListener('click',()=>{state.date=btn.dataset.eventDate||''}));

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
  $('#eventDate').value=state.date;
  updateDateLabels(state.date);
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
function formatEventDate(value){
  const labels={'2026-11-28':'Sábado 28 de noviembre · 22:00','2026-12-04':'Viernes 4 de diciembre · 22:00','2026-12-12':'Sábado 12 de diciembre · 22:00'};
  return labels[value]||'Selecciona una fecha';
}
function updateDateLabels(value){
  const label=formatEventDate(value);
  $('#orderDate').textContent=label;
  $('#paymentDate').textContent=label.toUpperCase();
  $('#confirmationDate').textContent=label.toUpperCase();
}
$('#eventDate').addEventListener('change',e=>{state.date=e.target.value;updateDateLabels(state.date)});
$('#customerForm').addEventListener('submit',e=>{
  e.preventDefault(); const data=new FormData(e.target); state.date=String(data.get('eventDate')||''); state.quantity=state.kind==='ticket'?Number(data.get('quantity')):1; const total=state.price*state.quantity;
  updateDateLabels(state.date); $('#paymentTotal').textContent=formatBs(total); createFakeQr(`${state.type}-${state.date}-${total}`); showStep(2);
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

const legalCopy={
  privacy:{title:'Política de privacidad',body:'<p>Para gestionar compras y reservas podemos solicitar nombre, correo, WhatsApp y el comprobante de pago. Estos datos se utilizan únicamente para validar el pago, confirmar el acceso y atender consultas relacionadas con la reserva.</p><p>No vendemos información personal. Los datos se conservan solo durante el tiempo necesario para administrar la operación y cumplir obligaciones aplicables. Puedes solicitar acceso, corrección o eliminación mediante los canales oficiales de Diana.</p>'},
  terms:{title:'Términos y condiciones',body:'<p>El acceso está permitido únicamente a mayores de 18 años con documento de identidad vigente. Diana se reserva el derecho de admisión conforme a la normativa aplicable y sus reglas de convivencia.</p><p>La programación, los horarios y las áreas habilitadas pueden cambiar por razones operativas o de fuerza mayor. La compra implica aceptar las reglas del evento y mantener una conducta respetuosa dentro del establecimiento.</p>'},
  purchases:{title:'Compras y reservas',body:'<p>Una entrada o mesa queda confirmada solamente después de que Diana valide el comprobante de pago. La disponibilidad mostrada debe verificarse al momento de la confirmación.</p><p>Las mesas incluyen consumo por el valor indicado y la cantidad de manillas informada. Cambios de fecha, cancelaciones o devoluciones se revisan según las condiciones comunicadas para cada evento. No compartas tu confirmación con terceros.</p>'},
  cookies:{title:'Política de cookies',body:'<p>Esta versión demostrativa no utiliza cookies publicitarias ni herramientas de seguimiento. En una versión comercial, cualquier tecnología necesaria para seguridad, preferencias o medición se informará y gestionará conforme a la normativa aplicable.</p>'}
};
const legalModal=$('#legalModal');
$$('.legal-link').forEach(btn=>btn.addEventListener('click',()=>{const copy=legalCopy[btn.dataset.legal];if(!copy)return;$('#legalTitle').textContent=copy.title;$('#legalContent').innerHTML=copy.body;legalModal.classList.add('open');legalModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}));
$$('[data-legal-close]').forEach(el=>el.addEventListener('click',()=>{legalModal.classList.remove('open');legalModal.setAttribute('aria-hidden','true');document.body.style.overflow=''}));
