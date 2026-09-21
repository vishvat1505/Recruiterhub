import { useLoaderData, Form, useNavigation } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { FaLocationArrow, FaBriefcase, FaSearch } from 'react-icons/fa';
import Wrapper from '../assets/wrappers/BrowseJobs';
import customFetch from '../utils/customFetch';

const openJobsQuery = (search) => ({
  queryKey: ['open-jobs', search ?? ''],
  queryFn: async () => {
    const { data } = await customFetch.get('/jobs/open', {
      params: search ? { search } : {},
    });
    return data;
  },
});

export const loader =
  (queryClient) =>
  async ({ request }) => {
    const params = Object.fromEntries([
      ...new URL(request.url).searchParams.entries(),
    ]);
    const data = await queryClient.ensureQueryData(openJobsQuery(params.search));
    // Fetch the candidate's existing applications to disable duplicates
    const { data: appData } = await customFetch.get('/applications/me');
    const appliedJobIds = appData.applications
      .map((a) => a.job?._id)
      .filter(Boolean);
    return { jobs: data.jobs, appliedJobIds, search: params.search ?? '' };
  };

const BrowseJobs = () => {
  const { jobs, appliedJobIds, search } = useLoaderData();
  const queryClient = useQueryClient();
  const navigation = useNavigation();
  const isSearching = navigation.state === 'loading';
  const [applied, setApplied] = useState(appliedJobIds);
  const [busyId, setBusyId] = useState(null);

  const handleApply = async (jobId) => {
    setBusyId(jobId);
    try {
      await customFetch.post('/applications', { job: jobId });
      setApplied((prev) => [...prev, jobId]);
      queryClient.invalidateQueries(['my-applications']);
      queryClient.invalidateQueries(['candidate-dashboard']);
      toast.success('Application submitted');
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Could not apply');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Wrapper>
      <h4>Open Positions</h4>

      <Form method='get' className='search-form'>
        <div className='search-input'>
          <FaSearch className='search-icon' />
          <input
            type='text'
            name='search'
            placeholder='Search by position or company...'
            defaultValue={search}
            className='form-input'
          />
        </div>
        <button type='submit' className='btn' disabled={isSearching}>
          {isSearching ? 'searching...' : 'Search'}
        </button>
        {search && (
          <Form method='get'>
            <button type='submit' className='btn clear-btn'>
              Clear
            </button>
          </Form>
        )}
      </Form>

      {jobs.length === 0 ? (
        <p>No open jobs match your search.</p>
      ) : (
        <div className='jobs'>
          {jobs.map((job) => {
            const hasApplied = applied.includes(job._id);
            return (
              <article key={job._id} className='job-card'>
                <h5>{job.position}</h5>
                <p className='company'>{job.company}</p>
                <div className='job-meta'>
                  <span>
                    <FaLocationArrow /> {job.jobLocation}
                  </span>
                  <span>
                    <FaBriefcase /> {job.jobType}
                  </span>
                </div>
                {hasApplied ? (
                  <span className='applied'>✓ Applied</span>
                ) : (
                  <button
                    type='button'
                    className='btn apply-btn'
                    disabled={busyId === job._id}
                    onClick={() => handleApply(job._id)}
                  >
                    {busyId === job._id ? 'applying...' : 'Apply'}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </Wrapper>
  );
};
export default BrowseJobs;
