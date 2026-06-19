import { drizzle } from "drizzle-orm/postgres-js";
import { connectionDetails } from "./drizzle.config";

export const db = drizzle({
  connection: {
    ...connectionDetails,
  },
});
