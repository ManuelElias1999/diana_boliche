const $=(s,p=document)=>p.querySelector(s), $$=(s,p=document)=>[...p.querySelectorAll(s)];
const state={kind:'ticket',type:'Entrada VIP',price:150,quantity:1,table:null,date:'',tableDate:'2026-11-28'};
const demoStore=window.DianaStore;
let customerDraft={};
const tableAvailability={
  '2026-11-28':['V2','G2','G5'],
  '2026-12-04':['V1','V4','G1','G4','G8'],
  '2026-12-12':['V3','G3','G6','G7']
};

const header=$('#siteHeader');
const nav=$('#mainNav');
const menuToggle=$('#menuToggle');
const emailField=$('#customerForm input[name="email"]')?.closest('label');
if(emailField){emailField.insertAdjacentHTML('afterend','<label>Código de relacionador <small>(opcional)</small><input type="text" name="promoter" id="promoterCode" placeholder="Ej. ANDRES24"></label>');const code=new URLSearchParams(location.search).get('relacionador');if(code)$('#promoterCode').value=code.toUpperCase()}
function publicDateParts(value){const date=new Date(`${value}T12:00:00`);return{day:String(date.getDate()).padStart(2,'0'),month:date.toLocaleDateString('es-BO',{month:'short'}).replace('.','').toUpperCase(),weekday:date.toLocaleDateString('es-BO',{weekday:'short'}).replace('.','').toUpperCase()}}
function syncPublicEvents(){
  const data=demoStore?.load();const events=(data?.events||[]).filter(event=>event.status==='Publicado');if(!events.length)return;
  const first=events[0],parts=publicDateParts(first.date),rest=events.slice(1);
  const grid=$('.event-grid');
  if(grid)grid.innerHTML=`<article class="event-card featured-event reveal"><img src="assets/diana-dj-event.webp" alt="Evento ${first.name}"><div class="event-shade"></div><div class="date-badge"><strong>${parts.day}</strong><span>${parts.month}<br>${parts.weekday}</span></div><div class="event-info"><span>PRÓXIMA FECHA · ${first.time}</span><h3>${first.name}</h3><p>DJ SET · +18 · DIANA BY LOFT</p><button class="button button-red event-date-button" data-event-date="${first.date}" data-scroll="#entradas">Entradas para esta fecha</button></div></article><div class="event-stack">${rest.map((event,index)=>{const p=publicDateParts(event.date);return`<article class="event-card compact-event reveal delay-${Math.min(index+1,2)}"><div class="compact-art ${index%2?'logo-night':'red-waves'}">${index%2?'<img src="assets/diana-logo.png" alt="">':''}</div><div class="date-badge"><strong>${p.day}</strong><span>${p.month}<br>${p.weekday}</span></div><div class="event-info"><span>${event.time}</span><h3>${event.name}</h3><p>FECHA PUBLICADA</p><button class="event-link event-date-button" data-event-date="${event.date}" data-scroll="#entradas">Elegir esta fecha</button></div></article>`}).join('')}</div>`;
  const select=$('#eventDate');if(select)select.innerHTML='<option value="">Selecciona viernes o sábado</option>'+events.map(event=>`<option value="${event.date}">${formatEventDate(event.date)}</option>`).join('');
  const picker=$('.table-date-picker');if(picker)picker.innerHTML=events.map((event,index)=>{const p=publicDateParts(event.date);return`<button class="table-date ${index===0?'active':''}" data-table-date="${event.date}"><span>${p.weekday}</span><b>${p.day} ${p.month}</b></button>`}).join('');
  state.tableDate=events[0].date;
}
syncPublicEvents();
addEventListener('scroll',()=>header?.classList.toggle('scrolled',scrollY>36),{passive:true});
menuToggle?.addEventListener('click',()=>{const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open))});
$$('#mainNav a').forEach(link=>link.addEventListener('click',()=>{nav.classList.remove('open');menuToggle?.setAttribute('aria-expanded','false')}));

$$('[data-scroll]').forEach(btn=>btn.addEventListener('click',()=>$(btn.dataset.scroll)?.scrollIntoView({behavior:'smooth'})));
$$('.event-date-button').forEach(btn=>btn.addEventListener('click',()=>{state.date=btn.dataset.eventDate||'';applyEventPricing(state.date)}));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:.13});
$$('.reveal').forEach(el=>observer.observe(el));

const panel=$('#reservationPanel');
function clearTableSelection(){
  $$('.table').forEach(t=>t.classList.remove('is-selected'));
  state.table=null;
  $('.empty-selection',panel).hidden=false;
  $('.active-selection',panel).hidden=true;
}
function renderTableAvailability(){
  const data=demoStore?.load();
  const event=demoStore?.eventByDate(state.tableDate,data);
  const stored=data&&event?data.tables.filter(t=>t.eventId===event.id&&t.status!=='Disponible').map(t=>t.code):null;
  const occupied=stored||tableAvailability[state.tableDate]||[];
  $$('.table').forEach(table=>{
    const unavailable=occupied.includes(table.dataset.table);
    table.classList.toggle('occupied',unavailable);
    table.disabled=unavailable;
    table.setAttribute('aria-label',`${table.dataset.table} · ${unavailable?'No disponible':'Disponible'}`);
  });
  $('#mapDateLabel').textContent=formatEventDate(state.tableDate).replace(' · 22:00','').toUpperCase();
}
function applyEventPricing(date){
  const data=demoStore?.load();
  const event=demoStore?.eventByDate(date,data);
  if(!event)return;
  $$('.ticket-card').forEach(card=>{
    const vip=card.dataset.type.includes('VIP');
    const price=vip?event.vipPrice:event.generalPrice;
    card.dataset.price=String(price);
    const label=$('.ticket-bottom strong',card);if(label)label.textContent=formatBs(price);
  });
  $$('.table').forEach(table=>{
    const vip=table.dataset.zone==='VIP';
    table.dataset.price=String(vip?event.tableVipPrice:event.tableGeneralPrice);
    table.dataset.bands=String(vip?event.vipBands:event.generalBands);
  });
  const pricing=$$('.table-pricing>div');
  if(pricing[0]){pricing[0].querySelector('strong').textContent=formatBs(event.tableGeneralPrice);pricing[0].querySelector('small').textContent=`${event.generalBands} MANILLAS · CONSUMO INCLUIDO`}
  if(pricing[1]){pricing[1].querySelector('strong').textContent=formatBs(event.tableVipPrice);pricing[1].querySelector('small').textContent=`${event.vipBands} MANILLAS · CONSUMO INCLUIDO`}
}
$$('.table-date').forEach(btn=>btn.addEventListener('click',()=>{
  state.tableDate=btn.dataset.tableDate;
  state.date=state.tableDate;
  applyEventPricing(state.tableDate);
  $$('.table-date').forEach(dateBtn=>dateBtn.classList.toggle('active',dateBtn===btn));
  clearTableSelection();
  renderTableAvailability();
}));
$$('.table').forEach(table=>table.addEventListener('click',()=>{
  if(table.disabled)return;
  $$('.table').forEach(t=>t.classList.remove('is-selected'));
  table.classList.add('is-selected');
  state.kind='table'; state.date=state.tableDate; state.table=table.dataset.table; state.type=`Mesa ${table.dataset.table} · ${table.dataset.zone}`; state.price=Number(table.dataset.price); state.quantity=1;
  $('#selectedTable').textContent=table.dataset.table;
  $('#selectedZone').textContent=table.dataset.zone.toUpperCase();
  $('#selectedPrice').textContent=`Bs ${Number(table.dataset.price).toLocaleString('es-BO')}`;
  $('#selectedBands').textContent=table.dataset.bands;
  $('#selectedDate').textContent=formatEventDate(state.tableDate).replace(' · 22:00','');
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
  $('#eventDate').disabled=state.kind==='table';
  $('.event-date-field').classList.toggle('date-locked',state.kind==='table');
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
  const event=demoStore?.eventByDate(value,demoStore?.load());
  if(event){const date=new Date(`${value}T12:00:00`);const label=date.toLocaleDateString('es-BO',{weekday:'long',day:'numeric',month:'long'});return`${label.charAt(0).toUpperCase()+label.slice(1)} · ${event.time}`}
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
  e.preventDefault(); const data=new FormData(e.target); if(state.kind==='ticket')state.date=String(data.get('eventDate')||''); state.quantity=state.kind==='ticket'?Number(data.get('quantity')):1; applyEventPricing(state.date); if(state.kind==='ticket'){const card=$$('.ticket-card').find(c=>c.dataset.type===state.type);if(card)state.price=Number(card.dataset.price)} const total=state.price*state.quantity;
  customerDraft={name:String(data.get('name')||''),phone:String(data.get('phone')||''),email:String(data.get('email')||''),promoter:String(data.get('promoter')||'').trim().toUpperCase()};
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
$('#confirmButton').addEventListener('click',()=>{
  const file=upload.files[0];
  const total=state.price*state.quantity;
  const requestId=`DF-${String(Date.now()).slice(-5)}`;
  if(demoStore){
    demoStore.update(data=>{
      const event=demoStore.eventByDate(state.date,data);
      const type=state.kind==='table'?(String(state.type).includes('VIP')?'Mesa VIP':'Mesa General'):(String(state.type).includes('VIP')?'VIP':'General');
      data.orders.unshift({id:requestId,eventId:event?.id||data.selectedEventId,customer:customerDraft.name,phone:customerDraft.phone,email:customerDraft.email,kind:state.kind,type,table:state.table||'',quantity:state.quantity,amount:total,status:'Pendiente',promoter:customerDraft.promoter,receipt:file?.name||'comprobante-demo.jpg',createdAt:new Date().toLocaleTimeString('es-BO',{hour:'2-digit',minute:'2-digit',hour12:false}),bandsDelivered:0});
      if(state.kind==='table'&&state.table&&event){
        const table=data.tables.find(t=>t.eventId===event.id&&t.code===state.table);
        if(table){table.status='Pendiente';table.customer=customerDraft.name;table.initialBalance=total;table.balance=total}
      }
    });
  }
  $('.confirmation-code strong').textContent=`#${requestId}`;
  renderTableAvailability();
  showStep(4);
});

function createFakeQr(seed){
  const qr=$('#fakeQr'); qr.innerHTML=''; let hash=[...seed].reduce((a,c)=>a+c.charCodeAt(0),0);
  const uploaded=demoStore?.load()?.qr?.image;
  if(uploaded){qr.innerHTML=`<img src="${uploaded}" alt="QR de pago de Diana">`;return}
  for(let r=0;r<13;r++)for(let c=0;c<13;c++){
    const cell=document.createElement('i'); const finder=(r<4&&c<4)||(r<4&&c>8)||(r>8&&c<4); const dark=finder?((r+c)%3!==1):((r*7+c*11+hash)%5<2); if(dark)cell.className='dark'; qr.appendChild(cell);
  }
}
createFakeQr('diana');
applyEventPricing(state.tableDate);
renderTableAvailability();

const legalCopy={
  privacy:{title:'Política de privacidad',body:'<p>Para gestionar compras y reservas podemos solicitar nombre, correo, WhatsApp y el comprobante de pago. Estos datos se utilizan únicamente para validar el pago, confirmar el acceso y atender consultas relacionadas con la reserva.</p><p>No vendemos información personal. Los datos se conservan solo durante el tiempo necesario para administrar la operación y cumplir obligaciones aplicables. Puedes solicitar acceso, corrección o eliminación mediante los canales oficiales de Diana.</p>'},
  terms:{title:'Términos y condiciones',body:'<p>El acceso está permitido únicamente a mayores de 18 años con documento de identidad vigente. Diana se reserva el derecho de admisión conforme a la normativa aplicable y sus reglas de convivencia.</p><p>La programación, los horarios y las áreas habilitadas pueden cambiar por razones operativas o de fuerza mayor. La compra implica aceptar las reglas del evento y mantener una conducta respetuosa dentro del establecimiento.</p>'},
  purchases:{title:'Compras y reservas',body:'<p>Una entrada o mesa queda confirmada solamente después de que Diana valide el comprobante de pago. La disponibilidad mostrada debe verificarse al momento de la confirmación.</p><p>Las mesas incluyen consumo por el valor indicado y la cantidad de manillas informada. Cambios de fecha, cancelaciones o devoluciones se revisan según las condiciones comunicadas para cada evento. No compartas tu confirmación con terceros.</p>'},
  cookies:{title:'Política de cookies',body:'<p>Esta versión demostrativa no utiliza cookies publicitarias ni herramientas de seguimiento. En una versión comercial, cualquier tecnología necesaria para seguridad, preferencias o medición se informará y gestionará conforme a la normativa aplicable.</p>'}
};
const legalModal=$('#legalModal');
$$('.legal-link').forEach(btn=>btn.addEventListener('click',()=>{const copy=legalCopy[btn.dataset.legal];if(!copy)return;$('#legalTitle').textContent=copy.title;$('#legalContent').innerHTML=copy.body;legalModal.classList.add('open');legalModal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}));
$$('[data-legal-close]').forEach(el=>el.addEventListener('click',()=>{legalModal.classList.remove('open');legalModal.setAttribute('aria-hidden','true');document.body.style.overflow=''}));
