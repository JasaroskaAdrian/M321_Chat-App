const { query } = require("../Database/database");

// Example: Fetch users
(async () => {
  const users = await query("SELECT * FROM users");
  console.log(users);
})();