import { useEffect, useRef, useState } from 'react';
import { FaBell } from 'react-icons/fa';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import day from 'dayjs';
import Wrapper from '../assets/wrappers/NotificationBell';
import customFetch from '../utils/customFetch';
import { getSocket } from '../utils/socket';

const notificationsQuery = {
  queryKey: ['notifications'],
  queryFn: async () => {
    const { data } = await customFetch.get('/notifications');
    return data;
  },
};

const NotificationBell = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { data } = useQuery(notificationsQuery);

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  // Close the dropdown when clicking/tapping anywhere outside of it.
  useEffect(() => {
    if (!open) return;

    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  // Connect to the realtime channel and refresh on incoming notifications.
  useEffect(() => {
    const socket = getSocket();

    const handleNotification = (payload) => {
      toast.info(payload.message);
      queryClient.invalidateQueries(['notifications']);
      // Dashboards may show counts that change on new events
      queryClient.invalidateQueries(['recruiter-dashboard']);
      queryClient.invalidateQueries(['candidate-dashboard']);
    };

    socket.on('notification', handleNotification);
    return () => {
      socket.off('notification', handleNotification);
    };
  }, [queryClient]);

  const markAllRead = async () => {
    try {
      await customFetch.patch('/notifications/read-all');
      queryClient.invalidateQueries(['notifications']);
    } catch (error) {
      toast.error('Could not update notifications');
    }
  };

  const handleItemClick = async (id) => {
    try {
      await customFetch.patch(`/notifications/${id}/read`);
      queryClient.invalidateQueries(['notifications']);
    } catch (error) {
      // non-blocking
    }
  };

  return (
    <Wrapper ref={containerRef}>
      <button
        type='button'
        className='bell-btn'
        onClick={() => setOpen(!open)}
        aria-label='notifications'
      >
        <FaBell />
        {unreadCount > 0 && <span className='badge'>{unreadCount}</span>}
      </button>
      {open && (
        <div className='dropdown'>
          <div className='dropdown-header'>
            <h5>Notifications</h5>
            {unreadCount > 0 && (
              <button type='button' className='mark-all' onClick={markAllRead}>
                mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className='empty'>No notifications yet</p>
          ) : (
            notifications.map((n) => (
              <div
                key={n._id}
                className={`notif-item ${n.read ? '' : 'unread'}`}
                onClick={() => handleItemClick(n._id)}
              >
                {n.message}
                <span className='time'>
                  {day(n.createdAt).format('MMM D, h:mm A')}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </Wrapper>
  );
};
export default NotificationBell;
