import * as React from "react";
import styles from "./Calendar.module.scss";

const Calendar = () => {
  const [view, setView] = React.useState("month");
  const [currentDate, setCurrentDate] = React.useState(new Date(2026, 0, 1));

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const events = React.useMemo(
    () => [
      { date: "2026-01-03", label: "ZR_4312L_JOB", tone: "purple" },
      { date: "2026-01-03", label: "Interview 2", tone: "green" },
      { date: "2026-01-07", label: "Interview 4", tone: "orange" },
      { date: "2026-01-09", label: "Interview 1", tone: "blue" },
      { date: "2026-01-09", label: "Interview 2", tone: "red" },
      { date: "2026-01-09", label: "Interview 3", tone: "yellow" },
      { date: "2026-01-13", label: "Interview 1", tone: "purple" },
      { date: "2026-01-17", label: "Interview 1", tone: "gray" },
      { date: "2026-01-17", label: "Interview 2", tone: "purple" },
      { date: "2026-01-19", label: "Interview 1", tone: "red" },
      { date: "2026-01-19", label: "Interview 2", tone: "blue" },
      { date: "2026-01-21", label: "Interview 1", tone: "yellow" },
      { date: "2026-01-21", label: "Interview 2", tone: "green" },
      { date: "2026-01-21", label: "Interview 2", tone: "purple" },
      { date: "2026-01-23", label: "Interview 1", tone: "orange" },
      { date: "2026-01-23", label: "Interview 2", tone: "gray" },
      { date: "2026-01-26", label: "Interview 1", tone: "orange" },
      { date: "2026-01-26", label: "Interview 2", tone: "red" },
      { date: "2026-02-05", label: "Interview 1", tone: "blue" },
      { date: "2026-02-12", label: "Interview 2", tone: "green" },
      { date: "2026-03-04", label: "Interview 1", tone: "purple" },
      { date: "2026-03-14", label: "Interview 3", tone: "yellow" },
      { date: "2026-04-02", label: "ZR_4112_JOB", tone: "purple" },
      { date: "2026-04-19", label: "Interview 2", tone: "red" },
      { date: "2026-05-09", label: "Interview 1", tone: "blue" },
      { date: "2026-06-21", label: "Interview 4", tone: "orange" },
      { date: "2026-07-15", label: "Interview 1", tone: "gray" },
      { date: "2026-08-08", label: "Interview 2", tone: "green" },
      { date: "2026-09-10", label: "Interview 3", tone: "yellow" },
      { date: "2026-10-05", label: "Interview 1", tone: "purple" },
      { date: "2026-11-11", label: "Interview 2", tone: "red" },
      { date: "2026-12-22", label: "Interview 1", tone: "blue" },
    ],
    []
  );

  const eventMap = React.useMemo(() => {
    const map = new Map();
    events.forEach((event) => {
      if (!map.has(event.date)) {
        map.set(event.date, []);
      }
      map.get(event.date).push(event);
    });
    return map;
  }, [events]);

  const formatDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}`;

  const startOfWeek = (date) => {
    const dayIndex = date.getDay() === 0 ? 7 : date.getDay();
    const start = new Date(date);
    start.setDate(date.getDate() - (dayIndex - 1));
    start.setHours(0, 0, 0, 0);
    return start;
  };

  const monthMatrix = React.useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const lastOfMonth = new Date(year, month + 1, 0);
    const start = startOfWeek(firstOfMonth);
    const matrix = [];
    let current = new Date(start);

    for (let week = 0; week < 6; week += 1) {
      const row = [];
      for (let day = 0; day < 7; day += 1) {
        const key = formatDateKey(current);
        row.push({
          date: new Date(current),
          outside: current.getMonth() !== month,
          events: eventMap.get(key) || [],
        });
        current.setDate(current.getDate() + 1);
      }
      matrix.push(row);
      if (current > lastOfMonth && current.getDay() === 1) {
        break;
      }
    }
    return matrix;
  }, [currentDate, eventMap]);

  const weekDays = React.useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        date,
        events: eventMap.get(formatDateKey(date)) || [],
      };
    });
  }, [currentDate, eventMap]);

  const dayEvents = eventMap.get(formatDateKey(currentDate)) || [];

  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(currentDate);

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === "month") {
        next.setMonth(prev.getMonth() - 1);
      } else if (view === "week") {
        next.setDate(prev.getDate() - 7);
      } else {
        next.setDate(prev.getDate() - 1);
      }
      return next;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === "month") {
        next.setMonth(prev.getMonth() + 1);
      } else if (view === "week") {
        next.setDate(prev.getDate() + 7);
      } else {
        next.setDate(prev.getDate() + 1);
      }
      return next;
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.title}>Calendar</h2>
            <div className={styles.breadcrumb}>
              <span>Dashboard</span>
              <span className={styles.separator}>/</span>
              <span className={styles.current}>Calendar</span>
            </div>
          </div>
        </div>

        <div className={styles.calendarCard}>
          <div className={styles.controls}>
            <div className={styles.controlsLeft}>
              <select
                className={styles.modeSelect}
                value={view}
                onChange={(event) => setView(event.target.value)}
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
              </select>
              <button type="button" className={styles.navBtn} aria-label="Previous" onClick={handlePrev}>
                ‹
              </button>
              <button type="button" className={styles.navBtn} aria-label="Next" onClick={handleNext}>
                ›
              </button>
              <span className={styles.monthLabel}>{monthLabel}</span>
            </div>
          </div>

          {view === "month" && (
            <div className={styles.calendarGrid}>
              {days.map((day) => (
                <div key={day} className={styles.dayHeader}>
                  {day}
                </div>
              ))}

              {monthMatrix.map((week, weekIndex) =>
                week.map((cell, cellIndex) => {
                  const dateKey = formatDateKey(cell.date);
                  return (
                    <div
                      key={`${weekIndex}-${cellIndex}`}
                      className={`${styles.dayCell}${cell.outside ? ` ${styles.outside}` : ""}`}
                      onClick={() => setCurrentDate(cell.date)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          setCurrentDate(cell.date);
                        }
                      }}
                    >
                      <div className={styles.dayNumber}>
                        {cell.date.getDate()}
                        {cell.outside && (
                          <span className={styles.daySuffix}>
                            {cell.date.toLocaleString("en-US", { month: "short" })}
                          </span>
                        )}
                      </div>
                      <div className={styles.events}>
                        {(cell.events || []).map((event, eventIndex) => (
                          <span
                            key={`${dateKey}-${eventIndex}`}
                            className={`${styles.eventPill} ${styles[`tone${event.tone}`]}`}
                          >
                            {event.label}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {view === "week" && (
            <div className={styles.weekView}>
              <div className={styles.weekHeader}>
                {days.map((day) => (
                  <div key={day} className={styles.dayHeader}>
                    {day}
                  </div>
                ))}
              </div>
              <div className={styles.weekRow}>
                {weekDays.map((cell) => (
                  <div key={formatDateKey(cell.date)} className={styles.dayCell}>
                    <div className={styles.dayNumber}>
                      {cell.date.getDate()}
                      <span className={styles.daySuffix}>
                        {cell.date.toLocaleString("en-US", { month: "short" })}
                      </span>
                    </div>
                    <div className={styles.events}>
                      {cell.events.map((event, eventIndex) => (
                        <span
                          key={`${formatDateKey(cell.date)}-${eventIndex}`}
                          className={`${styles.eventPill} ${styles[`tone${event.tone}`]}`}
                        >
                          {event.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "day" && (
            <div className={styles.dayView}>
              <div className={styles.dayTitle}>
                {currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {dayEvents.length === 0 ? (
                <div className={styles.noEvents}>No events scheduled.</div>
              ) : (
                <div className={styles.dayEvents}>
                  {dayEvents.map((event, index) => (
                    <div key={`${formatDateKey(currentDate)}-${index}`} className={styles.dayEventRow}>
                      <span className={`${styles.eventDot} ${styles[`tone${event.tone}`]}`} />
                      <span className={styles.dayEventLabel}>{event.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
