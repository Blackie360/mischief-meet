import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Clock, Video, User, MessageSquare } from "lucide-react";
import CancelMeetingButton from "./cancel-meeting";

export default function MeetingList({ meetings, type }) {
  if (meetings.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mb-6">
          {type === "upcoming" ? (
            <Clock className="w-12 h-12 text-slate-400" />
          ) : (
            <Calendar className="w-12 h-12 text-slate-400" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3">
          No {type} meetings
        </h3>
        <p className="text-slate-600 max-w-md mx-auto">
          {type === "upcoming" 
            ? "You don't have any upcoming meetings scheduled. Create an event to start receiving bookings!"
            : "No past meetings to display."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-6 xl:grid-cols-12 auto-rows-[minmax(140px,_auto)]">
      {meetings.map((meeting) => (
        <Card key={meeting.id} className="flex flex-col justify-between group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm shadow-lg col-span-1 md:col-span-3 xl:col-span-4">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between mb-2">
              <CardTitle className="text-lg font-bold text-slate-800 group-hover:text-purple-700 transition-colors duration-200 line-clamp-2">
                {meeting.event.title}
              </CardTitle>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                type === "upcoming" 
                  ? "bg-blue-100 text-blue-700 border border-blue-200" 
                  : "bg-slate-100 text-slate-700 border border-slate-200"
              }`}>
                {type === "upcoming" ? "Upcoming" : "Past"}
              </div>
            </div>
            <CardDescription className="text-slate-600">
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-slate-500" />
                <span>with {meeting.name}</span>
              </div>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pb-4 space-y-3">
            {meeting.additionalInfo && (
              <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <MessageSquare className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-700 italic">
                  &ldquo;{meeting.additionalInfo}&rdquo;
                </p>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>{format(new Date(meeting.startTime), "MMMM d, yyyy")}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <Clock className="w-4 h-4 text-slate-500" />
                <span>
                  {format(new Date(meeting.startTime), "h:mm a")} -{" "}
                  {format(new Date(meeting.endTime), "h:mm a")}
                </span>
              </div>
            </div>
            
            {meeting.meetLink && (
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Video className="w-4 h-4 text-blue-600" />
                <a
                  href={meeting.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 font-medium text-sm hover:underline transition-colors duration-200"
                >
                  Join Meeting
                </a>
              </div>
            )}
          </CardContent>
          
          {type === "upcoming" && (
            <CardFooter className="pt-0">
              <CancelMeetingButton meetingId={meeting.id} />
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  );
}
