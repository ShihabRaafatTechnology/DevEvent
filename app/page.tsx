import EventCard from "@/components/EventCard";
import ExploreBtn from "@/components/ExploreBtn";
import type { IEvent } from "@/database";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL is not set");
  }
  const res = await fetch(`${BASE_URL}/api/events`);
  if (!res.ok) {
    throw new Error(`Failed to fetch events: ${res.status} ${res.statusText}`);
  }
  const { events } = await res.json();

  return (
    <section>
      <h1 className="text-center my-5">
        The Hub for Every Dev <br />
        Event You Can&apos;t Miss
      </h1>
      <p className="text-center text-sm lg:text-base">
        Hackathons, Meetups, and Conferences, All in One Place
      </p>
      <ExploreBtn />

      <div className="mt-20 space-y-7">
        <h3>Featured Events</h3>
        <ul className="events">
          {events &&
            events.length > 0 &&
            events.map((event: IEvent) => (
              <li key={event.slug ?? `event-${event._id}`}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
};

export default page;
