import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";

// ── Shared constants ──────────────────────────────────────────────────────────

/** Email pattern — mirrors the validator in booking.model.ts */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── GET /api/booking ──────────────────────────────────────────────────────────

/**
 * GET /api/booking
 *
 * Returns the total number of bookings stored in the database.
 * Optionally scope the count to a single event via `eventId`.
 *
 * Query parameters:
 *  - eventId (string, optional) – valid ObjectId; filters count by event
 *
 * Responses:
 *  200 – { message, data: { count } }
 *  400 – invalid `eventId` format
 *  500 – unexpected server error
 */
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = req.nextUrl;

    // Build an explicit filter type — no `any`
    const filter: { eventId?: mongoose.Types.ObjectId } = {};

    const eventId = searchParams.get("eventId");
    console.log("Event ID:", eventId);
    
    if (eventId !== null) {
      if (!mongoose.Types.ObjectId.isValid(eventId)) {
        return NextResponse.json(
          { message: "Invalid email format", error: "Invalid 'eventId' format" },
          { status: 400 }
        );
      }
      filter.eventId = new mongoose.Types.ObjectId(eventId);
    }

    // countDocuments is more efficient than find().length for large collections
    const count = await Booking.countDocuments(filter);

    return NextResponse.json(
      { message: "Booking count fetched successfully", data: { count } },
      { status: 200 }
    );
  } catch (error) {
    console.error("[GET /api/booking]", error);
    return NextResponse.json(
      {
        message: "Failed to fetch booking count",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// ── POST /api/booking ─────────────────────────────────────────────────────────

/** Expected shape of the incoming JSON body */
interface BookingPayload {
  eventId: string;
  email: string;
}

/**
 * Type guard — safely narrows an unknown JSON body to BookingPayload.
 * Avoids casting to `any`.
 */
function isBookingPayload(body: unknown): body is BookingPayload {
  return (
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).eventId === "string" &&
    typeof (body as Record<string, unknown>).email === "string"
  );
}

/**
 * POST /api/booking
 *
 * Creates a new booking for an event.
 * Prevents duplicate registrations (same email + eventId).
 *
 * Request body (JSON):
 *  - eventId (string, required) – valid MongoDB ObjectId of the target event
 *  - email   (string, required) – attendee email address
 *
 * Responses:
 *  201 – booking created   { message, data: { booking } }
 *  400 – missing / invalid fields, or referenced event not found
 *  409 – email already booked for this event
 *  500 – unexpected server error
 */
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    // ── Parse & type-check body ───────────────────────────────────────────────
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: "Validation error", error: "Request body must be valid JSON" },
        { status: 400 }
      );
    }

    if (!isBookingPayload(body)) {
      return NextResponse.json(
        {
          message: "Validation error",
          error: "Both 'eventId' and 'email' are required",
        },
        { status: 400 }
      );
    }

    const { eventId, email } = body;

    // ── Validate eventId ──────────────────────────────────────────────────────
    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return NextResponse.json(
        { message: "Validation error", error: "Invalid 'eventId' format" },
        { status: 400 }
      );
    }

    // ── Validate & normalise email ────────────────────────────────────────────
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { message: "Invalid email format", error: "Invalid email format" },
        { status: 400 }
      );
    }

    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    // ── Duplicate booking guard ───────────────────────────────────────────────
    // exists() returns { _id } | null — more efficient than findOne()
    const alreadyBooked = await Booking.exists({
      eventId: eventObjectId,
      email: normalizedEmail,
    });

    if (alreadyBooked) {
      return NextResponse.json(
        { message: "This email is already registered for the event" },
        { status: 409 }
      );
    }

    // ── Persist ───────────────────────────────────────────────────────────────
    // The model's pre-save hook verifies the referenced event exists
    const booking = await Booking.create({
      eventId: eventObjectId,
      email: normalizedEmail,
    });

    return NextResponse.json(
      { message: "Booking created successfully", data: { id: booking._id } },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/booking]", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // Surface Mongoose validation/cast errors and domain errors as 400
    const isBadRequest =
      error instanceof mongoose.Error.ValidationError ||
      error instanceof mongoose.Error.CastError ||
      errorMessage === "Referenced event does not exist";

    return NextResponse.json(
      { message: "Booking creation failed", error: errorMessage },
      { status: isBadRequest ? 400 : 500 }
    );
  }
}
