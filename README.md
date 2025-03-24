# Million Dollar Vibe Page

A modern take on the Million Dollar Homepage concept where developers can purchase pixel blocks to showcase their coding projects on a 1000×1000 grid, with larger blocks providing more visibility.

## Features

- Interactive grid display where each purchased block shows a project thumbnail that links to the developer's website when clicked
- Purchase interface allowing developers to select pixel blocks in various sizes (10×10, 20×20, 50×50, etc.) with pricing scaled accordingly
- Hover effects that reveal project name, developer info, and a brief description
- Clean, dark-mode aesthetic with neon accents to match the "vibe coder" aesthetic
- Real-time updates showing newly purchased areas and remaining available space

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd million-dollar-vibe-page
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Tempo Integration

This project is set up to work with Tempo. To use it with Tempo:

1. Create a new project in Tempo
2. Upload all the files from this repository
3. The project should automatically run in the Tempo environment

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- Zustand (for state management)
- React Hook Form
- Zod (for form validation)
- Supabase (for backend)

## Project Structure

- `src/components`: React components
- `src/lib`: Utility functions, types, and store
- `src/types`: TypeScript type definitions

## License

This project is licensed under the MIT License.
