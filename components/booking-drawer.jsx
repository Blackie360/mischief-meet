"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export default function BookingDrawer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const bookingUsername = searchParams.get("book_username");
  const bookingEventId = searchParams.get("book_eventId");

  useEffect(() => {
    const shouldOpen = Boolean(bookingUsername && bookingEventId);
    setIsOpen(shouldOpen);
  }, [bookingUsername, bookingEventId]);

  const bookingUrl = useMemo(() => {
    if (!bookingUsername || !bookingEventId) return null;
    const base = typeof window !== "undefined" ? window.location.origin : "";
    return `${base}/${bookingUsername}/${bookingEventId}`;
  }, [bookingUsername, bookingEventId]);

  const handleClose = () => {
    setIsOpen(false);
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("book_username");
    sp.delete("book_eventId");
    router.replace(`${pathname}${sp.toString() ? `?${sp.toString()}` : ""}`);
  };

  return (
    <Drawer open={isOpen} onClose={handleClose}>
      <DrawerContent className="h-[90vh] max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>Book a Meeting</DrawerTitle>
        </DrawerHeader>
        <div className="px-6 pb-6">
          {bookingUrl ? (
            <iframe
              title="Booking"
              src={bookingUrl}
              className="w-full h-[70vh] border rounded-lg bg-white"
            />
          ) : (
            <div className="text-sm text-slate-500">No booking selected.</div>
          )}
          <div className="mt-4 flex justify-end">
            <DrawerClose asChild>
              <Button variant="outline" onClick={handleClose}>Close</Button>
            </DrawerClose>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}


