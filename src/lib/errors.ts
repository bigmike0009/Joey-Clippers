export function getBookingErrorMessage(code: string): string {
  switch (code) {
    case 'no_slots_available':
      return 'No slots left — someone beat you to it!';
    case 'already_booked':
      return "You're already booked for that day.";
    case 'shop_day_not_found_or_closed':
      return 'This shop day is no longer available.';
    case 'booking_not_found':
      return 'Booking not found or already cancelled.';
    case 'not_authorized':
      return "You don't have permission to do that.";
    default:
      return 'Something went wrong. Please try again.';
  }
}
