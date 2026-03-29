import { configureStore } from '@reduxjs/toolkit'
import { pokemonApi } from '../features/pokemon/pokemonApi'
import { favoritesReducer } from '../features/pokemon/favoritesSlice'

export const store = configureStore({
  reducer: {
    [pokemonApi.reducerPath]: pokemonApi.reducer,
    favorites: favoritesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(pokemonApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

