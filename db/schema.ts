import { pgTable, text, timestamp, doublePrecision, pgEnum, uuid } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. Definição dos Enums
export const productCategoryEnum = pgEnum("product_category", ["roupas", "calcados", "brinquedos"]);
export const productStatusEnum = pgEnum("product_status", ["available", "reserved"]);

// 2. Tabela de Produtos
export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  price: doublePrecision("price").notNull(),
  imageUrl: text("image_url"),
  category: productCategoryEnum("category").notNull(),
  status: productStatusEnum("status").default("available").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. Tabela de Reservas
export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  reservedAt: timestamp("reserved_at").defaultNow().notNull(),
});

// 4. Definição de Relacionamentos (Drizzle Relations)
export const productsRelations = relations(products, ({ many }) => ({
  reservations: many(reservations),
}));

export const reservationsRelations = relations(reservations, ({ one }) => ({
  product: one(products, {
    fields: [reservations.productId],
    references: [products.id],
  }),
}));

// Tipos para uso no Frontend/Server Actions
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;