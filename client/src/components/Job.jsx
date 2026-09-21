import {
  FaLocationArrow,
  FaBriefcase,
  FaCalendarAlt,
  FaUsers,
} from 'react-icons/fa';
import { Link, Form } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Wrapper from '../assets/wrappers/Job';
import JobInfo from './JobInfo';
import customFetch from '../utils/customFetch';
import { JOB_STATUS } from '../../../utils/constants';
import day from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
day.extend(advancedFormat);

const Job = ({
  _id,
  position,
  company,
  jobLocation,
  jobType,
  createdAt,
  jobStatus,
  applicantCount = 0,
}) => {
  const date = day(createdAt).format('MMM Do, YYYY');
  const queryClient = useQueryClient();
  const [status, setStatus] = useState(jobStatus);
  const [saving, setSaving] = useState(false);

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    const prev = status;
    setStatus(newStatus);
    setSaving(true);
    try {
      await customFetch.patch(`/jobs/${_id}/status`, { jobStatus: newStatus });
      queryClient.invalidateQueries(['jobs']);
      queryClient.invalidateQueries(['recruiter-dashboard']);
      toast.success(`Job marked "${newStatus}"`);
    } catch (error) {
      setStatus(prev);
      toast.error(error?.response?.data?.msg || 'Could not update status');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Wrapper>
      <header>
        <div className='main-icon'>{company.charAt(0)}</div>
        <div className='info'>
          <h5>{position}</h5>
          <p>{company}</p>
        </div>
      </header>
      <div className='content'>
        <div className='content-center'>
          <JobInfo icon={<FaLocationArrow />} text={jobLocation} />
          <JobInfo icon={<FaCalendarAlt />} text={date} />
          <JobInfo icon={<FaBriefcase />} text={jobType} />
          <JobInfo
            icon={<FaUsers />}
            text={`${applicantCount} applicant${applicantCount === 1 ? '' : 's'}`}
          />
        </div>
        <footer className='actions'>
          <Link to={`../jobs/${_id}/applicants`} className='btn edit-btn'>
            Applicants
          </Link>
          <Link to={`../edit-job/${_id}`} className='btn edit-btn'>
            Edit
          </Link>
          <Form method='post' action={`../delete-job/${_id}`}>
            <button type='submit' className='btn delete-btn'>
              Delete
            </button>
          </Form>
          <select
            className={`status-select ${status.replace(/\s/g, '-')}`}
            value={status}
            onChange={handleStatusChange}
            disabled={saving}
            aria-label='job status'
          >
            {Object.values(JOB_STATUS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </footer>
      </div>
    </Wrapper>
  );
};
export default Job;
