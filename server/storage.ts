import { documents, type InsertDocument, type Document } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createDocument(doc: InsertDocument): Promise<Document>;
}

export class DatabaseStorage implements IStorage {
  async createDocument(doc: InsertDocument): Promise<Document> {
    const [document] = await db.insert(documents).values(doc).returning();
    return document;
  }
}

export const storage = new DatabaseStorage();
