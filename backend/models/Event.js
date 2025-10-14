import { randomUUID } from "node:crypto";

/**
 * @typedef {Object} Event
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} date // ISO
 * @property {string} time // "18:30"
 * @property {string} venue
 * @property {string} city
 * @property {string} description
 * @property {number} capacity
 * @property {string} organizerId
 * @property {Array<{userId:string,status:'registered'|'checked-in'}>} registrations
 * @property {Array<{userId:string, rating:number, comment:string}>} feedback
 * @property {boolean} published
 */

export function makeEvent(partial = {}) {
  return {
    id: randomUUID(),
    title: "Untitled Event",
    category: "General",
    date: new Date().toISOString().slice(0, 10),
    time: "18:00",
    venue: "",
    city: "",
    description: "",
    capacity: 100,
    organizerId: "",
    registrations: [],
    feedback: [],
    published: false,
    ...partial,
  };
}
