import express from 'express';
import path from 'path';
import { createServer } from 'http';
import { handler } from './src/server/handler'; // adjust import if needed

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Serve static files
app.use(express.static(path.resolve(__dirname, 'public')));

// All other routes should be handled by Remix/React SSR
app.all('*', handler);

const httpServer = createServer(app);
httpServer.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
