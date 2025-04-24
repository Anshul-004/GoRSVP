"use client"
import React, { useEffect, useState }  from "react";
import { useSession, signIn, signOut } from "next-auth/react"
import { becomeorganizer,saveevent, updateuserevent } from "@/actions/useractions";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const Page = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (status !== "authenticated") {
      toast.error("You need to sign in first");
      router.replace("/signin"); 
    }
  }, [status, router]);

  useEffect(() => {
    async function orgconvertor() {
      if (session?.user?.organizer === false) {
        try {
          const response = await becomeorganizer(session.user);
          if (response.ok) {
            toast.success("You are now an organizer");
          } else {
            toast.error("Try again later");
          }
        } catch (error) {
          console.error("Error making you organizer", error);
          toast.error("Please try again later");
        }
      }
    }

    if (status === "authenticated" && session) {
      orgconvertor();
    }
  }, [session, status]);

  //form logic
  const [eventData, seteventData] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    eventDescription: "",
    eventCapacity: "",
    eventBanner: "",
    organizerEmail: session?.user?.email || "",
    organizerName: session?.user?.name || "",
    Timestamp: Date.now(),
  });

  const handleChange = (e) => {
    seteventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const extractDriveId = (driveUrl) => {
    const regex = /(?:drive\.google\.com\/file\/d\/|drive\.google\.com\/open\?id=|drive\.google\.com\/uc\?id=)([^\/&?]+)/;
    const match = driveUrl.match(regex);
    return match ? match[1] : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const driveId = extractDriveId(eventData.eventBanner);
      if (driveId) {
        eventData.eventBanner = `https://drive.google.com/uc?id=${driveId}`;
      }
      const response = await saveevent(eventData);
      const upduser = await updateuserevent(session.user.email, eventData.Timestamp);
      if (response.ok && upduser.ok) {
        toast.success("We have listed your event!");
        seteventData({
          eventTitle: "",
          eventDate: "",
          eventTime: "",
          eventLocation: "",
          eventCapacity: "",
          eventBanner: "",
          eventDescription: "",
          organizerEmail: session.user.email,
          organizerName: session.user.name,
          Timestamp: Date.now(),
        });
        window.location.replace("/")
        
      } else {
        toast.error("Failed to list your event. Please try again.");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("An error occurred. Please try again.");
    }
  };
 
  return (
    <div className="bg-foreground flex justify-center items-center min-h-screen">
      <div className="bg-[rgb(249,248,240)] p-6 rounded-lg shadow-md w-full max-w-3xl">
        <h1 className="text-2xl font-semibold text-secondary mb-4">Create New Event</h1>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="eventTitle" className="block text-medium font-medium text-gray-900">
                Event Title
              </label>
              <input
                id="eventTitle"
                name="eventTitle"
                value={seteventData.eventTitle}
                onChange={handleChange}
                required
                type="text"
                placeholder="Hackathon 2025"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              />
            </div>
            <div>
              <label htmlFor="eventDate" className="block text-medium font-medium text-gray-900">
                Event Date
              </label>
              <input
                id="eventDate"
                name="eventDate"
                value={seteventData.eventDate}
                onChange={handleChange}
                required
                type="date"
                min={today}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              />
            </div>
            <div>
              <label htmlFor="eventTime" className="block text-medium font-medium text-gray-900">
                Event Time
              </label>
              <input
                type="time"
                id="eventTime"
                name="eventTime"
                value={seteventData.eventTime}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-medium font-medium text-gray-900">
                Location
              </label>
              <input
                type="text"
                id="eventLocation"
                name="eventLocation"
                value={seteventData.eventLocation}
                onChange={handleChange}
                required
                placeholder="Nashik Central"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              />
            </div>
            <div>
              <label htmlFor="maxCapacity" className="block text-medium font-medium text-gray-900">
                Maximum Capacity
              </label>
              <input
                type="number"
                id="eventCapacity"
                name="eventCapacity"
                value={seteventData.eventCapacity}
                onChange={handleChange}
                required
                placeholder="e.g. 500"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              />
            </div>
            <div>
              <label htmlFor="bannerUrl" className="block text-medium font-medium text-gray-900">
                Banner URL
              </label>
              <input
                type="url"
                id="eventBanner"
                name="eventBanner"
                value={seteventData.eventBanner}
                onChange={handleChange}
                required
                placeholder="e.g. drive.google.com/path"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              />
            </div>
          </div>
          <div className="mb-6">
            <label htmlFor="description" className="block text-medium font-medium text-gray-900">
              Event Description
            </label>
            <textarea
              id="eventDescription"
              name="eventDescription"
              value={seteventData.eventDescription}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Write event description here..."
              className="w-full resize-none px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-black font-medium"
              spellCheck="true"
            ></textarea>
          </div>
          <div className="flex justify-between">
            <button
              type="button" onClick={() => window.location.replace("/") }
              className="px-4 py-2 bg-primary  text-footertext rounded-md hover:bg-red-700 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:ring-offset-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-secondary bg-foreground rounded-md  shadow-sm focus:shadow-md hover:bg-secondary hover:text-footertext border-2 border-secondary"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;