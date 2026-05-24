import 'dotenv/config';
import { app } from './app';

const portValue = process.env.PORT;
const parsedPort = portValue ? Number(portValue) : 3000;

if (!Number.isInteger(parsedPort) || parsedPort <= 0) {
  throw new Error('PORT must be a positive integer');
}

app.listen(parsedPort, () => {
  console.log(`Server running on port ${parsedPort}`);
});