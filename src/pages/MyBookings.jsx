import { useEffect, useState } from "react";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FaTicketAlt, FaCalendar, FaClock, FaMapMarkerAlt, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, cancelled

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/bookings/my-bookings");
      setBookings(data);
    } catch (error) {
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const cancelBooking = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }
    
    try {
      await api.put(`/api/bookings/${id}/cancel`);
      toast.success("Booking cancelled successfully");
      fetchBookings();
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (filter === 'active') return b.bookingStatus === 'active';
    if (filter === 'cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="glass-card p-8">
          <div className="h-8 loading-shimmer rounded w-1/4 mb-6" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-6 p-6 border border-dark-700 rounded-lg">
              <div className="h-6 loading-shimmer rounded w-1/2 mb-3" />
              <div className="h-4 loading-shimmer rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <FaTicketAlt className="text-primary" />
              My Bookings
            </h1>
            <p className="text-gray-400">
              Manage and view all your movie bookings
            </p>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              Active ({bookings.filter(b => b.bookingStatus === 'active').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              Cancelled ({bookings.filter(b => b.bookingStatus === 'cancelled').length})
            </button>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-2xl font-bold mb-2">
            {filter === 'all' ? 'No Bookings Yet' : `No ${filter} bookings`}
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === 'all' 
              ? 'Start exploring movies and book your first show!'
              : `You don't have any ${filter} bookings`}
          </p>
          {filter === 'all' && (
            <a href="/" className="btn-primary inline-block">
              Browse Movies
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="glass-card overflow-hidden hover:border-primary/30 transition-all duration-300"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Movie Poster */}
                <div className="lg:w-48 h-48 lg:h-auto">
                  <img
                    src={booking.movie?.poster}
                    alt={booking.movie?.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/300x450?text=No+Image";
                    }}
                  />
                </div>

                {/* Booking Details */}
                <div className="flex-1 p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {booking.movie?.title}
                      </h3>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        booking.bookingStatus === 'active'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {booking.bookingStatus === 'active' ? (
                          <>
                            <FaCheckCircle />
                            Confirmed
                          </>
                        ) : (
                          <>
                            <FaTimesCircle />
                            Cancelled
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400 mb-1">Total Paid</p>
                      <p className="text-3xl font-bold text-accent">
                        ₹{booking.totalAmount}
                      </p>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <FaCalendar className="text-primary text-lg mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Show Date</p>
                        <p className="font-semibold">
                          {new Date(booking.showDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaClock className="text-primary text-lg mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Show Time</p>
                        <p className="font-semibold">{booking.showtime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <FaMapMarkerAlt className="text-primary text-lg mt-1" />
                      <div>
                        <p className="text-xs text-gray-400">Seats</p>
                        <p className="font-semibold">
                          {booking.seats.map((s) => s.seatNumber).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID and Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-dark-700">
                    <div>
                      <p className="text-xs text-gray-400">Booking ID</p>
                      <p className="font-mono text-sm text-gray-300">
                        {booking.bookingId}
                      </p>
                    </div>

                    {booking.bookingStatus === "active" && (
                      <button
                        onClick={() => cancelBooking(booking._id)}
                        className="btn-outline border-red-500 text-red-400 hover:bg-red-500 hover:text-white px-6 py-2"
                      >
                        Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;