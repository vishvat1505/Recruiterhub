import styled from 'styled-components';

const Wrapper = styled.section`
  .applicant-list {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }
  .applicant-card {
    background: var(--background-secondary-color);
    border-radius: var(--border-radius);
    padding: 1.25rem 1.5rem;
    box-shadow: var(--shadow-1);
  }
  .applicant-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .applicant-top h5 {
    margin-bottom: 0.25rem;
  }
  .applicant-top p {
    margin: 0;
    color: var(--text-secondary-color);
    font-size: 0.9rem;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    align-items: flex-end;
    margin-top: 1rem;
  }
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  .control-group label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing);
    color: var(--text-secondary-color);
  }
  .control-group select,
  .control-group input {
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--grey-200);
    border-radius: var(--border-radius);
    background: var(--background-color);
    color: var(--text-color);
  }
  .resume-link {
    color: var(--primary-500);
    font-size: 0.85rem;
  }
  .hired-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    background: #d1fae5;
    color: #065f46;
    border-radius: var(--border-radius);
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: capitalize;
  }
  .btn-sm {
    padding: 0.375rem 0.75rem;
    cursor: pointer;
  }
  .filter-bar {
    margin: 1rem 0;
    max-width: 250px;
  }
`;

export default Wrapper;
