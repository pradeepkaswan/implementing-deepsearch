# Implementing DeepSearch

This project is a Next.js application that implements a "DeepSearch" agent capable of answering questions by searching the web, summarizing content, and providing answers. It uses a variety of modern technologies to accomplish this, including the T3 Stack, NextAuth.js for authentication, Drizzle ORM for database interactions, and the Google AI SDK for its AI capabilities.

## Key Technologies

- [Next.js](https://nextjs.org)
- [React](https://react.dev/)
- [NextAuth.js](https://next-auth.js.org)
- [Drizzle ORM](https://orm.drizzle.team)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Tailwind CSS](https://tailwindcss.com)
- [Langfuse](https://langfuse.com/)
- [Biome](https://biomejs.dev/)
- [Vitest](https://vitest.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v20 or higher)
- [pnpm](https://pnpm.io/)
- [Docker](https://www.docker.com/)

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/implementing-deepsearch.git
   cd implementing-deepsearch
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```
   Then, fill in the required environment variables in the `.env` file.

4. **Start the database and Redis:**
   ```bash
   ./start-database.sh
   ./start-redis.sh
   ```

5. **Run database migrations:**
   ```bash
   pnpm db:push
   ```

### Running the Development Server

To start the development server, run:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `src/`: The main source code of the application.
  - `app/`: Next.js App Router pages and API routes.
  - `components/`: React components used throughout the application.
  - `server/`: Server-side code, including authentication, database, and Redis logic.
  - `styles/`: Global styles and Tailwind CSS configuration.
  - `answer-question.ts`: Logic for answering questions based on search results.
  - `deep-search.ts`: Core DeepSearch agent logic.
  - `query-rewriter.ts`: Logic for rewriting user queries for better search results.
  - `run-agent-loop.ts`: The main loop for the search agent.
  - `serper.ts`: Integration with the Serper API for search results.
  - `summarize-url.ts`: Logic for summarizing content from URLs.
- `public/`: Static assets.
- `drizzle.config.ts`: Configuration for Drizzle ORM.
- `next.config.js`: Configuration for Next.js.
- `package.json`: Project dependencies and scripts.

## Available Scripts

- `pnpm dev`: Starts the development server.
- `pnpm build`: Creates a production build of the application.
- `pnpm start`: Starts a production server.
- `pnpm check`: Runs Biome to check for code quality and formatting issues.
- `pnpm typecheck`: Runs the TypeScript compiler to check for type errors.
- `pnpm db:generate`: Generates Drizzle ORM migration files.
- `pnpm db:migrate`: Applies database migrations.
- `pnpm db:push`: Pushes the database schema to the database.
- `pnpm db:studio`: Starts the Drizzle ORM studio.
- `pnpm evals`: Runs `evalite` to watch for and run evaluations.
