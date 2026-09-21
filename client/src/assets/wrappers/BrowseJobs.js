import styled from 'styled-components';

const Wrapper = styled.section`
  .jobs {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }
  @media (min-width: 992px) {
    .jobs {
      grid-template-columns: 1fr 1fr;
    }
  }
  .job-card {
    background: var(--background-secondary-color);
    border-radius: var(--border-radius);
    padding: 1.5rem 2rem;
    box-shadow: var(--shadow-2);
  }
  .job-card h5 {
    margin-bottom: 0.25rem;
  }
  .job-card .company {
    color: var(--text-secondary-color);
    margin-bottom: 0.5rem;
  }
  .job-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.5rem;
    color: var(--text-secondary-color);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  .apply-btn {
    cursor: pointer;
  }
  .applied {
    color: var(--green-dark);
    font-weight: 600;
  }
  .search-bar {
    margin-bottom: 1rem;
    max-width: 400px;
  }
  .search-form {
    display: flex;
    gap: 0.75rem;
    align-items: center;
    margin: 1rem 0 1.5rem;
    flex-wrap: nowrap;
    width: 100%;
  }
  .search-input {
    position: relative;
    flex: 1 1 auto;
    width: 100%;
  }
  .search-input .search-icon {
    position: absolute;
    top: 50%;
    left: 0.75rem;
    transform: translateY(-50%);
    color: var(--text-secondary-color);
  }
  .search-input .form-input {
    padding-left: 2.25rem;
    width: 100%;
  }
  .search-form > .btn {
    flex-shrink: 0;
  }
  .clear-btn {
    background: var(--grey-300);
    color: var(--text-color);
  }
`;

export default Wrapper;
