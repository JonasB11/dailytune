# Daily Tune Vote

A web application that allows users to vote between two songs daily. Built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Daily song voting system
- Responsive design
- Real-time vote tracking
- Modern UI with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

- `src/app/page.tsx` - Main page component
- `src/components/SongCard.tsx` - Song card component
- `src/app/api/vote/route.ts` - API route for handling votes
- `src/types/index.ts` - TypeScript type definitions

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- React

## Future Improvements

- Add user authentication
- Implement a database for persistent storage
- Add admin panel for managing songs
- Add daily song rotation system
- Implement vote statistics and history
