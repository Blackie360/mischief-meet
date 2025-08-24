"use client";

import { UserButton } from "@clerk/nextjs";
import { Calendar, BarChart, Users, Clock } from "lucide-react";

const UserMenu = () => {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox: "w-10 h-10 ring-2 ring-white/50 hover:ring-white transition-all duration-200",
          userButtonPopoverCard: "shadow-2xl border border-slate-200/50",
          userButtonPopoverActionButton: "hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 transition-all duration-200",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="Dashboard"
          labelIcon={<BarChart size={16} />}
          href="/dashboard"
        />
        <UserButton.Link
          label="My Events"
          labelIcon={<Calendar size={16} />}
          href="/events"
        />
        <UserButton.Link
          label="Meetings"
          labelIcon={<Users size={16} />}
          href="/meetings"
        />
        <UserButton.Link
          label="Availability"
          labelIcon={<Clock size={16} />}
          href="/availability"
        />
        <UserButton.Action label="manageAccount" />
      </UserButton.MenuItems>
    </UserButton>
  );
};

export default UserMenu;
