# Pokémon TCG Card Explorer (RTK Query)

A responsive React app that searches and displays Pokémon TCG cards using the **Pokémon TCG API** with **Redux Toolkit + RTK Query**.

## Features
- Search cards by name (ex: `Charizard`) or advanced query syntax (ex: `name:Charizard`)
- Pagination (Prev / Next)
- Favorites / “Your Collection” saved in Redux state
- Card detail modal (click a card, press `Esc` to close)

## Tech Stack
- React (functional components) + TypeScript
- Redux Toolkit (RTK)
- RTK Query
- Vite

## API
- Pokémon TCG API: `https://api.pokemontcg.io/v2/cards`

## Getting Started
```bash
npm install
npm run dev
