import { useEffect, useRef, useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import './notification.scss'; // import the SCSS (global)


export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const [items, setItems] = useState([]);
  const ref = useRef(null);
  const { notificationsEnabled } = useTheme();

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/notifications/status', {
          method: 'GET',
        });
        if (!response.ok) {
          throw new Error(`Notifications unavailable (${response.status})`);
        }
        const payload = await response.json().catch(() => []);
        const rows = Array.isArray(payload) ? payload : (Array.isArray(payload?.data) ? payload.data : []);
        setItems(rows);
        const unreadCount = rows.filter((item) => {
          const flag = String(item?.status || item?.state || '').toLowerCase();
          return flag ? flag !== 'read' : true;
        }).length;
        setUnread(unreadCount);
      } catch (error) {
        // Keep lightweight local fallback when API is unavailable.
        setItems([
          { id: 'local-1', message: 'New comment on your post' },
          { id: 'local-2', message: 'Build finished successfully' },
        ]);
      }
    };

    if (notificationsEnabled) {
      loadNotifications();
    }
  }, [notificationsEnabled]);

  // Close menu on outside click / Escape
  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!notificationsEnabled) return null;


  return (
    <div className="notif" ref={ref} aria-expanded={open ? 'true' : 'false'}>
      <button
        type="button"
        className="notifBtn"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(v => !v)}
      >
        <FiBell className="icon" aria-hidden="true" />
        {unread > 0 && (
          <span className="notifBadge" aria-label={`${unread} unread notifications`}>
            {unread}
          </span>
        )}
      </button>


      {/* Optional dropdown */}
      {open && (
        <ul className="notifMenu" role="menu" aria-label="Notifications">
          {items.map((item, index) => (
            <li className="notifItem" role="menuitem" key={item?.id || index}>
              <span className="notifDot" aria-hidden></span>
              {item?.message || item?.title || item?.text || 'Notification'}
            </li>
          ))}
          {!items.length && (
            <li className="notifItem" role="menuitem">
              <span className="notifDot" aria-hidden></span>
              No notifications yet
            </li>
          )}
          <li className="notifFooter" role="presentation">
            <button
              className="notifClear"
              type="button"
              onClick={() => {
                setUnread(0);
                setOpen(false);
              }}
            >
              Clear all
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}


