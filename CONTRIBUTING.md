# Contributing to AlumUnity

Thanks for your interest in contributing to AlumUnity! Here's how to get started.

## Getting Started

1. Fork the repository and clone it locally.
2. Install dependencies:

```bash
npm install
```

3. Copy the environment variables and fill in your own values:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run dev
```

## Development Workflow

- Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`
- Make your changes and ensure the build passes: `npm run build`
- Run linting: `npm run lint`
- Commit your changes using clear and descriptive commit messages.
- Push your branch and open a pull request against `main`.

## Pull Request Guidelines

- Keep PRs focused on a single change.
- Write a clear description of what the PR does.
- Ensure the build passes before submitting.
- Reference any related issues.

## Code Style

- Follow the existing code conventions in the project.
- Use TypeScript for type safety.
- Use Tailwind CSS for styling.
- Use ESLint configuration provided (`npm run lint`).

## Questions?

If you have questions, feel free to open an issue.
