import app from './app.js';
import envConfig from './config/config.js';

const PORT = envConfig.PORT;
const NODE_ENV = envConfig.NODE_ENV;

app.listen(PORT, () => {
  if (NODE_ENV == 'development') {
    console.log(
      `Server running on development mode at http://localhost:${PORT}`,
    );
  }
});
