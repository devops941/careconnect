import dotenv from "dotenv";
dotenv.config();

import { clearAndSeedDatabase } from "./seed-enterprise-demo";

// Direct execution delegates to the full clear & seed routine
clearAndSeedDatabase();
