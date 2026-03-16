import mongoose, { Document, Model, Schema } from 'mongoose';

// TypeScript interface for Booking document
export interface IBooking extends Document {
  eventId: mongoose.Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Booking schema definition
const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      index: true, // Index for faster queries
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => {
          // Standard email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

/**
 * Pre-save hook to verify that the referenced event exists
 * Throws an error if the event is not found in the database
 */
BookingSchema.pre('save', async function (this: IBooking) {
  if (this.isNew || this.isModified('eventId')) {
    try {
      const Event =
        mongoose.models.Event || (await import('./event.model')).default;

      const eventExists = await Event.findById(this.eventId);

      if (!eventExists) {
        throw new Error('Referenced event does not exist');
      }
    } catch (error) {
      throw error instanceof Error
        ? error
        : new Error('Event validation failed');
    }
  }
});

// Create and export the Booking model
const Booking: Model<IBooking> =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
