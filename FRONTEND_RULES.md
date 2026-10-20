# Reglas de Frontend - Registro de Egresados

## 1. Objetivo

El frontend debe verse profesional, ordenado y fácil de usar, pero sin sobrecomplicarse. Para un proyecto pequeño, lo importante es que funcione bien, se vea limpio y sea consistente en todas las pantallas.

## 2. Principio general

- Priorizar claridad, simplicidad y velocidad de desarrollo.
- Usar una interfaz sobria, moderna y fácil de entender.
- Evitar diseños cargados, demasiado ornamentados o complejos.
- No agregar librerías, componentes ni patrones avanzados si no son necesarios.
- La prioridad es una experiencia útil y consistente.

## 3. Estilo visual base

### Paleta de colores

Usar una paleta elegante y institucional, con tonos neutros y uno o dos acentos de color.

```css
:root {
  --bg: #f4f7fb;
  --panel: #ffffff;
  --panel-soft: #eef3f9;
  --primary: #1f4e79;
  --primary-dark: #153a59;
  --secondary: #3b82f6;
  --accent: #10b981;
  --text: #1f2937;
  --muted: #6b7280;
  --border: #dfe7f1;
  --warning: #f59e0b;
  --danger: #ef4444;
  --success: #22c55e;
  --shadow: rgba(15, 23, 42, 0.08);
}
```

### Regla de color

- Fondo claro, contenido blanco o gris muy suave.
- Azul oscuro para marca y estructura principal.
- Acentos suaves en verde o azul para éxito/acción.
- Textos oscuros para buena legibilidad.
- Usar el color con criterio: no más de 2-3 colores principales en una vista.

## 4. Tipografía

- Usar una tipografía limpia y moderna, preferiblemente sans-serif.
- Mantener jerarquía clara entre títulos, subtítulos y texto normal.
- Los textos deben ser legibles y no demasiado densos.
- No abusar de mayúsculas ni estilos exagerados.

## 5. Layout y estructura

- El diseño debe verse como un panel administrativo o dashboard simple.
- Usar cards para agrupar información.
- Mantener espacios uniformes: padding y margin consistentes.
- Las pantallas deben sentirse ordenadas, no saturadas.
- Cada sección debe tener una función clara.

## 6. Componentes principales

### Tarjetas

- Usar cards para perfiles, egresados, stats, filtros y resumenes.
- Las cards deben tener borde suave, sombra leve y radio moderado.
- No hacer tarjetas demasiado grandes ni pesadas visualmente.

### Formularios

- Inputs con borde visible y fondo blanco.
- Labels claros y alineados.
- Botones con un estilo definido: primario, secundario y de peligro.
- Los formularios deben ser simples y directos.

### Botones

```css
.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
}

.btn-secondary {
  background: var(--panel-soft);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 16px;
}
```

## 7. Reglas de UX/UI

- Cada pantalla debe tener una intención clara.
- La navegación debe ser simple, visible y entendible.
- Mostrar estados de carga, éxito y error.
- Los mensajes del sistema deben ser claros y amigables.
- Evitar texto innecesario o información sin valor.
- Mantener la misma lógica visual en toda la app.

## 8. Diseño responsive

- La interfaz debe verse bien en escritorio y móvil.
- En móvil, todo debe comprimirse sin perder legibilidad.
- Los formularios no deben ser excesivamente largos ni aglomerados.
- Redimensionar columnas y cards según el ancho disponible.

## 9. Accesibilidad

- El color debe tener suficiente contraste.
- Los botones deben poder usarse por teclado.
- Los inputs deben tener labels visibles.
- No depender solo del color para transmitir estado.
- Mantener texto claro, ordenado y fácil de escanear.

## 10. Reglas de HTML y CSS

- Usar HTML semántico: header, nav, main, section, form, footer.
- Mantener clases limpias y descriptivas.
- Preferir estilos reutilizables sobre estilos aislados.
- Evitar CSS duplicado.
- No crear demasiadas animaciones ni efectos innecesarios.

## 11. JavaScript

- Usar JavaScript simple y legible.
- Separar lógica visual de lógica de negocio.
- Mantener funciones pequeñas y reutilizables.
- Validar datos antes de enviar al backend.
- Manejar errores con mensajes claros para el usuario.

## 12. Interacción con backend

- Centralizar las peticiones en un módulo de servicio.
- Manejar estados de carga y error.
- Evitar que la UI se rompa si la respuesta falla.
- No mostrar mensajes técnicos al usuario final.

## 13. Seguridad y calidad

- No guardar información sensible en el frontend.
- No confiar en validaciones solo del lado del cliente.
- Sanitizar entradas si se muestran en pantalla.
- Usar validación del backend como fuente de verdad.

## 14. Panel y estilo de administración

Este proyecto debe sentirse como un panel simple de control o directorio institucional, no como un sitio comercial o una landing page. Por eso:

- usar estructura ordenada y clara
- priorizar tablas, cards, filtros y formularios
- evitar diseños muy "coloridos" o de festival
- mantener la interfaz seria, útil y profesional
- el foco debe estar en la información y en la gestión de egresados

## 15. Extras recomendados

- Iconos pequeños y discretos cuando aporten claridad.
- Badges para estados como activo, pendiente, destacado.
- Mensajes de éxito con color verde suave.
- Mensajes de error con color rojo sobrio.
- Sombras muy ligeras para profundidad, no para exagerar.
- Bordes suaves y redondeos moderados para sensación limpia.

## 16. Regla final

Si una solución se ve complicada, demasiado decorativa o difícil de mantener, no es la correcta para este proyecto. La mejor interfaz para este sistema es simple, profesional, clara, estable y enfocada en la información.
