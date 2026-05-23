# 🌸 Café Primavera

Aplicación web de gestión integral para el negocio híbrido Café Primavera, que combina cafetería de especialidad y floristería artesanal.

Desarrollada como Trabajo de Fin de Grado del Ciclo Superior de Desarrollo de Aplicaciones Multiplataforma (DAM) en ILERNA Madrid.

---

## Stack tecnológico

- **Backend:** Java 21 + Spring Boot 4.0.3 + Maven
- **Frontend:** React 18 + Vite
- **Base de datos:** PostgreSQL 17 en Neon (cloud)
- **Documentación API:** Swagger / OpenAPI 3.1

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

La documentación Swagger estará disponible en `http://localhost:8080/swagger-ui/index.html`

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

## Estructura del proyecto

cafe-primavera/
├── src/
│ └── main/
│ └── java/es/cafeprimavera/
│ ├── controller/ # Endpoints REST
│ ├── service/ # Lógica de negocio
│ ├── repository/ # Acceso a datos
│ └── model/ # Entidades JPA
├── frontend/
│ └── src/
│ ├── pages/ # Páginas React
│ ├── components/ # Componentes reutilizables
│ ├── context/ # Context API (carrito)
│ └── services/ # Configuración Axios
└── pom.xml

---

## Roles y permisos

| Funcionalidad          | ADMIN | CAJERO | FLORISTA |
| ---------------------- | ----- | ------ | -------- |
| Salón y TPV            | ✓     | ✓      | ✗        |
| Inventario cafetería   | ✓     | ✓      | ✗        |
| Inventario floristería | ✓     | ✗      | ✓        |
| Talleres y reservas    | ✓     | ✗      | ✓        |
| APPCC                  | ✓     | ✓      | ✓        |
| Cierre de caja         | ✓     | ✓      | ✓        |
| Empleados              | ✓     | ✗      | ✗        |

---

## Autora

Rebeca Cristóbal Román — ILERNA Madrid, 2026
