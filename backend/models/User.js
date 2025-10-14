import { randomUUID } from "node:crypto";

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {'attendee'|'organizer'|'speaker'} role
 * @property {string=} bio
 * @property {string=} avatarUrl
 */

export function makeUser(partial = {}) {
  return {
    id: randomUUID(),
    name: "New User",
    email: "user@example.com",
    role: "attendee",
    bio: "",
    avatarUrl: "",
    ...partial,
  };
}
