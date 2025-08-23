import { Suspense } from "react";
import { getUserEvents } from "@/actions/events";
import EventCard from "@/components/event-card";
import { Calendar, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  return (
    <Suspense fallback={<EventsLoadingFallback />}>
      <Events />
    </Suspense>
  );
}

function EventsLoadingFallback() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse"></div>
        <div className="h-10 bg-slate-200 rounded-lg w-32 animate-pulse"></div>
      </div>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

async function Events() {
  const { events, username } = await getUserEvents();

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
          <Calendar className="w-12 h-12 text-purple-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">No events yet</h3>
        <p className="text-slate-600 mb-8 max-w-md mx-auto">
          Create your first event to start scheduling meetings with others. It only takes a few minutes!
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link href="/events?create=true">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Event
            </Button>
          </Link>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-slate-400">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm">Start building your scheduling empire</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-slate-800">
            Your Events ({events.length})
          </h3>
          <p className="text-slate-600 text-sm mt-1">
            Manage and share your scheduling events
          </p>
        </div>
        <Link href="/events?create=true">
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
            <Plus className="w-5 h-5 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>
      
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {events?.map((event) => (
          <EventCard key={event.id} event={event} username={username} />
        ))}
      </div>
    </div>
  );
}
