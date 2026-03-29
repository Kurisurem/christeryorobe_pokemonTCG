import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type PokemonCard = {
  id: string
  name: string
  supertype?: string
  types?: string[]
  number?: string
  rarity?: string
  artist?: string
  set?: { name?: string }
  images?: { small?: string; large?: string; symbol?: string }
}

type SearchCardsResponse = {
  data: PokemonCard[]
  page: number
  pageSize: number
  count: number
}

export const pokemonApi = createApi({
  reducerPath: 'pokemonApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.pokemontcg.io/v2' }),
  endpoints: (builder) => ({
    searchCards: builder.query<
      SearchCardsResponse,
      { query?: string; page?: number; pageSize?: number }
    >({
      query: ({ query, page = 1, pageSize = 12 }) => {
        const params: Record<string, string | number> = { page, pageSize }
        const trimmed = query?.trim()
        if (trimmed) params.q = trimmed
        return { url: '/cards', params }
      },
    }),
  }),
})

export const { useSearchCardsQuery } = pokemonApi

