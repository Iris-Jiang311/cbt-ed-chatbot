const fs = require("fs");

const raw = fs.readFileSync("./server/firebaseServiceAccount.json", "utf-8");
const json = JSON.parse(raw);

json.private_key = json.private_key.replace(/\n/g, "\\n");

const envString = `FIREBASE_SERVICE_ACCOUNT=${JSON.stringify(json)}`;
console.log(envString);
