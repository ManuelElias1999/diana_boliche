# Diana Fiesta

Prototipo funcional para digitalizar la venta de entradas, reservas de mesas, operaciones de puerta, barra, inventario, relacionadores y control administrativo de Diana by Loft.

## Rutas

- `/` — página pública, eventos, entradas y mesas.
- `/administrador/` — caja, comprobantes, métricas, precios, inventario y usuarios.
- `/puerta/` — búsqueda de compras, entrega de manillas y venta directa.
- `/barra/` — punto de venta, consumo de mesas e inventario.
- `/relacionador/` — código, ventas atribuidas y puntos.

## Estado actual

Esta versión es un prototipo interactivo para revisión con los propietarios. Los datos de los paneles son ejemplos y todavía no existe autenticación, base de datos ni procesamiento real de pagos.

La implementación productiva propuesta usa Next.js y Supabase, con autenticación por rol, almacenamiento privado de comprobantes, políticas RLS y registros de auditoría.

## Desarrollo local

La aplicación es estática y se sirve desde `dist/`. Puede abrirse con cualquier servidor estático.

## Documentación

La especificación funcional está en [docs/ESPECIFICACION_FUNCIONAL.md](docs/ESPECIFICACION_FUNCIONAL.md).
