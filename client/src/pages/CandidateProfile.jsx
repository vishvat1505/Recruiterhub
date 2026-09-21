import { Form, redirect, useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import Wrapper from '../assets/wrappers/DashboardFormPage';
import { FormRow, SubmitBtn } from '../components';
import customFetch from '../utils/customFetch';
import { toast } from 'react-toastify';

const profileQuery = {
  queryKey: ['candidate-profile'],
  queryFn: async () => {
    const { data } = await customFetch.get('/profiles/me');
    return data;
  },
};

export const loader = (queryClient) => async () => {
  try {
    return await queryClient.ensureQueryData(profileQuery);
  } catch (error) {
    toast.error(error?.response?.data?.msg || 'Unable to load profile');
    return redirect('/dashboard');
  }
};

export const action =
  (queryClient) =>
  async ({ request }) => {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Convert comma-separated inputs into the arrays the API expects
    data.skills = data.skills
      ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    data.portfolioLinks = data.portfolioLinks
      ? data.portfolioLinks.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    try {
      await customFetch.patch('/profiles/me', data);
      queryClient.invalidateQueries(['candidate-profile']);
      queryClient.invalidateQueries(['candidate-dashboard']);
      toast.success('Profile updated');
      return null;
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Update failed');
      return error;
    }
  };

const CandidateProfile = () => {
  const { profile, completion } = useLoaderData();
  const [uploading, setUploading] = useState(false);
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Resume must be a PDF file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5 MB');
      return;
    }
    const formData = new FormData();
    formData.append('resume', file);
    setUploading(true);
    try {
      const { data } = await customFetch.post('/profiles/me/resume', formData);
      setResumeUrl(data.resumeUrl);
      toast.success('Resume uploaded');
    } catch (error) {
      toast.error(error?.response?.data?.msg || 'Resume upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Wrapper>
      <Form method='post' className='form'>
        <h4 className='form-title'>
          my profile — {completion}% complete
        </h4>
        <div className='form-center'>
          <FormRow type='text' name='name' defaultValue={profile.name} />
          <FormRow type='email' name='email' defaultValue={profile.email} />
          <FormRow type='text' name='phone' defaultValue={profile.phone} />
          <FormRow
            type='text'
            name='education'
            defaultValue={profile.education}
          />
          <FormRow
            type='text'
            name='experience'
            defaultValue={profile.experience}
          />
          <FormRow
            type='text'
            name='skills'
            labelText='skills (comma separated)'
            defaultValue={profile.skills?.join(', ')}
          />
          <FormRow
            type='text'
            name='portfolioLinks'
            labelText='portfolio links (comma separated)'
            defaultValue={profile.portfolioLinks?.join(', ')}
          />

          <div className='form-row'>
            <label htmlFor='resume' className='form-label'>
              Resume (PDF, max 5 MB)
            </label>
            <input
              type='file'
              id='resume'
              name='resume'
              className='form-input'
              accept='application/pdf'
              onChange={handleResumeUpload}
            />
            {uploading && <small>uploading...</small>}
            {resumeUrl && !uploading && (
              <a
                href={resumeUrl}
                target='_blank'
                rel='noreferrer'
                className='member-btn'
              >
                view current resume
              </a>
            )}
          </div>

          <SubmitBtn formBtn />
        </div>
      </Form>
    </Wrapper>
  );
};
export default CandidateProfile;
