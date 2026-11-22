from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from docx.enum.text import WD_BREAK
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "output" / "Propuesta_Sistema_Digital_Diana.docx"
REPO_OUT = ROOT / "docs" / "Propuesta_Sistema_Digital_Diana.docx"
LOGO = ROOT / "dist" / "assets" / "diana-logo.png"
OUT.parent.mkdir(exist_ok=True)

RED = "EF1833"
RED_DARK = "780817"
BLACK = "111113"
GRAY = "66666D"
LIGHT = "F3F1EE"
WHITE = "FFFFFF"

doc = Document()
sec = doc.sections[0]
sec.page_width, sec.page_height = Inches(8.5), Inches(11)
sec.top_margin = Inches(.68)
sec.bottom_margin = Inches(.62)
sec.left_margin = Inches(.72)
sec.right_margin = Inches(.72)

styles = doc.styles
styles['Normal'].font.name = 'Aptos'
styles['Normal'].font.size = Pt(9.3)
styles['Normal'].font.color.rgb = RGBColor.from_string(BLACK)
styles['Normal'].paragraph_format.space_after = Pt(5)
styles['Normal'].paragraph_format.line_spacing = 1.08

for name, size, color in [('Title', 34, BLACK), ('Heading 1', 18, BLACK), ('Heading 2', 13, RED_DARK), ('Heading 3', 10, BLACK)]:
    st = styles[name]
    st.font.name = 'Aptos Display'
    st.font.size = Pt(size)
    st.font.bold = True
    st.font.color.rgb = RGBColor.from_string(color)
    st.paragraph_format.space_before = Pt(7)
    st.paragraph_format.space_after = Pt(6)

if 'Eyebrow' not in styles:
    st = styles.add_style('Eyebrow', WD_STYLE_TYPE.PARAGRAPH)
    st.font.name = 'Aptos'
    st.font.size = Pt(7)
    st.font.bold = True
    st.font.color.rgb = RGBColor.from_string(RED)
    st.paragraph_format.space_after = Pt(5)

def shade(cell, fill):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = tcPr.find(qn('w:shd'))
    if shd is None:
        shd = OxmlElement('w:shd')
        tcPr.append(shd)
    shd.set(qn('w:fill'), fill)

def margins(cell, top=90, start=110, bottom=90, end=110):
    tc = cell._tc.get_or_add_tcPr()
    tcMar = tc.first_child_found_in('w:tcMar')
    if tcMar is None:
        tcMar = OxmlElement('w:tcMar')
        tc.append(tcMar)
    for m, v in [('top', top), ('start', start), ('bottom', bottom), ('end', end)]:
        el = tcMar.find(qn(f'w:{m}'))
        if el is None:
            el = OxmlElement(f'w:{m}')
            tcMar.append(el)
        el.set(qn('w:w'), str(v)); el.set(qn('w:type'), 'dxa')

def set_repeat_table_header(row):
    trPr = row._tr.get_or_add_trPr()
    tblHeader = OxmlElement('w:tblHeader')
    tblHeader.set(qn('w:val'), 'true')
    trPr.append(tblHeader)

def add_footer(section):
    p = section.footer.paragraphs[0]
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r = p.add_run('DIANA BY LOFT  •  PROPUESTA FUNCIONAL  •  ')
    r.font.name='Aptos'; r.font.size=Pt(7); r.font.color.rgb=RGBColor.from_string(GRAY)
    fld = OxmlElement('w:fldSimple'); fld.set(qn('w:instr'), 'PAGE')
    p._p.append(fld)

add_footer(sec)

def add_page():
    doc.add_page_break()

def eyebrow(text):
    p = doc.add_paragraph(style='Eyebrow')
    p.add_run(text.upper())
    return p

def title(text, subtitle=None):
    doc.add_heading(text, 1)
    if subtitle:
        p = doc.add_paragraph(subtitle)
        p.style = styles['Normal']; p.paragraph_format.space_after = Pt(10)
        p.runs[0].font.color.rgb = RGBColor.from_string(GRAY)

def pill(text, fill=RED, color=WHITE):
    t=doc.add_table(rows=1, cols=1); t.autofit=False; t.columns[0].width=Inches(1.55)
    c=t.cell(0,0); shade(c,fill); margins(c,70,100,70,100)
    p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
    r=p.add_run(text.upper()); r.bold=True; r.font.size=Pt(7); r.font.color.rgb=RGBColor.from_string(color)
    doc.add_paragraph().paragraph_format.space_after=Pt(0)

def callout(head, body, fill='F7F4F1'):
    t=doc.add_table(rows=1,cols=1); t.autofit=False; t.columns[0].width=Inches(7.05)
    c=t.cell(0,0); shade(c,fill); margins(c,150,180,150,180)
    p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(3)
    r=p.add_run(head); r.bold=True; r.font.size=Pt(10); r.font.color.rgb=RGBColor.from_string(RED_DARK)
    p=c.add_paragraph(body); p.paragraph_format.space_after=Pt(0); p.runs[0].font.size=Pt(9)
    doc.add_paragraph().paragraph_format.space_after=Pt(0)

def table(headers, rows, widths=None, font=8.2):
    t=doc.add_table(rows=1, cols=len(headers)); t.alignment=WD_TABLE_ALIGNMENT.CENTER; t.autofit=False
    if widths:
        for i,w in enumerate(widths): t.columns[i].width=Inches(w)
    hdr=t.rows[0]; set_repeat_table_header(hdr)
    for i,h in enumerate(headers):
        c=hdr.cells[i]; shade(c,BLACK); margins(c)
        if widths: c.width=Inches(widths[i])
        p=c.paragraphs[0]; r=p.add_run(h.upper()); r.bold=True; r.font.size=Pt(7); r.font.color.rgb=RGBColor.from_string(WHITE)
    for ridx,row in enumerate(rows):
        cells=t.add_row().cells
        for i,val in enumerate(row):
            c=cells[i]; margins(c); c.vertical_alignment=WD_CELL_VERTICAL_ALIGNMENT.CENTER
            if widths: c.width=Inches(widths[i])
            if ridx%2: shade(c,'F7F7F7')
            p=c.paragraphs[0]; p.paragraph_format.space_after=Pt(0)
            r=p.add_run(str(val)); r.font.size=Pt(font); r.font.color.rgb=RGBColor.from_string(BLACK)
    doc.add_paragraph().paragraph_format.space_after=Pt(0)
    return t

def bullets(items, compact=False):
    for item in items:
        p=doc.add_paragraph(style='List Bullet')
        p.paragraph_format.left_indent=Inches(.2); p.paragraph_format.first_line_indent=Inches(-.12)
        p.paragraph_format.space_after=Pt(2 if compact else 4)
        r=p.add_run(item); r.font.size=Pt(9)

def numbered(items):
    for i,item in enumerate(items,1):
        t=doc.add_table(rows=1, cols=2); t.autofit=False; t.columns[0].width=Inches(.45); t.columns[1].width=Inches(6.55)
        c=t.cell(0,0); shade(c,RED); margins(c,80,50,80,50)
        p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER; r=p.add_run(str(i)); r.bold=True; r.font.color.rgb=RGBColor.from_string(WHITE)
        c2=t.cell(0,1); margins(c2,80,110,80,110); p=c2.paragraphs[0]; p.add_run(item)
        doc.add_paragraph().paragraph_format.space_after=Pt(0)

# Cover
top=doc.add_table(rows=1, cols=2); top.autofit=False; top.columns[0].width=Inches(5.2); top.columns[1].width=Inches(1.8)
top.cell(0,0).paragraphs[0].add_run('SKYLOS  ×  DIANA').bold=True
top.cell(0,0).paragraphs[0].runs[0].font.size=Pt(8); top.cell(0,0).paragraphs[0].runs[0].font.color.rgb=RGBColor.from_string(RED)
if LOGO.exists():
    top.cell(0,1).paragraphs[0].alignment=WD_ALIGN_PARAGRAPH.RIGHT
    top.cell(0,1).paragraphs[0].add_run().add_picture(str(LOGO), width=Inches(1.1))
for _ in range(4): doc.add_paragraph()
p=doc.add_paragraph(); p.alignment=WD_ALIGN_PARAGRAPH.LEFT
r=p.add_run('SISTEMA DIGITAL\nDE GESTIÓN'); r.bold=True; r.font.name='Aptos Display'; r.font.size=Pt(40); r.font.color.rgb=RGBColor.from_string(BLACK)
p=doc.add_paragraph('Diana by Loft'); p.paragraph_format.space_after=Pt(18)
p.runs[0].font.name='Aptos Display'; p.runs[0].font.size=Pt(28); p.runs[0].font.italic=True; p.runs[0].font.color.rgb=RGBColor.from_string(RED)
p=doc.add_paragraph('PROPUESTA FUNCIONAL PARA REVISIÓN DE LOS PROPIETARIOS'); p.runs[0].font.bold=True; p.runs[0].font.size=Pt(9); p.runs[0].font.color.rgb=RGBColor.from_string(GRAY)
doc.add_paragraph('Venta de entradas y mesas · Puerta · Barra · Inventario · Administración · Relacionadores')
for _ in range(3): doc.add_paragraph()
callout('Objetivo de este documento', 'Validar qué se mantiene, qué se modifica y qué se agrega antes de conectar el sistema a una base de datos y usarlo en operaciones reales.')
p=doc.add_paragraph('VERSIÓN 1.0  ·  22 DE NOVIEMBRE DE 2026  ·  COCHABAMBA, BOLIVIA')
p.runs[0].font.size=Pt(7); p.runs[0].font.bold=True; p.runs[0].font.color.rgb=RGBColor.from_string(GRAY)

# Page 2
add_page(); eyebrow('01 · visión general'); title('Una sola operación, cuatro equipos', 'El sistema centraliza lo que hoy se registra manualmente y entrega a cada persona una vista acorde a su trabajo.')
callout('Estado del entregable', 'La web y los paneles publicados son un prototipo interactivo con datos de ejemplo. Sirven para validar procesos y diseño; todavía no procesan dinero ni guardan información real.', 'FFF3F4')
doc.add_heading('Rutas y responsabilidades',2)
table(['Rol / ruta','Qué puede hacer'],[
('Cliente · /','Ver eventos, comprar General/VIP, reservar mesa, pagar por QR y subir comprobante.'),
('Administrador · /administrador','Aprobar pagos, manejar caja, precios, eventos, productos, inventario, usuarios y reportes.'),
('Puerta · /puerta','Buscar compras, comprobar aprobación, entregar manillas, registrar ingresos y ventas presenciales.'),
('Barra · /barra','Vender bebidas y otros productos, cobrar, descontar saldo de mesas y controlar stock.'),
('Relacionador · /relacionador','Compartir su código, consultar ventas atribuidas y ver puntos.')], [2.05,4.95])
doc.add_heading('Resultado esperado',2)
bullets(['Una fuente única de ventas, ingresos y consumo por evento.','Caja separada por canal y método de pago: efectivo, tarjeta o QR.','Trazabilidad de aprobaciones, entrega de manillas, movimientos de inventario y acciones del personal.','Información en tiempo real para decidir durante y después de cada noche.'])

# Page 3
add_page(); eyebrow('02 · compra y reservas'); title('De la página a la puerta', 'La aprobación continúa siendo manual en la primera versión, pero todo el proceso queda registrado.')
numbered(['El cliente selecciona el evento correcto —viernes o sábado— y elige entrada o mesa.','El sistema calcula el total; el QR de Diana permanece en Bs 0 y el cliente escribe el monto exacto.','El cliente carga el comprobante junto con su nombre, WhatsApp y correo.','El administrador revisa monto y comprobante; aprueba o rechaza la solicitud.','Puerta encuentra la compra aprobada por nombre, teléfono o código y entrega las manillas.'])
doc.add_heading('Productos iniciales',2)
table(['Producto','Referencia','Condición'],[
('Entrada General','Precio editable por evento','Ingreso y manilla General.'),
('Entrada VIP','Precio editable por evento','Ingreso preferencial y manilla VIP.'),
('Mesa General','Bs 1.000 · 10 manillas','Todo el valor se convierte en consumo.'),
('Mesa VIP','Bs 1.400 · 12 manillas','Todo el valor se convierte en consumo.')],[1.6,2.0,3.4])
callout('Regla clave de mesas', 'La disponibilidad se controla por fecha. La misma mesa puede estar reservada el viernes y disponible el sábado. El comprador recoge presencialmente todas las manillas de su mesa.')

# Page 4
add_page(); eyebrow('03 · operación en puerta y barra'); title('Operación rápida, controlada y auditable')
table(['Puerta','Barra'],[
('Buscar por nombre, teléfono o código.','Catálogo por botellas, cervezas, shots, cigarrillos y otros.'),
('Ver estado del pago: pendiente, verificado o rechazado.','Cobrar en efectivo, tarjeta, QR o saldo de mesa.'),
('Entregar manillas solo cuando el pago esté verificado.','Descontar cada consumo del saldo incluido en la mesa.'),
('Vender General/VIP y registrar método de pago.','Cobrar la diferencia si el pedido supera el saldo.'),
('Registrar operador, hora, cantidad e ingreso.','Descontar inventario y guardar operador, hora y evento.')],[3.5,3.5])
doc.add_heading('Inventario mínimo viable',2)
bullets(['Existencia actual y stock mínimo por producto.','Alta de productos, categorías y precios desde Administración.','Alertas de reposición durante el evento.','Ajustes manuales únicamente con motivo y usuario responsable.','Historial de entradas, ventas, bajas y correcciones.'])
callout('Cierre de caja', 'Cada venta queda asociada al evento, punto de venta, operador y método de pago. El administrador puede comparar efectivo, tarjeta, QR y consumo de mesa antes de cerrar la noche.', 'F3F6F4')

# Page 5
add_page(); eyebrow('04 · administración y relacionadores'); title('Todo lo importante en un solo panel')
doc.add_heading('Administración',2)
table(['Módulo','Control disponible'],[
('Resumen','Venta total, asistencia, pendientes y alertas de stock.'),('Comprobantes','Revisar archivo, monto, aprobar/rechazar y registrar responsable.'),('Eventos','Fecha, horario, aforo, precios, mesas, imágenes y estado de publicación.'),('Caja y reportes','Ventas por canal, método, producto, evento y operador.'),('Equipo','Usuarios, roles, activación y permisos.'),('Configuración','QR bancario, políticas y contenido público.')],[1.8,5.2])
doc.add_heading('Relacionadores',2)
bullets(['Cada relacionador tiene una cuenta por correo y un código único.','El código es opcional en compras de entradas o mesas.','Se contabilizan General, VIP, mesa General y mesa VIP cuando el pago está verificado.','Los puntos quedan visibles para el relacionador y la administración.','Los premios y reglas de canje se definirán con los propietarios.'], compact=True)
callout('El QR no es personal', 'Los relacionadores comparten la página o el flujo de compra, pero el cliente siempre paga al QR general configurado por Diana.')

# Page 6
add_page(); eyebrow('05 · página pública'); title('La experiencia Diana también vive online')
doc.add_heading('Contenido y conversión',2)
table(['Sección','Propósito'],[
('Portada','Presentar la marca y llevar a entradas o reservas.'),('Próximos eventos','Mostrar viernes y sábados disponibles.'),('Entradas','Comprar General o VIP para una fecha concreta.'),('Plano de mesas','Ver disponibilidad por fecha y reservar una mesa específica.'),('Eventos pasados','Construir reputación con artistas y ediciones anteriores.'),('Ubicación y contacto','Google Maps, WhatsApp, Facebook e Instagram.'),('Legal','Privacidad, términos, compras, reservas y cookies.')],[1.8,5.2])
doc.add_heading('Archivo de eventos',2)
bullets(['El prototipo incorpora “Luis Vega en Diana” como evento anterior indicado por el equipo.','Se enlaza a @dianabyloft para ver más recuerdos.','Administración podrá publicar, editar u ocultar eventos, imágenes y textos.','Antes de producción se deben entregar las fotografías y fechas autorizadas.'])
callout('Información por confirmar', 'Instagram exige inicio de sesión para revisar el archivo completo desde la herramienta. Por eso no se inventaron nombres ni fechas adicionales: los propietarios deben indicar qué eventos desean destacar.', 'FFF3F4')

# Page 7
add_page(); eyebrow('06 · tecnología y seguridad'); title('Base preparada para crecer sin perder control')
doc.add_heading('Arquitectura propuesta',2)
table(['Capa','Propuesta'],[
('Aplicación','Next.js, diseño adaptable a computadora, tablet y celular.'),('Datos y acceso','Supabase Postgres + autenticación por cuenta y rol.'),('Comprobantes','Almacenamiento privado y enlaces temporales.'),('Seguridad','Políticas RLS; cada rol accede solo a lo necesario.'),('Auditoría','Registro de aprobaciones, caja, inventario y manillas.'),('Operación','Copias de seguridad, monitoreo y procedimiento de cierre.')],[1.8,5.2])
doc.add_heading('Fases recomendadas',2)
table(['Fase 1 · MVP operativo','Fase 2 · automatización'],[
('Roles, eventos y precios.','API de pagos y confirmación automática.'),('QR y comprobante manual.','Notificaciones por WhatsApp o correo.'),('Puerta, barra y saldo de mesas.','Tickets QR individuales si Diana los requiere.'),('Inventario, relacionadores y reportes.','Reportes contables y conciliación avanzada.')],[3.5,3.5])
callout('Seguridad obligatoria', 'Las rutas internas no estarán abiertas en producción. Las credenciales administrativas se mantendrán en el servidor y los comprobantes no serán archivos públicos.')

# Page 8
add_page(); eyebrow('07 · aprobación de propietarios'); title('Decisiones antes de construir la versión productiva', 'Marcar cada punto como Aprobado, Cambiar, Eliminar o Agregar información.')
table(['Tema','Decisión necesaria','Estado'],[
('Entradas','Precios finales y límite por evento.','□'),('Mesas','Plano real, nombres, cantidad, aforo y precios.','□'),('Pagos','QR bancario, tarjeta/POS y responsables de aprobación.','□'),('Puerta','Tolerancia de ingreso y procedimiento de entrega.','□'),('Barra','Productos, precios, inventario inicial y stock mínimo.','□'),('Relacionadores','Puntos, premios y condiciones.','□'),('Usuarios','Personas, correos y permisos por rol.','□'),('Políticas','Cancelación, devolución, privacidad y términos.','□'),('Contenido','Eventos pasados, fechas, artistas e imágenes autorizadas.','□'),('Reportes','Indicadores necesarios para caja y administración.','□')],[1.35,4.95,.7],7.8)
doc.add_heading('Siguiente paso',2)
numbered(['Reunión de revisión con los propietarios usando el prototipo y este documento.','Registrar cambios, elementos a eliminar y nuevas necesidades.','Aprobar el alcance del MVP y entregar información real.','Implementar base de datos, autenticación, seguridad y pruebas.','Realizar una prueba controlada antes del primer evento en producción.'])
t=doc.add_table(rows=1, cols=1); t.autofit=False; t.columns[0].width=Inches(7.0)
c=t.cell(0,0); c.width=Inches(7.0); shade(c,'F7F4F1'); margins(c,110,140,110,140)
p=c.paragraphs[0]; p.alignment=WD_ALIGN_PARAGRAPH.CENTER
r=p.add_run('DOCUMENTO DE REVISIÓN  ·  DESARROLLADO POR SKYLOS PARA DIANA BY LOFT'); r.bold=True; r.font.size=Pt(8); r.font.color.rgb=RGBColor.from_string(RED_DARK)

doc.save(OUT)
doc.save(REPO_OUT)
print(OUT)
