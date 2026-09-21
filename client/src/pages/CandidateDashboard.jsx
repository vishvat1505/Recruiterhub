import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { FaClipboardList, FaCalendarCheck, FaUserCheck } from 'react-icons/fa';
import day from 'dayjs';
import Wrapper from '../assets/wrappers/DashboardHome';
import { StatItem } from '../components';
import customFetch from '../utils/customFetch';

export const candidateDashboardQuery = {
  queryKey: ['candidate-dashboard'],
  queryFn: async () => {
    const { data } = await customFetch.get('/dashboard/candidate');
    return data;
  },
};

const CandidateDashboard = () => {
  const { data } = useQuery(candidateDashboardQuery);
  const {
    appliedJobs,
    upcomingInterviews,
    profileCompletion,
  } = data;

  return (
    <Wrapper>
      <div className='stats-grid'>
        <StatItem
          title='applications'
          count={appliedJobs.length}
          icon={<FaClipboardList />}
          color='#647acb'
          bcg='#e0e8f9'
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
        <StatItem
          title='profile complete'
          count={`${profileCompletion}%`}
          icon={<FaUserCheck />}
          color='#e9b949'
          bcg='#fcefc7'
        />
      </div>

      {profileCompletion < 100 && (
        <div className='panel'>
          <p className='completion'>
            Your profile is {profileCompletion}% complete.{' '}
            <Link to='../candidate-profile'>Complete it</Link> to improve your
            chances and enable applying.
          </p>
        </div>
      )}

      <div className='panel'>
        <h5>My Applications</h5>
        {appliedJobs.length === 0 ? (
          <p className='muted'>
            No applications yet. <Link to='../browse-jobs'>Browse jobs</Link>.
          </p>
        ) : (
          appliedJobs.map((item) => (
            <div className='applied-item' key={item.applicationId}>
              <span>
                {item.job?.position} — {item.job?.company}
              </span>
              <span className='stage'>{item.stage}</span>
            </div>
          ))
        )}
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
              <span>{iv.job?.position} — {iv.job?.company}</span>
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
export default CandidateDashboard;
