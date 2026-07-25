import app from './app.js';
import env from './config/config.js';

const PORT = env.PORT;
const NODE_ENV = env.NODE_ENV;

app.listen(PORT, () => {
  if (NODE_ENV == 'development') {
    console.log(
      `Server running on development mode at http://localhost:${PORT}`,
    );
  }
});
