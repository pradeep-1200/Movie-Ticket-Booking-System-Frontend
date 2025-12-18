import { useEffect, useState } from "react";
import api from "../utils/api";
import MovieCard from "../components/MovieCard.jsx";
import { FaSearch, FaFilter } from "react-icons/fa";

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (genre) params.genre = genre;
      if (language) params.language = language;
      const { data } = await api.get("/api/movies", { params });
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const applyFilters = (e) => {
    e.preventDefault();
    fetchMovies();
  };

  const clearFilters = () => {
    setSearch("");
    setGenre("");
    setLanguage("");
    fetchMovies();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-8 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
          Book Your Movie Tickets
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Experience cinema like never before. Choose from the latest blockbusters and indie favorites.
        </p>
      </div>

      {/* Search and Filter Bar */}
      <form
        onSubmit={applyFilters}
        className="glass-card p-6 space-y-4"
      >
        <div className="flex items-center gap-2 text-primary mb-2">
          <FaFilter />
          <h2 className="font-semibold">Find Your Perfect Movie</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="text-xs text-gray-400 mb-2 block">Search Movies</label>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                className="input-field pl-11"
                placeholder="Search by title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Genre Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Genre</label>
            <select
              className="input-field cursor-pointer"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">All Genres</option>
              <option value="Action">Action</option>
              <option value="Drama">Drama</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Comedy">Comedy</option>
              <option value="Thriller">Thriller</option>
              <option value="Romance">Romance</option>
              <option value="Horror">Horror</option>
            </select>
          </div>

          {/* Language Filter */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Language</label>
            <select
              className="input-field cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Tamil">Tamil</option>
              <option value="Telugu">Telugu</option>
              <option value="Korean">Korean</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button type="submit" className="btn-primary flex-1 md:flex-none">
            Apply Filters
          </button>
          {(search || genre || language) && (
            <button
              type="button"
              onClick={clearFilters}
              className="btn-outline flex-1 md:flex-none"
            >
              Clear All
            </button>
          )}
        </div>
      </form>

      {/* Movies Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="glass-card overflow-hidden">
              <div className="h-72 loading-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-6 loading-shimmer rounded" />
                <div className="h-4 loading-shimmer rounded w-2/3" />
                <div className="flex gap-2">
                  <div className="h-6 loading-shimmer rounded w-16" />
                  <div className="h-6 loading-shimmer rounded w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold mb-2">No Movies Found</h3>
          <p className="text-gray-400 mb-6">
            Try adjusting your filters or search terms
          </p>
          <button onClick={clearFilters} className="btn-primary">
            View All Movies
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {search || genre || language ? "Search Results" : "Now Showing"}
            </h2>
            <span className="text-gray-400 text-sm">
              {movies.length} {movies.length === 1 ? "movie" : "movies"} found
            </span>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;