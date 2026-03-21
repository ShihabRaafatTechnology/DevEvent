import connectDB from "@/lib/mongodb";
import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Event from "@/database/event.model"

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        // Whitelisted validated payload
        const title = formData.get('title')?.toString();
        const description = formData.get('description')?.toString();
        const overview = formData.get('overview')?.toString();
        const image = formData.get('image')?.toString();
        const venue = formData.get('venue')?.toString();
        const location = formData.get('location')?.toString();
        const date = formData.get('date')?.toString();
        const time = formData.get('time')?.toString();
        const mode = formData.get('mode')?.toString();
        const audience = formData.get('audience')?.toString();
        const organizer = formData.get('organizer')?.toString();

        let agenda: string[];
        try {
            const agendaStr = formData.get('agenda')?.toString();
            const parsedAgenda = agendaStr ? JSON.parse(agendaStr) : [];
            if (!Array.isArray(parsedAgenda) || !parsedAgenda.every(item => typeof item === 'string')) {
                return NextResponse.json({ message: "Invalid agenda JSON" }, { status: 400 });
            }
            agenda = parsedAgenda;
        } catch {
            return NextResponse.json({ message: "Invalid agenda JSON" }, { status: 400 });
        }

        let tags: string[];
        try {
            const tagsStr = formData.get('tags')?.toString();
            const parsedTags = tagsStr ? JSON.parse(tagsStr) : [];
            if (!Array.isArray(parsedTags) || !parsedTags.every(item => typeof item === 'string')) {
                return NextResponse.json({ message: "Invalid tags JSON" }, { status: 400 });
            }
            tags = parsedTags;
        } catch {
            return NextResponse.json({ message: "Invalid tags JSON" }, { status: 400 });
        }

        if (!title || agenda.length === 0 || tags.length === 0) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const event = {
            title,
            description,
            overview,
            image,
            venue,
            location,
            date,
            time,
            mode,
            audience,
            agenda,
            organizer,
            tags
        };

        const file = formData.get("image") as File;

        if(!file) return NextResponse.json({ message: "Image file is required" }, { status: 400 });

        const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
        if (!file.type.startsWith("image/")) {
          return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
        }
        if (file.size > MAX_IMAGE_SIZE) {
          return NextResponse.json({ message: "File too large" }, { status: 413 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: "image", folder: "DevEvent" },
                (error, result) => {
                    if(error) return reject(error);

                    resolve(result);
                }
            ).end(buffer);
        });

        event.image = (uploadResult as {secure_url: string}).secure_url;

        const createdEvent = await Event.create(event);

        return NextResponse.json({ message: "Event created successfully", event: createdEvent }, { status: 201 });
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        let status = 500;
        
        const err = error as Error;
        if ((mongoose.Error).ValidationError && err instanceof (mongoose.Error).ValidationError || 
            (mongoose.Error).CastError && err instanceof (mongoose.Error).CastError ||
            err.name === 'ValidationError' || 
            err.name === 'CastError' ||
            errorMessage === 'Invalid date format' ||
            errorMessage === 'Time must be in HH:MM format') {
          status = 400;
        }
        
        return NextResponse.json({ message: "Event creation failed", error: errorMessage }, { status });
    }
}

export async function GET() {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json({ message: "Events fetched successfully", events }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch events", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
}