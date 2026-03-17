"use server";

import { Event } from "@/database";
import connectDB from "../mongodb";
import { EventClient } from "@/database/event.model";

export const getSimilarEventsBySlug = async (slug: string): Promise<EventClient[]> => {  try {
    await connectDB();

    const event = await Event.findOne({ slug }).lean();

    if (!event) return [];

    const similarEvents = await Event.find({
      _id: { $ne: event._id },
      tags: { $in: event.tags },
    })
      .limit(4)
      .lean();

    // ✅ IMPORTANT: convert _id to string
    return similarEvents.map((ev) => ({
      ...ev,
      _id: ev._id.toString(),
    }));

  } catch {
    return [];
  }
};