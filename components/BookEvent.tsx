"use client";
import { createBooking } from "@/lib/actions/booking.actions";
import posthog from "posthog-js";
import { useState } from "react";

const BookEvent = ({ eventId, slug }: { eventId: string; slug: string }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const { success, error } = await createBooking({ eventId, email, slug });

    if (success) {
      setMessage({ text: "Booking confirmed! Check your email.", type: "success" });
      setEmail("");
      posthog.capture("booking_created", { eventId, slug, email });
    } else {
      setMessage({ text: error || "Booking failed. Please try again.", type: "error" });
      console.error("Booking creation failed:", error);
      posthog.captureException(error);
    }

    setIsSubmitting(false);
  };

  return (
    <div id="book-event">
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
        {message && (
          <p className={message.type === "success" ? "text-green-600" : "text-red-600"}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
};

export default BookEvent;
