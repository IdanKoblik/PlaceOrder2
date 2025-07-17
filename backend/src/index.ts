import express from 'express';
import api from "./routes/index";

const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/v1/", api);

app.get('/', (_req, res) => {
  res.send('Hello from TypeScript Express!');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

process.on('SIGINT', () => {
  const db = require('./database').getDatabase();
  db.close((err: Error) => {
      if (err) {
          console.error(err.message);
          return;
      }

      console.log('Closed the database connection.');
      process.exit(0);
  });
});
