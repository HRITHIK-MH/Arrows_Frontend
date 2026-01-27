import React from 'react';
import ProgressBar from '../../components/ProgressBar';
import StepProgressBar from '../../components/StepProgressBar';
import styles from './JobProgressExample.module.scss';

/**
 * Example Integration: Job Opening Progress Tracking
 * Shows how to use progress bars in a real job opening card
 */
const JobProgressExample = () => {
  // Sample job data
  const jobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Engineering',
      viewsTarget: 2000,
      currentViews: 1450,
      applicationsTarget: 100,
      currentApplications: 67,
      hiringStage: 2,
      urgency: 'high'
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      viewsTarget: 1500,
      currentViews: 890,
      applicationsTarget: 50,
      currentApplications: 23,
      hiringStage: 1,
      urgency: 'medium'
    },
    {
      id: 3,
      title: 'UI/UX Designer',
      department: 'Design',
      viewsTarget: 1000,
      currentViews: 1200,
      applicationsTarget: 40,
      currentApplications: 48,
      hiringStage: 3,
      urgency: 'low'
    }
  ];

  const hiringSteps = [
    { label: 'Posted' },
    { label: 'Screening' },
    { label: 'Interviews' },
    { label: 'Offers' },
    { label: 'Hired' }
  ];

  const getProgressColor = (percentage) => {
    if (percentage >= 75) return 'green';
    if (percentage >= 50) return 'blue';
    if (percentage >= 25) return 'orange';
    return 'red';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Job Opening Progress Tracking</h1>
        <p>Integration example showing progress bars in job cards</p>
      </div>

      <div className={styles.jobGrid}>
        {jobs.map(job => {
          const viewsProgress = Math.min((job.currentViews / job.viewsTarget) * 100, 100);
          const applicationsProgress = (job.currentApplications / job.applicationsTarget) * 100;
          
          return (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h3>{job.title}</h3>
                  <span className={styles.department}>{job.department}</span>
                </div>
                <span className={`${styles.urgencyBadge} ${styles[job.urgency]}`}>
                  {job.urgency.toUpperCase()}
                </span>
              </div>

              <div className={styles.progressSection}>
                <div className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <span className={styles.label}>Views</span>
                    <span className={styles.stats}>
                      {job.currentViews.toLocaleString()} / {job.viewsTarget.toLocaleString()}
                    </span>
                  </div>
                  <ProgressBar
                    percentage={viewsProgress}
                    color={getProgressColor(viewsProgress)}
                    showPercentage={true}
                    height={15}
                  />
                </div>

                <div className={styles.progressItem}>
                  <div className={styles.progressHeader}>
                    <span className={styles.label}>Applications</span>
                    <span className={styles.stats}>
                      {job.currentApplications} / {job.applicationsTarget}
                    </span>
                  </div>
                  <ProgressBar
                    percentage={applicationsProgress}
                    color={getProgressColor(applicationsProgress)}
                    showPercentage={true}
                    animate={applicationsProgress < 100}
                    height={15}
                  />
                </div>
              </div>

              <div className={styles.hiringPipeline}>
                <h4>Hiring Pipeline</h4>
                <StepProgressBar
                  steps={hiringSteps}
                  currentStep={job.hiringStage}
                  showLabels={false}
                />
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.detailsBtn}>View Details</button>
                <button className={styles.candidatesBtn}>
                  {job.currentApplications} Candidates
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Pipeline Example */}
      <div className={styles.pipelineExample}>
        <h2>Detailed Recruitment Pipeline</h2>
        <div className={styles.pipelineCard}>
          <div className={styles.pipelineHeader}>
            <h3>Senior React Developer - Candidate: John Doe</h3>
            <span className={styles.status}>In Progress</span>
          </div>
          
          <StepProgressBar
            steps={[
              { label: 'Application Received' },
              { label: 'Resume Screening' },
              { label: 'Phone Interview' },
              { label: 'Technical Assessment' },
              { label: 'Panel Interview' },
              { label: 'Final Review' },
              { label: 'Offer Extended' }
            ]}
            currentStep={3}
            showLabels={true}
          />

          <div className={styles.pipelineDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Days in Pipeline:</span>
              <span className={styles.detailValue}>14 days</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Next Action:</span>
              <span className={styles.detailValue}>Schedule Panel Interview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Code Example */}
      <div className={styles.codeExample}>
        <h2>Integration Code</h2>
        <pre className={styles.codeBlock}>
{`// In your JobOpenings component
import ProgressBar from '@/components/ProgressBar';

function JobCard({ job }) {
  const viewsProgress = (job.currentViews / job.viewsTarget) * 100;
  
  return (
    <div className="job-card">
      <h3>{job.title}</h3>
      
      <div className="progress-section">
        <span>Views Progress</span>
        <ProgressBar 
          percentage={viewsProgress}
          color={viewsProgress >= 75 ? 'green' : 'orange'}
          showPercentage={true}
        />
      </div>
    </div>
  );
}`}
        </pre>
      </div>
    </div>
  );
};

export default JobProgressExample;
