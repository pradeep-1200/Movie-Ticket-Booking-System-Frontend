import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";

const emptyForm = {
  title: "",
  description: "",
  genre: "",
  duration: "",
  language: "",
  releaseDate: "",
  rating: "",
  poster: "",
  trailer: "",
  cast: "",
  director: "",
  price: ""
};

const Admin = () => {
  const [movies, setMovies] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadData = async () => {
    const [mRes, bRes] = await Promise.all([
      api.get("/api/movies"),
      api.get("/api/bookings/all")
    ]);
    setMovies(mRes.data);
    setBookings(bRes.data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      genre: form.genre.split(",").map((g) => g.trim()),
      cast: form.cast.split(",").map((c) => c.trim()),
      duration: Number(form.duration),
      rating: Number(form.rating),
      price: Number(form.price),
      releaseDate: new Date(form.releaseDate)
    };
    try {
      if (editingId) {
        await api.put(`/api/movies/${editingId}`, payload);
        toast.success("Movie updated");
      } else {
        await api.post("/api/movies", payload);
        toast.success("Movie created");
      }
      setForm(emptyForm);
      setEditingId(null);
      loadData();
    } catch {
      toast.error("Could not save movie");
    }
  };

  const handleEdit = (movie) => {
    setEditingId(movie._id);
    setForm({
      title: movie.title,
      description: movie.description,
      genre: movie.genre.join(", "),
      duration: movie.duration,
      language: movie.language,
      releaseDate: movie.releaseDate.slice(0, 10),
      rating: movie.rating,
      poster: movie.poster,
      trailer: movie.trailer || "",
      cast: movie.cast.join(", "),
      director: movie.director,
      price: movie.price
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this movie?")) return;
    try {
      await api.delete(`/api/movies/${id}`);
      toast.success("Movie deleted");
      loadData();
    } catch {
      toast.error("Could not delete movie");
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card p-4">
        <h2 className="text-lg font-bold mb-3">
          {editingId ? "Edit Movie" : "Add Movie"}
        </h2>
        <form
          className="grid md:grid-cols-2 gap-3 text-xs"
          onSubmit={handleSubmit}
        >
          {[
            "title",
            "description",
            "genre",
            "duration",
            "language",
            "releaseDate",
            "rating",
            "poster",
            "trailer",
            "cast",
            "director",
            "price"
          ].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-white/70 capitalize">{field}</label>
              <input
                type={
                  ["duration", "rating", "price"].includes(field)
                    ? "number"
                    : field === "releaseDate"
                    ? "date"
                    : "text"
                }
                className="mt-1 bg-black/30 rounded-lg px-2 py-1 outline-none"
                value={form[field]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [field]: e.target.value }))
                }
                required={!["trailer"].includes(field)}
              />
            </div>
          ))}
          <div className="md:col-span-2 flex gap-3 mt-2">
            <button type="submit" className="btn-primary text-xs">
              {editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-outline text-xs"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass-card p-4">
        <h2 className="text-lg font-bold mb-3">Movies</h2>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="text-white/70">
              <tr>
                <th className="py-1">Title</th>
                <th>Lang</th>
                <th>Rating</th>
                <th>Price</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {movies.map((m) => (
                <tr key={m._id} className="border-t border-white/10">
                  <td className="py-1">{m.title}</td>
                  <td>{m.language}</td>
                  <td>{m.rating}</td>
                  <td>₹{m.price}</td>
                  <td className="flex gap-2 py-1">
                    <button
                      onClick={() => handleEdit(m)}
                      className="btn-outline text-[11px]"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(m._id)}
                      className="btn-outline text-[11px] border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {movies.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-2 text-white/60">
                    No movies
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="glass-card p-4">
        <h2 className="text-lg font-bold mb-3">All Bookings</h2>
        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="text-white/70">
              <tr>
                <th className="py-1">User</th>
                <th>Movie</th>
                <th>Date</th>
                <th>Showtime</th>
                <th>Seats</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b._id} className="border-t border-white/10">
                  <td className="py-1">
                    {b.user?.name} ({b.user?.email})
                  </td>
                  <td>{b.movie?.title}</td>
                  <td>{new Date(b.showDate).toDateString()}</td>
                  <td>{b.showtime}</td>
                  <td>{b.seats.map((s) => s.seatNumber).join(", ")}</td>
                  <td>₹{b.totalAmount}</td>
                  <td>{b.bookingStatus}</td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-2 text-white/60">
                    No bookings
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
