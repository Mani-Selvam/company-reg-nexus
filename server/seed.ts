import { db } from "./db";
import { countries, states, cities } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  const indiaResult = await db.insert(countries).values([
    { name: "India", code: "IN" },
    { name: "United States", code: "US" },
    { name: "United Kingdom", code: "GB" },
  ]).returning();

  console.log("Countries seeded:", indiaResult.length);

  const india = indiaResult.find(c => c.code === "IN");
  if (!india) {
    throw new Error("India not found");
  }

  const statesResult = await db.insert(states).values([
    { name: "Maharashtra", countryId: india.id },
    { name: "Karnataka", countryId: india.id },
    { name: "Delhi", countryId: india.id },
    { name: "Tamil Nadu", countryId: india.id },
  ]).returning();

  console.log("States seeded:", statesResult.length);

  const maharashtra = statesResult.find(s => s.name === "Maharashtra");
  const karnataka = statesResult.find(s => s.name === "Karnataka");
  const delhi = statesResult.find(s => s.name === "Delhi");
  const tamilNadu = statesResult.find(s => s.name === "Tamil Nadu");

  const citiesResult = await db.insert(cities).values([
    { name: "Mumbai", stateId: maharashtra!.id },
    { name: "Pune", stateId: maharashtra!.id },
    { name: "Bangalore", stateId: karnataka!.id },
    { name: "New Delhi", stateId: delhi!.id },
    { name: "Chennai", stateId: tamilNadu!.id },
  ]).returning();

  console.log("Cities seeded:", citiesResult.length);
  console.log("Database seeded successfully!");
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
