import { app } from "./app.js";
app.listen(5302, "0.0.0.0", () =>
  console.log("API ready: http://localhost:5302"),
);
