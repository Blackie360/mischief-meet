"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUsername } from "@/actions/users";
import { BarLoader } from "react-spinners";
import useFetch from "@/hooks/use-fetch";
import { usernameSchema } from "@/app/lib/validators";
import { getLatestUpdates } from "@/actions/dashboard";
import { format } from "date-fns";
import { Calendar, Link as LinkIcon, User, Clock, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { user, isLoaded } = useUser();
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usernameSchema),
  });

  useEffect(() => {
    setValue("username", user?.username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded]);

  // Fetch updates only when user is loaded and authenticated
  useEffect(() => {
    const fetchUpdates = async () => {
      if (isLoaded && user) {
        setLoadingUpdates(true);
        try {
          const updates = await getLatestUpdates();
          setUpcomingMeetings(updates || []);
        } catch (error) {
          console.error("Failed to fetch updates:", error);
          setUpcomingMeetings([]);
        } finally {
          setLoadingUpdates(false);
        }
      }
    };

    fetchUpdates();
  }, [isLoaded, user]);

  const { loading, error, fn: fnUpdateUsername } = useFetch(updateUsername);

  const onSubmit = async (data) => {
    await fnUpdateUsername(data.username);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-full">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.firstName}!</h1>
            <p className="text-purple-100 text-lg">Ready to schedule your next meeting?</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-purple-200" />
              <div>
                <p className="text-2xl font-bold">{upcomingMeetings?.length || 0}</p>
                <p className="text-purple-100">Upcoming Meetings</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-purple-200" />
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className="text-purple-100">Availability</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-purple-200" />
              <div>
                <p className="text-2xl font-bold">Active</p>
                <p className="text-purple-100">Scheduling</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg border-b border-slate-200/50">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <Calendar className="w-6 h-6 text-blue-600" />
            Upcoming Meetings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!loadingUpdates ? (
            <div className="space-y-4">
              {upcomingMeetings && upcomingMeetings?.length > 0 ? (
                <div className="space-y-3">
                  {upcomingMeetings?.map((meeting) => (
                    <div key={meeting.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200/50 hover:shadow-md transition-all duration-200">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800">{meeting.event.title}</h4>
                        <p className="text-sm text-slate-600">
                          {format(new Date(meeting.startTime), "MMM d, yyyy 'at' h:mm a")} with {meeting.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No upcoming meetings</p>
                  <p className="text-slate-400 text-sm">Your schedule is clear for now</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <BarLoader width={"60%"} color="#8b5cf6" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Username Update Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-lg border-b border-slate-200/50">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <LinkIcon className="w-6 h-6 text-purple-600" />
            Your Unique Link
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customize your scheduling link
              </label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 font-mono text-sm">{window?.location.origin}/</span>
                <Input 
                  {...register("username")} 
                  placeholder="username" 
                  className="border-0 bg-transparent focus:ring-0 text-slate-700 font-medium"
                />
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {errors.username.message}
                </p>
              )}
              {error && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  {error?.message}
                </p>
              )}
            </div>
            {loading && (
              <div className="flex items-center justify-center">
                <BarLoader width={"100%"} color="#8b5cf6" />
              </div>
            )}
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? "Updating..." : "Update Username"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
