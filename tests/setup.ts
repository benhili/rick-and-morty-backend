import fs from "fs";
import path from "path";

// Create test database directory if it doesn't exist
const testDbDir = path.join(__dirname, "../sqlite");
if (!fs.existsSync(testDbDir)) {
  fs.mkdirSync(testDbDir, { recursive: true });
}
