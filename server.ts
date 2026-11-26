import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

interface PledgeRecord {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  createdAt: string;
}

const ALLOWED_BLOOD_GROUPS = new Set([
  'A+',
  'A-',
  'B+',
  'B-',
  'O+',
  'O-',
  'AB+',
  'AB-',
  "Don't know",
]);

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PLEDGES_FILE = path.join(DATA_DIR, 'pledges.json');

const VENUE_LAT = 19.2945;
const VENUE_LNG = 73.0605;
const VENUE_RADIUS_METERS = 1500;
const EVENT_DAY_IST = '2026-12-06';

function getIstDateString(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function haversineMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function ensureDataStore(): PledgeRecord[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(PLEDGES_FILE)) {
      fs.writeFileSync(
        PLEDGES_FILE,
        JSON.stringify([], null, 2),
        'utf-8'
      );
      return [];
    }

    const raw = fs.readFileSync(PLEDGES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);

    return Array.isArray(parsed) ? (parsed as PledgeRecord[]) : [];
  } catch (err) {
    console.error('Failed to read pledges store:', err);
    return [];
  }
}

function savePledges(records: PledgeRecord[]): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  fs.writeFileSync(
    PLEDGES_FILE,
    JSON.stringify(records, null, 2),
    'utf-8'
  );
}

async function startServer() {
  const app = express();

  const port = Number(process.env.PORT) || 3000;

  const distDir = path.resolve(process.cwd(), 'dist');
  const distIndexHtml = path.join(distDir, 'index.html');

  const isProdEnv =
    process.env.npm_lifecycle_event !== 'dev' &&
    (process.env.NODE_ENV === 'production' ||
      process.env.npm_lifecycle_event === 'start' ||
      Boolean(process.env.K_SERVICE));

  const useProdStatic = isProdEnv && fs.existsSync(distIndexHtml);

  app.use(express.json({ limit: '16kb' }));

  // Get total pledges
  app.get('/api/pledges', (_req, res) => {
    const records = ensureDataStore();
    res.json({ count: records.length });
  });

  // Submit blood donation pledge
  app.post('/api/pledges', (req, res) => {
    const body = req.body as Record<string, unknown> | null;

    if (!body || typeof body !== 'object') {
      res.status(400).json({ error: 'Invalid request body.' });
      return;
    }

    const todayIst = getIstDateString();

    if (todayIst < EVENT_DAY_IST) {
      res.status(403).json({
        error:
          "Unlocks on Sunday, 6 December 2026 at K. M. E. Society's G. M. Momin Women's College, Bhiwandi.",
      });
      return;
    }

    const proof =
      body.unlockProof && typeof body.unlockProof === 'object'
        ? (body.unlockProof as Record<string, unknown>)
        : null;

    const rawLat =
      typeof body.lat === 'number'
        ? body.lat
        : proof && typeof proof.lat === 'number'
          ? proof.lat
          : Number.NaN;

    const rawLng =
      typeof body.lng === 'number'
        ? body.lng
        : proof && typeof proof.lng === 'number'
          ? proof.lng
          : Number.NaN;

    const proofDayValid =
      todayIst === EVENT_DAY_IST ||
      (proof !== null && proof.eventDay === EVENT_DAY_IST);

    if (
      !proofDayValid ||
      !Number.isFinite(rawLat) ||
      !Number.isFinite(rawLng) ||
      haversineMeters(
        rawLat,
        rawLng,
        VENUE_LAT,
        VENUE_LNG
      ) > VENUE_RADIUS_METERS
    ) {
      res.status(403).json({
        error:
          "Please verify your location at K. M. E. Society's G. M. Momin Women's College, Bhiwandi on Event Day to unlock.",
      });
      return;
    }

    const rawName =
      typeof body.name === 'string' ? body.name.trim() : '';

    const rawPhone =
      typeof body.phone === 'string' ? body.phone.trim() : '';

    const rawBloodGroup =
      typeof body.bloodGroup === 'string'
        ? body.bloodGroup.trim()
        : '';

    if (rawName.length < 2 || rawName.length > 80) {
      res.status(400).json({
        error: 'Please enter your full name.',
      });
      return;
    }

    const digitsOnly = rawPhone.replace(/\D/g, '');

    if (
      digitsOnly.length < 7 ||
      digitsOnly.length > 15 ||
      rawPhone.length > 24
    ) {
      res.status(400).json({
        error: 'Please enter a valid phone number.',
      });
      return;
    }

    if (!ALLOWED_BLOOD_GROUPS.has(rawBloodGroup)) {
      res.status(400).json({
        error: 'Please select a valid blood group.',
      });
      return;
    }

    const records = ensureDataStore();

    const newRecord: PledgeRecord = {
      id: crypto.randomUUID(),
      name: rawName,
      phone: rawPhone,
      bloodGroup: rawBloodGroup,
      createdAt: new Date().toISOString(),
    };

    records.push(newRecord);

    try {
      savePledges(records);
    } catch (err) {
      console.error('Failed to persist pledge:', err);

      res.status(500).json({
        error: 'Could not save pledge right now.',
      });
      return;
    }

    res.status(201).json({
      count: records.length,
      pledge: {
        id: newRecord.id,
        name: newRecord.name,
        bloodGroup: newRecord.bloodGroup,
        createdAt: newRecord.createdAt,
      },
    });
  });

  // Vite development server
  if (!useProdStatic) {
    const { createServer: createViteServer } = await import('vite');

    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static files
    app.use(express.static(distDir));

    app.get('*', (_req, res) => {
      res.sendFile(distIndexHtml);
    });
  }

  // Start Express server
  app.listen(port, '0.0.0.0', () => {
    console.log('\n========================================');
    console.log('🚀 SERVER STARTED SUCCESSFULLY');
    console.log('========================================');
    console.log(`🌐 Local:   http://localhost:${port}`);
    console.log(`🌐 Network: http://127.0.0.1:${port}`);
    console.log('✅ Ready for development!');
    console.log('========================================\n');
  });
}

startServer().catch((err) => {
  console.error('❌ Fatal server error:', err);
  process.exit(1);
});