import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaUsers, FaCalendarCheck } from 'react-icons/fa';
import day from 'dayjs';
import Wrapper from '../assets/wrappers/DashboardHome';
import { StatItem, HiringFunnel } from '../components';
import customFetch from '../utils/customFetch';

export const recruiterDashboardQuery = {
  queryKey: ['recruiter-dashboard'],
  queryFn: async () => {
    const { data } = await customFetch.get('/dashboard/recruiter');
    return data;
  },
};

const RecruiterDashboard = () => {
  const { data } = useQuery(recruiterDashboardQuery);
  const {
    activeJobs,
    totalApplications,
    upcomingInterviews,
    hiringFunnel,
  } = data;

  return (
    <Wrapper>
      <div className='stats-grid'>
        <StatItem
          title='active jobs'
          count={activeJobs}
          icon={<FaBriefcase />}
          color='#647acb'
          bcg='#e0e8f9'
        />
        <StatItem
          title='total applicants'
          count={totalApplications}
          icon={<FaUsers />}
          color='#e9b949'
          bcg='#fcefc7'
        />
        <Link to='interviews' className='stat-link'>
          <StatItem
            title='upcoming interviews'
            count={upcomingInterviews.length}
            icon={<FaCalendarCheck />}
            color='#2cb1bc'
            bcg='#d3f3f5'
          />
        </Link>
      </div>

      <div className='panel'>
        <h5>Hiring Funnel</h5>
        <HiringFunnel funnel={hiringFunnel} />
      </div>

      <div className='panel'>
        <div className='panel-head'>
          <h5>Upcoming Interviews</h5>
          <Link to='interviews' className='see-all'>
            see all
          </Link>
        </div>
        {upcomingInterviews.length === 0 ? (
          <p className='muted'>No interviews scheduled.</p>
        ) : (
          upcomingInterviews.map((iv) => (
            <Link
              to='interviews'
              key={iv._id}
              className='interview-item interview-link'
            >
              <span>
                {iv.candidate?.name} — {iv.job?.position}
              </span>
              <span className='muted'>
                {day(iv.scheduledAt).format('MMM D, YYYY h:mm A')}
              </span>
            </Link>
          ))
        )}
      </div>
    </Wrapper>
  );
};
export default RecruiterDashboard;
