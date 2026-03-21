"use server";

import { Event } from "@/database";
import connectDB from "../mongodb";
import { EventClient } from "@/database/event.model";

// Handles fields that were mistakenly stored as a JSON string (e.g. '["a","b"]')
// instead of a proper array.
const parseArray = (val: unknown): string[] => {
  if (Array.isArray(val)) {
    // If it's already an array but the first element looks like a JSON array string, parse it
    if (val.length === 1 && typeof val[0] === "string" && val[0].trimStart().startsWith("[")) {
      try { return JSON.parse(val[0]); } catch { /* fall through */ }
    }
    return val as string[];
  }
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return [val]; }
  }
  return [];
};

export const getEventBySlug = async (
  slug: string
): Promise<EventClient | null> => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();
    if (!event) return null;

    return {
      ...event,
      _id: event._id.toString(),
      agenda: parseArray(event.agenda),
      tags: parseArray(event.tags),
      createdAt: event.createdAt?.toISOString?.() || "",
      updatedAt: event.updatedAt?.toISOString?.() || "",
    };
  } catch {
    return null;
  }
};

export const getSimilarEventsBySlug = async (
  slug: string
): Promise<EventClient[]> => {
  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();
    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .limit(4)
      .lean();

    return similarEvents.map((ev) => ({
      ...ev,
      _id: ev._id.toString(),
      createdAt: ev.createdAt?.toISOString?.() || "",
      updatedAt: ev.updatedAt?.toISOString?.() || "",
    }));
  } catch {
    return [];
  }
};