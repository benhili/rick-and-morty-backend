# Rick and Morty Character Explorer Backend

## Description

This is a backend service to extend the Rick and Morty Character Explorer web application.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Web Framework**: Fastify
- **Database**: SQLite3
- **Validation**: Zod
- **Testing**: Jest with Supertest
- **Development**:
  - Nodemon for hot reloading
  - ts-node for TypeScript execution
  - ESLint for code linting
- **CORS**: @fastify/cors for cross-origin requests

## Getting Started

### Installation

1. **Clone the repository:**

```bash
git clone https://github.com/benhili/rick-and-morty-backend.git
cd rick-and-morty-backend
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up the database:**

```bash
sqlite3 sqlite/characters.db < sqlite/init.sql
```

### Quick Start

1. **Start the development server:**

```bash
npm run dev
```

2. **Test the API with curl:**

Get API info:

```bash
curl http://localhost:3000/
```

Get all characters:

```bash
curl http://localhost:3000/character
```

Get a specific character:

```bash
curl http://localhost:3000/character/1
```

Create a new character:

```bash
curl -X POST http://localhost:3000/character \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jerry Smith",
    "status": "Alive",
    "species": "Human",
    "gender": "Male"
  }'
```

## Development

### Available Scripts

Start development server with hot reload:

```bash
npm run dev
```

Run the test suite:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

Build the project:

```bash
npm run build
```

## API Documentation

### Base URL

```
http://localhost:3000
```

### Endpoints

#### GET /

Returns basic API information and available endpoints.

**Response:**

```json
{
  "message": "Rick and Morty API",
  "endpoints": ["/character", "/character/:id"]
}
```

#### GET /character

Returns a list of all characters in the database.

**Response:**

```json
[
  {
    "id": 1,
    "name": "Rick Sanchez",
    "status": "Alive",
    "species": "Human"
  },
  {
    "id": 2,
    "name": "Morty Smith",
    "status": "Alive",
    "species": "Human"
  }
]
```

#### GET /character/:id

Returns a specific character by ID.

**Parameters:**

- `id` (number) - The character ID

**Response (200):**

```json
{
  "id": 1,
  "name": "Rick Sanchez",
  "status": "Alive",
  "species": "Human"
}
```

**Error Responses:**

- `400 Bad Request` - Invalid ID format
- `404 Not Found` - Character not found

#### POST /character

Creates a new character.

**Request Body:**

```json
{
  "name": "Summer Smith",
  "status": "Alive",
  "species": "Human",
  "gender": "Female",
  "type": ""
}
```

**Required Fields:**

- `name` (string) - Character name (minimum 1 character)
- `status` (enum) - Character status: `"Alive"`, `"Dead"`, or `"unknown"`
- `species` (string) - Character species (minimum 1 character)
- `gender` (enum) - Character gender: `"Female"`, `"Male"`, `"Genderless"`, or `"unknown"`

**Optional Fields:**

- `type` (string) - Character type/subspecies (defaults to empty string)

**Response (201):**

```json
{
  "id": 11,
  "message": "Character created successfully"
}
```

**Error Responses:**

- `400 Bad Request` - Validation failed (missing fields or invalid enum values)
- `500 Internal Server Error` - Database error

### Error Format

All error responses follow this format:

```json
{
  "error": "Error description",
  "details": [
    {
      "field": "fieldName",
      "message": "Specific validation error"
    }
  ]
}
```

### Data Validation

The API uses Zod for request validation:

- All required fields must be present
- Enum values must match exactly (case-sensitive)
- String fields cannot be empty
- ID parameters must be numeric
