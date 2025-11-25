# 🏨 Hostal Don Tito - Sistema de Reservas Online

Sistema completo de reservas online para el Hostal Don Tito en Izalco, Sonsonate, El Salvador.

## ✨ Características Principales

### Para Clientes
- ✅ **Proceso de Reserva Simplificado (3 Pasos):**
  1. Selección de fechas y habitación con calendario interactivo
  2. Formulario de datos del huésped
  3. Confirmación y resumen

- 📱 **Diseño Responsive:** Optimizado para móvil, tablet y desktop
- 👴 **UX Optimizado +45 años:**
  - Tipografía legible (≥18px base)
  - Botones grandes (≥44x44px)
  - Alto contraste de colores
  - Máximo 3 pasos en el proceso
  - Navegación simple e intuitiva

- 🗓️ **Calendario Interactivo:**
  - Visualización de disponibilidad en tiempo real
  - Código de colores claro (verde=disponible, gris=ocupado)
  - Navegación fácil entre meses

- ✉️ **Confirmación Automática:**
  - Número de confirmación único
  - Simulación de envío por Email y SMS
  - Impresión de confirmación

### Para Administradores
- 📊 **Dashboard Completo:**
  - KPIs en tiempo real (ocupación, ingresos, reservas futuras)
  - Vista de ocupación semanal
  - Estadísticas del mes

- 📅 **Gestión de Reservas:**
  - Visualización de todas las reservas
  - Filtros por estado (todas, confirmada, pendiente, cancelada, completada)
  - Búsqueda por ID, nombre o habitación
  - Cambio de estado de reservas
  - Vista detallada de cada reserva

- 🔐 **Sistema de Autenticación:**
  - Login seguro para personal autorizado
  - Sesión persistente

## 🎨 Diseño y UX

- **Colores:**
  - Primario: Azul oscuro/marino (#1e3a8a)
  - Secundario: Dorado (#f59e0b)
  - Acentos: Verde para disponibilidad

- **Tipografía:**
  - Base: 18px (optimizado para +45 años)
  - Títulos grandes y legibles
  - Alto contraste para mejor lectura

- **Interacciones:**
  - Botones mínimo 44x44px (táctil-friendly)
  - Feedback visual inmediato
  - Animaciones suaves y profesionales

## 🛠️ Tecnologías Utilizadas

- **Framework:** Next.js 14 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Iconos:** Lucide React
- **Almacenamiento:** LocalStorage (demo - sin backend)

## 📋 Requisitos del Proyecto

✅ Sistema responsive (móvil/tablet/desktop)
✅ Calendario interactivo con disponibilidad en tiempo real
✅ Formulario de reserva en MÁXIMO 3 pasos
✅ Confirmación automática
✅ Panel administrativo con gestión de reservas
✅ Diseño optimizado para usuarios +45 años:
  - Tipografía ≥16px
  - Botones ≥44x44px
  - Alto contraste
  - Proceso simplificado

## 🚀 Instalación y Uso

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Abrir en el navegador
# http://localhost:3000
```

### Credenciales de Admin

- **Email:** admin@hostaldontico.com
- **Contraseña:** admin123

## 📁 Estructura del Proyecto

```
hostal-don-tito/
├── src/
│   ├── app/                    # Páginas de la aplicación
│   │   ├── page.tsx           # Página principal
│   │   ├── reservar/          # Sistema de reservas
│   │   └── admin/             # Panel administrativo
│   ├── components/            # Componentes reutilizables
│   │   ├── Header.tsx         # Header del sitio
│   │   ├── Footer.tsx         # Footer del sitio
│   │   └── reservas/          # Componentes de reservas
│   ├── lib/                   # Utilidades y datos
│   │   └── data.ts           # Sistema de datos mockeados
│   └── types/                 # Tipos TypeScript
│       └── index.ts
├── public/                    # Archivos estáticos
└── package.json
```

## 🗄️ Sistema de Datos

**IMPORTANTE:** Esta versión utiliza LocalStorage para simular una base de datos. Los datos persisten en el navegador del usuario pero se reinician al limpiar el caché.

### Datos Iniciales:
- 4 Habitaciones (Individual, Doble, Triple, Familiar)
- 2 Reservas de ejemplo
- 2 Huéspedes de ejemplo
- 1 Usuario administrador

### Funciones Principales:
- `getHabitaciones()` - Obtener habitaciones
- `getReservas()` - Obtener reservas
- `guardarReserva()` - Guardar nueva reserva
- `actualizarReserva()` - Actualizar estado de reserva
- `verificarDisponibilidad()` - Verificar disponibilidad de habitación

## 📊 Características de la Base de Datos Mockeada

- ✅ Verificación de disponibilidad en tiempo real
- ✅ Cálculo automático de precios
- ✅ Generación de IDs únicos
- ✅ Historial de reservas
- ✅ Estadísticas y reportes

## 🎯 Flujo de Reserva

1. **Cliente accede** al sistema desde cualquier dispositivo
2. **Selecciona fechas** en el calendario interactivo
3. **Elige habitación** según disponibilidad y capacidad
4. **Completa datos** (nombre, email, teléfono)
5. **Confirma reserva** y recibe número de confirmación
6. **Personal recibe notificación** en el panel administrativo
7. **Cliente recibe confirmación** (simulada vía email/SMS)

## 🔐 Seguridad

**Nota:** Esta es una versión de demostración. En producción se requiere:
- Backend con base de datos real
- Encriptación de contraseñas
- Autenticación con JWT o similar
- Validación en servidor
- Protección CSRF
- HTTPS obligatorio

## 📱 Responsive Design

- **Móvil:** < 768px - Diseño de una columna, menú hamburguesa
- **Tablet:** 768px - 1024px - Diseño de dos columnas
- **Desktop:** > 1024px - Diseño completo de tres columnas

## 🌟 Próximas Características (Versión con Backend)

- [ ] Integración con base de datos real (PostgreSQL/MySQL)
- [ ] Pasarela de pagos online
- [ ] Envío real de emails y SMS
- [ ] Sistema de calificaciones y reseñas
- [ ] Gestión de inventario y amenidades
- [ ] Reportes avanzados y exportación
- [ ] Multi-idioma (Español/Inglés)
- [ ] Integración con redes sociales
- [ ] Sistema de promociones y descuentos
- [ ] API REST documentada

## 🤝 Contribución

Este proyecto fue desarrollado como parte de la evaluación del proyecto "Mejoramiento de la infraestructura y desarrollo de un sistema digital de reservas para optimizar la experiencia del cliente en el Hostal Don Tito ubicado en Izalco".

## 📄 Licencia

© 2024 Hostal Don Tito. Todos los derechos reservados.

## 📞 Contacto

- **Hostal Don Tito**
- Izalco, Sonsonate, El Salvador
- Teléfono: +503 XXXX-XXXX
- Email: info@hostaldontico.com

---

**Desarrollado con ❤️ para Hostal Don Tito**
