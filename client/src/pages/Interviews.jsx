import { useLoaderData, useOutletContext } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-toastify';
import day from 'dayjs';
import Wrapper from '../assets/wrappers/ApplicationsList';
import customFetch from '../utils/customFetch';

export const loader = (queryClient) => async () => {
  try {
    const { data } = await customFetch.get('/interviews/upcoming');
    return data;
  } catch (error) {
    toast.error('Unable to load interviews');
    return { interviews: [] };
  }
};

const RecruiterInterviewCard = ({ interview }) => {
  const [feedback, setFeedback] = useState(interview.feedback || '');
  const [notes, setNotes] = useState(interview.notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await customFetch.patch(`/interviews/${interview._id}`, {
        notes,
        feedback,
      });
      toast.success('Interview notes saved');
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className='app-card' style={{ display: 'block' }}>
      <div className='app-info'>
        <h5>
          {interview.candidate?.name} — {interview.job?.position}
        </h5>
        <p>
          {day(interview.scheduledAt).format('MMM D, YYYY h:mm A')} ·{' '}
          interviewer: {interview.interviewerName || 'TBD'}
        </p>
      </div>
      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
        <textarea
          className='form-input'
          rows='2'
          placeholder='notes'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <textarea
          className='form-input'
          rows='2'
          placeholder='feedback'
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
        <button
          type='button'
          className='btn'
          style={{ width: 'fit-content' }}
          disabled={saving}
          onClick={save}
        >
          {saving ? 'saving...' : 'Save notes'}
        </button>
      </div>
    </article>
  );
};

const Interviews = () => {
  const { interviews } = useLoaderData();
  const { user } = useOutletContext();
  const isRecruiter = user?.role !== 'candidate';

  return (
    <Wrapper>
      <h4>Upcoming Interviews ({interviews.length})</h4>
      {interviews.length === 0 ? (
        <p>No upcoming interviews.</p>
      ) : (
        <div className='app-list'>
          {interviews.map((iv) =>
            isRecruiter ? (
              <RecruiterInterviewCard key={iv._id} interview={iv} />
            ) : (
              <article key={iv._id} className='app-card'>
                <div className='app-info'>
                  <h5>{iv.job?.position}</h5>
                  <p>
                    {iv.job?.company} · interviewer:{' '}
                    {iv.interviewerName || 'TBD'}
                  </p>
                </div>
                <span className='muted'>
                  {day(iv.scheduledAt).format('MMM D, YYYY h:mm A')}
                </span>
              </article>
            )
          )}
        </div>
      )}
    </Wrapper>
  );
};
export default Interviews;
