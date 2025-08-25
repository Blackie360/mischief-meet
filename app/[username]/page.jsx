import { notFound } from "next/navigation";
import { getUserByUsername } from "@/actions/users";
import EventCard from "@/components/event-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export async function generateMetadata({ params }) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    return {
      title: "User Not Found",
    };
  }

  return {
    title: `${user.name}'s Profile | Your App Name`,
    description: `Book an event with ${user.name}. View available public events and schedules.`,
  };
}

export default async function UserProfilePage({ params }) {
  const user = await getUserByUsername(params.username);

  if (!user) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto w-full mb-10">
        <div className="relative rounded-3xl border bg-white/90 shadow-xl">
          <div className="absolute inset-x-0 top-0 h-1 rounded-t-3xl bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500" />
          <div className="p-6 md:p-8 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-purple-200 to-blue-200 blur" />
              <Avatar className="relative w-24 h-24 ring-4 ring-white">
                <AvatarImage src={user.imageUrl} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">{user.name}</h1>
            <div className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
              <span>✨ Friendly • Efficient • On time</span>
            </div>
            <p className="mt-3 text-slate-600 max-w-2xl">
              Choose an event type below to instantly book a time that works for you.
            </p>
          </div>
        </div>
      </div>

      {user.events.length === 0 ? (
        <p className="text-center text-gray-600">No public events available.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {user.events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              username={params.username}
              isPublic
            />
          ))}
        </div>
      )}
    </div>
  );
}
