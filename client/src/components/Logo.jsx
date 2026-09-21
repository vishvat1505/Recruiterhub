import styled from 'styled-components';

// Text wordmark used across the app (navbar, sidebar, auth pages, landing).
const Logo = () => {
  return (
    <Wrapper className='logo'>
      Recruit<span>Hub</span>
    </Wrapper>
  );
};

const Wrapper = styled.span`
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--text-color);
  white-space: nowrap;
  span {
    color: var(--primary-500);
  }
`;

export default Logo;
