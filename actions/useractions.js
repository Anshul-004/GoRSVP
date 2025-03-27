"use server";

import connectDB from "@/db/ConnectDB";
import User from "@/models/User";
import Event from "@/models/Event";
import Contact from "@/models/Contact";

//contact us form submission, POST req.
export const savecontact = async (msg) => {
  await connectDB();

  // console.log(msg);
  const newcontact = new Contact({
    name: msg.name,
    email: msg.email,
    message: msg.message,
  });
  await newcontact.save();
  return { ok: true };
};

//updates isOrganizer field in User model for current user.
export const becomeorganizer = async (msg) => {
  await connectDB();
  const user = await User.findOne({ email: msg.email });
  if (user) {
    await User.updateOne({ email: msg.email }, { isOrganizer: true });
    return { ok: true };
  } else {
    return { ok: false, error: "email not found in record" };
  }
};

//event creation form submission, POST req.
export const saveevent = async (msg) => {
  await connectDB();
  const newevent = new Event({
    organizerEmail: msg.organizerEmail,
    organizerName: msg.organizerName,
    eventTitle: msg.eventTitle,
    eventDate: msg.eventDate,
    eventTime: msg.eventTime,
    eventLocation: msg.eventLocation,
    eventCapacity: msg.eventCapacity,
    eventBanner: msg.eventBanner,
    eventDescription: msg.eventDescription,
    Timestamp: msg.Timestamp,
  });
  await newevent.save();
  return { ok: true };
};

//fetches all events from Event model. (Latest first)
export const getallevents = async (msg) => {
  await connectDB();
  const currentDate = new Date();
  const events = await Event.find({ isDeleted: false, eventDate: { $gte: currentDate } })
    .sort({ eventDate: 1 })
    .limit(6)
    .lean();
  const plainEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));
  return { events: plainEvents };
};

//fetches specific events from Event model.
export const getevent = async (msg) => {
  await connectDB();

  const event = await Event.findOne({
    Timestamp: msg,
    isDeleted: false,
  }).lean();
  if (!event) {
    return { ok: false };
  }
  const plainEvent = {
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
    Timestamp: event.Timestamp.toString(),
  };
  return { event: plainEvent };
};
//fetches specific events from Event model.
export const getusersevent = async (msg) => {
  await connectDB();
  // console.log(msg)
  const event = await Event.find({
    organizerEmail: msg,
    isDeleted: false,
  }).lean();

  if (!event) {
    window.location.replace("/");
    return { ok: false };
  }
  const plainEvents = event.map((event) => ({
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
    Timestamp: event.Timestamp.toString(),
  }));
  return { event: plainEvents };
};

//deletes specific event from Event model.
export const deleteevent = async (msg) => {
  await connectDB();
  const event = await Event.findOne({ Timestamp: msg, isDeleted: false });
  if (event) {
    await Event.updateOne({ Timestamp: msg }, { isDeleted: true });
    return { ok: true };
  } else {
    return { ok: false, error: "event not found" };
  }
};

//append RSVP to rsvps field in Event model.
export const rsvpevent = async (Timestamp, email) => {
  await connectDB();
  // console.log(Timestamp,email);
  let flag = 0;
  const event = await Event.findOne({ Timestamp: Timestamp, isDeleted: false });
  const rsvpold = event.rsvps;
  //   console.log(rsvpold);
  rsvpold.forEach((e) => {
    if (e == email) {
      flag = 1;
    }
  });
  if (event && flag == 0) {
    await Event.updateOne(
      { Timestamp: Timestamp },
      { $push: { rsvps: email } }
    );
    await User.updateOne(
      { email: email },
      { $push: { rsvpevents: Timestamp } }
    );
    return { ok: true };
  } else {
    return { ok: false, error: "Already Registered" };
  }
};

//import matching user from User model.
export const getuser = async (msg) => {
  await connectDB();
  const user = await User.findOne({ email: msg }).lean();
  if (!user) {
    return { ok: false, error: "user not found" };
  } else {
    const plainuser = {
      ...user,
      _id: user._id.toString(),
      createdAt: user.createdAt.toISOString(),
    };
    return { user: plainuser, ok: true };
  }
};

//User's RSVPs from User model.
export const getuserrsvps = async (msg) => {
  await connectDB();
  // console.log(msg)
  const userexists = await User.find({ email: msg }).lean();

  if (!userexists) {
    window.location.replace("/");
    return { ok: false };
  }
  const plainuser = userexists.map((u) => ({
    ...u,
    _id: u._id.toString(),
    createdAt: u.createdAt.toISOString(),
  }));
  return { user: plainuser };
};

//get events from Event model using array of Timestamps.
export const getspecificevents = async (msg) => {
  await connectDB();
  // console.log(msg)
  const events = await Event.find({
    Timestamp: { $in: msg },
    isDeleted: false,
  }).lean();

  if (!events) {
    window.location.replace("/");
    return { ok: false };
  }
  const plainEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
    Timestamp: event.Timestamp.toString(),
  }));
  return { events: plainEvents };
};

//updates the event in Event model.
export const updateevent = async (ts, msg) => {
  await connectDB();
  const event = await Event.findOne({ Timestamp: ts, isDeleted: false });
  if (event) {
    // console.log("event exists ", msg, ts);
    await Event.updateOne({
      eventTitle: msg.eventTitle,
      eventDate: msg.eventDate,
      eventTime: msg.eventTime,
      eventLocation: msg.eventLocation,
      eventCapacity: msg.eventCapacity,
      eventBanner: msg.eventBanner,
      eventDescription: msg.eventDescription,
    });
    return { ok: true };
  } else {
    return { ok: false, error: "event not found" };
  }
};

//search bar functionality, fetches events from Event model.
export const searchevents = async (msg) => {
  await connectDB();
  const events = await Event.find({
    eventTitle: { $regex: msg, $options: "i" },
    isDeleted: false,
  }).lean(); //$options:"i" -> case insensitive
  if (!events) {
    return { ok: false };
  }
  const plainEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
    Timestamp: event.Timestamp.toString(),
  }));
  return { events: plainEvents, ok: true };
};

//gets all users
export const getallusers = async () => {
  await connectDB();
  const users = await User.find({isDeleted:false}).lean();
  const plainUsers = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt.toISOString(),
  }));
  return { users: plainUsers };
};

//gets just organizers
export const getorganizers = async () => {
  await connectDB();
  const users = await User.find({ isOrganizer: true, isDeleted:false }).lean();
  const plainUsers = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt.toISOString(),
  }));
  return { users: plainUsers };
};

//update user with its timestamp of event
export const updateuserevent = async (email, timestamp) => {
  await connectDB();
  console.log(email, timestamp);
  const user = await User.findOne({ email: email });
  if (user) {
    await User.updateOne(
      { email: email },
      { $push: { createdevents: timestamp } }
    );
    return { ok: true };
  } else {
    return { ok: false, error: "user not found" };
  }
};

export const getalleventsadmin = async () => {
  await connectDB();
  const events = await Event.find({ isDeleted: false })
    .sort({ Timestamp: -1 })
    .lean();
  const plainEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));
  return { events: plainEvents };
};

//master fetcher
export const fetchall = async () => {
  await connectDB();
  const users = await User.find({}).lean();
  const plainUsers = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt.toISOString(),
  }));
  const orgs = await User.find({ isOrganizer: true }).lean();
  const plainorgs = orgs.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt.toISOString(),
  }));

  const events = await Event.find({ isDeleted: false })
    .sort({ Timestamp: -1 })
    .lean();
  const plainEvents = events.map((event) => ({
    ...event,
    _id: event._id.toString(),
    eventDate: event.eventDate.toISOString(),
    createdAt: event.createdAt.toISOString(),
  }));
  return { users: plainUsers, events: plainEvents, organizers: plainorgs };
};

//add to checkin array
export const checkinevent = async (timestamp, email) => {
  await connectDB();
  const event = await Event.findOne({ Timestamp: timestamp, isDeleted: false });
  if (event) {
    await Event.updateOne(
      { Timestamp: timestamp },
      { $push: { checkin: email } }
    );
    return { ok: true };
  } else {
    return { ok: false, error: "event not found" };
  }
};

//remove from checkin array
export const checkoutevent = async (timestamp, email) => {
  await connectDB();
  const event = await Event.findOne({ Timestamp: timestamp, isDeleted: false });
  if (event) {
    await Event.updateOne(
      { Timestamp: timestamp },
      { $pull: { checkin: email } }
    );
    return { ok: true };
  } else {
    return { ok: false, error: "event not found" };
  }
};

//set user as deleted
export const deleteuser = async (email) => {
  await connectDB();
  const user = await User.findOne({ email: email });
  if (user) {
    await User.updateOne({ email: email }, { isDeleted: true });
    return { ok: true };
  } else {
    return { ok: false, error: "user not found" };
  }
};
