import { Link } from "react-router-dom";
import { FaClock, FaStar } from "react-icons/fa";

const MovieCard = ({ movie }) => {
  return (
    <div className="glass-card overflow-hidden hover:scale-[1.02] hover:shadow-2xl transition-transform duration-200">
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-full h-56 object-cover"
      />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">{movie.title}</h3>
          <span className="flex items-center gap-1 text-accent text-sm">
            <FaStar /> {movie.rating}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <FaClock /> <span>{movie.duration} min</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">
          {movie.genre?.map((g) => (
            <span
              key={g}
              className="text-[10px] px-2 py-1 rounded-full bg-white/10 border border-white/10"
            >
              {g}
            </span>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm">
            From <span className="text-accent font-semibold">₹{movie.price}</span>
          </span>
          <Link
            to={`/movies/${movie._id}`}
            className="btn-primary text-xs md:text-sm"
          >
            Book Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
