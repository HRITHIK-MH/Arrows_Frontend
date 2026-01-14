

import { useState, useRef, useEffect } from 'react';
import bellIconUrl from '../../assets/icons/bell.svg'; // ← adjust the relative path to your file
import './notification.scss'; // import the SCSS (global)


export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(3);
  const ref = useRef(null);


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
        <img className="icon" src={bellIconUrl} alt="" aria-hidden />
        {unread > 0 && (
          <span className="notifBadge" aria-label={`${unread} unread notifications`}>
            {unread}
          </span>
        )}
      </button>


      {/* Optional dropdown */}
      {open && (
        <ul className="notifMenu" role="menu" aria-label="Notifications">
          <li className="notifItem" role="menuitem">
            <span className="notifDot" aria-hidden></span>
            New comment on your post
          </li>
          <li className="notifItem" role="menuitem">
            <span className="notifDot" aria-hidden></span>
            Build finished successfully
          </li>
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



