import { Meeting } from '../types';

export function getMeetingJoinState(meeting: Meeting): { canJoin: boolean, reason: string, label: string } {
  if (meeting.isSynthetic) {
    return { canJoin: false, reason: 'SYNTHETIC', label: 'TEST MEETING — NO LIVE JOIN LINK' };
  }
  
  if (!meeting.meetUrl) {
    return { canJoin: false, reason: 'NO_URL', label: 'MEETING LINK PENDING' };
  }

  // To be joinable, it must be provider verified OR come from an authorized Google Calendar creation event.
  // We consider it trusted if providerVerified is explicitly true, OR if it has a valid calendarEventId 
  // (which our code sets internally when creating via the authorized Google API).
  if (meeting.providerVerified || meeting.calendarEventId) {
    return { canJoin: true, reason: 'VERIFIED', label: 'JOIN CALL' };
  }

  return { canJoin: false, reason: 'UNVERIFIED', label: 'MEETING LINK UNVERIFIED' };
}
