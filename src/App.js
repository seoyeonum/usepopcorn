import { useEffect, useState } from 'react';

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
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);

  useEffect(function () {
    fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=frozen`)
      .then((res) => res.json())
      .then((data) => setMovies(data.Search));
  }, []);
  // ※ [] (빈 배열)은 dependancy array로,
  // 지정한 효과가 마운트(mount)에서만 실행되도록 한다.
  // 즉, App component가 렌더링될 때 한 번만 실행되도록 한다.

  return (
    <>
      <NavBar>
        <Search />
        <NumResult movies={movies} />
      </NavBar>

      <Main>
        <Box>
          <MovieList movies={movies} />
        </Box>

        <Box>
          <WatchedSummary watched={watched} />
          <WatchedMovieList watched={watched} />
        </Box>
      </Main>
    </>
  );
}

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
function Search() {
  const [query, setQuery] = useState('');

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
function MovieList({ movies }) {
  return (
    <ul className="list">
      {movies?.map((movie) => (
        <Movie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

// (1) Stateless / presentational components
function Movie({ movie }) {
  return (
    <li>
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
          <span>{avgImdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}

// (1) Stateless / presentational components
function WatchedMovieList({ watched }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie movie={movie} key={movie.imdbID} />
      ))}
    </ul>
  );
}

// (1) Stateless / presentational components
function WatchedMovie({ movie }) {
  return (
    <li>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
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
      </div>
    </li>
  );
}
