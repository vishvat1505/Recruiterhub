import React from 'react';

import { IoBarChartSharp } from 'react-icons/io5';
import { MdQueryStats, MdAdminPanelSettings, MdWork } from 'react-icons/md';
import { FaWpforms, FaUsers, FaRegCalendarCheck } from 'react-icons/fa';
import { ImProfile } from 'react-icons/im';
import { BiSearchAlt } from 'react-icons/bi';
import { HiOutlineClipboardList } from 'react-icons/hi';

// Links shown to recruiters (and admins).
const recruiterLinks = [
  { text: 'dashboard', path: '.', icon: <IoBarChartSharp /> },
  { text: 'add job', path: 'add-job', icon: <FaWpforms /> },
  { text: 'my jobs', path: 'all-jobs', icon: <MdWork /> },
  { text: 'interviews', path: 'interviews', icon: <FaRegCalendarCheck /> },
  { text: 'analytics', path: 'analytics', icon: <MdQueryStats /> },
  { text: 'account', path: 'profile', icon: <ImProfile /> },
];

// Links shown to candidates.
const candidateLinks = [
  { text: 'dashboard', path: '.', icon: <IoBarChartSharp /> },
  { text: 'browse jobs', path: 'browse-jobs', icon: <BiSearchAlt /> },
  {
    text: 'my applications',
    path: 'my-applications',
    icon: <HiOutlineClipboardList />,
  },
  { text: 'interviews', path: 'interviews', icon: <FaRegCalendarCheck /> },
  { text: 'my profile', path: 'candidate-profile', icon: <FaUsers /> },
  { text: 'account', path: 'profile', icon: <ImProfile /> },
];

const adminLink = {
  text: 'admin',
  path: 'admin',
  icon: <MdAdminPanelSettings />,
};

// Returns the nav links appropriate for the given role.
export const getLinks = (role) => {
  if (role === 'candidate') return candidateLinks;
  if (role === 'admin') return [...recruiterLinks, adminLink];
  // recruiter (default)
  return recruiterLinks;
};

export default getLinks;
