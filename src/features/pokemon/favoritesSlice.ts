import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { PokemonCard } from './pokemonApi'

type FavoriteCard = Pick<
  PokemonCard,
  | 'id'
  | 'name'
  | 'supertype'
  | 'types'
  | 'number'
  | 'rarity'
  | 'artist'
  | 'set'
  | 'images'
>

type FavoritesState = {
  cards: FavoriteCard[]
}

const initialState: FavoritesState = {
  cards: [],
}

export const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite(state, action: PayloadAction<FavoriteCard>) {
      const id = action.payload.id
      const idx = state.cards.findIndex((c) => c.id === id)
      if (idx >= 0) {
        state.cards.splice(idx, 1)
      } else {
        state.cards.push(action.payload)
      }
    },
    removeFavorite(state, action: PayloadAction<string>) {
      state.cards = state.cards.filter((c) => c.id !== action.payload)
    },
    clearFavorites(state) {
      state.cards = []
    },
  },
})

export const { toggleFavorite, removeFavorite, clearFavorites } = favoritesSlice.actions
export const favoritesReducer = favoritesSlice.reducer

