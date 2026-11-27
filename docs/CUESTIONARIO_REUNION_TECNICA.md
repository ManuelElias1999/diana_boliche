# Cuestionario para la reunión técnica — Diana

Este documento reúne las preguntas necesarias para definir el funcionamiento real del sistema antes de desarrollar el backend. Las preguntas marcadas como **imprescindibles** deberían resolverse primero.

## 1. Alcance y operación actual

1. **¿Qué procesos quieren digitalizar en la primera versión: entradas, mesas, barra, inventario, relacionadores y reportes, o todos desde el inicio?**
2. ¿Cómo registran hoy las ventas y reservas: cuaderno, Excel, WhatsApp, sistema de caja u otra aplicación?
3. ¿Qué problemas ocurren con mayor frecuencia: pagos sin identificar, mesas duplicadas, falta de stock, diferencias de caja o entradas falsas?
4. ¿Cuántas personas usan el sistema simultáneamente en una noche normal y en un evento grande?
5. ¿Con cuántos celulares, tablets o computadoras cuentan en puerta, barra y administración?
6. ¿El sistema debe seguir funcionando si se cae el internet? ¿Durante cuánto tiempo?

## 2. Eventos, entradas y capacidad

1. **¿Cada viernes y sábado se maneja como un evento independiente, con sus propios precios, cupos, mesas y horarios?**
2. ¿Quién crea y publica un evento?
3. ¿Qué tipos de entrada existen además de General y VIP?
4. ¿Los precios pueden cambiar por preventa, horario, relacionador o etapa de venta?
5. ¿Cuál es el cupo máximo por tipo de entrada y la capacidad total del local?
6. ¿Existe una hora límite de ingreso para cada entrada?
7. ¿Se permite transferir una compra a otra persona?
8. ¿Qué información mínima se pedirá al comprador: nombre, carnet, teléfono, correo o fecha de nacimiento?
9. ¿Los menores de edad deben quedar bloqueados desde la compra o la validación se realiza solo en puerta?

## 3. Pagos y comprobantes

1. **¿A qué banco, billetera o plataforma pertenece el QR actual?**
2. **¿El QR será único y estático para todos los pagos o cambiará por evento/caja?**
3. **¿Qué datos del comprobante revisa hoy el administrador: monto, fecha, hora, nombre, banco y número de operación?**
4. ¿Cuántas personas pueden aprobar pagos y en qué horario lo hacen?
5. ¿Cuánto tiempo puede permanecer una compra pendiente antes de liberar el cupo o la mesa?
6. ¿Qué sucede si el cliente paga un monto incorrecto, paga dos veces o sube un comprobante ilegible?
7. ¿Se aceptarán capturas de pantalla, PDF y fotografías?
8. ¿Necesitan registrar pagos en efectivo y tarjeta además de QR? ¿Qué terminal utilizan para tarjeta?
9. ¿Se requiere cierre de caja separado por método de pago y por operador?
10. ¿Cuál será la política de cancelaciones, cambios de fecha y devoluciones?
11. ¿El banco permite descargar movimientos en CSV o Excel para conciliarlos con las ventas?
12. ¿Existe una API oficial o integración empresarial disponible con el banco/proveedor del QR?

### Recomendación para la primera versión

Sin API oficial, la opción más segura es mantener la validación manual: el cliente sube el comprobante, Administración compara monto y datos, y aprueba o rechaza. Conviene añadir filtros, alertas de comprobantes posiblemente duplicados y, si el banco lo permite, conciliación mediante archivo CSV/Excel.

No se recomienda hacer web scraping de la banca o de una aplicación financiera como solución principal. Puede romperse con cambios visuales, CAPTCHA o doble autenticación, y puede exponer credenciales. Solo debería evaluarse con autorización escrita del propietario de la cuenta y después de confirmar que el proveedor lo permite.

## 4. Control de acceso y manillas

1. **¿Puerta buscará al cliente por nombre, teléfono, carnet o código de compra?**
2. **¿Quién puede marcar una entrada como entregada y puede deshacer esa acción?**
3. ¿Una compra puede entregarse parcialmente, por ejemplo 2 de 5 manillas?
4. ¿La persona que reservó la mesa debe recoger todas las manillas o puede autorizar a otra persona?
5. ¿Qué ocurre si alguien llega sin teléfono o sin comprobante?
6. ¿Se necesita registrar la hora exacta y el operador que entregó cada manilla?
7. ¿Habrá reingreso después de salir del local?
8. ¿Quieren utilizar en el futuro un QR individual por compra para acelerar el ingreso?

## 5. Mesas y consumo

1. **¿Cuál es el plano real, número, zona y capacidad de cada mesa?**
2. **¿El precio total de la mesa siempre se convierte en saldo de consumo?**
3. ¿Las 10 o 12 manillas son fijas o configurables por evento?
4. ¿Se puede reservar una mesa con adelanto o debe pagarse completa?
5. ¿Se pueden unir, cambiar o reasignar mesas?
6. ¿Qué sucede si el consumo supera el saldo de la mesa?
7. ¿El saldo no utilizado se pierde, se devuelve o puede trasladarse?
8. ¿Quién puede cargar consumo a una mesa y se requiere confirmación del cliente?
9. ¿Necesitan ver el historial completo de consumos y anulaciones de cada mesa?

## 6. Barra, productos e inventario

1. **¿Qué productos venden y en qué unidades se controla el stock: botella, vaso, shot, cajetilla o unidad?**
2. ¿Una botella vendida descuenta una unidad completa? ¿Cómo se controlan tragos preparados y shots?
3. ¿Existen recetas que descuentan varios insumos automáticamente?
4. ¿Cuántas barras o puntos de venta funcionan al mismo tiempo?
5. ¿Cada bartender abre y cierra su propia caja?
6. ¿Quién puede modificar precios, aplicar descuentos, anular ventas o ajustar stock?
7. ¿Necesitan registrar mermas, invitaciones, consumo interno, botellas rotas y cortesías?
8. ¿Qué nivel de stock debe generar una alerta?
9. ¿Se realizará inventario inicial antes de cada evento y conteo final al cerrar?
10. ¿Necesitan imprimir comandas, tickets o facturas?

## 7. Usuarios, permisos y auditoría

1. **¿Qué puede hacer exactamente Administrador, Puerta, Barra y Relacionador?**
2. ¿Habrá más de un administrador? ¿Existe un superadministrador o propietario con permisos especiales?
3. ¿Cada empleado tendrá una cuenta personal o compartirán una cuenta por área?
4. ¿Cómo iniciarán sesión: correo y contraseña, código PIN o enlace enviado por correo?
5. ¿Quién crea, bloquea o elimina usuarios?
6. ¿Necesitan registrar quién aprobó, vendió, anuló o modificó cada operación?
7. ¿Qué acciones deben requerir una segunda confirmación del administrador?

## 8. Relacionadores

1. **¿Cómo se atribuye una venta: código escrito por el cliente, enlace personal o registro manual?**
2. ¿El código puede utilizarse tanto online como en puerta?
3. ¿Cuándo se otorgan puntos: al crear la compra, aprobar el pago o entregar la entrada?
4. ¿Cuántos puntos genera cada entrada y cada tipo de mesa?
5. ¿Los puntos caducan o se reinician por evento/mes?
6. ¿Qué premios o comisiones existen y quién autoriza su entrega?
7. ¿El relacionador puede ver nombres y montos de clientes o solo totales?
8. ¿Cómo se corrige una venta atribuida al código equivocado?

## 9. Reportes y caja

1. **¿Qué números necesita ver el propietario al cerrar cada evento?**
2. ¿Necesitan ventas por evento, producto, método de pago, operador, hora y relacionador?
3. ¿Cómo se calculan caja esperada, caja contada y diferencia?
4. ¿Quieren separar ingresos de entradas, mesas y barra?
5. ¿Necesitan exportar Excel/PDF o enviar un resumen por WhatsApp/correo?
6. ¿Qué información histórica quieren comparar entre eventos?
7. ¿Quién puede ver costos, utilidad, stock y reportes completos?

## 10. Página pública y contenido

1. ¿Quién enviará fotos, videos, logo, textos, eventos pasados y datos de contacto oficiales?
2. ¿Quién podrá crear, editar, publicar u ocultar eventos desde Administración?
3. ¿Necesitan promociones, códigos de descuento o preventas?
4. ¿La página tendrá políticas de privacidad, términos, compras, devoluciones y cookies aprobadas por los dueños?
5. ¿Qué número de WhatsApp y redes sociales deben aparecer oficialmente?
6. ¿Quieren recibir notificaciones cuando llegue una nueva compra o reserva?

## 11. Datos, seguridad y soporte

1. **¿Durante cuánto tiempo deben guardarse comprobantes, datos de clientes, ventas y registros de acceso?**
2. ¿Quién puede descargar o eliminar esos datos?
3. ¿Necesitan copias de seguridad y cada cuánto tiempo?
4. ¿Qué debe pasar si un dispositivo se pierde o un empleado deja de trabajar?
5. ¿Quién será responsable de aprobar cambios y responder incidencias?
6. ¿Qué horario de soporte esperan durante los eventos?
7. ¿Cuál es la fecha objetivo para probar el sistema y cuál para utilizarlo en una noche real?

## 12. Material que debemos pedirles

- Plano real y listado de mesas.
- Lista completa de productos, precios, categorías y stock inicial.
- Tipos de entrada, precios, cupos, horarios y reglas de ingreso.
- QR oficial y datos bancarios que deben mostrarse.
- Ejemplos reales de comprobantes válidos e inválidos, ocultando datos sensibles cuando corresponda.
- Lista inicial de empleados, roles y correos.
- Lista inicial de relacionadores y reglas de puntos/comisiones.
- Logo en buena calidad, paleta, tipografías, fotografías y videos autorizados.
- Políticas actuales de cambios, devoluciones, consumo y reservas.
- Ejemplos de los reportes o cierres de caja que utilizan hoy.

## 13. Decisiones que deberían salir de la reunión

1. Funciones incluidas en el MVP y funciones para una segunda etapa.
2. Flujo exacto de compra, aprobación, entrega y anulación.
3. Método inicial de validación de pagos y posible integración futura.
4. Reglas de mesas, saldo de consumo, inventario y caja.
5. Permisos de cada rol y registro de auditoría.
6. Datos que deben migrarse y material que entregará Diana.
7. Responsable de aprobación, fecha de prueba y fecha de lanzamiento.
