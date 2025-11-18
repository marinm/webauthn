import dotenv from "dotenv";

dotenv.config();

import express from "express";
import routes from "./routes";
import session from "./session";
import { host, port } from "./constants";

const app = express();

app.use(express.static("./public/"));

app.use(session());
app.use(routes({}));

app.listen(port, host, () => console.log(`🚀 Server ready at ${host}:${port}`));
