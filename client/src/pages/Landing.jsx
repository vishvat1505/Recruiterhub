import styled from 'styled-components';
import Wrapper from '../assets/wrappers/LandingPage';
import main from '../assets/images/main.svg';
import { Link } from 'react-router-dom';
import { Logo } from '../components';

const Landing = () => {
  return (
    <Wrapper>
      <nav>
        <Logo />
      </nav>
      <div className='container page'>
        <div className='info'>
          <h1>
            recruit<span>hub</span> platform
          </h1>
          <p>
            RecruitHub is an all-in-one recruitment platform. Recruiters post
            jobs and track applicants through every hiring stage, while
            candidates build profiles, upload resumes, apply to roles, and
            follow their progress in real time.
          </p>
          <Link to='/register' className='btn register-link'>
            Register
          </Link>
          <Link to='/login' className='btn '>
            Login / Demo User
          </Link>
        </div>
        <img src={main} alt='recruitment' className='img main-img' />
      </div>
    </Wrapper>
  );
};

export default Landing;
