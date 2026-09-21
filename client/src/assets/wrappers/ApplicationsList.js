import styled from 'styled-components';

const Wrapper = styled.section`
  .app-list {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
  }
  .app-card {
    background: var(--background-secondary-color);
    border-radius: var(--border-radius);
    padding: 1.25rem 1.5rem;
    box-shadow: var(--shadow-1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .app-info h5 {
    margin-bottom: 0.25rem;
  }
  .app-info p {
    color: var(--text-secondary-color);
    margin: 0;
  }
  .stage {
    text-transform: capitalize;
    padding: 0.25rem 0.75rem;
    border-radius: var(--border-radius);
    background: var(--grey-100);
    color: var(--grey-700);
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .stage.hired,
  .stage.offered {
    background: #d1fae5;
    color: #065f46;
  }
  .stage.rejected {
    background: #fee2e2;
    color: #991b1b;
  }
  .actions {
    display: flex;
    gap: 0.75rem;
    align-items: center;
  }
  .withdraw-btn {
    background: var(--red-light);
    color: var(--red-dark);
    cursor: pointer;
  }
  .accept-btn {
    background: #d1fae5;
    color: #065f46;
    cursor: pointer;
  }
`;

export default Wrapper;
