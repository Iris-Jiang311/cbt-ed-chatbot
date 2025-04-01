const fs = require("fs");

const raw = fs.readFileSync("firebaseServiceAccount.json", "utf-8");
const json = JSON.parse(raw);

// 替换 key 中所有换行符为 \n
json.private_key = json.private_key.replace(/\n/g, "\\n");

const envLine = `FIREBASE_SERVICE_ACCOUNT=${JSON.stringify(json)}`;
fs.writeFileSync("firebase.env", envLine);

console.log("✅ 已生成 firebase.env 文件，你可以复制粘贴到 Render！");
