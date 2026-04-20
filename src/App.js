import { useEffect, useState } from 'react';
import StarRating from './StarRating';

const tempMovieData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt0133093',
    Title: 'The Matrix',
    Year: '1999',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',
  },
  {
    imdbID: 'tt6751668',
    Title: 'Parasite',
    Year: '2019',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',
  },
];

const tempWatchedData = [
  {
    imdbID: 'tt1375666',
    Title: 'Inception',
    Year: '2010',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: 'tt0088763',
    Title: 'Back to the Future',
    Year: '1985',
    Poster:
      'https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
// ※ arr.reduce → 누적 계산
// acc: 누적값(accumulator)
// cur: 현재 요소(currentValue)
// i: 현재 인덱스(index)
// arr: 원본 배열(array)
// 0: 초기 누적값

// ※ KEY를 외부에 만드는 이유?
// : 변수 정의가 렌더링 로직의 일부인 경우, 데이터 컴포넌트가 렌더링될 때마다 다시 만들어짐
// 큰 문제는 아니지만 컴포넌트 내부에 의존하지 않는 변수 정의 시 외부에 정의하는 습관을 들이는 것이 좋다.
// => config.js로 분리?
const KEY = '25a08b93';

// ※ Prop Drilling
// : 중간 단계에 해당하지 않더라도 필요한 하위 컴포넌트에 값을 전달하기 위해 props를 전달하는 과정
// → Component Composition 이 해결책이 될 수 있다!

// ※ Component Composition
// : 단순히 component를 "사용하는" 것이 아니라,
//   children props를 활용하여 서로 다른 component를 결합하는 형태
// 1) Create highly reusable and flecible components
// 2) Fix prop drilling (great for layouts)

// Component Composition 을 활용해보자!
export default function App() {
  const [query, setQuery] = useState('frozen');
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  /*
  // ※ Testing the results according to the dependency array
  useEffect(function () {
    console.log('After initial render');
  }, []);

  useEffect(function () {
    console.log('After every render');
  });

  useEffect(
    function () {
      console.log('D');
    },
    [query],
  );

  console.log('During render');
  */

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie(id) {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  useEffect(
    function () {
      async function fetchMovies() {
        try {
          setIsLoading(true);
          setError('');

          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          );

          if (!res.ok)
            throw new Error('Something went wrong with fetching movies');

          const data = await res.json();
          if (data.Response === 'False') throw new Error('Movie not found');

          setMovies(data.Search);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }

      if (query.length < 3) {
        setMovies([]);
        setError('');
        return;
      }
      fetchMovies();
    },
    [query],
  );
  // ※ [] (빈 배열)은 dependancy array로,
  // 지정한 효과가 마운트(mount)에서만 실행되도록 한다.
  // 즉, App component가 렌더링될 때 한 번만 실행되도록 한다.

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {/* {isLoading ? <Loader /> : <MovieList movies={movies} />} */}
          {isLoading && <Loader />}
          {!isLoading && !error && (
            <MovieList movies={movies} onSelectMovie={handleSelectMovie} />
          )}
          {error && <ErrorMessage message={error} />}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
              watched={watched}
            />
          ) : (
            <>
              <WatchedSummary watched={watched} />
              <WatchedMovieList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

// (3) Structural components
function Loader() {
  return <p className="loader">Loading...</p>;
}

// (3) Structural components
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

// (3) Structural components
function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

// (1) Stateless / presentational components
function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

// (2) Stateful components
function Search({ query, setQuery }) {
  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

// (1) Stateless / presentational components
function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

// (3) Structural components
function Main({ children }) {
  return <main className="main">{children}</main>;
}

// (2) Stateful components
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? '–' : '+'}
      </button>
      {isOpen && children}
    </div>
  );
}

// (2) Stateful components
function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

// (1) Stateless / presentational components
function Movie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function MovieDetails({ selectedId, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userRating, setUserRating] = useState('');

  const isWatched = watched.map((movie) => movie.imdbID).includes(selectedId);
  const watchedIserRating = watched.find(
    (movie) => movie.imdbID === selectedId,
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Runtime: runtime,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();
  }

  useEffect(
    function () {
      async function getMovieDetails() {
        try {
          setIsLoading(true);
          const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`,
          );
          if (!res.ok)
            throw new Error('Something went wrong with fetching movie details');

          const data = await res.json();
          setMovie(data);
        } catch (err) {
          console.error(err.message);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
      getMovieDetails();
    },
    [selectedId],
  );

  useEffect(
    function () {
      if (!title) return;
      document.title = `Movie | ${title}`;

      // cleanup function
      // : 컴포넌트 마운트 해제 이후 발생하지만 JS의 closure 개념 덕에 title을 기억
      return function () {
        document.title = 'usePopcorn';
        console.log(`Clean up effect for movie ${title}`);
      };
    },
    [title],
  );

  return (
    <div className="details">
      {isLoading && <Loader />}
      {!isLoading && !error && (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              &larr;
            </button>
            <img src={poster} alt={`Poster of ${movie} movie`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>
                {released} &bull; {runtime}
              </p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>
          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p>
                  You rated with movie {watchedIserRating} <span>⭐</span>
                </p>
              )}
            </div>
            <p>
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
      {error && <ErrorMessage message={error} />}
    </div>
  );
}

// (1) Stateless / presentational components
function WatchedSummary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(1)} min</span>
        </p>
      </div>
    </div>
  );
}

// (1) Stateless / presentational components
function WatchedMovieList({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          key={movie.imdbID}
          onDeleteWatched={onDeleteWatched}
        />
      ))}
    </ul>
  );
}

// (1) Stateless / presentational components
function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>

        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          X
        </button>
      </div>
    </li>
  );
}

///////////////////////////////////////////

// ※ 컴포넌트를 나누는 기준
// 1. Logical Seperation Content
// 2. Reusability
// 3. Responsibility and Complexity
// 4. Personal Coding Style

// ※ Component Categories
// Most of our components will naturally fall into one of three categories:
// (1) Stateless / presentational components
// - No state
// - Can receive props and simply present receieved data or other content
// - Usually small and reusable
// (2) Stateful components
// - Have state
// - Can still be reusable
// (3) Structural components
// - "Pages", "layouts" or "screens" of the app
// - Result of composition
// - Can be huge and non-reusable (but don't have to)

///////////////////////////////////////////

// ※ The dependency array
// - By default, effects run after every render.
//  We can prevent that by passing a dependency array.
// - Without the dependency array, React doesn't know when to run the effect.
// - Each time one of the dependencies changes, the effect will be executed again.
// - Every state variable and prop used inside the effect MUST be included in the dependency array.
// (Otherwise, we get a "stale closure")

// ※ The mechanics of effects
// - useEffect is like an event listener that is listening for one dependency to change.
//  Whenever a dependency changes, it will execute the effect again.
// - Effects react to updates to state and props used inside the effect (the dependencies).
//  So effects are "reactive" (like state updates re-rendering the UI)

// ※ Synchronization and lifecycle
// useEffect(fn, [x, y, z]): mount 일 때와 x,y,z가 update 되어 re-render 일 때 실행
// useEffect(fn, []): mount 일 때만 실행 (only initial render)
// useEffect(fn): 모든 render에 대해 실행 (모든 것에 대해 동기화)

//////////////////////////////////////////

// ※ useEffect Cleanup function
// - function that we can return from an effect (optional)
// - runs on two different occasions
//  1) before the effect is executed again
//  2) after a component has unmounted
// - necessary whenever the side effect keeps happening
//   after the component has been re-rendered or unmounted
// - each effect should do only one thing!
//   use one useEffect hook for each side effect.
//   this makes effect easier to clean up.
