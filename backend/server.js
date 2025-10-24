// backend/server.js
import fs from 'node:fs';
import dotenv from 'dotenv';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
  console.log('🧪 Loaded .env.local');
} else {
  dotenv.config();
  console.log('🧪 Loaded .env');
}

import './firebaseAdmin.js';
import app from './app.js';

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`✅ Backend (local) http://localhost:${PORT}`));
