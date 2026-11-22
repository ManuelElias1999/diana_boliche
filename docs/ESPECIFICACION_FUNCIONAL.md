# Sistema digital de gestión para Diana by Loft

## Objetivo

Centralizar las ventas, reservas, ingresos, consumos, inventario y control de caja de Diana. El sistema reemplaza registros manuales dispersos y permite que cada trabajador acceda únicamente a las funciones de su rol.

> La versión publicada es un prototipo para validar diseño y procesos. Los datos mostrados son de demostración y no procesan pagos reales.

## Roles y rutas

| Rol | Ruta | Funciones principales |
|---|---|---|
| Cliente | `/` | Ver eventos, comprar entradas, reservar mesas, cargar comprobante y consultar ubicación. |
| Administrador | `/administrador/` | Aprobar pagos, controlar caja, eventos, precios, mesas, productos, inventario, usuarios, relacionadores y reportes. |
| Puerta | `/puerta/` | Buscar compras verificadas, entregar manillas, registrar ingresos y ventas presenciales. |
| Barra | `/barra/` | Vender productos, registrar método de pago, descontar saldo de mesas y controlar inventario. |
| Relacionador | `/relacionador/` | Compartir código, consultar ventas atribuidas y puntos. |

## Flujo de compra online

1. El cliente elige un evento de viernes o sábado.
2. Selecciona entradas General/VIP o una mesa disponible para esa fecha.
3. El sistema calcula el total. El QR de Diana se mantiene en Bs 0 para que el cliente escriba el monto exacto.
4. El cliente paga y carga su comprobante, junto con nombre, WhatsApp y correo.
5. La solicitud queda en estado `Pendiente`.
6. El administrador revisa manualmente el monto y comprobante, y aprueba o rechaza.
7. Una compra aprobada queda visible en Puerta.
8. El comprador dice su nombre o código; Puerta confirma el estado, entrega las manillas y registra el ingreso.

## Entradas y mesas

- Entrada General y VIP con precio independiente por evento.
- Mesa General: referencia de Bs 1.000, 10 manillas y todo el valor como consumo.
- Mesa VIP: referencia de Bs 1.400, 12 manillas y todo el valor como consumo.
- Las mesas se administran por evento; una mesa puede estar disponible el viernes y ocupada el sábado.
- Cuando se reserva una mesa, el comprador recoge presencialmente todas las manillas.
- El estado de una mesa puede ser Disponible, Pendiente de pago, Reservada, Ocupada o Cancelada.

## Puerta

- Búsqueda por nombre, teléfono o código de solicitud.
- Solo entrega manillas de compras verificadas.
- Venta presencial de entradas General y VIP.
- Registro obligatorio de efectivo, tarjeta o QR.
- Código de relacionador opcional.
- Registro de operador, hora, cantidad de manillas e ingreso.

## Barra e inventario

- Catálogo por categoría: botellas, cervezas, shots, cigarrillos y otros.
- Registro de ventas en efectivo, tarjeta, QR o consumo de mesa.
- El valor de una mesa funciona como saldo; cada consumo reduce el saldo disponible.
- Si el pedido supera el saldo, la diferencia se paga con otro método.
- Cada venta descuenta inventario y conserva un historial de operador, hora y evento.
- Alertas de stock mínimo y movimientos manuales de ajuste con motivo.

## Administración

- Panel general de ventas, asistencia, comprobantes pendientes y alertas de stock.
- Gestión de eventos, fechas, horarios, aforo, entradas, precios y plano de mesas.
- Aprobación/rechazo de comprobantes con registro de quién revisó.
- Gestión del QR bancario visible en la web.
- Alta, baja y cambio de roles del personal.
- Alta de productos, categorías, precios y existencias.
- Caja por evento, canal y método de pago.
- Reportes de entradas, mesas, barra, inventario, relacionadores e ingresos.
- Publicación de próximos eventos y archivo de eventos pasados.

## Relacionadores

- Registro por correo y código único.
- El código es opcional en compras de entradas o mesas.
- El relacionador puede compartir la página; el QR de pago continúa siendo el QR general de Diana.
- Se contabilizan General, VIP, mesa General y mesa VIP una vez que el pago es verificado.
- El sistema acumula puntos. Los premios o conversiones se definen posteriormente por administración.

## Sitio público

- Imagen premium en negro, rojo y blanco.
- Próximos eventos de viernes y sábado.
- Sección de eventos pasados, inicialmente con Luis Vega y un archivo enlazado a Instagram.
- Compra de entradas, plano de mesas por fecha, carga de comprobante, ubicación, redes, privacidad y condiciones.
- Los eventos, textos, imágenes, precios y disponibilidad serán editables por administración en producción.

## Seguridad propuesta para producción

- Next.js para la aplicación y Supabase para base de datos, autenticación y archivos.
- Acceso por cuenta y rol; las rutas internas no serán públicas.
- Políticas RLS para que Puerta, Barra y Relacionadores solo accedan a la información necesaria.
- Comprobantes guardados en un contenedor privado con enlaces temporales.
- Historial de cambios y auditoría para aprobaciones, caja, inventario y entrega de manillas.
- Claves administrativas únicamente en el servidor; nunca en el navegador.
- Copias de seguridad, monitoreo y procedimiento de cierre de caja.

## Alcance por fases

### Fase 1 — MVP operativo

- Autenticación y roles.
- Eventos, precios y plano por fecha.
- Compra online con QR y comprobante manual.
- Venta presencial en Puerta y Barra.
- Mesas como saldo de consumo.
- Inventario básico, relacionadores, puntos y reportes diarios.

### Fase 2 — Automatización

- Integración con API de pagos para confirmación automática.
- Tickets o códigos QR individuales si Diana decide incorporarlos.
- Notificaciones automáticas por WhatsApp/correo.
- Reportes contables avanzados, exportación y conciliación.
- Programa formal de premios para relacionadores.

## Decisiones que deben confirmar los propietarios

1. Precios finales por evento y límite de entradas.
2. Plano real, nombres, cantidad y aforo de mesas.
3. Política de devolución, cancelación y tolerancia de ingreso.
4. Datos bancarios y QR que se publicará.
5. Productos, precios, inventario inicial y stock mínimo.
6. Si tarjeta se registra solamente o requiere integración con POS.
7. Reglas de puntos y premios para relacionadores.
8. Información mínima que puede ver cada rol.
9. Responsables autorizados para aprobar comprobantes y cerrar caja.
10. Historial de eventos, artistas, fotografías y textos autorizados para publicar.
