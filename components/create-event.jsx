"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import EventForm from "./event-form";

export default function CreateEventDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const create = searchParams.get("create");
    if (create === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);

  // State can be exposed to our app in case we want to manually open the drawer 👇
  // useEffect(() => {
  //   window.openCreateEventDrawer = () => setIsOpen(true);

  //   return () => {
  //     delete window.openCreateEventDrawer;
  //   };
  // }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (searchParams.get("create") === "true") {
      router.replace(window?.location.pathname);
    }
  };

  return (
    <Modal open={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Create New Event</ModalTitle>
        </ModalHeader>
        <EventForm
          onSubmitForm={() => {
            handleClose();
          }}
        />
        <ModalFooter>
          <Button variant="outline" onClick={handleClose} className="w-full">
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
