import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp } from "firebase/app";
import { doc, getFirestore, setDoc } from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const envPath = path.join(rootDir, ".env");

function parseEnv(fileContent) {
  const env = {};

  for (const rawLine of fileContent.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (value.endsWith(";")) value = value.slice(0, -1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

if (!fs.existsSync(envPath)) {
  throw new Error(`.env file not found at ${envPath}`);
}

const env = parseEnv(fs.readFileSync(envPath, "utf8"));

const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const requiredKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing Firebase config value: ${key}`);
  }
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const now = Date.now();

const events = [
  {
    id: "seed-event-1",
    title: "Alumni Career Mixer 2026",
    description: "Network with alumni mentors from product, AI, and fintech roles.",
    author: "seed-user-1",
    date: new Date(now + 2 * 24 * 60 * 60 * 1000).toISOString(),
    meet_link: "videochat/101",
    location: "Virtual",
  },
  {
    id: "seed-event-2",
    title: "Resume Clinic Live Review",
    description: "Bring your resume and get practical feedback from hiring managers.",
    author: "seed-user-2",
    date: new Date(now + 5 * 24 * 60 * 60 * 1000).toISOString(),
    meet_link: "videochat/102",
    location: "Virtual",
  },
  {
    id: "seed-event-3",
    title: "Startup Stories Fireside",
    description: "Founders from our alumni network share lessons from early growth.",
    author: "seed-user-3",
    date: new Date(now + 9 * 24 * 60 * 60 * 1000).toISOString(),
    meet_link: "videochat/103",
    location: "Innovation Hub Auditorium",
  },
];

const opportunities = [
  {
    id: "seed-opportunity-1",
    title: "Frontend Developer Intern",
    Company: "Nimbus Labs",
    type: "Internship",
    location: "Remote",
    salary: "NPR 30,000/month",
    applicationLink: "https://example.com/jobs/frontend-intern",
    vacancy: "3",
    postedBy: "seed-user-1",
  },
  {
    id: "seed-opportunity-2",
    title: "Graduate Product Analyst",
    Company: "Orbit Finance",
    type: "Full-time",
    location: "Kathmandu",
    salary: "NPR 65,000/month",
    applicationLink: "https://example.com/jobs/product-analyst",
    vacancy: "2",
    postedBy: "seed-user-2",
  },
  {
    id: "seed-opportunity-3",
    title: "Backend Engineer (Node.js)",
    Company: "ScaleForge",
    type: "Contract",
    location: "Hybrid",
    salary: "NPR 120,000/month",
    applicationLink: "https://example.com/jobs/backend-node",
    vacancy: "1",
    postedBy: "seed-user-3",
  },
];

const forumQuestions = [
  {
    id: "seed-question-1",
    question: "How should I prepare for an entry-level software engineering interview?",
    date: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "seed-user-1",
    upVotes: ["seed-user-2", "seed-user-3"],
    downVotes: [],
    replies: [],
  },
  {
    id: "seed-question-2",
    question: "Which projects impress recruiters most for frontend roles in 2026?",
    date: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "seed-user-2",
    upVotes: ["seed-user-1"],
    downVotes: [],
    replies: [],
  },
  {
    id: "seed-question-3",
    question: "Any tips for balancing college final year with internship applications?",
    date: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
    posted_by: "seed-user-3",
    upVotes: ["seed-user-1", "seed-user-2"],
    downVotes: [],
    replies: [],
  },
];

async function seedCollection(collectionName, records) {
  for (const { id, ...payload } of records) {
    await setDoc(doc(db, collectionName, id), payload, { merge: true });
  }
}

async function main() {
  await seedCollection("events", events);
  await seedCollection("opportunities", opportunities);
  await seedCollection("questions", forumQuestions);

  console.log("Seeding complete.");
  console.log(`events: ${events.length}`);
  console.log(`opportunities: ${opportunities.length}`);
  console.log(`questions: ${forumQuestions.length}`);
  console.log(`projectId: ${firebaseConfig.projectId}`);
}

main().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
