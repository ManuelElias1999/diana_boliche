const role = location.pathname.split('/').filter(Boolean)[0] || 'administrador';
const store = window.DianaStore;
const app = document.querySelector('#app');

const roles = {
  administrador: {
    label: 'Administrador', name: 'Valeria R.', initials: 'VR', title: 'Control total de la noche',
    nav: [
      ['resumen', 'Resumen'], ['comprobantes', 'Comprobantes'], ['eventos', 'Eventos y precios'],
      ['entradas-mesas', 'Entradas y mesas'], ['inventario', 'Barra e inventario'],
      ['relacionadores', 'Relacionadores'], ['usuarios', 'Usuarios'], ['reportes', 'Reportes'], ['qr', 'Configuración QR']
    ]
  },
  puerta: {
    label: 'Puerta', name: 'Marco A.', initials: 'MA', title: 'Ingresos y venta directa',
    nav: [['buscar', 'Buscar compra'], ['venta', 'Venta en puerta'], ['ingresos', 'Ingresos de hoy'], ['historial', 'Historial']]
  },
  barra: {
    label: 'Barra', name: 'Daniel C.', initials: 'DC', title: 'Ventas e inventario',
    nav: [['pos', 'Punto de venta'], ['mesas', 'Saldos de mesas'], ['inventario', 'Inventario'], ['historial', 'Historial']]
  },
  relacionador: {
    label: 'Relacionador', name: 'Andrés M.', initials: 'AM', title: 'Mis ventas y puntos',
    nav: [['resumen', 'Resumen'], ['codigo', 'Mi código'], ['ventas', 'Mis ventas'], ['puntos', 'Puntos']]
  }
};

const cfg = roles[role] || roles.administrador;
let activeView = location.hash.replace('#', '') || cfg.nav[0][0];
if (!cfg.nav.some(([id]) => id === activeView)) activeView = cfg.nav[0][0];
let data = store.load();
let cart = [];
let catalogCategory = 'Todos';
let doorSearchQuery = 'Camila Rojas';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const money = (value) => `Bs ${Number(value || 0).toLocaleString('es-BO')}`;
const todayTime = () => new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', hour12: false });
const formatDate = (value) => new Date(`${value}T12:00:00`).toLocaleDateString('es-BO', { weekday: 'short', day: '2-digit', month: 'short' });
const eventNow = () => store.selectedEvent(data);
const eventOrders = () => data.orders.filter((order) => order.eventId === eventNow().id);
const eventSales = () => data.sales.filter((sale) => sale.eventId === eventNow().id);
const eventEntries = () => data.entries.filter((entry) => entry.eventId === eventNow().id);
const eventTables = () => data.tables.filter((table) => table.eventId === eventNow().id);
const orderBands = (order) => order.kind === 'table' ? (order.type.includes('VIP') ? eventNow().vipBands : eventNow().generalBands) : order.quantity;
const statusClass = (status) => ['Aprobado', 'Entregado', 'Publicado', 'Activo'].includes(status) ? 'ok' : ['Rechazado', 'Inactivo', 'Cancelada'].includes(status) ? 'bad' : 'pending';
const badge = (status) => `<span class="badge ${statusClass(status)}">${escapeHtml(status)}</span>`;

function kpis(items) {
  return `<section class="kpis">${items.map((item) => `<article class="kpi"><span class="label">${item[0]}</span><strong>${item[1]}</strong><span class="delta ${item[3] || ''}">${item[2]}</span></article>`).join('')}</section>`;
}

function emptyState(title, text) {
  return `<div class="empty-state"><span>◇</span><h3>${title}</h3><p>${text}</p></div>`;
}

function shell(content) {
  const current = eventNow();
  return `<div class="demo">DEMO INTERACTIVA · DATOS LOCALES</div><div class="shell">
    <aside class="sidebar" id="sidebar"><a class="logo" href="/"><b>diana</b><span>BY LOFT · CBB</span></a><div class="role-chip">${cfg.label}</div>
      <nav class="nav">${cfg.nav.map(([id, label]) => `<button data-nav="${id}" class="${id === activeView ? 'active' : ''}">${label}</button>`).join('')}</nav>
      <div class="sidebar-foot"><div class="profile"><div class="avatar">${cfg.initials}</div><div><b>${cfg.name}</b><small>${cfg.label}</small></div></div><a class="view-site" href="/">← Ver página pública</a></div>
    </aside><main class="main"><header class="topbar"><div><button class="mobile-menu" id="mobileMenu">☰</button><span class="eyebrow">${formatDate(current.date).toUpperCase()} · ${escapeHtml(current.name).toUpperCase()}</span><h1>${cfg.title}</h1></div><div class="top-actions"><select class="event-select" id="eventSelect">${data.events.map((event) => `<option value="${event.id}" ${event.id === current.id ? 'selected' : ''}>${escapeHtml(event.name)} · ${formatDate(event.date)}</option>`).join('')}</select><button class="icon-btn" data-action="refresh">↻</button></div></header><div class="view-stage">${content}</div></main>
  </div><div class="toast" id="toast"></div><div id="modalRoot"></div>`;
}

function viewHeader(kicker, title, description, action = '') {
  return `<div class="view-header"><div><span>${kicker}</span><h2>${title}</h2><p>${description}</p></div>${action}</div>`;
}

function renderAdminSummary() {
  const orders = eventOrders();
  const sales = eventSales();
  const approvedOnline = orders.filter((order) => ['Aprobado', 'Entregado'].includes(order.status)).reduce((sum, order) => sum + order.amount, 0);
  const salesTotal = sales.reduce((sum, sale) => sum + sale.amount, 0);
  const pending = orders.filter((order) => order.status === 'Pendiente');
  const lowStock = data.products.filter((product) => product.stock <= product.minStock && product.active);
  const entered = eventEntries().reduce((sum, entry) => sum + entry.bands, 0);
  return `${kpis([
    ['Venta registrada', money(approvedOnline + salesTotal), 'Entradas, mesas, puerta y barra'], ['Personas ingresadas', entered, 'Manillas entregadas'],
    ['Por verificar', pending.length, 'Comprobantes pendientes', pending.length ? 'warn' : ''], ['Stock crítico', lowStock.length, 'Productos requieren atención', lowStock.length ? 'warn' : '']
  ])}<section class="grid"><div><article class="card"><div class="card-head"><div><h2>Comprobantes pendientes</h2><p>Aprueba o rechaza antes de habilitar la entrega en Puerta.</p></div><button class="link-btn" data-nav="comprobantes">Ver todos</button></div>
    ${pending.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Cliente</th><th>Compra</th><th>Monto</th><th>Código</th><th>Estado</th><th></th></tr></thead><tbody>${pending.slice(0, 5).map((order) => `<tr><td><b>${escapeHtml(order.customer)}</b></td><td>${escapeHtml(order.type)}${order.quantity > 1 ? ` × ${order.quantity}` : ''}</td><td>${money(order.amount)}</td><td class="muted">${escapeHtml(order.promoter || '—')}</td><td>${badge(order.status)}</td><td><button class="action primary" data-action="review-order" data-id="${order.id}">Revisar</button></td></tr>`).join('')}</tbody></table></div>` : emptyState('Todo al día', 'No hay comprobantes pendientes para este evento.')}</article>
    <article class="card"><div class="card-head"><div><h2>Ventas por canal</h2><p>Comparación del evento seleccionado.</p></div><span class="badge ok">En vivo</span></div><div class="bar-chart">${[['Online', approvedOnline], ['Puerta', sales.filter((s) => s.channel === 'Puerta').reduce((a, s) => a + s.amount, 0)], ['Barra', sales.filter((s) => s.channel === 'Barra').reduce((a, s) => a + s.amount, 0)]].map(([label, value]) => `<div class="bar-col"><i style="height:${Math.max(12, Math.min(95, value / Math.max(1, approvedOnline + salesTotal) * 220))}%"></i><span>${label}<br>${money(value)}</span></div>`).join('')}</div></article></div>
    <aside><article class="card"><div class="card-head"><div><h2>Evento activo</h2><p>Precios publicados para esta fecha.</p></div><button class="link-btn" data-action="edit-event" data-id="${eventNow().id}">Editar</button></div><div class="stack"><div class="order-line"><span>General</span><b>${money(eventNow().generalPrice)}</b></div><div class="order-line"><span>VIP</span><b>${money(eventNow().vipPrice)}</b></div><div class="order-line"><span>Mesa general</span><b>${money(eventNow().tableGeneralPrice)}</b></div><div class="order-line"><span>Mesa VIP</span><b>${money(eventNow().tableVipPrice)}</b></div></div></article>
    <article class="card"><div class="card-head"><div><h2>Alertas de inventario</h2><p>Stock igual o menor al mínimo.</p></div></div><div class="stack">${lowStock.length ? lowStock.map((product) => `<div class="order-line"><span>${escapeHtml(product.name)}</span><b class="danger-text">${product.stock} u.</b></div>`).join('') : '<span class="muted">Sin alertas.</span>'}</div></article></aside></section>`;
}

function renderReceipts() {
  const orders = eventOrders();
  return `${viewHeader('PAGOS ONLINE', 'Comprobantes', 'Revisa cada solicitud y habilita únicamente las compras cuyo monto sea correcto.', `<div class="segmented"><button data-filter-status="Todos" class="active">Todos</button><button data-filter-status="Pendiente">Pendientes</button><button data-filter-status="Aprobado">Aprobados</button><button data-filter-status="Rechazado">Rechazados</button></div>`)}
  <article class="card"><div class="toolbar"><input class="search" data-table-filter="ordersTable" placeholder="Buscar nombre, código o teléfono"><span class="muted">${orders.length} solicitudes</span></div><div class="table-wrap"><table class="data-table" id="ordersTable"><thead><tr><th>Solicitud</th><th>Cliente</th><th>Compra</th><th>Monto</th><th>Comprobante</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${orders.map((order) => `<tr data-status="${order.status}" data-search="${escapeHtml(`${order.id} ${order.customer} ${order.phone}`.toLowerCase())}"><td><b>${order.id}</b><small>${order.createdAt}</small></td><td><b>${escapeHtml(order.customer)}</b><small>${escapeHtml(order.phone)}</small></td><td>${escapeHtml(order.type)}${order.quantity > 1 ? ` × ${order.quantity}` : ''}</td><td><b>${money(order.amount)}</b></td><td><button class="link-btn" data-action="view-receipt" data-id="${order.id}">${escapeHtml(order.receipt || 'Sin archivo')}</button></td><td>${badge(order.status)}</td><td><div class="row-actions"><button class="action" data-action="review-order" data-id="${order.id}">Revisar</button>${order.status === 'Pendiente' ? `<button class="action primary" data-action="set-order-status" data-status="Aprobado" data-id="${order.id}">Aprobar</button><button class="action" data-action="set-order-status" data-status="Rechazado" data-id="${order.id}">Rechazar</button>` : ''}</div></td></tr>`).join('')}</tbody></table></div></article>`;
}

function renderEvents() {
  return `${viewHeader('PROGRAMACIÓN', 'Eventos y precios', 'Crea fechas, publica eventos y configura precios y cupos de forma independiente.', `<button class="btn" data-action="new-event">Crear evento</button>`)}<div class="event-admin-grid">${data.events.map((event) => { const orders = data.orders.filter((order) => order.eventId === event.id); return `<article class="event-admin-card ${event.id === eventNow().id ? 'selected' : ''}"><div class="event-admin-top"><div><span>${formatDate(event.date).toUpperCase()} · ${event.time}</span><h3>${escapeHtml(event.name)}</h3></div>${badge(event.status)}</div><div class="event-stats"><div><small>GENERAL</small><b>${money(event.generalPrice)}</b></div><div><small>VIP</small><b>${money(event.vipPrice)}</b></div><div><small>SOLICITUDES</small><b>${orders.length}</b></div></div><div class="result-actions"><button class="btn secondary" data-action="select-event" data-id="${event.id}">Usar evento</button><button class="btn secondary" data-action="edit-event" data-id="${event.id}">Editar</button><button class="btn ${event.status === 'Publicado' ? 'secondary' : ''}" data-action="toggle-event" data-id="${event.id}">${event.status === 'Publicado' ? 'Pasar a borrador' : 'Publicar'}</button></div></article>`; }).join('')}</div>`;
}

function renderAdmissions() {
  const orders = eventOrders(); const tables = eventTables();
  const generalSold = orders.filter((o) => ['Aprobado', 'Entregado'].includes(o.status) && o.kind === 'ticket' && o.type === 'General').reduce((a, o) => a + o.quantity, 0);
  const vipSold = orders.filter((o) => ['Aprobado', 'Entregado'].includes(o.status) && o.kind === 'ticket' && o.type === 'VIP').reduce((a, o) => a + o.quantity, 0);
  return `${viewHeader('AFORO Y RESERVAS', 'Entradas y mesas', 'Controla cupos vendidos y cambia el estado de cada mesa para la fecha seleccionada.')}${kpis([['General vendidas', generalSold, `${eventNow().generalCapacity - generalSold} disponibles`], ['VIP vendidas', vipSold, `${eventNow().vipCapacity - vipSold} disponibles`], ['Mesas ocupadas', tables.filter((t) => t.status !== 'Disponible').length, `de ${tables.length} mesas`], ['Manillas entregadas', eventEntries().reduce((a, e) => a + e.bands, 0), 'accesos registrados']])}<section class="grid"><article class="card"><div class="card-head"><div><h2>Plano operativo de mesas</h2><p>Los estados se reflejan también en Barra.</p></div></div><div class="admin-table-map">${tables.map((table) => `<div class="table-admin"><div><strong>${table.code}</strong><span>${table.zone}</span></div><select data-table-status="${table.code}"><option ${table.status === 'Disponible' ? 'selected' : ''}>Disponible</option><option ${table.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option><option ${table.status === 'Reservada' ? 'selected' : ''}>Reservada</option><option ${table.status === 'Ocupada' ? 'selected' : ''}>Ocupada</option><option ${table.status === 'Cancelada' ? 'selected' : ''}>Cancelada</option></select><small>${escapeHtml(table.customer || 'Sin cliente')}</small></div>`).join('')}</div></article><aside><article class="card"><div class="card-head"><div><h2>Configuración</h2><p>Cupos y manillas del evento.</p></div></div><div class="stack"><div class="order-line"><span>Aforo General</span><b>${eventNow().generalCapacity}</b></div><div class="order-line"><span>Aforo VIP</span><b>${eventNow().vipCapacity}</b></div><div class="order-line"><span>Manillas General</span><b>${eventNow().generalBands}</b></div><div class="order-line"><span>Manillas VIP</span><b>${eventNow().vipBands}</b></div><button class="btn secondary" data-action="edit-event" data-id="${eventNow().id}">Editar configuración</button></div></article></aside></section>`;
}

function productTable() {
  return `<div class="table-wrap"><table class="data-table"><thead><tr><th>Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Mínimo</th><th>Estado</th><th>Acciones</th></tr></thead><tbody>${data.products.map((product) => `<tr><td><b>${escapeHtml(product.name)}</b></td><td>${escapeHtml(product.category)}</td><td>${money(product.price)}</td><td><b class="${product.stock <= product.minStock ? 'danger-text' : ''}">${product.stock}</b></td><td>${product.minStock}</td><td>${badge(product.active ? 'Activo' : 'Inactivo')}</td><td><div class="row-actions"><button class="action" data-action="adjust-stock" data-delta="-1" data-id="${product.id}">−</button><button class="action" data-action="adjust-stock" data-delta="1" data-id="${product.id}">＋</button><button class="action" data-action="edit-product" data-id="${product.id}">Editar</button><button class="action" data-action="toggle-product" data-id="${product.id}">${product.active ? 'Ocultar' : 'Activar'}</button></div></td></tr>`).join('')}</tbody></table></div>`;
}

function renderInventoryAdmin() {
  const low = data.products.filter((p) => p.stock <= p.minStock && p.active).length;
  return `${viewHeader('CATÁLOGO Y EXISTENCIAS', 'Barra e inventario', 'Agrega productos, modifica precios y registra ajustes de stock.', `<button class="btn" data-action="new-product">Agregar producto</button>`)}${kpis([['Productos activos', data.products.filter((p) => p.active).length, 'Disponibles en Barra'], ['Unidades registradas', data.products.reduce((sum, p) => sum + p.stock, 0), 'Inventario total'], ['Stock crítico', low, 'Requieren reposición', low ? 'warn' : ''], ['Venta de Barra', money(eventSales().filter((s) => s.channel === 'Barra').reduce((a, s) => a + s.amount, 0)), 'Evento seleccionado']])}<article class="card">${productTable()}</article>`;
}

function renderPromoters() {
  return `${viewHeader('EQUIPO COMERCIAL', 'Relacionadores', 'Crea códigos, activa accesos y revisa ventas y puntos.', `<button class="btn" data-action="new-promoter">Registrar relacionador</button>`)}<article class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Relacionador</th><th>Código</th><th>Ventas verificadas</th><th>Mesas</th><th>Puntos</th><th>Estado</th><th></th></tr></thead><tbody>${data.promoters.map((promoter) => { const orders = data.orders.filter((o) => o.promoter === promoter.code && ['Aprobado', 'Entregado'].includes(o.status)); return `<tr><td><b>${escapeHtml(promoter.name)}</b><small>${escapeHtml(promoter.email)}</small></td><td><span class="code-pill">${promoter.code}</span></td><td>${orders.reduce((a, o) => a + (o.kind === 'ticket' ? o.quantity : 0), 0)}</td><td>${orders.filter((o) => o.kind === 'table').length}</td><td><b>${promoter.points}</b></td><td>${badge(promoter.active ? 'Activo' : 'Inactivo')}</td><td><div class="row-actions"><button class="action" data-action="edit-promoter" data-id="${promoter.id}">Editar</button><button class="action" data-action="toggle-promoter" data-id="${promoter.id}">${promoter.active ? 'Desactivar' : 'Activar'}</button></div></td></tr>`; }).join('')}</tbody></table></div></article>`;
}

function renderUsers() {
  return `${viewHeader('ACCESOS INTERNOS', 'Usuarios y permisos', 'Administra quién puede entrar a cada panel.', `<button class="btn" data-action="new-user">Agregar usuario</button>`)}<article class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Acceso</th><th>Acciones</th></tr></thead><tbody>${data.users.map((user) => `<tr><td><b>${escapeHtml(user.name)}</b></td><td>${escapeHtml(user.email)}</td><td><span class="role-badge">${escapeHtml(user.role)}</span></td><td>${badge(user.active ? 'Activo' : 'Inactivo')}</td><td><div class="row-actions"><button class="action" data-action="edit-user" data-id="${user.id}">Editar</button><button class="action" data-action="toggle-user" data-id="${user.id}">${user.active ? 'Desactivar' : 'Activar'}</button></div></td></tr>`).join('')}</tbody></table></div></article>`;
}

function renderReports() {
  const verified = eventOrders().filter((o) => ['Aprobado', 'Entregado'].includes(o.status)); const sales = eventSales();
  const online = verified.reduce((a, o) => a + o.amount, 0); const door = sales.filter((s) => s.channel === 'Puerta').reduce((a, s) => a + s.amount, 0); const bar = sales.filter((s) => s.channel === 'Barra').reduce((a, s) => a + s.amount, 0); const total = online + door + bar;
  return `${viewHeader('RESULTADOS DEL EVENTO', 'Reportes', 'Consulta ingresos, asistencia y métodos de pago. Exporta los datos en CSV.', `<button class="btn" data-action="export-report">Exportar CSV</button>`)}${kpis([['Ingresos totales', money(total), 'Suma de todos los canales'], ['Online', money(online), `${verified.length} compras verificadas`], ['Puerta', money(door), `${sales.filter((s) => s.channel === 'Puerta').length} ventas`], ['Barra', money(bar), `${sales.filter((s) => s.channel === 'Barra').length} órdenes`]])}<section class="grid"><article class="card"><div class="card-head"><div><h2>Detalle por canal</h2><p>Información registrada en la demo.</p></div></div><div class="report-bars">${[['Compras online', online], ['Venta en puerta', door], ['Barra', bar]].map(([label, value]) => `<div><span>${label}</span><div class="track"><i style="width:${Math.max(3, value / Math.max(1, total) * 100)}%"></i></div><b>${money(value)}</b></div>`).join('')}</div></article><aside><article class="card"><div class="card-head"><div><h2>Asistencia</h2><p>Manillas registradas en Puerta.</p></div></div><div class="credit"><small>INGRESARON</small><strong>${eventEntries().reduce((a, e) => a + e.bands, 0)}</strong><span class="muted">personas registradas</span></div></article></aside></section>`;
}

function renderQr() {
  return `${viewHeader('PAGO MANUAL', 'Configuración QR', 'El QR queda en Bs 0; el cliente escribe el total calculado y sube su comprobante.')}<section class="grid"><article class="card"><form id="qrForm" class="form-grid"><label>Nombre de la cuenta<input name="accountName" value="${escapeHtml(data.qr.accountName)}" required></label><label>Banco<input name="bank" value="${escapeHtml(data.qr.bank)}" required></label><label class="span-2">Instrucciones<textarea name="instructions" rows="4" required>${escapeHtml(data.qr.instructions)}</textarea></label><label class="span-2 upload-inline">Imagen del QR<input type="file" id="qrImageInput" accept="image/png,image/jpeg"><small>Se guarda únicamente en este navegador.</small></label><button class="btn span-2" type="submit">Guardar configuración</button></form></article><aside><article class="card"><div class="qr-preview">${data.qr.image ? `<img src="${data.qr.image}" alt="QR cargado">` : '<div class="qr-placeholder">QR<br><small>BS 0</small></div>'}<b>${escapeHtml(data.qr.accountName)}</b><span>${escapeHtml(data.qr.bank)}</span></div></article><article class="card danger-zone"><div class="card-head"><div><h2>Reiniciar demostración</h2><p>Restaura todos los datos de ejemplo.</p></div></div><button class="btn secondary" data-action="reset-demo">Restaurar datos iniciales</button></article></aside></section>`;
}

function renderAdmin() {
  const views = { resumen: renderAdminSummary, comprobantes: renderReceipts, eventos: renderEvents, 'entradas-mesas': renderAdmissions, inventario: renderInventoryAdmin, relacionadores: renderPromoters, usuarios: renderUsers, reportes: renderReports, qr: renderQr };
  return (views[activeView] || renderAdminSummary)();
}

function findDoorResults() {
  const query = doorSearchQuery.trim().toLowerCase();
  if (!query) return [];
  return eventOrders().filter((order) => `${order.id} ${order.customer} ${order.phone}`.toLowerCase().includes(query));
}

function renderDoorSearch() {
  const results = findDoorResults();
  return `${viewHeader('VALIDACIÓN DE ACCESO', 'Buscar compra online', 'Busca por nombre, teléfono o código. Solo se entregan manillas con pago aprobado.')}
    <div class="notice">Las compras online solo pueden entregarse cuando el administrador haya aprobado el comprobante. La persona que reservó una mesa recoge todas las manillas.</div>
    <article class="card"><div class="search-row"><input class="search" id="doorSearch" value="${escapeHtml(doorSearchQuery)}" placeholder="Ej. Camila Rojas o DF-2819"><button class="btn" data-action="door-search">Buscar</button></div><div class="result-list">${results.length ? results.map((order) => `<div class="result"><div class="result-head"><div><h3>${escapeHtml(order.customer)}</h3><p>Solicitud #${order.id} · ${escapeHtml(order.phone)}</p></div>${badge(order.status)}</div><div class="order-lines"><div class="order-line"><span>${escapeHtml(order.type)}${order.quantity > 1 ? ` × ${order.quantity}` : ''}</span><b>${money(order.amount)}</b></div><div class="order-line"><span>Relacionador</span><b>${escapeHtml(order.promoter || 'Sin código')}</b></div><div class="order-line"><span>Manillas</span><b>${order.bandsDelivered}/${orderBands(order)} entregadas</b></div></div><div class="result-actions"><button class="btn" data-action="deliver-order" data-id="${order.id}" ${order.status !== 'Aprobado' ? 'disabled' : ''}>${order.status === 'Entregado' ? 'Manillas entregadas' : `Entregar ${orderBands(order) - order.bandsDelivered} manillas`}</button><button class="btn secondary" data-action="view-receipt" data-id="${order.id}">Ver comprobante</button></div></div>`).join('') : emptyState('Sin resultados', 'Prueba con otro nombre, teléfono o código de solicitud.')}</div></article>`;
}

function renderDoorSale() {
  return `${viewHeader('VENTA PRESENCIAL', 'Venta en puerta', 'Registra el tipo de entrada, cantidad, forma de pago y código opcional de relacionador.')}<section class="grid"><article class="card"><form id="doorSaleForm" class="form-grid"><label>Tipo de entrada<select name="type" id="doorType"><option value="General" data-price="${eventNow().generalPrice}">General · ${money(eventNow().generalPrice)}</option><option value="VIP" data-price="${eventNow().vipPrice}">VIP · ${money(eventNow().vipPrice)}</option></select></label><label>Cantidad<select name="quantity" id="doorQty">${[1, 2, 3, 4, 5, 10].map((n) => `<option>${n}</option>`).join('')}</select></label><label>Método de pago<select name="payment"><option>Efectivo</option><option>Tarjeta</option><option>QR</option></select></label><label>Código relacionador<select name="promoter"><option value="">Sin código</option>${data.promoters.filter((p) => p.active).map((p) => `<option value="${p.code}">${p.code} · ${escapeHtml(p.name)}</option>`).join('')}</select></label><label class="span-2">Nombre del cliente (opcional)<input name="customer" placeholder="Ej. Andrea Pérez"></label><div class="pos-total span-2"><span>Total</span><strong id="doorTotal">${money(eventNow().generalPrice)}</strong></div><button class="btn span-2" type="submit">Registrar venta y entregar manillas</button></form></article><aside><article class="card"><div class="card-head"><div><h2>Resumen de precios</h2><p>${escapeHtml(eventNow().name)}</p></div></div><div class="stack"><div class="order-line"><span>General</span><b>${money(eventNow().generalPrice)}</b></div><div class="order-line"><span>VIP</span><b>${money(eventNow().vipPrice)}</b></div></div></article></aside></section>`;
}

function renderDoorEntries() {
  const entries = eventEntries();
  return `${viewHeader('OPERACIÓN EN PUERTA', 'Ingresos de hoy', 'Historial de manillas entregadas y operador responsable.')}${kpis([['Personas ingresadas', entries.reduce((a, e) => a + e.bands, 0), 'Manillas registradas'], ['Operaciones', entries.length, 'Entregas realizadas'], ['General', entries.filter((e) => e.access.includes('General')).reduce((a, e) => a + e.bands, 0), 'ingresos'], ['VIP y mesas', entries.filter((e) => !e.access.includes('General')).reduce((a, e) => a + e.bands, 0), 'ingresos']])}<article class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Hora</th><th>Cliente</th><th>Acceso</th><th>Manillas</th><th>Solicitud</th><th>Operador</th></tr></thead><tbody>${entries.map((entry) => `<tr><td>${entry.time}</td><td><b>${escapeHtml(entry.customer)}</b></td><td>${badge(entry.access)}</td><td>${entry.bands}</td><td>${entry.orderId || 'Venta directa'}</td><td>${escapeHtml(entry.operator)}</td></tr>`).join('')}</tbody></table></div></article>`;
}

function renderDoorHistory() {
  const sales = eventSales().filter((sale) => sale.channel === 'Puerta');
  return `${viewHeader('TRAZABILIDAD', 'Historial de ventas', 'Consulta ventas presenciales por método de pago, operador y hora.', `<button class="btn secondary" data-action="export-door">Exportar</button>`)}<article class="card">${sales.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Hora</th><th>Detalle</th><th>Monto</th><th>Pago</th><th>Relacionador</th><th>Operador</th></tr></thead><tbody>${sales.map((sale) => `<tr><td>${sale.time}</td><td><b>${escapeHtml(sale.detail)}</b></td><td>${money(sale.amount)}</td><td>${escapeHtml(sale.payment)}</td><td>${escapeHtml(sale.promoter || '—')}</td><td>${escapeHtml(sale.operator)}</td></tr>`).join('')}</tbody></table></div>` : emptyState('Todavía no hay ventas', 'Las ventas registradas en Puerta aparecerán aquí.')}</article>`;
}

function renderDoor() {
  const views = { buscar: renderDoorSearch, venta: renderDoorSale, ingresos: renderDoorEntries, historial: renderDoorHistory };
  return (views[activeView] || renderDoorSearch)();
}

function cartTotal() { return cart.reduce((sum, item) => sum + item.price * item.quantity, 0); }

function renderBarPos() {
  const products = data.products.filter((product) => product.active && (catalogCategory === 'Todos' || product.category === catalogCategory));
  const availableTables = eventTables().filter((table) => ['Reservada', 'Ocupada'].includes(table.status));
  return `${viewHeader('PUNTO DE VENTA', 'Venta de Barra', 'Selecciona productos, cantidades y forma de pago. El inventario se descuenta al cobrar.')}<section class="grid"><div><article class="card"><div class="card-head"><div><h2>Productos</h2><p>Solo se muestran productos activos.</p></div><span class="badge ok">${products.length} disponibles</span></div><div class="tabs">${['Todos', 'Botellas', 'Cervezas', 'Shots', 'Otros'].map((category) => `<button class="tab ${category === catalogCategory ? 'active' : ''}" data-action="catalog-category" data-category="${category}">${category}</button>`).join('')}</div><div class="catalog">${products.map((product) => `<button class="product" data-action="cart-add" data-id="${product.id}" ${product.stock <= 0 ? 'disabled' : ''}><span>${escapeHtml(product.category)} · Stock ${product.stock}</span><b>${escapeHtml(product.name)}</b><strong>${money(product.price)}</strong></button>`).join('')}</div></article></div><aside><article class="card"><div class="card-head"><div><h2>Venta actual</h2><p>${cart.length ? `${cart.reduce((a, i) => a + i.quantity, 0)} productos` : 'Sin productos'}</p></div><button class="link-btn" data-action="cart-clear">Limpiar</button></div><div class="cart-list">${cart.length ? cart.map((item) => `<div class="cart-item"><div><b>${escapeHtml(item.name)}</b><small>${money(item.price)} c/u</small></div><div class="qty-control"><button data-action="cart-qty" data-delta="-1" data-id="${item.id}">−</button><span>${item.quantity}</span><button data-action="cart-qty" data-delta="1" data-id="${item.id}">＋</button></div><b>${money(item.price * item.quantity)}</b></div>`).join('') : '<span class="muted">Agrega productos desde el catálogo.</span>'}</div><div class="cart-total"><span>Total</span><strong>${money(cartTotal())}</strong></div><form id="barCheckoutForm" class="stack"><label>Método de pago<select name="payment"><option>Efectivo</option><option>Tarjeta</option><option>QR</option><option>Consumo de mesa</option></select></label><label>Mesa (si corresponde)<select name="table"><option value="">Seleccionar mesa</option>${availableTables.map((table) => `<option value="${table.code}">${table.code} · Saldo ${money(table.balance)}</option>`).join('')}</select></label><label>Diferencia si el saldo no alcanza<select name="differencePayment"><option>Efectivo</option><option>Tarjeta</option><option>QR</option></select></label><button class="btn full" type="submit">Cobrar venta</button></form></article></aside></section>`;
}

function renderTableBalances() {
  const tables = eventTables().filter((table) => table.status !== 'Disponible');
  return `${viewHeader('CONSUMO INCLUIDO', 'Saldos de mesas', 'Cada reserva funciona como crédito. Barra descuenta el consumo y cobra cualquier diferencia.')}<div class="balance-grid">${tables.map((table) => { const pct = table.initialBalance ? table.balance / table.initialBalance * 100 : 0; return `<article class="balance-card"><div><span>MESA ${table.zone.toUpperCase()}</span><h3>${table.code}</h3></div>${badge(table.status)}<p>${escapeHtml(table.customer || 'Sin cliente')}</p><div class="balance-amount"><small>SALDO DISPONIBLE</small><strong>${money(table.balance)}</strong><span>de ${money(table.initialBalance)}</span></div><div class="track"><i style="width:${pct}%"></i></div><button class="btn secondary full" data-action="table-detail" data-code="${table.code}">Ver movimientos</button></article>`; }).join('')}</div>`;
}

function renderBarInventory() {
  return `${viewHeader('EXISTENCIAS', 'Inventario de Barra', 'Consulta stock y registra ajustes rápidos. Cada venta descuenta unidades automáticamente.')}${kpis([['Productos', data.products.filter((p) => p.active).length, 'activos'], ['Unidades', data.products.reduce((a, p) => a + p.stock, 0), 'registradas'], ['Stock crítico', data.products.filter((p) => p.active && p.stock <= p.minStock).length, 'alertas', 'warn'], ['Agotados', data.products.filter((p) => p.stock === 0).length, 'sin existencias', 'warn']])}<article class="card">${productTable()}</article>`;
}

function renderBarHistory() {
  const sales = eventSales().filter((sale) => sale.channel === 'Barra');
  return `${viewHeader('TRAZABILIDAD', 'Historial de Barra', 'Cada venta conserva hora, detalle, forma de pago, mesa y operador.', `<button class="btn secondary" data-action="export-bar">Exportar</button>`)}<article class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Hora</th><th>Venta</th><th>Monto</th><th>Pago</th><th>Mesa</th><th>Operador</th></tr></thead><tbody>${sales.map((sale) => `<tr><td>${sale.time}</td><td><b>${escapeHtml(sale.detail)}</b></td><td>${money(sale.amount)}</td><td>${escapeHtml(sale.payment)}</td><td>${escapeHtml(sale.table || '—')}</td><td>${escapeHtml(sale.operator)}</td></tr>`).join('')}</tbody></table></div></article>`;
}

function renderBar() {
  const views = { pos: renderBarPos, mesas: renderTableBalances, inventario: renderBarInventory, historial: renderBarHistory };
  return (views[activeView] || renderBarPos)();
}

function promoterNow() { return data.promoters.find((promoter) => promoter.code === 'ANDRES24') || data.promoters[0]; }
function promoterOrders() { return data.orders.filter((order) => order.promoter === promoterNow().code); }

function renderPromoterSummary() {
  const orders = promoterOrders(); const verified = orders.filter((o) => ['Aprobado', 'Entregado'].includes(o.status));
  return `${kpis([['Entradas General', verified.filter((o) => o.kind === 'ticket' && o.type === 'General').reduce((a, o) => a + o.quantity, 0), 'ventas verificadas'], ['Entradas VIP', verified.filter((o) => o.kind === 'ticket' && o.type === 'VIP').reduce((a, o) => a + o.quantity, 0), 'ventas verificadas'], ['Mesas General', verified.filter((o) => o.kind === 'table' && !o.type.includes('VIP')).length, 'reservas verificadas'], ['Mesas VIP', verified.filter((o) => o.kind === 'table' && o.type.includes('VIP')).length, 'reservas verificadas']])}<section class="grid"><div><article class="card"><div class="card-head"><div><h2>Actividad reciente</h2><p>Las compras pendientes todavía no suman puntos.</p></div><span class="badge ok">${promoterNow().points} puntos</span></div><div class="table-wrap"><table class="data-table"><thead><tr><th>Evento</th><th>Cliente</th><th>Producto</th><th>Monto</th><th>Estado</th></tr></thead><tbody>${orders.map((order) => `<tr><td>${formatDate(data.events.find((e) => e.id === order.eventId)?.date || eventNow().date)}</td><td><b>${escapeHtml(order.customer)}</b></td><td>${escapeHtml(order.type)}</td><td>${money(order.amount)}</td><td>${badge(order.status)}</td></tr>`).join('')}</tbody></table></div></article></div><aside><article class="card"><div class="share-box"><span class="muted">CÓDIGO PERSONAL</span><div class="share-code">${promoterNow().code}</div><button class="btn full" data-action="copy-code">Copiar código</button></div></article><article class="card"><div class="credit"><small>PUNTOS ACTUALES</small><strong>${promoterNow().points}</strong><span class="muted">Faltan ${Math.max(0, 500 - promoterNow().points)} puntos</span></div></article></aside></section>`;
}

function renderPromoterCode() {
  const pageUrl = `${location.origin}/?relacionador=${promoterNow().code}`;
  return `${viewHeader('HERRAMIENTAS DE VENTA', 'Mi código', 'Comparte el enlace de Diana; el cliente puede ingresar tu código en la compra.')}<section class="grid"><article class="card"><div class="code-hero"><span>TU CÓDIGO PERSONAL</span><strong>${promoterNow().code}</strong><p>Las compras aprobadas con este código se suman a tus resultados.</p><div class="result-actions"><button class="btn" data-action="copy-code">Copiar código</button><button class="btn secondary" data-action="copy-link" data-link="${pageUrl}">Copiar enlace</button></div></div></article><aside><article class="card"><div class="stack"><button class="btn" data-action="share-link" data-link="${pageUrl}#entradas">Compartir entradas</button><button class="btn secondary" data-action="share-link" data-link="${pageUrl}#mesas">Compartir mesas</button><button class="btn secondary" data-action="show-payment-qr">Mostrar QR de pago</button></div></article></aside></section>`;
}

function renderPromoterSales() {
  const orders = promoterOrders();
  return `${viewHeader('RESULTADOS PERSONALES', 'Mis ventas', 'Detalle por evento y tipo. Los puntos se contabilizan únicamente después de la aprobación.')}${kpis([['Solicitudes', orders.length, 'con tu código'], ['Verificadas', orders.filter((o) => ['Aprobado', 'Entregado'].includes(o.status)).length, 'suman puntos'], ['Pendientes', orders.filter((o) => o.status === 'Pendiente').length, 'esperando revisión', 'warn'], ['Monto atribuido', money(orders.filter((o) => ['Aprobado', 'Entregado'].includes(o.status)).reduce((a, o) => a + o.amount, 0)), 'ventas verificadas']])}<article class="card"><div class="table-wrap"><table class="data-table"><thead><tr><th>Solicitud</th><th>Evento</th><th>Cliente</th><th>Tipo</th><th>Monto</th><th>Estado</th></tr></thead><tbody>${orders.map((order) => `<tr><td><b>${order.id}</b></td><td>${escapeHtml(data.events.find((e) => e.id === order.eventId)?.name || 'Evento')}</td><td>${escapeHtml(order.customer)}</td><td>${escapeHtml(order.type)}${order.quantity > 1 ? ` × ${order.quantity}` : ''}</td><td>${money(order.amount)}</td><td>${badge(order.status)}</td></tr>`).join('')}</tbody></table></div></article>`;
}

function renderPromoterPoints() {
  const progress = Math.min(100, promoterNow().points / 500 * 100);
  return `${viewHeader('PROGRAMA DE RELACIONADORES', 'Puntos', 'Resumen demostrativo. Diana definirá posteriormente las reglas y premios definitivos.')}<section class="grid"><article class="card"><div class="points-hero"><span>PUNTOS ACUMULADOS</span><strong>${promoterNow().points}</strong><p>Nivel actual: <b>Promotor Plata</b></p><div class="track large"><i style="width:${progress}%"></i></div><small>${Math.max(0, 500 - promoterNow().points)} puntos para Promotor Oro</small></div></article><aside><article class="card"><div class="stack"><div class="order-line"><span>Entrada General</span><b>5 pts</b></div><div class="order-line"><span>Entrada VIP</span><b>10 pts</b></div><div class="order-line"><span>Mesa General</span><b>40 pts</b></div><div class="order-line"><span>Mesa VIP</span><b>60 pts</b></div></div></article></aside></section>`;
}

function renderPromoter() {
  const views = { resumen: renderPromoterSummary, codigo: renderPromoterCode, ventas: renderPromoterSales, puntos: renderPromoterPoints };
  return (views[activeView] || renderPromoterSummary)();
}

function render() {
  data = store.load();
  const content = role === 'puerta' ? renderDoor() : role === 'barra' ? renderBar() : role === 'relacionador' ? renderPromoter() : renderAdmin();
  app.innerHTML = shell(content);
  history.replaceState(null, '', `#${activeView}`);
}

function toast(message) {
  const element = document.querySelector('#toast'); if (!element) return;
  element.textContent = message; element.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => element.classList.remove('show'), 2800);
}

function openModal(title, body, wide = false) {
  document.querySelector('#modalRoot').innerHTML = `<div class="panel-modal open"><div class="panel-modal-backdrop" data-action="close-modal"></div><div class="panel-modal-dialog ${wide ? 'wide' : ''}"><button class="panel-modal-close" data-action="close-modal">×</button><h2>${title}</h2>${body}</div></div>`;
}
function closeModal() { const root = document.querySelector('#modalRoot'); if (root) root.innerHTML = ''; }

function orderModal(order) {
  const event = data.events.find((item) => item.id === order.eventId);
  openModal(`Solicitud ${order.id}`, `<div class="modal-status">${badge(order.status)}</div><div class="detail-grid"><div><span>Cliente</span><b>${escapeHtml(order.customer)}</b><small>${escapeHtml(order.phone)} · ${escapeHtml(order.email)}</small></div><div><span>Evento</span><b>${escapeHtml(event?.name || 'Evento')}</b><small>${formatDate(event?.date || eventNow().date)} · ${event?.time || ''}</small></div><div><span>Compra</span><b>${escapeHtml(order.type)}${order.quantity > 1 ? ` × ${order.quantity}` : ''}</b><small>${order.table ? `Mesa ${order.table}` : `${orderBands(order)} manillas`}</small></div><div><span>Total esperado</span><b>${money(order.amount)}</b><small>Código: ${escapeHtml(order.promoter || 'Sin relacionador')}</small></div></div><div class="receipt-preview"><div class="receipt-paper"><span>COMPROBANTE DE DEMOSTRACIÓN</span><strong>${money(order.amount)}</strong><small>${escapeHtml(order.receipt || 'Archivo no disponible')}</small></div></div><div class="modal-actions"><button class="btn secondary" data-action="set-order-status" data-status="Rechazado" data-id="${order.id}">Rechazar</button><button class="btn" data-action="set-order-status" data-status="Aprobado" data-id="${order.id}">Aprobar pago</button></div>`, true);
}

function eventModal(event = null) {
  const item = event || { id: '', name: '', date: '', time: '22:00', status: 'Borrador', generalPrice: 80, vipPrice: 150, generalCapacity: 280, vipCapacity: 140, tableGeneralPrice: 1000, tableVipPrice: 1400, generalBands: 10, vipBands: 12 };
  openModal(event ? 'Editar evento' : 'Crear evento', `<form id="eventForm" class="form-grid"><input type="hidden" name="id" value="${item.id}"><label class="span-2">Nombre del evento<input name="name" value="${escapeHtml(item.name)}" required></label><label>Fecha<input type="date" name="date" value="${item.date}" required></label><label>Hora<input type="time" name="time" value="${item.time}" required></label><label>Entrada General<input type="number" name="generalPrice" value="${item.generalPrice}" min="0" required></label><label>Entrada VIP<input type="number" name="vipPrice" value="${item.vipPrice}" min="0" required></label><label>Mesa General<input type="number" name="tableGeneralPrice" value="${item.tableGeneralPrice}" min="0" required></label><label>Mesa VIP<input type="number" name="tableVipPrice" value="${item.tableVipPrice}" min="0" required></label><label>Aforo General<input type="number" name="generalCapacity" value="${item.generalCapacity}" min="1" required></label><label>Aforo VIP<input type="number" name="vipCapacity" value="${item.vipCapacity}" min="1" required></label><label>Manillas mesa General<input type="number" name="generalBands" value="${item.generalBands}" min="1" required></label><label>Manillas mesa VIP<input type="number" name="vipBands" value="${item.vipBands}" min="1" required></label><label class="span-2">Estado<select name="status"><option ${item.status === 'Publicado' ? 'selected' : ''}>Publicado</option><option ${item.status === 'Borrador' ? 'selected' : ''}>Borrador</option></select></label><button class="btn span-2" type="submit">Guardar evento</button></form>`, true);
}

function productModal(product = null) {
  const item = product || { id: '', name: '', category: 'Botellas', price: 0, stock: 0, minStock: 0, active: true };
  openModal(product ? 'Editar producto' : 'Agregar producto', `<form id="productForm" class="form-grid"><input type="hidden" name="id" value="${item.id}"><label class="span-2">Nombre<input name="name" value="${escapeHtml(item.name)}" required></label><label>Categoría<select name="category">${['Botellas', 'Cervezas', 'Shots', 'Otros'].map((c) => `<option ${c === item.category ? 'selected' : ''}>${c}</option>`).join('')}</select></label><label>Precio<input type="number" name="price" value="${item.price}" min="0" required></label><label>Stock actual<input type="number" name="stock" value="${item.stock}" min="0" required></label><label>Stock mínimo<input type="number" name="minStock" value="${item.minStock}" min="0" required></label><button class="btn span-2" type="submit">Guardar producto</button></form>`);
}

function promoterModal(promoter = null) {
  const item = promoter || { id: '', name: '', email: '', code: '', points: 0, active: true };
  openModal(promoter ? 'Editar relacionador' : 'Registrar relacionador', `<form id="promoterForm" class="form-grid"><input type="hidden" name="id" value="${item.id}"><label class="span-2">Nombre<input name="name" value="${escapeHtml(item.name)}" required></label><label>Correo<input type="email" name="email" value="${escapeHtml(item.email)}" required></label><label>Código único<input name="code" value="${escapeHtml(item.code)}" maxlength="16" required></label><label class="span-2">Puntos<input type="number" name="points" value="${item.points}" min="0" required></label><button class="btn span-2" type="submit">Guardar relacionador</button></form>`);
}

function userModal(user = null) {
  const item = user || { id: '', name: '', email: '', role: 'Puerta', active: true };
  openModal(user ? 'Editar usuario' : 'Agregar usuario', `<form id="userForm" class="form-grid"><input type="hidden" name="id" value="${item.id}"><label class="span-2">Nombre<input name="name" value="${escapeHtml(item.name)}" required></label><label class="span-2">Correo<input type="email" name="email" value="${escapeHtml(item.email)}" required></label><label class="span-2">Rol<select name="role">${['Administrador', 'Puerta', 'Barra'].map((r) => `<option ${r === item.role ? 'selected' : ''}>${r}</option>`).join('')}</select></label><button class="btn span-2" type="submit">Guardar usuario</button></form>`);
}

function setOrderStatus(id, status) {
  store.update((next) => {
    const order = next.orders.find((item) => item.id === id); if (!order) return;
    order.status = status; order.reviewedBy = cfg.name; order.reviewedAt = todayTime();
    if (order.kind === 'table' && order.table) {
      const table = next.tables.find((item) => item.eventId === order.eventId && item.code === order.table);
      if (table) { table.status = status === 'Aprobado' ? 'Reservada' : status === 'Rechazado' ? 'Disponible' : table.status; table.customer = status === 'Rechazado' ? '' : order.customer; }
    }
    if (status === 'Aprobado' && order.promoter && !order.pointsApplied) {
      const promoter = next.promoters.find((item) => item.code === order.promoter);
      if (promoter) { promoter.points += order.kind === 'table' ? (order.type.includes('VIP') ? 60 : 40) : order.quantity * (order.type === 'VIP' ? 10 : 5); order.pointsApplied = true; }
    }
  });
  closeModal(); render(); toast(status === 'Aprobado' ? 'Pago aprobado y habilitado en Puerta' : 'Solicitud rechazada');
}

function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('button, [data-action]'); if (!button) return;
  const nav = button.dataset.nav;
  if (nav) { activeView = nav; document.querySelector('#sidebar')?.classList.remove('open'); render(); return; }
  if (button.dataset.filterStatus) {
    const status = button.dataset.filterStatus;
    button.parentElement.querySelectorAll('button').forEach((item) => item.classList.toggle('active', item === button));
    document.querySelectorAll('#ordersTable tbody tr').forEach((row) => { row.hidden = status !== 'Todos' && row.dataset.status !== status; });
    return;
  }
  const action = button.dataset.action; if (!action) return;
  if (action === 'close-modal') return closeModal();
  if (action === 'refresh') { render(); toast('Datos actualizados'); return; }
  if (action === 'review-order' || action === 'view-receipt') { const order = data.orders.find((item) => item.id === button.dataset.id); if (order) orderModal(order); return; }
  if (action === 'set-order-status') return setOrderStatus(button.dataset.id, button.dataset.status);
  if (action === 'new-event') return eventModal();
  if (action === 'edit-event') return eventModal(data.events.find((item) => item.id === button.dataset.id));
  if (action === 'select-event') { store.update((next) => { next.selectedEventId = button.dataset.id; }); render(); toast('Evento activo actualizado'); return; }
  if (action === 'toggle-event') { store.update((next) => { const item = next.events.find((e) => e.id === button.dataset.id); if (item) item.status = item.status === 'Publicado' ? 'Borrador' : 'Publicado'; }); render(); toast('Estado del evento actualizado'); return; }
  if (action === 'new-product') return productModal();
  if (action === 'edit-product') return productModal(data.products.find((item) => item.id === button.dataset.id));
  if (action === 'adjust-stock') { store.update((next) => { const item = next.products.find((p) => p.id === button.dataset.id); if (item) item.stock = Math.max(0, item.stock + Number(button.dataset.delta)); }); render(); toast('Stock actualizado'); return; }
  if (action === 'toggle-product') { store.update((next) => { const item = next.products.find((p) => p.id === button.dataset.id); if (item) item.active = !item.active; }); render(); toast('Estado del producto actualizado'); return; }
  if (action === 'new-promoter') return promoterModal();
  if (action === 'edit-promoter') return promoterModal(data.promoters.find((item) => item.id === button.dataset.id));
  if (action === 'toggle-promoter') { store.update((next) => { const item = next.promoters.find((p) => p.id === button.dataset.id); if (item) item.active = !item.active; }); render(); toast('Acceso actualizado'); return; }
  if (action === 'new-user') return userModal();
  if (action === 'edit-user') return userModal(data.users.find((item) => item.id === button.dataset.id));
  if (action === 'toggle-user') { store.update((next) => { const item = next.users.find((u) => u.id === button.dataset.id); if (item) item.active = !item.active; }); render(); toast('Acceso actualizado'); return; }
  if (action === 'reset-demo') { if (confirm('¿Restaurar todos los datos de demostración?')) { store.reset(); cart = []; render(); toast('Datos iniciales restaurados'); } return; }
  if (action === 'door-search') { doorSearchQuery = document.querySelector('#doorSearch')?.value || ''; render(); return; }
  if (action === 'deliver-order') {
    const id = button.dataset.id;
    store.update((next) => {
      const order = next.orders.find((o) => o.id === id); if (!order || order.status !== 'Aprobado') return;
      const currentEvent = next.events.find((e) => e.id === order.eventId);
      const bands = order.kind === 'table' ? (order.type.includes('VIP') ? currentEvent.vipBands : currentEvent.generalBands) : order.quantity;
      order.bandsDelivered = bands; order.status = 'Entregado';
      next.entries.unshift({ id: store.makeId('IN'), eventId: order.eventId, orderId: order.id, customer: order.customer, access: order.type, bands, operator: cfg.name, time: todayTime() });
      if (order.table) { const table = next.tables.find((t) => t.eventId === order.eventId && t.code === order.table); if (table) { table.bandsDelivered = bands; table.status = 'Ocupada'; } }
    }); render(); toast('Manillas entregadas e ingreso registrado'); return;
  }
  if (action === 'catalog-category') { catalogCategory = button.dataset.category; render(); return; }
  if (action === 'cart-add') {
    const product = data.products.find((p) => p.id === button.dataset.id); if (!product || product.stock <= 0) return toast('Producto sin stock');
    const item = cart.find((p) => p.id === product.id);
    if (item) { if (item.quantity >= product.stock) return toast('No hay más unidades disponibles'); item.quantity += 1; } else cart.push({ id: product.id, name: product.name, price: product.price, quantity: 1 });
    render(); return;
  }
  if (action === 'cart-qty') {
    const item = cart.find((p) => p.id === button.dataset.id); const product = data.products.find((p) => p.id === button.dataset.id); if (!item) return;
    item.quantity += Number(button.dataset.delta); if (item.quantity <= 0) cart = cart.filter((p) => p.id !== item.id); else if (item.quantity > product.stock) { item.quantity = product.stock; toast('Llegaste al stock disponible'); } render(); return;
  }
  if (action === 'cart-clear') { cart = []; render(); return; }
  if (action === 'table-detail') {
    const table = eventTables().find((item) => item.code === button.dataset.code); const movements = eventSales().filter((sale) => sale.table === table.code);
    openModal(`Movimientos de mesa ${table.code}`, `<div class="credit"><small>SALDO DISPONIBLE</small><strong>${money(table.balance)}</strong><span class="muted">de ${money(table.initialBalance)} iniciales</span></div><div class="movement-list">${movements.length ? movements.map((sale) => `<div class="order-line"><span>${sale.time} · ${escapeHtml(sale.detail)}</span><b>− ${money(sale.amount)}</b></div>`).join('') : '<p class="muted">No hay consumos registrados.</p>'}</div>`); return;
  }
  if (action === 'copy-code') { navigator.clipboard?.writeText(promoterNow().code); toast(`Código ${promoterNow().code} copiado`); return; }
  if (action === 'copy-link') { navigator.clipboard?.writeText(button.dataset.link); toast('Enlace copiado'); return; }
  if (action === 'share-link') { if (navigator.share) navigator.share({ title: 'Diana by Loft', url: button.dataset.link }); else { navigator.clipboard?.writeText(button.dataset.link); toast('Enlace copiado'); } return; }
  if (action === 'show-payment-qr') { openModal('QR de pago de Diana', `<div class="qr-preview">${data.qr.image ? `<img src="${data.qr.image}" alt="QR de Diana">` : '<div class="qr-placeholder">QR<br><small>BS 0</small></div>'}<b>${escapeHtml(data.qr.accountName)}</b><span>${escapeHtml(data.qr.instructions)}</span></div>`); return; }
  if (action === 'export-report') { downloadCsv('reporte-diana.csv', [['Canal', 'Detalle', 'Monto', 'Pago', 'Hora'], ...eventSales().map((sale) => [sale.channel, sale.detail, sale.amount, sale.payment, sale.time])]); toast('Reporte exportado'); return; }
  if (action === 'export-door') { downloadCsv('ventas-puerta.csv', [['Detalle', 'Monto', 'Pago', 'Hora'], ...eventSales().filter((s) => s.channel === 'Puerta').map((s) => [s.detail, s.amount, s.payment, s.time])]); return; }
  if (action === 'export-bar') { downloadCsv('ventas-barra.csv', [['Detalle', 'Monto', 'Pago', 'Mesa', 'Hora'], ...eventSales().filter((s) => s.channel === 'Barra').map((s) => [s.detail, s.amount, s.payment, s.table, s.time])]); return; }
});

document.addEventListener('change', (event) => {
  if (event.target.id === 'eventSelect') { store.update((next) => { next.selectedEventId = event.target.value; }); render(); return; }
  if (event.target.matches('[data-table-status]')) { const code = event.target.dataset.tableStatus; store.update((next) => { const table = next.tables.find((item) => item.eventId === next.selectedEventId && item.code === code); if (table) table.status = event.target.value; }); render(); toast(`Mesa ${code}: ${event.target.value}`); return; }
  if (event.target.id === 'doorType' || event.target.id === 'doorQty') { const type = document.querySelector('#doorType'); const qty = Number(document.querySelector('#doorQty')?.value || 1); document.querySelector('#doorTotal').textContent = money(Number(type.options[type.selectedIndex].dataset.price) * qty); }
  if (event.target.id === 'qrImageInput' && event.target.files?.[0]) { const reader = new FileReader(); reader.onload = () => { store.update((next) => { next.qr.image = reader.result; }); render(); toast('Imagen del QR cargada'); }; reader.readAsDataURL(event.target.files[0]); }
});

document.addEventListener('input', (event) => {
  if (event.target.matches('[data-table-filter]')) { const query = event.target.value.toLowerCase(); const table = document.querySelector(`#${event.target.dataset.tableFilter}`); table?.querySelectorAll('tbody tr').forEach((row) => { row.hidden = !row.dataset.search.includes(query); }); }
});

document.addEventListener('submit', (event) => {
  event.preventDefault(); const form = event.target; const fields = Object.fromEntries(new FormData(form).entries());
  if (form.id === 'eventForm') {
    store.update((next) => { const payload = { ...fields, generalPrice: +fields.generalPrice, vipPrice: +fields.vipPrice, generalCapacity: +fields.generalCapacity, vipCapacity: +fields.vipCapacity, tableGeneralPrice: +fields.tableGeneralPrice, tableVipPrice: +fields.tableVipPrice, generalBands: +fields.generalBands, vipBands: +fields.vipBands }; if (fields.id) Object.assign(next.events.find((item) => item.id === fields.id), payload); else { payload.id = `${fields.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${fields.date}`; next.events.push(payload); next.selectedEventId = payload.id; ['V1', 'V2', 'V3', 'V4', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'].forEach((code) => next.tables.push({ eventId: payload.id, code, zone: code.startsWith('V') ? 'VIP' : 'General', status: 'Disponible', customer: '', initialBalance: code.startsWith('V') ? payload.tableVipPrice : payload.tableGeneralPrice, balance: code.startsWith('V') ? payload.tableVipPrice : payload.tableGeneralPrice, bands: code.startsWith('V') ? payload.vipBands : payload.generalBands, bandsDelivered: 0 })); } }); closeModal(); render(); toast('Evento guardado'); return;
  }
  if (form.id === 'productForm') { store.update((next) => { const payload = { ...fields, price: +fields.price, stock: +fields.stock, minStock: +fields.minStock, active: true }; if (fields.id) Object.assign(next.products.find((p) => p.id === fields.id), payload); else { payload.id = store.makeId('p'); next.products.push(payload); } }); closeModal(); render(); toast('Producto guardado'); return; }
  if (form.id === 'promoterForm') { store.update((next) => { const payload = { ...fields, code: fields.code.toUpperCase(), points: +fields.points, active: true }; if (fields.id) Object.assign(next.promoters.find((p) => p.id === fields.id), payload); else { payload.id = store.makeId('r'); next.promoters.push(payload); } }); closeModal(); render(); toast('Relacionador guardado'); return; }
  if (form.id === 'userForm') { store.update((next) => { const payload = { ...fields, active: true }; if (fields.id) Object.assign(next.users.find((u) => u.id === fields.id), payload); else { payload.id = store.makeId('u'); next.users.push(payload); } }); closeModal(); render(); toast('Usuario guardado'); return; }
  if (form.id === 'qrForm') { store.update((next) => { next.qr.accountName = fields.accountName; next.qr.bank = fields.bank; next.qr.instructions = fields.instructions; }); render(); toast('Configuración QR guardada'); return; }
  if (form.id === 'doorSaleForm') {
    const typeSelect = form.querySelector('[name="type"]'); const price = Number(typeSelect.options[typeSelect.selectedIndex].dataset.price); const quantity = Number(fields.quantity); const total = price * quantity;
    store.update((next) => { next.sales.unshift({ id: store.makeId('VP'), eventId: next.selectedEventId, channel: 'Puerta', detail: `${quantity} ${fields.type}`, amount: total, payment: fields.payment, table: '', promoter: fields.promoter, operator: cfg.name, time: todayTime() }); next.entries.unshift({ id: store.makeId('IN'), eventId: next.selectedEventId, orderId: '', customer: fields.customer || 'Venta directa', access: fields.type, bands: quantity, operator: cfg.name, time: todayTime() }); }); activeView = 'ingresos'; render(); toast(`Venta registrada por ${money(total)}`); return;
  }
  if (form.id === 'barCheckoutForm') {
    if (!cart.length) return toast('Agrega al menos un producto'); const total = cartTotal(); if (fields.payment === 'Consumo de mesa' && !fields.table) return toast('Selecciona una mesa');
    store.update((next) => { cart.forEach((item) => { const product = next.products.find((p) => p.id === item.id); if (product) product.stock = Math.max(0, product.stock - item.quantity); }); let paymentLabel = fields.payment; if (fields.payment === 'Consumo de mesa') { const table = next.tables.find((t) => t.eventId === next.selectedEventId && t.code === fields.table); if (table) { const fromBalance = Math.min(table.balance, total); table.balance -= fromBalance; if (fromBalance < total) paymentLabel = `Mesa + ${fields.differencePayment}`; } } next.sales.unshift({ id: store.makeId('VB'), eventId: next.selectedEventId, channel: 'Barra', detail: cart.map((item) => `${item.quantity} ${item.name}`).join(' + '), amount: total, payment: paymentLabel, table: fields.table || '', promoter: '', operator: cfg.name, time: todayTime() }); }); cart = []; activeView = 'historial'; render(); toast(`Venta cobrada por ${money(total)}`); return;
  }
});

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeModal(); });
document.addEventListener('click', (event) => { if (event.target.id === 'mobileMenu') document.querySelector('#sidebar')?.classList.toggle('open'); });

render();
