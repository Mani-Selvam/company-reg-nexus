import { pgTable, text, varchar, integer, timestamp, pgEnum, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

export const companyTypeEnum = pgEnum("company_type_enum", ["contractor", "builder", "developer", "supplier"]);
export const designationEnum = pgEnum("designation_enum", ["owner", "director", "manager", "engineer"]);
export const turnoverRangeEnum = pgEnum("turnover_range_enum", ["below_1cr", "1cr_to_10cr", "10cr_to_50cr", "above_50cr"]);
export const userRoleEnum = pgEnum("user_role_enum", ["admin", "company_user"]);

export const countries = pgTable("countries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  code: text("code").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const states = pgTable("states", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  countryId: uuid("country_id").references(() => countries.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cities = pgTable("cities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  stateId: uuid("state_id").references(() => states.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  companyType: companyTypeEnum("company_type").notNull(),
  logoUrl: text("logo_url"),
  contactPerson: text("contact_person").notNull(),
  designation: designationEnum("designation").notNull(),
  mobile: text("mobile").notNull(),
  email: text("email").notNull().unique(),
  address: text("address").notNull(),
  pincode: text("pincode").notNull(),
  cityId: uuid("city_id").notNull().references(() => cities.id),
  stateId: uuid("state_id").notNull().references(() => states.id),
  countryId: uuid("country_id").notNull().references(() => countries.id),
  numEmployees: integer("num_employees"),
  avgAnnualTurnover: turnoverRangeEnum("avg_annual_turnover").notNull(),
  yearEstablished: integer("year_established"),
  status: text("status").notNull().default("active"),
  createdBy: uuid("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedBy: uuid("updated_by"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),
  companyId: uuid("company_id").references(() => companies.id, { onDelete: "set null" }),
  loginType: text("login_type").notNull().default("manual"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userRoles = pgTable("user_roles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  role: userRoleEnum("role").notNull().default("company_user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCountrySchema = createInsertSchema(countries).omit({ id: true, createdAt: true });
export const insertStateSchema = createInsertSchema(states).omit({ id: true, createdAt: true });
export const insertCitySchema = createInsertSchema(cities).omit({ id: true, createdAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true });

export type InsertCountry = z.infer<typeof insertCountrySchema>;
export type InsertState = z.infer<typeof insertStateSchema>;
export type InsertCity = z.infer<typeof insertCitySchema>;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;

export type Country = typeof countries.$inferSelect;
export type State = typeof states.$inferSelect;
export type City = typeof cities.$inferSelect;
export type Company = typeof companies.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type UserRole = typeof userRoles.$inferSelect;
