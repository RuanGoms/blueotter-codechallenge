# GitHub Repository Management API - BlueOtter Code Challenge

A production-ready TypeScript REST API for managing and analyzing GitHub repositories. Built with NestJS, PostgreSQL, and TypeORM following enterprise-grade architectural patterns.

## Overview

This is my submission for the BlueOtter code challenge. The API implements a complete GitHub repository management system with synchronization, search capabilities, and advanced analytics.

The system fetches public repositories from GitHub's API, stores them locally in PostgreSQL, and provides powerful querying and statistical analysis features.

## Technology Stack

- **Node.js + TypeScript 5.1** - Strict type safety and modern JavaScript features
- **NestJS 10** - Progressive Node.js framework with dependency injection
- **PostgreSQL 15** - Relational database with ACID compliance
- **TypeORM 0.3** - Type-safe ORM with query builder capabilities
- **Class Validator 0.14** - Runtime schema validation and type coercion
- **Jest 29.5** - Comprehensive testing framework with coverage reporting
- **Docker** - Containerized development and deployment environment
- **Swagger/OpenAPI** - Interactive API documentation
- **Axios 1.6** - HTTP client for GitHub API integration

## Getting Started

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

### Installation & Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd blueotter-codechallenge
```

2. Configure environment variables:
```bash
cp .env-example .env.development
```

3. Start the application stack:
```bash
npm run docker:start
```

This command will:
- Initialize a PostgreSQL 15 database container
- Build the API server image
- Automatically create database tables
- Start the application on port 3000

## API Documentation

Interactive Swagger documentation is available at:
```
http://localhost:3000/api-docs
```

The Swagger UI provides request/response examples, schema definitions, and the ability to test endpoints directly from the browser.

## Testing

### Running Tests

Execute the complete test suite:
```bash
npm test
```

Run tests in watch mode for development:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:cov
```

## Project Structure

```
src/
├── main.ts                          # Application entry point
├── app.module.ts                    # Root module configuration
├── config/
│   └── database.config.ts           # TypeORM database configuration
├── common/
│   └── services/
│       └── github.service.ts        # GitHub API integration service
└── modules/
    ├── users/                       # User and repository sync module
    │   ├── entities/
    │   │   └── user.entity.ts       # User database entity
    │   ├── users.controller.ts      # Endpoints 1 & 2
    │   ├── users.service.ts         # User business logic
    │   ├── users.module.ts
    │   └── __tests__/               # Unit tests
    ├── repositories/                # Repository search module
    │   ├── entities/
    │   │   └── repository.entity.ts # Repository database entity
    │   ├── dto/                     # Data Transfer Objects
    │   ├── repositories.controller.ts
    │   ├── repositories.service.ts
    │   ├── repositories.module.ts
    │   └── __tests__/               # Unit tests
    └── statistics/                  # Analytics module
        ├── dto/                     # Statistics DTOs
        ├── statistics.controller.ts
        ├── statistics.service.ts
        ├── statistics.module.ts
        └── __tests__/               # Unit tests
```

### Architecture Pattern

The application follows a **modular architecture** with clear separation of concerns:

```
HTTP Request
    ↓
Controllers (HTTP request/response handling)
    ↓
Services (business logic and orchestration)
    ↓
TypeORM Repositories (data access layer)
    ↓
Database (PostgreSQL)
```

Each module is independently testable through dependency injection and follows NestJS best practices.
