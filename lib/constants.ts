import { EventClient } from "@/database/event.model";

export const events: EventClient[] = [
  {
    _id: "1",
    title: "React Summit US 2025",
    slug: "react-summit-us-2025",
    description: "A large React conference with top speakers.",
    overview: "Learn about React ecosystem, tools, and best practices.",
    image: "/images/event1.png",
    venue: "Moscone Center",
    location: "San Francisco, CA, USA",
    date: "2025-11-07",
    time: "09:00 AM",
    mode: "In-person",
    audience: "Frontend developers",
    agenda: ["Keynotes", "Workshops", "Networking"],
    organizer: "React Summit",
    tags: ["React", "JavaScript", "Frontend"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "2",
    title: "KubeCon + CloudNativeCon Europe 2026",
    slug: "kubecon-cloudnativecon-eu-2026",
    description: "The biggest Kubernetes and cloud-native conference.",
    overview: "Deep dive into Kubernetes and cloud-native technologies.",
    image: "/images/event2.png",
    venue: "Austria Center Vienna",
    location: "Vienna, Austria",
    date: "2026-03-18",
    time: "10:00 AM",
    mode: "In-person",
    audience: "DevOps engineers",
    agenda: ["Talks", "Panels", "Labs"],
    organizer: "CNCF",
    tags: ["Kubernetes", "Cloud", "DevOps"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // 👉 Continue same pattern for rest...
];