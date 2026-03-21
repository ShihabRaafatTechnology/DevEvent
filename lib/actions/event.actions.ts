"use server";

import { Event } from "@/database";
import connectDB from "../mongodb";
import { EventClient } from "@/database/event.model";

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