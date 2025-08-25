import { Suspense } from "react";
import { getUserMeetings } from "@/actions/meetings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MeetingList from "./_components/meeting-list";
import { Calendar, Clock } from "lucide-react";

export const metadata = {
  title: "Your Meetings | Mischief Meet",
  description: "View and manage your upcoming and past meetings.",
};

export default async function MeetingsPage() {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(140px,_auto)]">
      <div className="text-center md:text-left col-span-1 md:col-span-6 xl:col-span-8">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Meetings</h3>
        <p className="text-slate-600">Manage your scheduled meetings and appointments</p>
      </div>
      
      <Tabs defaultValue="upcoming" className="w-full col-span-1 md:col-span-6 xl:col-span-12">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-xl">
          <TabsTrigger 
            value="upcoming" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Clock className="w-4 h-4 mr-2" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="data-[state=active]:bg-white data-[state=active]:text-purple-700 data-[state=active]:shadow-md rounded-lg transition-all duration-200"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Past
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="mt-6 col-span-1 md:col-span-6 xl:col-span-12">
          <Suspense fallback={<MeetingsLoadingFallback />}>
            <UpcomingMeetings />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="past" className="mt-6 col-span-1 md:col-span-6 xl:col-span-12">
          <Suspense fallback={<MeetingsLoadingFallback />}>
            <PastMeetings />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MeetingsLoadingFallback() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse"></div>
      ))}
    </div>
  );
}

async function UpcomingMeetings() {
  const meetings = await getUserMeetings("upcoming");
  return <MeetingList meetings={meetings} type="upcoming" />;
}

async function PastMeetings() {
  const meetings = await getUserMeetings("past");
  return <MeetingList meetings={meetings} type="past" />;
}
