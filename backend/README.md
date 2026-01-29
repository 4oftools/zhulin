# Zhulin Backend

This is the backend service for the Zhulin project, built with Spring Boot 3 and Java 21.

## Prerequisites

- Java 21
- Maven (Wrapper included)
- MySQL 8.0+ OR PostgreSQL 14+

## Configuration

The application supports both MySQL and PostgreSQL. By default, it uses MySQL.

### Database Setup

1. Create a database named `zhulin` in your database server.
   - MySQL: `CREATE DATABASE zhulin;`
   - PostgreSQL: `CREATE DATABASE zhulin;`

2. Configure connection settings in `src/main/resources/application-mysql.yml` or `src/main/resources/application-postgresql.yml`.

### Switching Database

To use PostgreSQL, change the active profile in `src/main/resources/application.yml`:

```yaml
spring:
  profiles:
    active: postgresql
```

## Running the Application

Using Maven Wrapper (recommended):

```bash
# Windows
./mvnw spring-boot:run

# Linux/Mac
./mvnw spring-boot:run
```

The server will start on `http://localhost:8080`.

## API Endpoints

- `GET /api/forests` - Get all bamboo forests
- `GET /api/forests/{id}` - Get a specific forest
- `POST /api/forests` - Create a new forest
- `PUT /api/forests/{id}` - Update a forest
- `DELETE /api/forests/{id}` - Delete a forest

(Similar endpoints exist for Fields, Bamboos, etc.)
