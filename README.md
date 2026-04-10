# AlumUnity

AlumUnity is a community platform for alumni to connect, share opportunities, join forums, discover events, and communicate.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Authentication + Firestore)

## Features

- Email/password authentication
- Google and GitHub sign-in
- Protected dashboard routes
- Events, forums, opportunities, profile, and video chat sections

## Project Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root and add:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. Run the development server:

```bash
npm run dev
```

4. Open http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run lint` - Run ESLint

## Notes

- Enable Google and GitHub providers in Firebase Authentication if you use social login.
- Keep Firebase keys in `.env` and never commit real secrets.
