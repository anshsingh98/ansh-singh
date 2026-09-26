import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const COLLECTION = 'site';
const DOCUMENT = 'content';

function getFirebaseAdmin() {
  if (getApps().length) return getApps()[0];

  const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!rawServiceAccount) throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not configured on the server');

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(rawServiceAccount);
  } catch {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
  }

  return initializeApp({ credential: cert(serviceAccount) });
}

function getContentDocument() {
  getFirebaseAdmin();
  return getFirestore().collection(COLLECTION).doc(DOCUMENT);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    const contentDocument = getContentDocument();

    if (req.method === 'GET') {
      const snapshot = await contentDocument.get();
      return res.status(200).json({ content: snapshot.exists ? snapshot.data() : null });
    }

    if (req.method !== 'PUT') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content, password } = req.body || {};
    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!content || typeof content !== 'object' || Array.isArray(content)) {
      return res.status(400).json({ error: 'Missing or invalid content object' });
    }

    await contentDocument.set(content);
    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Firebase request failed' });
  }
}