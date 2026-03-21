"use client";
import { useState } from "react";

const BookEvent = ({ eventId }: { eventId: string }) => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;


  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) return;

    try {
      setIsSubmitting(true);
      setMessage("");

      const res = await fetch(`${BASE_URL}/api/booking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Something went wrong");
        setIsSubmitting(false);
        return;
      }

      setMessage("✅ Booking successful!");
      setEmail("");
    } catch {
      setMessage("❌ Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="book-event">
      {message && <p className="text-sm">{message}</p>}

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
};

export default BookEvent;
