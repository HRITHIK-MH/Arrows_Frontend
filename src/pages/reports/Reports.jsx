import * as React from "react";
import { FiCalendar } from "react-icons/fi";
import styles from "./Reports.module.scss";

export default function Reports() {
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const [metricsData] = React.useState([]);
  const [chartData] = React.useState([]);

  React.useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const colors = ["#0087BE", "#1A1A1A", "#0066CC", "#FF6B35", "#4CAF50", "#FFC107", "#FF5722", "#9C27B0", "#00BCD4"];

  const getMaxValue = () => {
    return chartData.length ? Math.max(...chartData.map(item => item.value)) : 0;
  };

  return (
    <div className={styles.reportsContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Reports</h1>
      </div>

      {/* Date Range Filter */}
      <div className={styles.dateRangeSection}>
        <div className={styles.dateField}>
          <label className={styles.dateLabel}>From <span className={styles.required}>*</span></label>
          <div className={styles.dateInputWrapper}>
            <FiCalendar className={styles.dateIcon} />
            <input
              type="date"
              className={styles.dateInput}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              placeholder="00/00/0000"
            />
          </div>
        </div>

        <div className={styles.dateField}>
          <label className={styles.dateLabel}>To <span className={styles.required}>*</span></label>
          <div className={styles.dateInputWrapper}>
            <FiCalendar className={styles.dateIcon} />
            <input
              type="date"
              className={styles.dateInput}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              placeholder="00/00/0000"
            />
          </div>
        </div>
      </div>


      {/* Content Area */}
      <div className={styles.contentArea}>
        {loading ? (
          <div className={styles.loadingState}>
            <p>Loading reports...</p>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            {metricsData.length > 0 ? (
              <div className={styles.metricsSection}>
                {metricsData.map((metric, index) => (
                  <div key={index} className={styles.metricCard}>
                    <h3 className={styles.metricLabel}>{metric.label}</h3>
                    <p className={styles.metricValue}>{metric.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Chart Section */}
            <div className={styles.chartSection}>
              <h2 className={styles.chartTitle}>Profile Sourced by Each</h2>

              <div className={styles.chartContainer}>
                {chartData.length === 0 ? (
                  <div className={styles.loadingState}>
                    <p>No report data available.</p>
                  </div>
                ) : chartData.map((item, index) => {
                  const maxValue = getMaxValue();
                  const percentage = (item.value / maxValue) * 100;

                  return (
                    <div key={index} className={styles.chartRow}>
                      <div className={styles.chartLabel}>{item.name}</div>
                      <div className={styles.chartBarWrapper}>
                        <div className={styles.chartBar}>
                          {item.skills.map((skill, skillIndex) => {
                            const skillWidth = (percentage * 0.3) + (skillIndex * 5);
                            return (
                              <div
                                key={skillIndex}
                                className={styles.chartSegment}
                                style={{
                                  width: `${skillWidth}px`,
                                  backgroundColor: colors[skillIndex % colors.length]
                                }}
                                title={skill}
                              />
                            );
                          })}
                          <div
                            className={styles.chartFill}
                            style={{
                              width: `${percentage}%`,
                              backgroundColor: colors[index % colors.length]
                            }}
                          />
                        </div>
                        <span className={styles.chartValue}>{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
