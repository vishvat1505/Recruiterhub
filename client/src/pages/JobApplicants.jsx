import { useLoaderData, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Wrapper from '../assets/wrappers/JobApplicants';
import customFetch from '../utils/customFetch';
import { APPLICATION_STAGE } from '../../../utils/constants';

const STAGES = Object.values(APPLICATION_STAGE);
// Recruiters can move applicants through every stage except "hired" —
// a candidate only becomes hired by accepting the offer themselves.
const RECRUITER_STAGES = STAGES.filter((s) => s !== APPLICATION_STAGE.HIRED);

export const loader =
  (queryClient) =>
  async ({ params }) => {
    try {
      const { data } = await customFetch.get(`/applications/job/${params.id}`);
      return data;
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Unable to load applicants');
      return { applicants: [] };
    }
  };

const ApplicantCard = ({ applicant, onChanged }) => {
  const [stage, setStage] = useState(applicant.stage);
  const [scheduledAt, setScheduledAt] = useState('');
  const [interviewerName, setInterviewerName] = useState('');
  const [saving, setSaving] = useState(false);

  const changeStage = async (newStage) => {
    setStage(newStage);
    try {
      await customFetch.patch(`/applications/${applicant._id}/stage`, {
        stage: newStage,
      });
      toast.success(`Moved to "${newStage}"`);
      onChanged();
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Could not update stage');
      setStage(applicant.stage);
    }
  };

  const scheduleInterview = async () => {
    if (!scheduledAt || !interviewerName) {
      toast.error('Interview date and interviewer name are required');
      return;
    }
    setSaving(true);
    try {
      await customFetch.post('/interviews', {
        application: applicant._id,
        scheduledAt,
        interviewerName,
      });
      toast.success('Interview scheduled');
      setScheduledAt('');
      setInterviewerName('');
      onChanged();
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Could not schedule');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className='applicant-card'>
      <div className='applicant-top'>
        <div>
          <h5>{applicant.candidate?.name}</h5>
          <p>{applicant.candidate?.email}</p>
        </div>
        {applicant.resumeUrl && (
          <a
            href={applicant.resumeUrl}
            target='_blank'
            rel='noreferrer'
            className='resume-link'
          >
            view resume
          </a>
        )}
      </div>

      <div className='controls'>
        <div className='control-group'>
          <label>stage</label>
          {applicant.stage === 'hired' ? (
            <span className='hired-badge'>hired (accepted by candidate)</span>
          ) : (
            <select value={stage} onChange={(e) => changeStage(e.target.value)}>
              {RECRUITER_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className='control-group'>
          <label>interview date/time</label>
          <input
            type='datetime-local'
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>

        <div className='control-group'>
          <label>interviewer</label>
          <input
            type='text'
            value={interviewerName}
            onChange={(e) => setInterviewerName(e.target.value)}
            placeholder='name'
          />
        </div>

        <button
          type='button'
          className='btn btn-sm'
          disabled={saving}
          onClick={scheduleInterview}
        >
          {saving ? 'scheduling...' : 'Schedule Interview'}
        </button>
      </div>
    </article>
  );
};

const JobApplicants = () => {
  const initial = useLoaderData();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [applicants, setApplicants] = useState(initial.applicants);

  const refresh = async () => {
    const { data } = await customFetch.get(`/applications/job/${id}`);
    setApplicants(data.applicants);
    queryClient.invalidateQueries(['recruiter-dashboard']);
  };

  const visible =
    filter === 'all'
      ? applicants
      : applicants.filter((a) => a.stage === filter);

  return (
    <Wrapper>
      <h4>Applicants ({applicants.length})</h4>

      <div className='filter-bar control-group'>
        <label>filter by stage</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value='all'>all</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <p>No applicants in this view.</p>
      ) : (
        <div className='applicant-list'>
          {visible.map((applicant) => (
            <ApplicantCard
              key={applicant._id}
              applicant={applicant}
              onChanged={refresh}
            />
          ))}
        </div>
      )}
    </Wrapper>
  );
};
export default JobApplicants;
