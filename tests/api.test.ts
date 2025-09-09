import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { z } from "zod";
import { CharacterStatus, CharacterGender } from "../src/types";
import { TestDbHelper } from "./helpers/TestDbHelper";

// Zod schemas (copied from main.ts for testing)
const CreateCharacterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(CharacterStatus),
  species: z.string().min(1, "Species is required"),
  gender: z.enum(CharacterGender),
  type: z.string().optional().default(""),
});

const GetCharacterSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a number").transform(Number),
});

describe("Rick and Morty API", () => {
  let app: FastifyInstance;
  let dbHelper: TestDbHelper;

  beforeEach(async () => {
    // Set up test database
    dbHelper = new TestDbHelper("api_test");
    await dbHelper.setupDatabase();
    const db = dbHelper.getDatabase();

    // Create Fastify app
    app = Fastify({ logger: false });

    // Register CORS
    await app.register(cors, {
      origin: true,
      allowedHeaders: ["Content-Type"],
      methods: ["GET", "POST", "OPTIONS"],
    });

    // Add hook
    app.addHook("onSend", (request, reply, payload, done) => {
      reply.header("Access-Control-Allow-Private-Network", "true");
      done();
    });

    // Define routes (similar to main.ts)
    app.get("/", async function handler() {
      return {
        message: "Rick and Morty API",
        endpoints: ["/character", "/character/:id"],
      };
    });

    app.get("/character", function (req: any, reply) {
      db.all(
        "SELECT id, name, status, species FROM characters",
        [],
        function (err, rows) {
          if (err) {
            reply.code(500).send({ error: err.message });
          } else {
            reply.send(rows);
          }
        }
      );
    });

    app.post("/character", function (req: any, reply) {
      try {
        const validatedData = CreateCharacterSchema.parse(req.body);
        const { name, status, species, gender, type } = validatedData;

        db.run(
          "INSERT INTO characters (name, status, species, gender, type) VALUES (?, ?, ?, ?, ?)",
          [name, status, species, gender, type],
          function (err) {
            if (err) {
              reply.code(500).send({ error: err.message });
            } else {
              reply.code(201).send({
                id: this.lastID,
                message: "Character created successfully",
              });
            }
          }
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Validation failed",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }
        return reply.code(500).send({ error: "Internal server error" });
      }
    });

    app.get("/character/:id", function (req: any, reply) {
      try {
        const { id } = GetCharacterSchema.parse(req.params);

        db.get(
          "SELECT id, name, status, species FROM characters WHERE id = ?",
          [id],
          function (err, row) {
            if (err) {
              reply.code(500).send({ error: err.message });
            } else if (row) {
              reply.send(row);
            } else {
              reply.code(404).send({ error: "Character not found" });
            }
          }
        );
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.code(400).send({
            error: "Invalid ID",
            details: error.issues.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }
        return reply.code(500).send({ error: "Internal server error" });
      }
    });

    await app.ready();
  }, 10000); // Increase timeout to 10 seconds

  afterEach(async () => {
    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.cleanup();
    }
  });

  describe("GET /", () => {
    it("should return API information", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/",
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        message: "Rick and Morty API",
        endpoints: ["/character", "/character/:id"],
      });
    });
  });

  describe("GET /character", () => {
    it("should return all characters", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/character",
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(Array.isArray(payload)).toBe(true);
      expect(payload).toHaveLength(2);
      expect(payload[0]).toHaveProperty("id");
      expect(payload[0]).toHaveProperty("name");
      expect(payload[0]).toHaveProperty("status");
      expect(payload[0]).toHaveProperty("species");
    });
  });

  describe("GET /character/:id", () => {
    it("should return a specific character", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/character/1",
      });

      expect(response.statusCode).toBe(200);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        id: 1,
        name: "Rick Sanchez",
        status: "Alive",
        species: "Human",
      });
    });

    it("should return 404 for non-existent character", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/character/999",
      });

      expect(response.statusCode).toBe(404);
      const payload = JSON.parse(response.payload);
      expect(payload).toEqual({
        error: "Character not found",
      });
    });

    it("should return 400 for invalid ID format", async () => {
      const response = await app.inject({
        method: "GET",
        url: "/character/abc",
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe("Invalid ID");
      expect(payload.details).toBeDefined();
    });
  });

  describe("POST /character", () => {
    it("should create a new character with valid data", async () => {
      const newCharacter = {
        name: "Summer Smith",
        status: "Alive",
        species: "Human",
        gender: "Female",
        type: "",
      };

      const response = await app.inject({
        method: "POST",
        url: "/character",
        payload: newCharacter,
      });

      expect(response.statusCode).toBe(201);
      const payload = JSON.parse(response.payload);
      expect(payload.message).toBe("Character created successfully");
      expect(payload.id).toBeDefined();
      expect(typeof payload.id).toBe("number");
    });

    it("should return 400 for missing required fields", async () => {
      const invalidCharacter = {
        name: "Test Character",
        // missing status, species, gender
      };

      const response = await app.inject({
        method: "POST",
        url: "/character",
        payload: invalidCharacter,
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe("Validation failed");
      expect(payload.details).toBeDefined();
      expect(Array.isArray(payload.details)).toBe(true);
    });

    it("should return 400 for invalid enum values", async () => {
      const invalidCharacter = {
        name: "Test Character",
        status: "Invalid Status",
        species: "Human",
        gender: "Invalid Gender",
      };

      const response = await app.inject({
        method: "POST",
        url: "/character",
        payload: invalidCharacter,
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe("Validation failed");
      expect(payload.details.some((d: any) => d.field === "status")).toBe(true);
      expect(payload.details.some((d: any) => d.field === "gender")).toBe(true);
    });

    it("should return 400 for empty required strings", async () => {
      const invalidCharacter = {
        name: "",
        status: "Alive",
        species: "",
        gender: "Male",
      };

      const response = await app.inject({
        method: "POST",
        url: "/character",
        payload: invalidCharacter,
      });

      expect(response.statusCode).toBe(400);
      const payload = JSON.parse(response.payload);
      expect(payload.error).toBe("Validation failed");
      expect(payload.details.some((d: any) => d.field === "name")).toBe(true);
      expect(payload.details.some((d: any) => d.field === "species")).toBe(
        true
      );
    });
  });
});
