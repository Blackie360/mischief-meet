import React from "react";
import AvailabilityForm from "./_components/availability-form";
import { getUserAvailability } from "@/actions/availability";
import { defaultAvailability } from "./data";
import { Clock } from "lucide-react";

export default async function AvailabilityPage() {
  const availability = await getUserAvailability();

  return (
    <div className="space-y-6">
      <div className="text-center md:text-left">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Your Availability</h3>
        <p className="text-slate-600">Set your weekly schedule and booking preferences</p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-full">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">Weekly Schedule</h4>
            <p className="text-sm text-slate-600">Configure when you&apos;re available for meetings</p>
          </div>
        </div>
        <AvailabilityForm initialData={availability || defaultAvailability} />
      </div>
    </div>
  );
}
