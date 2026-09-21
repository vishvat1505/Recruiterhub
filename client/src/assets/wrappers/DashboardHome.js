import styled from 'styled-components';

const Wrapper = styled.section`
  .stats-grid {
    display: grid;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  .panel {
    background: var(--background-secondary-color);
    border-radius: var(--border-radius);
    padding: 1.5rem 2rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-1);
  }
  .panel h5 {
    margin-bottom: 1rem;
  }
  .panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }
  .panel-head h5 {
    margin-bottom: 0;
  }
  .see-all {
    color: var(--primary-500);
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: var(--letter-spacing);
  }
  .stat-link {
    text-decoration: none;
    color: inherit;
    display: block;
  }
  .interview-link {
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }
  .interview-link:hover {
    background: var(--grey-50);
  }
  .funnel-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.5rem;
  }
  .funnel-label {
    width: 160px;
    text-transform: capitalize;
    font-size: 0.9rem;
  }
  .funnel-bar {
    height: 18px;
    background: var(--primary-500);
    border-radius: var(--border-radius);
    min-width: 2px;
    transition: width 0.3s ease;
  }
  .funnel-count {
    font-weight: 600;
  }
  .interview-item,
  .applied-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--grey-100);
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .muted {
    color: var(--text-secondary-color);
  }
  .stage {
    text-transform: capitalize;
    font-weight: 600;
    font-size: 0.85rem;
  }
  .completion {
    font-size: 0.9rem;
  }
`;

export default Wrapper;
