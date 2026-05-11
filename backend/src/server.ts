import { createApp } from './app.js';
import { getEnvConfig } from './types/env.types.js';

const envConfig = getEnvConfig();
const app = createApp();

app.listen(envConfig.PORT, () => {
  console.log(`Server running on port ${envConfig.PORT}`);
  console.log(`Environment: ${envConfig.NODE_ENV}`);
});