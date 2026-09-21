import { useQuery } from '@tanstack/react-query';
import { useLoaderData } from 'react-router-dom';
import { FaPercentage } from 'react-icons/fa';
import Wrapper from '../assets/wrappers/DashboardHome';
import {
  StatItem,
  ChartsContainer,
  HiringFunnel,
} from '../components';
import customFetch from '../utils/customFetch';

const analyticsQuery = {
  queryKey: ['recruiter-analytics'],
  queryFn: async () => {
    const { data } = await customFetch.get('/analytics/recruiter');
    return data;
  },
};

export const loader = (queryClient) => async () => {
  try {
    await queryClient.ensureQueryData(analyticsQuery);
    return null;
  } catch (error) {
    return null;
  }
};

const Analytics = () => {
  useLoaderData();
  const { data } = useQuery(analyticsQuery);
  const {
    monthlyApplications = [],
    conversionRate = 0,
    zeroApplications,
    hiringFunnel = [],
    topJobs = [],
  } = data || {};

  return (
    <Wrapper>
      <div className='stats-grid'>
        <StatItem
          title='conversion rate (hired)'
          count={`${conversionRate}%`}
          icon={<FaPercentage />}
          color='#2cb1bc'
          bcg='#d3f3f5'
        />
      </div>

      {zeroApplications && (
        <div className='panel'>
          <p className='muted'>
            No applications yet — conversion rate reflects zero applications.
          </p>
        </div>
      )}

      <div className='panel'>
        <h5>Hiring Funnel</h5>
        <HiringFunnel funnel={hiringFunnel} />
      </div>

      {monthlyApplications.length > 1 && (
        <ChartsContainer data={monthlyApplications} />
      )}

      <div className='panel'>
        <h5>Top Performing Jobs</h5>
        {topJobs.length === 0 ? (
          <p className='muted'>No application data yet.</p>
        ) : (
          topJobs.map((job) => (
            <div className='applied-item' key={job._id}>
              <span>
                {job.position} — {job.company}
              </span>
              <span className='funnel-count'>{job.applications} applicants</span>
            </div>
          ))
        )}
      </div>
    </Wrapper>
  );
};
export default Analytics;
