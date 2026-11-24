(function () {
  const STORAGE_KEY = 'diana-demo-v4';

  const initialData = {
    selectedEventId: 'red-room-2026-11-28',
    events: [
      {
        id: 'red-room-2026-11-28',
        name: 'Red Room',
        date: '2026-11-28',
        time: '22:00',
        status: 'Publicado',
        generalPrice: 80,
        vipPrice: 150,
        generalCapacity: 280,
        vipCapacity: 140,
        tableGeneralPrice: 1000,
        tableVipPrice: 1400,
        generalBands: 10,
        vipBands: 12
      },
      {
        id: 'friday-sessions-2026-12-04',
        name: 'Friday Sessions',
        date: '2026-12-04',
        time: '22:00',
        status: 'Publicado',
        generalPrice: 90,
        vipPrice: 160,
        generalCapacity: 280,
        vipCapacity: 140,
        tableGeneralPrice: 1100,
        tableVipPrice: 1500,
        generalBands: 10,
        vipBands: 12
      },
      {
        id: 'diana-nights-2026-12-12',
        name: 'Diana Nights',
        date: '2026-12-12',
        time: '22:00',
        status: 'Borrador',
        generalPrice: 80,
        vipPrice: 150,
        generalCapacity: 300,
        vipCapacity: 120,
        tableGeneralPrice: 1000,
        tableVipPrice: 1400,
        generalBands: 10,
        vipBands: 12
      }
    ],
    orders: [
      { id: 'DF-2819', eventId: 'red-room-2026-11-28', customer: 'Camila Rojas', phone: '70744521', email: 'camila@email.com', kind: 'ticket', type: 'VIP', quantity: 2, amount: 300, status: 'Aprobado', promoter: '', receipt: 'comprobante-camila.jpg', createdAt: '21:14', bandsDelivered: 0 },
      { id: 'DF-2820', eventId: 'red-room-2026-11-28', customer: 'Jorge Salvatierra', phone: '72711042', email: 'jorge@email.com', kind: 'table', type: 'Mesa VIP', table: 'V2', quantity: 1, amount: 1400, status: 'Pendiente', promoter: 'ANDRES24', receipt: 'comprobante-jorge.pdf', createdAt: '21:32', bandsDelivered: 0 },
      { id: 'DF-2821', eventId: 'red-room-2026-11-28', customer: 'Paola Méndez', phone: '76499110', email: 'paola@email.com', kind: 'ticket', type: 'General', quantity: 4, amount: 320, status: 'Pendiente', promoter: 'LUIS10', receipt: 'comprobante-paola.png', createdAt: '21:48', bandsDelivered: 0 },
      { id: 'DF-2812', eventId: 'red-room-2026-11-28', customer: 'Mario Pinto', phone: '70399101', email: 'mario@email.com', kind: 'ticket', type: 'General', quantity: 1, amount: 80, status: 'Entregado', promoter: '', receipt: 'comprobante-mario.jpg', createdAt: '20:52', bandsDelivered: 1 },
      { id: 'DF-2814', eventId: 'red-room-2026-11-28', customer: 'Sofía Rocha', phone: '77400552', email: 'sofia@email.com', kind: 'ticket', type: 'VIP', quantity: 2, amount: 300, status: 'Aprobado', promoter: 'ANDRES24', receipt: 'comprobante-sofia.jpg', createdAt: '20:58', bandsDelivered: 0 },
      { id: 'DF-2740', eventId: 'friday-sessions-2026-12-04', customer: 'Laura Arce', phone: '72011440', email: 'laura@email.com', kind: 'ticket', type: 'VIP', quantity: 2, amount: 320, status: 'Aprobado', promoter: 'ANDRES24', receipt: 'comprobante-laura.jpg', createdAt: '18:20', bandsDelivered: 0 }
    ],
    products: [
      { id: 'p1', name: 'Fernet 750 ml', category: 'Botellas', price: 380, stock: 9, minStock: 4, active: true },
      { id: 'p2', name: 'Johnnie Walker', category: 'Botellas', price: 520, stock: 3, minStock: 4, active: true },
      { id: 'p3', name: 'Vodka 750 ml', category: 'Botellas', price: 350, stock: 7, minStock: 4, active: true },
      { id: 'p4', name: 'Corona', category: 'Cervezas', price: 35, stock: 42, minStock: 18, active: true },
      { id: 'p5', name: 'Huari', category: 'Cervezas', price: 30, stock: 16, minStock: 18, active: true },
      { id: 'p6', name: 'Shot Jäger', category: 'Shots', price: 35, stock: 28, minStock: 12, active: true },
      { id: 'p7', name: 'Energizante', category: 'Otros', price: 30, stock: 5, minStock: 8, active: true },
      { id: 'p8', name: 'Agua', category: 'Otros', price: 15, stock: 36, minStock: 12, active: true },
      { id: 'p9', name: 'Cigarrillos', category: 'Otros', price: 45, stock: 6, minStock: 8, active: true }
    ],
    tables: [
      { eventId: 'red-room-2026-11-28', code: 'V1', zone: 'VIP', status: 'Reservada', customer: 'Natalia Vargas', initialBalance: 1400, balance: 860, bands: 12, bandsDelivered: 12 },
      { eventId: 'red-room-2026-11-28', code: 'V2', zone: 'VIP', status: 'Pendiente', customer: 'Jorge Salvatierra', initialBalance: 1400, balance: 1400, bands: 12, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'V3', zone: 'VIP', status: 'Disponible', customer: '', initialBalance: 1400, balance: 1400, bands: 12, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'V4', zone: 'VIP', status: 'Disponible', customer: '', initialBalance: 1400, balance: 1400, bands: 12, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'G1', zone: 'General', status: 'Reservada', customer: 'Alejandra Flores', initialBalance: 1000, balance: 620, bands: 10, bandsDelivered: 10 },
      { eventId: 'red-room-2026-11-28', code: 'G2', zone: 'General', status: 'Pendiente', customer: 'Carlos Quiroga', initialBalance: 1000, balance: 1000, bands: 10, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'G3', zone: 'General', status: 'Disponible', customer: '', initialBalance: 1000, balance: 1000, bands: 10, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'G4', zone: 'General', status: 'Ocupada', customer: 'Mesa G4', initialBalance: 1000, balance: 250, bands: 10, bandsDelivered: 10 },
      { eventId: 'red-room-2026-11-28', code: 'G5', zone: 'General', status: 'Pendiente', customer: 'María Suárez', initialBalance: 1000, balance: 1000, bands: 10, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'G6', zone: 'General', status: 'Disponible', customer: '', initialBalance: 1000, balance: 1000, bands: 10, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'G7', zone: 'General', status: 'Disponible', customer: '', initialBalance: 1000, balance: 1000, bands: 10, bandsDelivered: 0 },
      { eventId: 'red-room-2026-11-28', code: 'G8', zone: 'General', status: 'Disponible', customer: '', initialBalance: 1000, balance: 1000, bands: 10, bandsDelivered: 0 }
    ],
    sales: [
      { id: 'VB-1001', eventId: 'red-room-2026-11-28', channel: 'Barra', detail: 'Fernet 750 ml', amount: 380, payment: 'Consumo de mesa', table: 'V1', promoter: '', operator: 'Daniel C.', time: '23:12' },
      { id: 'VB-1002', eventId: 'red-room-2026-11-28', channel: 'Barra', detail: '2 Corona + Agua', amount: 85, payment: 'Efectivo', table: '', promoter: '', operator: 'Daniel C.', time: '23:24' },
      { id: 'VP-1003', eventId: 'red-room-2026-11-28', channel: 'Puerta', detail: '2 General', amount: 160, payment: 'QR', table: '', promoter: 'ANDRES24', operator: 'Marco A.', time: '23:31' },
      { id: 'VB-1004', eventId: 'red-room-2026-11-28', channel: 'Barra', detail: 'Vodka 750 ml + Energizante', amount: 380, payment: 'Tarjeta', table: '', promoter: '', operator: 'Daniel C.', time: '23:37' }
    ],
    entries: [
      { id: 'IN-1', eventId: 'red-room-2026-11-28', orderId: 'DF-2812', customer: 'Mario Pinto', access: 'General', bands: 1, operator: 'Marco A.', time: '23:42' },
      { id: 'IN-2', eventId: 'red-room-2026-11-28', orderId: 'DF-2810', customer: 'Sofía Rocha', access: 'VIP', bands: 2, operator: 'Marco A.', time: '23:39' },
      { id: 'IN-3', eventId: 'red-room-2026-11-28', orderId: 'DF-2808', customer: 'Mesa G4', access: 'Mesa General', bands: 10, operator: 'Lucía T.', time: '23:35' }
    ],
    promoters: [
      { id: 'r1', name: 'Andrés Méndez', email: 'andres@diana.bo', code: 'ANDRES24', points: 340, active: true },
      { id: 'r2', name: 'Luis Gutiérrez', email: 'luis@diana.bo', code: 'LUIS10', points: 230, active: true },
      { id: 'r3', name: 'Carla Vargas', email: 'carla@diana.bo', code: 'CARLA18', points: 160, active: true }
    ],
    users: [
      { id: 'u1', name: 'Valeria R.', email: 'admin@diana.bo', role: 'Administrador', active: true },
      { id: 'u2', name: 'Marco A.', email: 'puerta@diana.bo', role: 'Puerta', active: true },
      { id: 'u3', name: 'Daniel C.', email: 'barra@diana.bo', role: 'Barra', active: true },
      { id: 'u4', name: 'Lucía T.', email: 'lucia@diana.bo', role: 'Puerta', active: true }
    ],
    qr: {
      accountName: 'Diana by Loft',
      bank: 'Banco de ejemplo',
      instructions: 'Escanea el QR, escribe el monto exacto y sube tu comprobante.',
      image: ''
    }
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  let memory = clone(initialData);

  function normalize(data) {
    data.events.forEach((event) => {
      ['V1', 'V2', 'V3', 'V4', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7', 'G8'].forEach((code) => {
        const exists = data.tables.some((table) => table.eventId === event.id && table.code === code);
        if (exists) return;
        const vip = code.startsWith('V');
        data.tables.push({
          eventId: event.id,
          code,
          zone: vip ? 'VIP' : 'General',
          status: 'Disponible',
          customer: '',
          initialBalance: vip ? event.tableVipPrice : event.tableGeneralPrice,
          balance: vip ? event.tableVipPrice : event.tableGeneralPrice,
          bands: vip ? event.vipBands : event.generalBands,
          bandsDelivered: 0
        });
      });
    });
    return data;
  }

  function load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalize(JSON.parse(saved));
    } catch (_) {}
    return normalize(memory);
  }

  function save(data) {
    memory = normalize(data);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
    window.dispatchEvent(new CustomEvent('diana-store-change'));
    return memory;
  }

  function update(mutator) {
    const data = clone(load());
    mutator(data);
    return save(data);
  }

  function reset() {
    return save(clone(initialData));
  }

  function makeId(prefix) {
    return `${prefix}-${Date.now().toString().slice(-6)}`;
  }

  function selectedEvent(data = load()) {
    return data.events.find((event) => event.id === data.selectedEventId) || data.events[0];
  }

  function eventByDate(date, data = load()) {
    return data.events.find((event) => event.date === date);
  }

  window.DianaStore = { load, save, update, reset, makeId, selectedEvent, eventByDate, clone };
})();
