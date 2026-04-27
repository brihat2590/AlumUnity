# AlumUnity

AlumUnity is a modern alumni community platform where students and graduates can connect, discuss in forums, discover events, share opportunities, and request resume feedback.

## Highlights

- Alumni networking with structured profiles
- Community forums with threaded discussions and voting
- Event discovery with online or in-person details
- Resume review workflows with comments and feedback
- Secure authentication with protected application routes

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Firebase (Authentication + Firestore)
- Stream Video SDK (video chat)

## Screenshots

<p align="center">
  <img src="https://github.com/user-attachments/assets/b117026e-9bb9-4753-8cd2-c66460c5be29" width="90%" style="margin-bottom: 20px;" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/786ad49c-a77c-4913-92da-cc41adde518f" width="90%" style="margin-bottom: 20px;" />
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/cf5eb4b2-b145-464d-a693-0eaf2ec9616a" width="90%" />
</p>







## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```dotenv
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Scripts

- `npm run dev`: Start the local development server
- `npm run build`: Build the production bundle
- `npm run start`: Run the production build
- `npm run lint`: Run ESLint
- `npm run seed:firebase`: Seed Firestore data

## Project Structure

- `src/app`: App Router pages and layouts
- `src/components`: Reusable UI and feature components
- `src/firebase`: Firebase configuration and controllers
- `src/types`: Shared TypeScript type definitions
- `scripts/seed-firestore.mjs`: Firestore seed script

## Security Notes

- Never commit real credentials to version control.
- Enable and configure required OAuth providers in Firebase Authentication.
- Use environment-specific Firebase projects for development and production.
