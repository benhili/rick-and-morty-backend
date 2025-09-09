import Fastify from "fastify";
import cors from "@fastify/cors";
import sqlite3 from "sqlite3";
import path from "path";
import { z } from "zod";
import { CharacterStatus, CharacterGender } from "./types";

const fastify = Fastify({
  logger: true,
});

const db = new sqlite3.Database(
  path.join(__dirname, "../sqlite/characters.db")
);

// Zod schemas for validation
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

fastify.register(cors, {
  origin: true,
  allowedHeaders: ["Content-Type"],
  methods: ["GET", "POST", "OPTIONS"],
});

fastify.addHook("onSend", (request, reply, payload, done) => {
  reply.header("Access-Control-Allow-Private-Network", "true");
  done();
});

fastify.get("/", async function handler() {
  return {
    message: "Rick and Morty API",
    endpoints: ["/character", "/character/:id"],
  };
});

fastify.get("/character", function (req: any, reply) {
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

fastify.post("/character", async function handler(req: any, reply) {
  try {
    // Validate request body with Zod
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

fastify.get("/character/:id", function (req: any, reply) {
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

try {
  fastify.listen({ port: 3000 });
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
