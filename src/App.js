import { useEffect, useRef, useState } from 'react';
import StarRating from './StarRating';
import { useMovies } from './useMovies';

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const KEY = '25a08b93';

export default function App() {
  const [query, setQuery] = useState('');

  const [selectedId, setSelectedId] = useState(null);
  const { movies, isLoading, error } = useMovies(query);

  // const [watched, setWatched] = useState([]);
  // 무언가를 반환하는 pure function을 state의 initial value로 설정할 수 있다.
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem('watched');
    return JSON.parse(storedValue);
  });

  // 아래와 같이 state 값을 직접 호출하면 안된다!
  // useState(localStorage.getItem("watched"))

  // function handleSelectedMovie = () => ...
  // 아래 function 정의 시 화살표 함수(위)가 아닌 방식으로 정의했기에
  // 함수 선언 부분 이전에도 hoisting 이 가능하다!

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (id === selectedId ? null : id));
  }

  function handleCloseMovie(id) {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem('watched', watched); // stale data
    // (setWatched가 async 이므로 가장 최근 데이터 누락, 아래와 같이 저장)
    // localStorage.setItem('watched', JSON.stringify([...watched, movie]));
  }

  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(
    function () {
      localStorage.setItem('watched', JSON.stringify(watched));
    },
    [watched],
  );

  return (
    <>
      <NavBar>
        <Search query={query} setQuery={setQuery} />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        <Box>
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

function Loader() {
  return <p className="loader">Loading...</p>;
}

function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span> {message}
    </p>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function Search({ query, setQuery }) {
  const inputEl = useRef(null);

  useEffect(
    function () {
      // React는 선언적이므로 DOM element를 직접 선택하지 않는다.
      // 따라서 작동한다 하더라도 아래와 같은 방식으로 element를 참조할 수 없다.
      // (대체 수단으로 useRef 이용 필요!)
      //   const el = document.querySelector('.search');
      //   console.log(el);
      //   el.focus();

      function callback(e) {
        if (document.activeElement === inputEl.current) return;
        if (e.code === 'Enter') {
          inputEl.current.focus();
          setQuery('');
        }
      }

      document.addEventListener('keydown', callback);
      return () => document.addEventListener('keydown', callback);
    },
    [setQuery],
  );

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function NumResult({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

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

function MovieList({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} onSelectMovie={onSelectMovie} />
      ))}
    </ul>
  );
}

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

  const countRef = useRef(0);
  // let count = 0;

  useEffect(
    function () {
      if (userRating) countRef.current++;
      // if (userRating) count++;
    },
    [userRating],
    // [userRating, count],
  );

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

  // useState 의 rendering 에 대한 실험 코드1
  /* eslint-disable*/
  // if (imdbRating > 8) [isTop, setIsTop] = useState(true);
  // if (imdbRating > 8) return <p>Greatest ever!</p>;

  // const [isTop, setIsTop] = useState(imdbRating > 8);
  // console.log(isTop);
  // useEffect(
  //   function () {
  //     setIsTop(imdbRating > 8);
  //   },
  //   [imdbRating],
  // );

  // 위와 같은 코드 대신,
  // 아래와 같이 derived state (파생된 상태)를 활용해야 한다!
  // const isTop = imdbRating > 8;
  // console.log(isTop);

  // const [avgRating, setAvgRating] = useState(0);

  function handleAdd() {
    const newWatchedMovie = {
      imdbID: selectedId,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(' ').at(0)),
      userRating,
      countRatingDecisions: countRef.current,
      // count,
    };

    onAddWatched(newWatchedMovie);
    onCloseMovie();

    // useState 의 rendering 에 대한 실험 코드2
    // setAvgRating(Number(imdbRating));
    // setAvgRating((avgRating) => (avgRating + userRating) / 2);
  }

  useEffect(
    function () {
      function callback(e) {
        if (e.code === 'Escape') {
          onCloseMovie();
        }
      }

      document.addEventListener('keydown', callback);

      return function () {
        document.removeEventListener('keydown', callback);
      };
    },
    [onCloseMovie],
  );

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
        // console.log(`Clean up effect for movie ${title}`);
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
          {/* <p>{avgRating}</p> */}
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

////////////////////////////////////////////////////////

// ※ React Hooks
// - Special built-in functions that allow as to "hook" into React internals
// : Creating and accessing state from Fiber tree
// : Registering side effects in Fiber tree
// : Manual DOM selections
// : ...

// - Always start with "use" (useState, useEffect, etc.)
// - Enable easy reusing of non-visual logic
// : we can compose multiple hooks into our own custom hooks
// - Give function components the ability to own state and run side effects
// at different lifecycle points
// (before v16.8 only available in class componenets)

// ※ Overview of all built-in hooks
// 1) Most used
// - useState, useEffect, useReducer, useContext
// 2) Less used
// - useRef, useCallback, useMemo, useTransition, useDeferredValue
// - useLayoutEffect, useDebugValue, useImperativeHandle, useId
// 3) Only for libraries
// - useSyncExternalStore, useInsertionEffect

// ※ The rules of React hooks
// 1) Only call hooks at the top level
// 2) Only call hooks from React functions
// (automatically enforced by React's ESLint rules)

////////////////////////////////////////////////////////

// ※ REF with useRef
// 1) "Box" (object) with a mutable .current property that is persisted across renders
//  ("normal" variables are always reset)
// 2) Two big use cases:
// - Creating a variable that stays the same between renders
//  (e.g. previous state, setTimeout id, etc.)
// - Selecting and sroting DOM elements
// 3) Refs are for data that is NOT rendered:
//  usually only appear in event handlers of effects, not in JSX (otherwise useState)
// 3) Do NOT read write or read .current in render logic (like state)

// ※ 데이터 저장이 필요할 때
// - 어느 지점에서 데이터가 변경되는가? =(NO)=> "const"
// =(YES)=> component 가 re-render 되어야 하는가? =(NO)=> "Ref(useRef)"
// =(YES)=> State(useState)

////////////////////////////////////////////////////////

// ※ Custom Hooks
// - Custom Hooks allow us to reuse non-visual logic in multiple components
// - One custom hook should have one purpose,
//  to make it reusable and portable (even arcoss multiple projects)
// - Rules of hooks also apply to custom hooks

// 1) Custom Hook needs to use one or more hooks
// 2) Function name needs to start with "use"
// 3) Unlike components, custom hooks can recieve
//  and return any relevant data (usaully [] or {})
