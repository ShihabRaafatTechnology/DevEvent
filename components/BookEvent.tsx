"use client";
import { useState } from "react";

const BookEvent = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  return (
    <div id="book-event">
      {isSubmitting ? (
        <p className="text-sm">Thank you for signing up!</p>
      ) : (
        <form>
          <div>
            <input
            type="email"
            id="email"
            placeholder="Enter your email"
            className=""
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
    
          </div>
           <button
            type="submit"
            disabled={isSubmitting}
            onClick={(e) => {
              e.preventDefault();
              setIsSubmitting(true);
            }}
          >
            {isSubmitting ? "Booking..." : "Book Now"}
          </button>
        </form>
      )}
    </div>
  );
};

export default BookEvent;
