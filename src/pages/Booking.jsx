import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import { toast } from "react-toastify";
import { FaCouch, FaTicketAlt, FaCreditCard, FaWallet, FaMobile } from "react-icons/fa";

const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 12;

const getSeatType = (rowIndex) => {
  if (rowIndex <= 2) return "vip"; // A-C
  if (rowIndex <= 5) return "premium"; // D-F
  return "regular"; // G-H
};

const SEAT_PRICES = {
  regular: 150,
  premium: 200,
  vip: 300
};

const Booking = () => {
  const { movieId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  const [movie, setMovie] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState("");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const showDate = useMemo(() => new Date(dateParam), [dateParam]);

  const fetchBookedSeats = async () => {
    try {
      const { data } = await api.get("/api/bookings/booked-seats", {
        params: {
          movieId,
          showDate: showDate.toISOString(),
          showtime: timeParam
        }
      });
      setBookedSeats(data.bookedSeats || []);
    } catch (error) {
      toast.error("Failed to load seat availability");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/movies/${movieId}`),
      dateParam && timeParam ? fetchBookedSeats() : Promise.resolve()
    ])
      .then(([movieRes]) => {
        setMovie(movieRes.data);
      })
      .catch(() => toast.error("Failed to load booking details"))
      .finally(() => setLoading(false));
  }, [movieId, dateParam, timeParam]);

  const toggleSeat = (seatNumber, type) => {
    if (bookedSeats.includes(seatNumber)) return;
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.seatNumber === seatNumber);
      if (exists) {
        return prev.filter((s) => s.seatNumber !== seatNumber);
      }
      return [...prev, { seatNumber, type }];
    });
  };

  const totalAmount = selectedSeats.reduce(
    (sum, seat) => sum + (SEAT_PRICES[seat.type] || 0),
    0
  );

  const handlePaymentSelect = (method) => {
    setSelectedPayment(method);
    setShowPaymentForm(true);
    setPaymentDetails({});
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    const requiredFields = {
      "Credit Card": ["cardNumber", "expiryDate", "cvv", "cardholderName"],
      "UPI": ["upiId"],
      "Wallet": ["walletType", "walletId"]
    };
    
    const required = requiredFields[selectedPayment];
    const missing = required.filter(field => !paymentDetails[field]);
    
    if (missing.length > 0) {
      toast.error("Please fill all payment details");
      return;
    }
    
    handleConfirm();
  };

  const handleConfirm = async () => {
    try {
      await api.post("/api/bookings", {
        movieId,
        showDate: showDate.toISOString(),
        showtime: timeParam,
        seats: selectedSeats,
        paymentMethod: selectedPayment,
        paymentDetails
      });
      toast.success(`Payment successful via ${selectedPayment}! Booking confirmed 🎉`);
      navigate("/my-bookings");
    } catch (err) {
      if (err.response?.status === 409) {
        toast.error("Some seats were just booked. Please refresh and try again.");
        fetchBookedSeats();
        setSelectedSeats([]);
      } else {
        toast.error("Booking failed. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-8">
        <div className="glass-card p-8">
          <div className="h-8 loading-shimmer rounded w-1/3 mb-4" />
          <div className="h-96 loading-shimmer rounded" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const seatTypeStats = {
    regular: selectedSeats.filter(s => s.type === 'regular').length,
    premium: selectedSeats.filter(s => s.type === 'premium').length,
    vip: selectedSeats.filter(s => s.type === 'vip').length,
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{movie.title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span>{showDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="text-primary font-semibold">{timeParam}</span>
              <span>{movie.language}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400 mb-1">Total Amount</p>
            <p className="text-4xl font-bold text-accent">₹{totalAmount}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Seat Legend
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="seat seat-regular w-8 h-8">
              <FaCouch />
            </div>
            <div>
              <p className="text-sm font-medium">Regular</p>
              <p className="text-xs text-gray-400">₹150</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="seat seat-premium w-8 h-8">
              <FaCouch />
            </div>
            <div>
              <p className="text-sm font-medium">Premium</p>
              <p className="text-xs text-gray-400">₹200</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="seat seat-vip w-8 h-8">
              <FaCouch />
            </div>
            <div>
              <p className="text-sm font-medium">VIP</p>
              <p className="text-xs text-gray-400">₹300</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="seat seat-booked w-8 h-8">
              <FaCouch />
            </div>
            <div>
              <p className="text-sm font-medium">Booked</p>
              <p className="text-xs text-gray-400">Unavailable</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="seat seat-selected w-8 h-8">
              <FaCouch />
            </div>
            <div>
              <p className="text-sm font-medium">Selected</p>
              <p className="text-xs text-gray-400">Your choice</p>
            </div>
          </div>
        </div>
      </div>

      {/* Seat Layout */}
      <div className="glass-card p-8">
        <div className="flex flex-col items-center space-y-8">
          {/* Screen */}
          <div className="w-full max-w-3xl">
            <div className="glass-card bg-gradient-to-b from-gray-400 to-gray-600 py-2 text-center">
              <p className="text-xs uppercase tracking-widest font-semibold text-dark-900">
                Screen This Way
              </p>
            </div>
            <div className="h-2 bg-gradient-to-b from-gray-600/50 to-transparent rounded-b-full" />
          </div>

          {/* Seats */}
          <div className="space-y-3 w-full flex flex-col items-center">
            {rows.map((row, rowIndex) => (
              <div key={row} className="flex items-center gap-3">
                {/* Row Label - Left */}
                <span className="w-8 text-center text-sm font-bold text-gray-400">
                  {row}
                </span>

                {/* Seats */}
                <div className="flex gap-2">
                  {Array.from({ length: seatsPerRow }).map((_, index) => {
                    const seatNumber = `${row}${index + 1}`;
                    const type = getSeatType(rowIndex);
                    const isBooked = bookedSeats.includes(seatNumber);
                    const isSelected = selectedSeats.some(
                      (s) => s.seatNumber === seatNumber
                    );

                    let seatClass = isBooked
                      ? "seat-booked"
                      : isSelected
                      ? "seat-selected"
                      : `seat-${type}`;

                    // Add gap in the middle for aisle
                    const showGap = index === 5;

                    return (
                      <div key={seatNumber} className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => !isBooked && toggleSeat(seatNumber, type)}
                          disabled={isBooked}
                          className={`seat ${seatClass}`}
                          title={`${seatNumber} - ${type.toUpperCase()} - ₹${SEAT_PRICES[type]}`}
                        >
                          <FaCouch />
                        </button>
                        {showGap && <div className="w-6" />}
                      </div>
                    );
                  })}
                </div>

                {/* Row Label - Right */}
                <span className="w-8 text-center text-sm font-bold text-gray-400">
                  {row}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Options */}
      {selectedSeats.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
            <FaCreditCard className="text-primary" />
            Select Payment Method
          </h3>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { id: "Credit Card", icon: FaCreditCard, desc: "Visa, MasterCard, Amex" },
              { id: "UPI", icon: FaMobile, desc: "PhonePe, GPay, Paytm" },
              { id: "Wallet", icon: FaWallet, desc: "Paytm, Amazon Pay" }
            ].map((method) => {
              const Icon = method.icon;
              return (
                <button
                  key={method.id}
                  onClick={() => handlePaymentSelect(method.id)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedPayment === method.id
                      ? "bg-primary border-primary text-white"
                      : "bg-dark-700/50 border-dark-600 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="text-xl" />
                    <span className="font-semibold">{method.id}</span>
                  </div>
                  <p className="text-xs text-gray-400">{method.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Details Form */}
      {showPaymentForm && selectedPayment && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold mb-4">Enter {selectedPayment} Details</h3>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            {selectedPayment === "Credit Card" && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Card Number (1234 5678 9012 3456)"
                    className="input-field"
                    value={paymentDetails.cardNumber || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, cardNumber: e.target.value})}
                    maxLength={19}
                  />
                  <input
                    type="text"
                    placeholder="Cardholder Name"
                    className="input-field"
                    value={paymentDetails.cardholderName || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, cardholderName: e.target.value})}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    className="input-field"
                    value={paymentDetails.expiryDate || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, expiryDate: e.target.value})}
                    maxLength={5}
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="input-field"
                    value={paymentDetails.cvv || ""}
                    onChange={(e) => setPaymentDetails({...paymentDetails, cvv: e.target.value})}
                    maxLength={3}
                  />
                </div>
              </>
            )}
            
            {selectedPayment === "UPI" && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="UPI ID (example@paytm)"
                  className="input-field"
                  value={paymentDetails.upiId || ""}
                  onChange={(e) => setPaymentDetails({...paymentDetails, upiId: e.target.value})}
                />
                <div className="bg-dark-700/50 p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-400 mb-2">Scan QR Code to Pay ₹{totalAmount}</p>
                  <div className="w-40 h-40 bg-white mx-auto rounded-lg p-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${paymentDetails.upiId || 'demo@paytm'}&pn=CineBook&am=${totalAmount}&cu=INR&tn=Movie Ticket Booking`}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = `https://via.placeholder.com/150x150/000000/FFFFFF?text=QR+CODE`;
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Pay using any UPI app</p>
                </div>
              </div>
            )}
            
            {selectedPayment === "Wallet" && (
              <>
                <select
                  className="input-field"
                  value={paymentDetails.walletType || ""}
                  onChange={(e) => setPaymentDetails({...paymentDetails, walletType: e.target.value})}
                >
                  <option value="">Select Wallet</option>
                  <option value="Paytm">Paytm</option>
                  <option value="Amazon Pay">Amazon Pay</option>
                  <option value="PhonePe">PhonePe</option>
                </select>
                <input
                  type="text"
                  placeholder="Wallet ID / Phone Number"
                  className="input-field"
                  value={paymentDetails.walletId || ""}
                  onChange={(e) => setPaymentDetails({...paymentDetails, walletId: e.target.value})}
                />
              </>
            )}
            
            <div className="flex gap-3">
              <button type="submit" className="btn-primary flex-1">
                Pay ₹{totalAmount}
              </button>
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="btn-outline"
              >
                Back
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Booking Summary */}
      <div className="glass-card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FaTicketAlt className="text-primary" />
              Selected Seats
            </h3>
            {selectedSeats.length > 0 ? (
              <div className="space-y-2">
                <p className="text-gray-300">
                  {selectedSeats.map((s) => s.seatNumber).join(", ")}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {seatTypeStats.vip > 0 && (
                    <span className="text-gray-400">
                      VIP: {seatTypeStats.vip} × ₹300 = ₹{seatTypeStats.vip * 300}
                    </span>
                  )}
                  {seatTypeStats.premium > 0 && (
                    <span className="text-gray-400">
                      Premium: {seatTypeStats.premium} × ₹200 = ₹{seatTypeStats.premium * 200}
                    </span>
                  )}
                  {seatTypeStats.regular > 0 && (
                    <span className="text-gray-400">
                      Regular: {seatTypeStats.regular} × ₹150 = ₹{seatTypeStats.regular * 150}
                    </span>
                  )}
                </div>
                {selectedPayment && (
                  <p className="text-sm text-primary font-medium">
                    Payment: {selectedPayment}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No seats selected</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Total Amount</p>
              <p className="text-4xl font-bold text-accent">₹{totalAmount}</p>
            </div>
            <button
              onClick={() => selectedPayment && setShowPaymentForm(true)}
              disabled={selectedSeats.length === 0 || !selectedPayment}
              className="btn-primary w-full lg:w-auto px-12 py-4 text-lg"
            >
              {selectedPayment ? `Continue to Payment` : "Select Payment Method"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;