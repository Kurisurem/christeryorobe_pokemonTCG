import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchCardsQuery, type PokemonCard } from './features/pokemon/pokemonApi'
import { clearFavorites, removeFavorite, toggleFavorite } from './features/pokemon/favoritesSlice'
import './App.css'
import { useAppDispatch, useAppSelector } from './app/hooks'

function buildQuery(text: string) {
  const t = text.trim()
  if (!t) return undefined
  // If they already typed the API query language, use it as-is.
  if (t.includes(':')) return t
  // Otherwise assume they want to search by card name.
  return `name:${t}`
}

function CardView({
  card,
  isFavorite,
  onToggleFavorite,
  onOpen,
}: {
  card: PokemonCard
  isFavorite: boolean
  onToggleFavorite: (card: PokemonCard) => void
  onOpen: (card: PokemonCard) => void
}) {
  const img = card.images?.small ?? card.images?.large ?? card.images?.symbol
  return (
    <article
      className="card"
      aria-label={`${card.name ?? 'Unknown'} card`}
      onClick={() => onOpen(card)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen(card)
      }}
    >
      <div className="cardImgWrap">
        {img ? (
          <img className="cardImg" src={img} alt={card.name ?? 'Card'} loading="lazy" />
        ) : (
          <div className="cardImgFallback">No image</div>
        )}
      </div>
      <div className="cardBody">
        <div className="cardTop">
          <div>
            <div className="cardName">{card.name ?? 'Unknown'}</div>
            {card.rarity ? <div className="cardRarity">{card.rarity}</div> : null}
          </div>

          <button
            type="button"
            className={`favBtn ${isFavorite ? 'favBtnOn' : ''}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            aria-pressed={isFavorite}
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(card)
            }}
          >
            <svg className="favIcon" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <div className="cardMeta">
          {card.set?.name ? <span className="pill">{card.set?.name}</span> : null}
          {card.number ? <span className="pill">#{card.number}</span> : null}
        </div>
        {card.types?.length ? (
          <div className="cardTypes">
            {card.types.slice(0, 4).map((t) => (
              <span key={t} className="type">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  )
}

function App() {
  const [draftSearch, setDraftSearch] = useState('Charizard')
  const [searchText, setSearchText] = useState('Charizard')
  const [page, setPage] = useState(1)
  const [selectedCard, setSelectedCard] = useState<PokemonCard | null>(null)

  const dispatch = useAppDispatch()
  const favorites = useAppSelector((s) => s.favorites.cards)
  const favoriteIds = useMemo(() => new Set(favorites.map((c) => c.id)), [favorites])

  const query = useMemo(() => buildQuery(searchText), [searchText])

  const { data, error, isLoading, isFetching } = useSearchCardsQuery({
    query,
    page,
    pageSize: 12,
  })

  const totalPages = data ? Math.max(1, Math.ceil(data.count / data.pageSize)) : 1

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setPage(1)
    setSearchText(draftSearch)
  }

  useEffect(() => {
    if (!selectedCard) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedCard(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedCard])

  const onToggleFavorite = (card: PokemonCard) => {
    dispatch(toggleFavorite(card))
  }

  return (
    <div className="app">
      <header className="header">
        <div className="headerLeft">
          <h1 className="title">Pokémon TCG Card Explorer</h1>
          <p className="subtitle">Search by card name (ex: <span className="mono">Charizard</span>) or use API query syntax.</p>
        </div>

        <form className="search" onSubmit={onSubmit}>
          <input
            className="searchInput"
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            placeholder="Try: Charizard or name:Charizard"
            aria-label="Search Pokémon cards"
          />
          <button className="searchButton" type="submit">Search</button>
        </form>
      </header>

      <main className="main">
        {error ? (
          <div className="state stateError">
            <div className="stateTitle">Could not load cards</div>
            <div className="stateBody">
              {typeof error === 'object' && error && 'status' in error ? `Status: ${(error as any).status}` : 'Unknown error'}
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="state">
            <div className="stateTitle">Loading...</div>
            <div className="stateBody">Fetching cards from the Pokémon TCG API.</div>
          </div>
        ) : null}

        {!isLoading && data?.data?.length ? (
          <>
            <div className="grid" aria-busy={isFetching}>
              {data.data.map((card) => (
                <CardView
                  key={card.id}
                  card={card}
                  isFavorite={favoriteIds.has(card.id)}
                  onToggleFavorite={onToggleFavorite}
                  onOpen={(c) => setSelectedCard(c)}
                />
              ))}
            </div>

            <div className="pager" role="navigation" aria-label="Pagination">
              <button className="pagerBtn" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                Prev
              </button>
              <div className="pagerInfo">
                Page <span className="mono">{page}</span> / <span className="mono">{totalPages}</span>
              </div>
              <button
                className="pagerBtn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </button>
            </div>
          </>
        ) : null}

        {!isLoading && !data?.data?.length && !error ? (
          <div className="state">
            <div className="stateTitle">No results</div>
            <div className="stateBody">Try a different search term.</div>
          </div>
        ) : null}

        {isFetching && !isLoading ? <div className="fetchingHint">Updating...</div> : null}

        {favorites.length ? (
          <section className="favorites" aria-label="Favorites collection">
            <div className="favoritesHeader">
              <div>
                <div className="favoritesTitle">Your Collection</div>
                <div className="favoritesSubtitle">{favorites.length} card(s)</div>
              </div>
              <button className="clearBtn" type="button" onClick={() => dispatch(clearFavorites())}>
                Clear
              </button>
            </div>

            <div className="favoritesGrid">
              {favorites.map((card) => {
                const img = card.images?.small ?? card.images?.large ?? card.images?.symbol
                return (
                  <div key={card.id} className="favCard">
                    <div className="favThumb">
                      {img ? <img src={img} alt={card.name ?? 'Favorite card'} loading="lazy" /> : null}
                    </div>
                    <div className="favInfo">
                      <div className="favName">{card.name ?? 'Unknown'}</div>
                      {card.types?.length ? (
                        <div className="favTypes">
                          {card.types.slice(0, 3).map((t) => (
                            <span key={t} className="type">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <div className="favActions">
                        <button
                          className="removeBtn"
                          type="button"
                          onClick={() => dispatch(removeFavorite(card.id))}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        ) : null}
      </main>

      {selectedCard ? (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          aria-label="Card details"
          onMouseDown={() => setSelectedCard(null)}
        >
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modalTop">
              <div>
                <div className="modalTitle">{selectedCard.name ?? 'Unknown'}</div>
                <div className="modalSub">
                  {selectedCard.set?.name ? <span className="pill">{selectedCard.set?.name}</span> : null}
                  {selectedCard.number ? <span className="pill">#{selectedCard.number}</span> : null}
                  {selectedCard.rarity ? <span className="pill">{selectedCard.rarity}</span> : null}
                </div>
              </div>
              <button className="closeBtn" type="button" onClick={() => setSelectedCard(null)}>
                Close
              </button>
            </div>

            <div className="modalBody">
              <div className="modalImgWrap">
                {selectedCard.images?.large ?? selectedCard.images?.small ?? selectedCard.images?.symbol ? (
                  <img
                    src={selectedCard.images?.large ?? selectedCard.images?.small ?? selectedCard.images?.symbol}
                    alt={selectedCard.name ?? 'Card'}
                  />
                ) : (
                  <div className="cardImgFallback">No image</div>
                )}
              </div>

              <div className="modalFacts">
                <div className="factsRow">
                  <div className="factLabel">Supertype</div>
                  <div className="factValue">{selectedCard.supertype ?? '—'}</div>
                </div>
                <div className="factsRow">
                  <div className="factLabel">Artist</div>
                  <div className="factValue">{selectedCard.artist ?? '—'}</div>
                </div>
                <div className="factsRow">
                  <div className="factLabel">Types</div>
                  <div className="factValue">
                    {selectedCard.types?.length ? selectedCard.types.join(', ') : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default App
