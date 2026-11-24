# Diana Fiesta

Prototipo funcional para digitalizar la venta de entradas, reservas de mesas, operaciones de puerta, barra, inventario, relacionadores y control administrativo de Diana by Loft.

## Rutas

- `/` — página pública, eventos, entradas y mesas.
- `/administrador/` — caja, comprobantes, métricas, precios, inventario y usuarios.
- `/puerta/` — búsqueda de compras, entrega de manillas y venta directa.
- `/barra/` — punto de venta, consumo de mesas e inventario.
- `/relacionador/` — código, ventas atribuidas y puntos.

## Estado actual

Esta versión es una demo frontend completamente interactiva para revisión con los propietarios. No existe todavía autenticación, base de datos ni procesamiento real de pagos, pero los flujos pueden recorrerse de principio a fin con datos simulados.

La demo guarda los cambios en `localStorage`: una compra creada desde la página pública aparece en Administración, puede aprobarse y luego entregarse desde Puerta. Las ventas de Barra descuentan inventario y saldo de mesas. Desde `/administrador/#qr` puede restaurarse el estado inicial.

### Funciones disponibles en la demo

- Compra de entradas y reserva de mesas con carga de comprobante.
- Aprobación o rechazo manual de pagos.
- Eventos, precios, cupos y estados de mesas editables.
- Venta presencial y entrega de manillas en Puerta.
- Punto de venta de Barra, carrito, métodos de pago y consumo de mesa.
- Inventario, alertas de stock y ajustes de existencias.
- Usuarios, relacionadores, códigos, puntos y ventas atribuidas.
- Reportes por evento y exportación CSV.
- Configuración visual del QR de pago.

La implementación productiva propuesta usa Next.js y Supabase, con autenticación por rol, almacenamiento privado de comprobantes, políticas RLS y registros de auditoría.

## Desarrollo local

La aplicación es estática y se sirve desde `dist/`. Puede abrirse con cualquier servidor estático. Por ejemplo:

```bash
python3 -m http.server 3000 --directory dist
```

## Documentación

- [Especificación funcional](docs/ESPECIFICACION_FUNCIONAL.md)
- [Propuesta detallada en Word](docs/Propuesta_Sistema_Digital_Diana.docx)
- [Presentación para propietarios en PowerPoint](docs/Presentacion_Diana_Sistema_Digital.pptx)
- [Presentación para propietarios en PDF](docs/Presentacion_Diana_Sistema_Digital.pdf)
