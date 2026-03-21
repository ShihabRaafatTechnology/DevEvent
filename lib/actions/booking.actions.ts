"use server"; 
import { Booking } from "@/database"; 
import connectDB from "../mongodb"; 
export const createBooking = async ({ eventId, email, slug }: { eventId: string; email: string; slug: string;}) => { 
  try { 
    await connectDB(); 
    const booking = (await Booking.create({ eventId, email, slug })).toObject(); 
    return { success: true, booking }; } 
    catch (error) { 
      console.error("Failed to create booking", error); 
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
    } 
  }