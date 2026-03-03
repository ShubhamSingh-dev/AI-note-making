import { env } from "./config/env.js";
import { app } from "./app.js";

const PORT = env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT http://localhost:${PORT}`);
});
