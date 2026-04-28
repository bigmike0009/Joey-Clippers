# Joe's Clippers — MVP Features

Features are ordered by dependency: each feature can be implemented on its own branch once its dependencies are merged.

---

## 1. Invite-Only Auth & Profile Setup

**Description:** Joe generates a single-use invite token; a friend opens the invite link, registers with email/password, and lands on the app with a fully created profile.

**Acceptance criteria:**
- [ ] Joe (admin) can generate an invite token from the Members screen; a shareable link is produced.
- [ ] An unauthenticated user who opens the invite link is taken to a registration screen pre-loaded with the token.
- [ ] `validate_invite_token` RPC returns `true` for an unused token and `false` for an already-used or non-existent token.
- [ ] After successful registration, `use_invite_token` marks the invite as used (`used_by`, `used_at` populated).
- [ ] A profile row is auto-created via the `handle_new_user` trigger with `role = 'member'`.
- [ ] Attempting to access the app without a valid session redirects to the login screen.
- [ ] Attempting to register without a valid invite token shows a clear error and blocks signup.
- [ ] Joe's admin account is seeded; Joe can log in and land on the admin home screen.

**Dependencies:** none
**Complexity:** M

---

## 2. Shop Day Management (Admin)

**Description:** Joe can create an open shop day (date + slot count + optional note), view it in his day list, and cancel it if plans change.

**Acceptance criteria:**
- [ ] Joe can open a new shop day via a form: date picker (no past dates), slot count (1–10), optional note.
- [ ] Created shop day appears at the top of the home day list with `status = 'open'` and correct slot count.
- [ ] Joe can tap a shop day to see its detail: date, slots total, active booking count, notes.
- [ ] Joe can cancel an open shop day; its status changes to `cancelled` and it disappears from the "upcoming open" list.
- [ ] Attempting to create a shop day on a date that already has one shows a validation error (enforced by the `UNIQUE(date)` constraint error returned from Supabase).
- [ ] Only admin users can access the "Open New Day" screen and the cancel action.

**Dependencies:** 1 (auth must exist)
**Complexity:** M

---

## 3. Member Home — View Open Days

**Description:** Members see a scrollable list of upcoming open shop days with available slot counts, and can navigate to book.

**Acceptance criteria:**
- [ ] Home screen shows all `shop_days` with `status = 'open'` and `date >= today`, sorted ascending by date.
- [ ] Each row shows: date (human-readable), available slots remaining (total minus active bookings), and Joe's note if present.
- [ ] A day with 0 slots remaining shows a "Full" badge and disables the Book button.
- [ ] A day the member has already booked shows a "Booked ✓" badge instead of a Book button.
- [ ] Empty state is shown when no upcoming open days exist.
- [ ] List refreshes on pull-to-refresh.
- [ ] Loading and error states are handled.

**Dependencies:** 2 (shop days must exist)
**Complexity:** S

---

## 4. Booking — Book and Cancel a Slot

**Description:** A member books one slot on an open shop day via the `book_slot` RPC; they can also cancel their own booking.

**Acceptance criteria:**
- [ ] Tapping "Book" calls `book_slot` RPC; on success the member's booking appears in My Bookings.
- [ ] The available slot count on the home screen decrements after a successful booking.
- [ ] If the last slot is taken concurrently by another user, the member receives a clear "No slots left" error (mapped from `no_slots_available` exception).
- [ ] A member cannot book more than one slot on the same shop day (enforced by the partial unique index; error is surfaced to the user).
- [ ] Member can cancel their own active booking from the My Bookings screen; `cancel_booking` RPC is called.
- [ ] After cancellation, the slot count increments back and the booking disappears from My Bookings.
- [ ] My Bookings shows loading, error, and empty states.

**Dependencies:** 3 (member must be able to see the shop day before booking)
**Complexity:** M

---

## 5. Admin Booking Management

**Description:** Joe sees all bookings for a shop day and can remove (cancel) any member from a slot.

**Acceptance criteria:**
- [ ] Shop Day Detail screen (admin) shows a list of all active bookings with member names.
- [ ] Joe can tap a member in the booking list and cancel their booking via `cancel_booking` RPC.
- [ ] After Joe cancels a member's booking, the slot count increments back and the member disappears from the list.
- [ ] Booking list shows empty state when no active bookings exist for the day.
- [ ] Non-admin users cannot access the admin booking management actions.

**Dependencies:** 4 (bookings must exist to manage them)
**Complexity:** S

---

## 6. Day-Request Flow

**Description:** A member submits a date request for Joe to open the shop; Joe sees all pending requests and can approve or decline each with an optional note.

**Acceptance criteria:**
- [ ] Member can submit a day request via a date picker; request appears in their "My Requests" list with `status = 'pending'`.
- [ ] A member can delete their own pending request.
- [ ] Joe's Requests tab shows a badge with the count of pending requests.
- [ ] Joe sees all requests (pending, approved, declined) with requester name and requested date.
- [ ] Joe can approve a request — status changes to `approved`, `responded_by` and `responded_at` are set.
- [ ] Joe can decline a request with an optional note — status changes to `declined`.
- [ ] Member's "My Requests" list reflects the updated status after Joe responds.
- [ ] All three request statuses (pending / approved / declined) have distinct visual treatment.
- [ ] Loading, error, and empty states handled on both member and admin views.

**Dependencies:** 1 (auth), 2 (admin role must exist for Joe to respond)
**Complexity:** M

---

## 7. Member Directory & Invite Management

**Description:** Joe can see a list of all members and generate new invite links; members can view a simple member list.

**Acceptance criteria:**
- [ ] Members screen shows all profiles with full name; admin sees role badges.
- [ ] Joe can tap "Invite Member" to generate a new invite token; the app presents a shareable link (e.g., via Share Sheet).
- [ ] Generated invite is saved to the `invites` table with `invited_by = Joe's id`.
- [ ] Joe can see a list of existing invites (used and unused) with status.
- [ ] Member count is shown in a header or summary line.
- [ ] Non-admin users see the member list but not the invite management UI.

**Dependencies:** 1 (auth and profiles must exist)
**Complexity:** S