import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import { NextRequest, NextResponse } from "next/server";

// Define the shape of route parameters
interface RouteParams {
  params: {
    slug: string;
  };
}

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 * 
 * @param req - Next.js request object
 * @param context - Route context containing dynamic parameters
 * @returns JSON response with event data or error message
 */
export async function GET(
  req: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    // Connect to database
    await connectDB();

    // Extract and validate slug parameter
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { message: "Slug parameter is required" },
        { status: 400 }
      );
    }

    // Validate slug format (alphanumeric with hyphens only)
    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!slugPattern.test(slug)) {
      return NextResponse.json(
        { message: "Invalid slug format. Slug must contain only lowercase letters, numbers, and hyphens" },
        { status: 400 }
      );
    }

    // Query event by slug
    const event: IEvent | null = await Event.findOne({ slug }).lean<IEvent>();

    // Handle event not found
    if (!event) {
      return NextResponse.json(
        { message: `Event with slug '${slug}' not found` },
        { status: 404 }
      );
    }

    // Return successful response
    return NextResponse.json(
      { message: "Event fetched successfully", event },
      { status: 200 }
    );
  } catch (error) {
    // Log error for debugging (consider using a proper logging service in production)
    console.error("Error fetching event by slug:", error);

    // Handle Mongoose/MongoDB specific errors
    if (error instanceof Error) {
      // Handle MongoDB connection errors
      if (error.name === "MongooseError" || error.name === "MongoError") {
        return NextResponse.json(
          { message: "Database connection error", error: error.message },
          { status: 503 }
        );
      }

      // Handle other known errors
      return NextResponse.json(
        { message: "Failed to fetch event", error: error.message },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { message: "An unexpected error occurred while fetching the event" },
      { status: 500 }
    );
  }
}
