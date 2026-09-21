import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import day from 'dayjs';
import Wrapper from '../assets/wrappers/ApplicationsList';
import customFetch from '../utils/customFetch';

const myApplicationsQuery = {
  queryKey: ['my-applications'],
  queryFn: async () => {
    const { data } = await customFetch.get('/applications/me');
    return data;
  },
};

export const loader = (queryClient) => async () => {
  return await queryClient.ensureQueryData(myApplicationsQuery);
};

const MyApplications = () => {
  const initial = useLoaderData();
  const queryClient = useQueryClient();
  const [applications, setApplications] = useState(initial.applications);

  const handleWithdraw = async (id) => {
    try {
      await customFetch.delete(`/applications/${id}`);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      queryClient.invalidateQueries(['my-applications']);
      queryClient.invalidateQueries(['candidate-dashboard']);
      toast.success('Application withdrawn');
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Could not withdraw');
    }
  };

  const handleAccept = async (id) => {
    const confirmed = window.confirm(
      'Accept this offer? Your other active applications will be automatically declined.'
    );
    if (!confirmed) return;
    try {
      const { data } = await customFetch.patch(`/applications/${id}/accept`);
      queryClient.invalidateQueries(['my-applications']);
      queryClient.invalidateQueries(['candidate-dashboard']);
      // Reflect the new stages locally
      setApplications((prev) =>
        prev.map((a) => {
          if (a._id === id) return { ...a, stage: 'hired' };
          if (a.stage !== 'rejected') return { ...a, stage: 'rejected' };
          return a;
        })
      );
      toast.success(
        data.autoDeclined > 0
          ? `Offer accepted. ${data.autoDeclined} other application(s) auto-declined.`
          : 'Offer accepted!'
      );
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Could not accept offer');
    }
  };

  return (
    <Wrapper>
      <h4>My Applications ({applications.length})</h4>
      {applications.length === 0 ? (
        <p>You have not applied to any jobs yet.</p>
      ) : (
        <div className='app-list'>
          {applications.map((app) => (
            <article key={app._id} className='app-card'>
              <div className='app-info'>
                <h5>{app.job?.position || 'Job removed'}</h5>
                <p>
                  {app.job?.company} ·{' '}
                  applied {day(app.createdAt).format('MMM D, YYYY')}
                </p>
              </div>
              <div className='actions'>
                <span className={`stage ${app.stage.replace(/\s/g, '-')}`}>
                  {app.stage}
                </span>
                {app.stage === 'offered' && (
                  <button
                    type='button'
                    className='btn accept-btn'
                    onClick={() => handleAccept(app._id)}
                  >
                    Accept Offer
                  </button>
                )}
                <button
                  type='button'
                  className='btn withdraw-btn'
                  onClick={() => handleWithdraw(app._id)}
                >
                  Withdraw
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Wrapper>
  );
};
export default MyApplications;
