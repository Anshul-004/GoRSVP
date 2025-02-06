"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { getevent, rsvpevent } from "@/actions/useractions";
import { useSession, signIn, signOut } from "next-auth/react";
import { toast } from "react-toastify";

const Page = () => {
  const { data: session, status } = useSession();
  const params = useParams();
  const eveid = params.eventid;
  const [event, setEvents] = useState([]);
  const [size, setSize] = useState(0);
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const fetchEvents = async () => {
    try {
      const data = await getevent(eveid);
      setEvents(data.event);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };  

  useEffect(() => {
    fetchEvents();
    if (status === "authenticated") setEmail(session.user.email);
    if (!loading) setSize(event.rsvps.length);
  }, [status, session,loading]);
  
  const handleRegisterClick = async (Timestamp) => {
    try {
      if(!session) {
        window.location.replace("/signin")
      }
      const data = await rsvpevent(Timestamp, email);
      if (data.ok) {
        toast.success("Slot Reserved Successfully!");
        setSize(size + 1);
      }
      else {
        toast.error("You Might Have Already Registered for this Event");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };
  const handleuserClick = (email) => {
    window.location.replace(`/profile/${email}`);
  };
  
  // console.log(size);

  return (
    <div className="bg-foreground flex justify-center items-center min-h-screen text-primary">
      <div className="p-6 rounded-lg border-2 shadow-xl  min-h-[70vh] mb-6 mt-6">
        {/* Event Banner */}
        <img
          src={event.eventBanner}
          alt="event banner"
          className="w-full h-52 object-cover rounded-md mb-4"
        />

        {/* Event Details */}
        <div className="flex flex-col sm:flex-row gap-6 mt-4">
          {/* Left Section */}
          <div className="flex-1 p-4">
            <h1 className="text-2xl font-semibold text-start text-gray-800">
              {event.eventTitle}
            </h1>
            <p
              className="text-sm font-medium flex items-center my-2"
              onClick={() => handleuserClick(event.organizerEmail)}
            >
              <span className="mr-2">👤</span> {event.organizerName}
            </p>
            <p className="text-sm font-medium text-gray-800 mb-2">
              <strong>Date and Time:</strong>{" "}
              {new Date(event.eventDate).toLocaleDateString()} at{" "}
              {event.eventTime} hrs.
            </p>
            <p className="text-sm font-medium text-gray-800 mb-6">
              <strong>Location:</strong> {event.eventLocation}
            </p>

            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              About this Event
            </h2>
            <p className="text-gray-700 text-sm border border-gray-200 p-3 rounded-md">
              {event.eventDescription}
            </p>
          </div>

          {/* Right Section */}
          <div className="w-full sm:w-64 p-4 rounded-lg shadow-md self-start mt-8">
            <h3 className="text-lg font-semibold text-center text-gray-800">
              {event.eventTitle}
            </h3>

            <p className="text-sm font-medium text-center text-gray-800 mb-4">
              Slots:{" "}
              <strong>
                {size} booked of {event.eventCapacity}
              </strong>
            </p>
            <button
              className="px-4 py-2 text-secondary border-2 border-secondary rounded-md bg-foreground shadow-sm focus:shadow-md hover:bg-secondary hover:text-foreground  w-full"
              onClick={() => {
                handleRegisterClick(event.Timestamp);
              }}
            >
              Reserve Slot
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
