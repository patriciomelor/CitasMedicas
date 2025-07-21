# API de Citas Médicas 🏥

<p align="center">
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS"/>
  <img src="https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/postgresql-%234169E1.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/TypeORM-262627?style=for-the-badge&logo=typeorm&logoColor=white" alt="TypeORM"/>
  <img src="https://img.shields.io/badge/docker-%232496ED.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT"/>
  <img src="https://img.shields.io/badge/Mercado%20Pago-009EE3?style=for-the-badge&logo=mercado-pago&logoColor=white" alt="Mercado Pago"/>
  <img src="https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white" alt="Swagger"/>
</p>

API RESTful construida con **NestJS** para gestionar el ciclo de vida de citas médicas, incluyendo autenticación por roles, solicitud de citas, integración con pasarela de pagos y confirmación.

## ✨ Características Principales

- **Autenticación JWT**: Sistema de registro y login seguro basado en JSON Web Tokens.
- **Sistema de Roles**: Dos roles definidos (`PATIENT`, `DOCTOR`) con permisos específicos para cada endpoint.
- **Gestión de Citas**: Flujo completo para solicitar, pagar, confirmar y consultar citas médicas.
- **Validaciones de Negocio**: Reglas implementadas para horarios de atención (7-12h y 14-18h) y disponibilidad de agenda.
- **Pasarela de Pagos**: Integración con el sandbox de Mercado Pago para procesar los pagos de las citas.
- **Documentación Interactiva**: Documentación completa de la API generada con Swagger (OpenAPI).

## 🛠️ Stack Tecnológico

- **Framework**: NestJS
- **Lenguaje**: TypeScript
- **Base de Datos**: PostgreSQL
- **ORM**: TypeORM
- **Autenticación**: Passport.js (Estrategias `local` y `jwt`)
- **Pagos**: Mercado Pago SDK
- **Contenerización**: Docker & Docker Compose
- **Validación**: `class-validator`, `class-transformer`

## 🏛️ Arquitectura y Patrones de Diseño

El proyecto sigue una **arquitectura modular en capas**, una práctica recomendada que organiza el código para que sea mantenible, escalable y fácil de probar. Aunque es una aplicación monolítica, su estructura interna está claramente dividida en módulos con responsabilidades únicas.

-   **Arquitectura Modular (Monolito Bien Hecho)**: La API está organizada en módulos cohesivos (`Auth`, `Users`, `Appointments`, `Payments`). Cada módulo encapsula una parte específica del dominio del negocio, lo que facilita su desarrollo y mantenimiento independiente.

-   **Patrones de Diseño Utilizados**: NestJS promueve el uso de patrones de diseño probados en la industria, que han sido aplicados en este proyecto:
    -   **Inyección de Dependencias (DI)**: Es la base del framework. Los servicios, repositorios y otros proveedores se "inyectan" en los controladores y otros servicios, desacoplando los componentes y facilitando las pruebas unitarias.
    -   **Patrón Repository**: Se utiliza a través de TypeORM (`@InjectRepository`) para abstraer la lógica de acceso a datos. Los servicios no interactúan directamente con la base de datos, sino a través de los repositorios, separando las preocupaciones.
    -   **Patrón Strategy**: Implementado en el sistema de autenticación con Passport.js. Cada estrategia (`local` para login con email/contraseña y `jwt` para autenticación basada en token) es un "algoritmo" intercambiable para validar usuarios.
    -   **Patrón Decorator**: Usado extensivamente en todo el código (`@Controller`, `@Injectable`, `@Post`, `@Get`, `@Roles`, etc.) para añadir metadatos y funcionalidades a las clases y métodos de forma declarativa.

### ✍️ Buenas Prácticas y Código Limpio

Se ha puesto especial énfasis en seguir buenas prácticas de codificación para asegurar que el código no solo funcione, sino que también sea fácil de leer y mantener.

-   **Nombres Descriptivos**: Los métodos, variables y clases tienen nombres claros y en inglés, siguiendo el estándar de la industria. Esto hace que el código sea auto-documentado.
    -   **Métodos**: `requestAppointment`, `createPreference`, `confirmAppointment`, `getDoctorTodayAppointments`.
    -   **Variables**: `existingAppointment`, `appointmentTime`, `isValidTime`, `newAppointment`.
-   **Principio de Responsabilidad Única (SRP)**: Cada clase y método tiene una única y bien definida responsabilidad. Por ejemplo, `AppointmentsService` se encarga de la lógica de negocio de las citas, mientras que `AppointmentsController` gestiona las rutas y las peticiones HTTP.

## 🚀 Puesta en Marcha

Sigue estos pasos para levantar el proyecto en un entorno de desarrollo local.

### 1. Prerrequisitos

- Node.js (v20 o superior)
- NPM
- Docker y Docker Compose

### 2. Instalación

```bash
# 1. Clona el repositorio
git clone https://github.com/patriciomelor/CitasMedicas.git

# 2. Navega a la carpeta de la API
cd CitasMedicas/api

# 3. Instala las dependencias
npm install
```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz de la carpeta `/api` y configúralo con tus credenciales.

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=appointments_db

# Autenticación
JWT_SECRET=TU_SECRETO_PARA_JWT

# Pasarela de Pagos
MERCADOPAGO_ACCESS_TOKEN=TU_ACCESS_TOKEN_DE_PRUEBA
```

### 4. Ejecutar la Aplicación

```bash
# 1. Levanta la base de datos con Docker
docker-compose up -d

# 2. Inicia la API en modo de desarrollo
npm run start:dev
```

La API estará disponible en `http://localhost:3000`.

## 📄 Uso y Documentación

La documentación completa e interactiva de la API está generada con Swagger y se encuentra disponible en:

**http://localhost:3000/api-docs**

Desde esta interfaz se pueden probar todos los endpoints. Para las rutas protegidas, primero obtén un token desde `/auth/login` y luego úsalo en el botón `Authorize`.

### Resumen de Endpoints

#### Autenticación (`/auth`)
| Método | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Público | Registra un nuevo usuario (paciente o médico). |
| `POST` | `/login` | Público | Inicia sesión y devuelve un JWT. |
| `GET` | `/profile` | Autenticado | Devuelve el perfil del usuario logueado. |

#### Citas (`/appointments`)
| Método | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/request` | `PATIENT` | Solicita una nueva cita médica. |
| `GET` | `/doctor/today` | `DOCTOR` | Lista las citas del día para el médico logueado. |
| `GET` | `/patient/my-agenda` | `PATIENT` | Lista el historial de citas del paciente logueado. |
| `PATCH` | `/:id/confirm` | `DOCTOR` | Confirma una cita (debe estar pagada). |

#### Pagos (`/payments`)
| Método | Endpoint | Rol Requerido | Descripción |
| :--- | :--- | :--- | :--- |
| `POST` | `/create-preference` | `PATIENT` | Crea una preferencia de pago en Mercado Pago para una cita. |
| `POST` | `/webhook` | Público | Recibe notificaciones de pago de Mercado Pago. |

## 📝 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.