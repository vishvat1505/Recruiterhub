export const JOB_STATUS = {
  OPEN: 'open',
  CLOSED: 'closed',
  ON_HOLD: 'on hold',
};

export const JOB_TYPE = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  INTERNSHIP: 'internship',
};

export const JOB_SORT_BY = {
  NEWEST_FIRST: 'newest',
  OLDEST_FIRST: 'oldest',
  ASCENDING: 'a-z',
  DESCENDING: 'z-a',
};

// RecruitHub additions

export const USER_ROLE = {
  CANDIDATE: 'candidate',
  RECRUITER: 'recruiter',
  ADMIN: 'admin',
};

// Ordered ATS pipeline stages
export const APPLICATION_STAGE = {
  APPLIED: 'applied',
  SHORTLISTED: 'shortlisted',
  INTERVIEW_SCHEDULED: 'interview scheduled',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
};

// Ordered list used for funnel metrics and stage ordering
export const APPLICATION_STAGE_ORDER = [
  APPLICATION_STAGE.APPLIED,
  APPLICATION_STAGE.SHORTLISTED,
  APPLICATION_STAGE.INTERVIEW_SCHEDULED,
  APPLICATION_STAGE.INTERVIEWED,
  APPLICATION_STAGE.OFFERED,
  APPLICATION_STAGE.HIRED,
  APPLICATION_STAGE.REJECTED,
];

export const NOTIFICATION_TYPE = {
  NEW_APPLICATION: 'new_application',
  STATUS_CHANGE: 'status_change',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  HIRING_DECISION: 'hiring_decision',
  // Candidate accepted this recruiter's offer
  OFFER_ACCEPTED: 'offer_accepted',
  // Candidate accepted an offer elsewhere; this application was auto-declined
  OFFER_DECLINED: 'offer_declined',
};

// Required fields used to compute candidate profile completion percentage
export const PROFILE_REQUIRED_FIELDS = [
  'name',
  'email',
  'phone',
  'skills',
  'experience',
  'education',
  'resumeUrl',
];
