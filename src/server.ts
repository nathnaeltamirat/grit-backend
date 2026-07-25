import { configDotenv } from 'dotenv';
import app from './app.js';
configDotenv();
const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;

app.listen(PORT, () => {
  if (NODE_ENV == 'development') {
    console.log(
      `Server running on development mode at http://localhost:${PORT}`,
    );
  }
});
