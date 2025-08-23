"use client";

import { deleteEvent } from "@/actions/events";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import { Link, Trash2, Calendar, Clock, Users, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EventCard({ event, username, isPublic = false }) {
  const [isCopied, setIsCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window?.location.origin}/${username}/${event.id}`
      );
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  const { loading, fn: fnDeleteEvent } = useFetch(deleteEvent);

  const handleDelete = async () => {
    if (window?.confirm("Are you sure you want to delete this event?")) {
      await fnDeleteEvent(event.id);
      router.refresh();
    }
  };

  const handleCardClick = (e) => {
    if (e.target.tagName !== "BUTTON" && e.target.tagName !== "SVG") {
      window?.open(
        `${window?.location.origin}/${username}/${event.id}`,
        "_blank"
      );
    }
  };

  return (
    <Card
      className="group flex flex-col justify-between cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-2xl"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-purple-700 transition-colors duration-200">
            {event.title}
          </CardTitle>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            event.isPrivate 
              ? "bg-red-100 text-red-700 border border-red-200" 
              : "bg-green-100 text-green-700 border border-green-200"
          }`}>
            {event.isPrivate ? "Private" : "Public"}
          </div>
        </div>
        <CardDescription className="text-slate-600">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{event.duration} mins</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-slate-500" />
              <span>{event._count.bookings} Bookings</span>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-4">
        <p className="text-slate-700 leading-relaxed">
          {event.description.substring(0, event.description.indexOf("."))}.
        </p>
      </CardContent>
      
      {!isPublic && (
        <CardFooter className="flex gap-3 pt-0">
          <Button
            variant="outline"
            onClick={handleCopy}
            className="flex-1 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200 text-blue-700 hover:text-blue-800 transition-all duration-200 hover:shadow-md"
          >
            <Link className="mr-2 h-4 w-4" />
            {isCopied ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={loading}
            className="bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200 text-red-700 hover:text-red-800 transition-all duration-200 hover:shadow-md"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </CardFooter>
      )}
      
      {isPublic && (
        <CardFooter className="pt-0">
          <Button
            variant="outline"
            className="w-full bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 text-purple-700 hover:text-purple-800 transition-all duration-200 hover:shadow-md"
          >
            <Eye className="mr-2 h-4 w-4" />
            View Event
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
