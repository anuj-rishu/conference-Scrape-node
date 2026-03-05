const express = require("express");
const cors = require("cors");
const conferenceRoutes = require("./routes/conferenceRoutes");
const logger = require("./Utils/logger");

const app = express();
const PORT = process.env.PORT || 9007;

app.use(
  cors({
    origin: "*",
    allowedHeaders: "*",
  }),
);

app.use(express.json());

app.use("/api", conferenceRoutes);


app.listen(PORT, () => {
  logger.info(`Conference API is running on http://localhost:${PORT}`);

});
