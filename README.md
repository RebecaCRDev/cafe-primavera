# 🌸 Café Primavera

Aplicación web de gestión integral para el negocio híbrido Café Primavera, que combina cafetería de especialidad y floristería artesanal.

Desarrollada como Trabajo de Fin de Grado del Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma (DAM) en ILERNA Madrid.

---

## Stack tecnológico

- **Backend:** Java 21 + Spring Boot 4.0.3 + Maven
- **Frontend:** React 18 + Vite
- **Base de datos:** PostgreSQL en Neon (cloud)
- **Documentación API:** Swagger / OpenAPI 3.1

---

## Funcionalidades principales

- **Salón** — mapa visual de mesas con gestión de pedidos en tiempo real
- **Inventario** — control de stock con alertas de caducidad para productos florales
- **Talleres** — gestión de talleres con reservas y control de aforo
- **APPCC** — registro de controles de higiene alimentaria
- **Cierre de caja** — desglose diario de ingresos por área de negocio
- **Dashboard** — previsión del día adaptada al rol del empleado, con alertas de stock crítico y estado de mesas

---

## Cómo arrancar el proyecto

### Requisitos previos

- Java 21
- Node.js 18+
- Maven (incluido con el proyecto via `mvnw`)

### Backend

```bash
cd cafe-primavera
./mvnw spring-boot:run
```

El backend arranca en `http://localhost:8080`
Swagger disponible en `http://localhost:8080/swagger-ui/index.html`

### Frontend

```bash
cd cafe-primavera/frontend
npm install
npm run dev
```

El frontend arranca en `http://localhost:5173`

---

## Credenciales de prueba

| Rol      | Email                 | Contraseña |
| -------- | --------------------- | ---------- |
| ADMIN    | ana@cafeprimavera.es  | admin123   |
| CAJERO   | luis@cafeprimavera.es | 1234       |
| FLORISTA | rosa@cafeprimavera.es | 1234       |

---

## Roles y permisos

| Funcionalidad          | ADMIN | CAJERO | FLORISTA |
| ---------------------- | ----- | ------ | -------- |
| Salón y pedidos        | ✓     | ✓      | ✗        |
| Inventario cafetería   | ✓     | ✓      | ✗        |
| Inventario floristería | ✓     | ✗      | ✓        |
| Talleres y reservas    | ✓     | ✗      | ✓        |
| APPCC                  | ✓     | ✓      | ✓        |
| Cierre de caja         | ✓     | ✓      | ✓        |
| Empleados              | ✓     | ✗      | ✗        |

---

## Seguridad

- Autenticación propia con cifrado **SHA256 con sal**
- Control de acceso basado en roles (RBAC): ADMIN, CAJERO, FLORISTA
- Restricción de rutas en frontend y validación de rol en backend

---

## Base de datos

Esquema completo disponible en `schema.sql`. 13 tablas organizadas en 5 módulos funcionales: catálogo, personas, ventas, talleres y operaciones.

---

## Autora

Rebeca Cristóbal Román — ILERNA Madrid, 2026
