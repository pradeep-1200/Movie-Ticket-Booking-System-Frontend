import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { FaClock, FaGlobe, FaStar, FaPlay, FaTimes, FaCalendar } from "react-icons/fa";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "react-toastify";

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [showTrailer, setShowTrailer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/api/movies/${id}`)
      .then(({ data }) => {
        setMovie(data);
        if (data.showtimes?.length) {
          setSelectedDate(data.showtimes[0].date);
        }
      })
      .catch(() => toast.error("Failed to load movie details"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = () => {
    if (!user) {
      toast.info("Please login to book tickets");
      navigate("/login");
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error("Please select date and showtime");
      return;
    }
    navigate(
      `/booking/${movie._id}?date=${selectedDate}&time=${encodeURIComponent(
        selectedTime
      )}`
    );
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const videoId = url.split('v=')[1] || url.split('/').pop();
    return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="glass-card overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 h-96 loading-shimmer" />
            <div className="flex-1 p-8 space-y-4">
              <div className="h-8 loading-shimmer rounded w-3/4" />
              <div className="h-4 loading-shimmer rounded w-full" />
              <div className="h-4 loading-shimmer rounded w-full" />
              <div className="h-4 loading-shimmer rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 space-y-6 animate-fade-in">
        {/* Movie Hero Section */}
        <div className="glass-card overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Movie Poster */}
            <div className="lg:w-2/5 relative group">
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/400x600?text=No+Image";
                }}
              />
              {movie.trailer && (
                <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="bg-primary p-6 rounded-full transform group-hover:scale-110 transition-transform duration-300 hover:bg-secondary"
                  >
                    <FaPlay className="text-white text-3xl ml-1" />
                  </button>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1 p-8 space-y-6">
              {/* Title and Rating */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                    {movie.title}
                  </h1>
                  <div className="flex items-center gap-2 bg-dark-700 px-4 py-2 rounded-lg border border-accent/30 shrink-0">
                    <FaStar className="text-accent text-lg" />
                    <span className="text-2xl font-bold">{movie.rating}</span>
                    <span className="text-gray-400 text-sm">/10</span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <FaClock className="text-primary" />
                    {movie.duration} minutes
                  </span>
                  <span className="flex items-center gap-2">
                    <FaGlobe className="text-primary" />
                    {movie.language}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaCalendar className="text-primary" />
                    {new Date(movie.releaseDate).getFullYear()}
                  </span>
                </div>
              </div>

              {/* Genre Tags */}
              <div className="flex flex-wrap gap-2">
                {movie.genre?.map((g) => (
                  <span
                    key={g}
                    className="badge bg-primary/20 text-primary border border-primary/30 font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="text-gray-300 leading-relaxed text-lg">
                {movie.description}
              </p>

              {/* Cast and Director */}
              <div className="space-y-3 pt-4 border-t border-dark-700">
                <div>
                  <span className="text-sm text-gray-400">Director: </span>
                  <span className="text-white font-medium">{movie.director}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Cast: </span>
                  <span className="text-white">{movie.cast?.join(", ")}</span>
                </div>
              </div>

              {/* Trailer Button */}
              {movie.trailer && (
                <button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 text-accent hover:text-accent/80 transition-colors duration-200 font-medium"
                >
                  <FaPlay />
                  Watch Trailer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Booking Section */}
        <div className="glass-card p-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Select Showtime</h2>
            <div className="text-right">
              <p className="text-sm text-gray-400">Ticket Price</p>
              <p className="text-3xl font-bold text-accent">₹{movie.price}</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Select Date
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {movie.showtimes?.map((s) => {
                const showDate = new Date(s.date);
                const isSelected = selectedDate === s.date;
                return (
                  <button
                    key={s.date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(s.date);
                      setSelectedTime("");
                    }}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                      isSelected
                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/30"
                        : "bg-dark-700/50 border-dark-600 hover:border-primary/50"
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-1">
                        {showDate.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-lg font-bold">
                        {showDate.getDate()}
                      </div>
                      <div className="text-xs text-gray-400">
                        {showDate.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Select Time
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {movie.showtimes
                  ?.find((s) => s.date === selectedDate)
                  ?.times?.map((t) => {
                    const isSelected = selectedTime === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`p-4 rounded-lg border-2 font-semibold transition-all duration-200 ${
                          isSelected
                            ? "bg-secondary border-secondary text-white shadow-lg shadow-secondary/30"
                            : "bg-dark-700/50 border-dark-600 hover:border-secondary/50"
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBook}
            disabled={!selectedDate || !selectedTime}
            className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedDate && selectedTime
              ? "Continue to Seat Selection →"
              : "Select Date & Time to Continue"}
          </button>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && movie.trailer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-fade-in"
          onClick={() => setShowTrailer(false)}
        >
          <button
            onClick={() => setShowTrailer(false)}
            className="absolute top-4 right-4 bg-dark-800 p-3 rounded-full hover:bg-primary transition-colors duration-200"
          >
            <FaTimes className="text-white text-xl" />
          </button>
          <div
            className="w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={getYouTubeEmbedUrl(movie.trailer)}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
};

export default MovieDetails;