# Consensus Hub

A secure mutual-consent team allocation system for college students. Form teams through consensus-based selection.

## Features

- **Mutual Consent Team Formation**: Students can only be placed in teams when all members agree
- **Batch Isolation**: Students can only see and select peers from their own batch
- **Secure Authentication**: JWT-based authentication system
- **Admin Controls**: Administrative endpoints for team finalization

## Tech Stack

- **Frontend**: React, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd consensus-hub

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:8080`

## Development

### Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run lint` - Run ESLint
- `npm run preview` - Preview the production build

## Deployment

Build the project using `npm run build` and deploy the `dist` folder to your preferred hosting service.

## License

MIT
