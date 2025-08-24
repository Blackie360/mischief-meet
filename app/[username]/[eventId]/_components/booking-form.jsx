"use client";

import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createBooking } from "@/actions/bookings";
import "react-day-picker/style.css";

export default function BookingForm({ event, availability }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [bookingResult, setBookingResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // We're calling createBooking directly now, so we don't need useFetch

  const onSubmit = async (formData) => {
    console.log("Form submitted with data:", formData);
    console.log("Selected date:", selectedDate);
    console.log("Selected time:", selectedTime);
    console.log("Event:", event);

    // Basic validation
    const errors = {};
    if (!formData.name || formData.name.trim() === "") {
      errors.name = "Name is required";
    }
    if (!formData.email || formData.email.trim() === "") {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }
    if (!selectedDate || !selectedTime) {
      errors.dateTime = "Please select a date and time";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      console.error("Validation errors:", errors);
      return;
    }

    setFormErrors({});
    setIsSubmitting(true);

    try {
      // Create the date in the local timezone to avoid timezone conversion issues
      const startTime = new Date(
        `${format(selectedDate, "yyyy-MM-dd")}T${selectedTime}:00`
      );
      const endTime = new Date(startTime.getTime() + event.duration * 60000);
      
      console.log("Local start time:", startTime.toString());
      console.log("Local end time:", endTime.toString());
      console.log("ISO start time:", startTime.toISOString());
      console.log("ISO end time:", endTime.toISOString());

      const bookingData = {
        eventId: event.id,
        name: formData.name,
        email: formData.email,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        additionalInfo: formData.additionalInfo,
      };

      console.log("Booking data to send:", bookingData);

      console.log("About to call createBooking directly with:", bookingData);
      
      // Call the server action directly to bypass useFetch
      try {
        const result = await createBooking(bookingData);
        console.log("Direct createBooking result:", result);
        console.log("Result type:", typeof result);
        console.log("Result success:", result?.success);
        console.log("Result error:", result?.error);
        
        if (result && result.success) {
          // Success - the form will show the success message
          console.log("Booking created successfully:", result);
          setBookingResult(result);
          // Reset form after successful submission
          setSelectedDate(null);
          setSelectedTime(null);
          setFormErrors({});
        } else {
          // Error - show error message
          const errorMessage = result?.error || "Unknown error occurred";
          console.error("Failed to create booking:", errorMessage);
          alert(`Failed to create booking: ${errorMessage}`);
        }
      } catch (error) {
        console.error("Error calling createBooking:", error);
        alert(`Error: ${error.message}`);
      } finally {
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error in onSubmit:", error);
      alert(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const availableDays = availability.map((day) => new Date(day.date));

  const timeSlots = selectedDate
    ? availability.find(
        (day) => day.date === format(selectedDate, "yyyy-MM-dd")
      )?.slots || []
    : [];

  if (bookingResult?.success) {
    return (
      <div className="text-center p-10 border bg-white rounded-lg shadow-lg">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-4 text-green-800">Booking Successful!</h2>
        <p className="text-gray-600 mb-4">Your meeting has been scheduled successfully.</p>
        
        {bookingResult.meetLink && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-blue-800 mb-2">Join your meeting using this link:</p>
            <a
              href={bookingResult.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 font-medium hover:underline break-all"
            >
              {bookingResult.meetLink}
            </a>
          </div>
        )}
        
        <div className="text-sm text-gray-500">
          <p>A confirmation email has been sent to your email address.</p>
          <p>You can also view this booking in your calendar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 p-10 border bg-white">
      <div className="md:h-96 flex flex-col md:flex-row gap-5 ">
        <div className="w-full">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              setSelectedDate(date);
              setSelectedTime(null); // Reset selected time when date changes
            }}
            disabled={[{ before: new Date() }]}
            modifiers={{ available: availableDays }}
            modifiersStyles={{
              available: {
                background: "lightblue",
                borderRadius: 100,
              },
            }}
          />
        </div>
        <div className="w-full h-full md:overflow-scroll no-scrollbar">
          {/* add hide scroll bar code */}
          {selectedDate && (
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">
                Available Time Slots
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={selectedTime === slot ? "default" : "outline"}
                    onClick={() => setSelectedTime(slot)}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {selectedTime && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log("Form onSubmit triggered");
            console.log("Form element:", e.target);
            console.log("Form data:", new FormData(e.target));
            
            // Get the form data manually
            const formData = new FormData(e.target);
            const formValues = {
              name: formData.get('name'),
              email: formData.get('email'),
              additionalInfo: formData.get('additionalInfo'),
            };
            
            console.log("Form values:", formValues);
            
            // Call our custom submission handler
            onSubmit(formValues);
          }} 
          className="space-y-4"
        >
          <div>
            <Input 
              name="name"
              placeholder="Your Name" 
              onChange={(e) => console.log("Name input changed:", e.target.value)}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm">{formErrors.name}</p>
            )}
          </div>
          <div>
            <Input
              name="email"
              type="email"
              placeholder="Your Email"
              onChange={(e) => console.log("Email input changed:", e.target.value)}
            />
            {formErrors.email && (
              <p className="text-red-500 text-sm">{formErrors.email}</p>
            )}
          </div>
          <div>
            <Textarea
              name="additionalInfo"
              placeholder="Additional Information"
              onChange={(e) => console.log("Additional info changed:", e.target.value)}
            />
          </div>
          
          {formErrors.dateTime && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{formErrors.dateTime}</p>
            </div>
          )}
          

          

          
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full"
            onClick={() => console.log("Submit button clicked!")}
          >
            {isSubmitting ? "Scheduling..." : "Schedule Event"}
          </Button>
        </form>
      )}
    </div>
  );
}
