import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;

  .bell-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: var(--text-color);
    display: flex;
    align-items: center;
    position: relative;
  }
  .badge {
    position: absolute;
    top: -6px;
    right: -8px;
    background: var(--red-dark);
    color: var(--white);
    border-radius: 50%;
    font-size: 0.7rem;
    min-width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 4px;
  }
  .dropdown {
    position: absolute;
    top: 130%;
    right: 0;
    width: 320px;
    max-height: 400px;
    overflow-y: auto;
    background: var(--background-secondary-color);
    border: 1px solid var(--grey-100);
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-3);
    z-index: 100;
  }
  .dropdown-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--grey-100);
  }
  .dropdown-header h5 {
    margin: 0;
  }
  .mark-all {
    background: transparent;
    border: none;
    color: var(--primary-500);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .notif-item {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--grey-100);
    cursor: pointer;
    font-size: 0.85rem;
  }
  .notif-item.unread {
    background: var(--grey-50);
    font-weight: 600;
  }
  .notif-item .time {
    display: block;
    color: var(--text-secondary-color);
    font-size: 0.7rem;
    margin-top: 0.25rem;
    font-weight: 400;
  }
  .empty {
    padding: 1.5rem 1rem;
    text-align: center;
    color: var(--text-secondary-color);
  }
`;

export default Wrapper;
