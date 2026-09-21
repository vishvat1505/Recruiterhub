import { useOutletContext } from 'react-router-dom';
import { userQuery } from './DashboardLayout';
import RecruiterDashboard, {
  recruiterDashboardQuery,
} from './RecruiterDashboard';
import CandidateDashboard, {
  candidateDashboardQuery,
} from './CandidateDashboard';

// Awaits the user (so role is known even when loaders run in parallel),
// then prefetches the correct dashboard data based on role.
export const loader = (queryClient) => async () => {
  const userData = await queryClient.ensureQueryData(userQuery);
  const role = userData?.user?.role;

  if (role === 'candidate') {
    await queryClient.ensureQueryData(candidateDashboardQuery);
  } else {
    await queryClient.ensureQueryData(recruiterDashboardQuery);
  }
  return null;
};

const DashboardHome = () => {
  const { user } = useOutletContext();
  if (user?.role === 'candidate') return <CandidateDashboard />;
  return <RecruiterDashboard />;
};
export default DashboardHome;
