"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

import { updateAvailability } from "@/actions/availability";
import { availabilitySchema } from "@/app/lib/validators";
import { timeSlots } from "../data";
import useFetch from "@/hooks/use-fetch";
import { Clock, Calendar, AlertCircle } from "lucide-react";

export default function AvailabilityForm({ initialData }) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(availabilitySchema),
    defaultValues: { ...initialData },
  });

  const {
    loading,
    error,
    fn: fnupdateAvailability,
  } = useFetch(updateAvailability);

  const onSubmit = async (data) => {
    await fnupdateAvailability(data);
  };

  const days = [
    { key: "monday", label: "Monday", icon: "🌅" },
    { key: "tuesday", label: "Tuesday", icon: "🌤️" },
    { key: "wednesday", label: "Wednesday", icon: "☀️" },
    { key: "thursday", label: "Thursday", icon: "🌅" },
    { key: "friday", label: "Friday", icon: "🌤️" },
    { key: "saturday", label: "Saturday", icon: "🎉" },
    { key: "sunday", label: "Sunday", icon: "🛌" },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Weekly Schedule */}
      <div className="space-y-4">
        <h5 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Weekly Schedule
        </h5>
        
        <div className="grid gap-4">
          {days.map((day) => {
            const isAvailable = watch(`${day.key}.isAvailable`);

            return (
              <div key={day.key} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-all duration-200">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{day.icon}</span>
                    <Controller
                      name={`${day.key}.isAvailable`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={(checked) => {
                            setValue(`${day.key}.isAvailable`, checked);
                            if (!checked) {
                              setValue(`${day.key}.startTime`, "09:00");
                              setValue(`${day.key}.endTime`, "17:00");
                            }
                          }}
                          className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                        />
                      )}
                    />
                    <span className="font-medium text-slate-700 min-w-[80px]">
                      {day.label}
                    </span>
                  </div>
                  
                  {isAvailable && (
                    <div className="flex items-center gap-3 ml-auto">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <Controller
                          name={`${day.key}.startTime`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-32 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="Start Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      <span className="text-slate-500 font-medium">to</span>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-500" />
                        <Controller
                          name={`${day.key}.endTime`}
                          control={control}
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-32 bg-slate-50 border-slate-200">
                                <SelectValue placeholder="End Time" />
                              </SelectTrigger>
                              <SelectContent>
                                {timeSlots.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                      
                      {errors[day.key]?.endTime && (
                        <div className="flex items-center gap-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors[day.key].endTime.message}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Gap Setting */}
      <div className="bg-white rounded-xl p-6 border border-slate-200">
        <h5 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Booking Preferences
        </h5>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700 min-w-[200px]">
            Minimum gap before booking (minutes):
          </label>
          <Input
            type="number"
            {...register("timeGap", {
              valueAsNumber: true,
            })}
            className="w-32 bg-slate-50 border-slate-200"
            placeholder="15"
          />
          {errors.timeGap && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.timeGap.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">Error:</span>
            <span>{error?.message}</span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Updating...
            </div>
          ) : (
            "Update Availability"
          )}
        </Button>
      </div>
    </form>
  );
}
