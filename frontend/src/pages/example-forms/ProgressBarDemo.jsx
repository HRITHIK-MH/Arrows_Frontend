import React from 'react';
import ProgressBar from '../../components/ProgressBar';
import StepProgressBar from '../../components/StepProgressBar';
import styles from './ProgressBarDemo.module.scss';

/**
 * Progress Bar Demo Page
 * Demonstrates all progress bar styles and variations
 */
const ProgressBarDemo = () => {
  const [percentage1, setPercentage1] = React.useState(25);
  const [percentage2, setPercentage2] = React.useState(50);
  const [percentage3, setPercentage3] = React.useState(75);
  const [percentage4, setPercentage4] = React.useState(90);
  const [currentStep, setCurrentStep] = React.useState(1);

  const recruitmentSteps = [
    { label: 'Application' },
    { label: 'Screening' },
    { label: 'Interview' },
    { label: 'Assessment' },
    { label: 'Offer' }
  ];

  const jobPostingSteps = [
    { label: 'Create Job' },
    { label: 'Review' },
    { label: 'Approve' },
    { label: 'Published' }
  ];

  const handleStepNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, recruitmentSteps.length - 1));
  };

  const handleStepPrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className={styles.demoPage}>
      <div className={styles.header}>
        <h1>Progress Bar Components</h1>
        <p>Based on CSS Tricks CSS3 Progress Bars</p>
      </div>

      {/* Basic Progress Bars */}
      <section className={styles.section}>
        <h2>Basic Progress Bars</h2>
        <div className={styles.demoGroup}>
          <div className={styles.demoItem}>
            <label>Green (Default) - {percentage1}%</label>
            <ProgressBar percentage={percentage1} color="green" />
            <input
              type="range"
              min="0"
              max="100"
              value={percentage1}
              onChange={(e) => setPercentage1(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.demoItem}>
            <label>Orange - {percentage2}%</label>
            <ProgressBar percentage={percentage2} color="orange" />
            <input
              type="range"
              min="0"
              max="100"
              value={percentage2}
              onChange={(e) => setPercentage2(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.demoItem}>
            <label>Red - {percentage3}%</label>
            <ProgressBar percentage={percentage3} color="red" />
            <input
              type="range"
              min="0"
              max="100"
              value={percentage3}
              onChange={(e) => setPercentage3(Number(e.target.value))}
              className={styles.slider}
            />
          </div>

          <div className={styles.demoItem}>
            <label>Blue - {percentage4}%</label>
            <ProgressBar percentage={percentage4} color="blue" />
            <input
              type="range"
              min="0"
              max="100"
              value={percentage4}
              onChange={(e) => setPercentage4(Number(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>
      </section>

      {/* Animated Stripes */}
      <section className={styles.section}>
        <h2>Animated Candy Stripes</h2>
        <div className={styles.demoGroup}>
          <div className={styles.demoItem}>
            <label>Green with Animation</label>
            <ProgressBar percentage={60} color="green" animate />
          </div>

          <div className={styles.demoItem}>
            <label>Orange with Animation</label>
            <ProgressBar percentage={45} color="orange" animate />
          </div>

          <div className={styles.demoItem}>
            <label>Red with Animation</label>
            <ProgressBar percentage={30} color="red" animate />
          </div>

          <div className={styles.demoItem}>
            <label>Blue with Animation</label>
            <ProgressBar percentage={75} color="blue" animate />
          </div>
        </div>
      </section>

      {/* With Percentage Display */}
      <section className={styles.section}>
        <h2>With Percentage Display</h2>
        <div className={styles.demoGroup}>
          <div className={styles.demoItem}>
            <ProgressBar percentage={85} color="green" showPercentage />
          </div>
          <div className={styles.demoItem}>
            <ProgressBar percentage={65} color="orange" showPercentage />
          </div>
          <div className={styles.demoItem}>
            <ProgressBar percentage={40} color="red" showPercentage />
          </div>
          <div className={styles.demoItem}>
            <ProgressBar percentage={95} color="blue" showPercentage animate />
          </div>
        </div>
      </section>

      {/* Different Sizes */}
      <section className={styles.section}>
        <h2>Different Heights</h2>
        <div className={styles.demoGroup}>
          <div className={styles.demoItem}>
            <label>Small (15px)</label>
            <ProgressBar percentage={70} color="green" height={15} />
          </div>
          <div className={styles.demoItem}>
            <label>Default (20px)</label>
            <ProgressBar percentage={70} color="orange" height={20} />
          </div>
          <div className={styles.demoItem}>
            <label>Large (30px)</label>
            <ProgressBar percentage={70} color="blue" height={30} />
          </div>
        </div>
      </section>

      {/* Step Progress Bar - Horizontal */}
      <section className={styles.section}>
        <h2>Step Progress Bar - Recruitment Pipeline</h2>
        <div className={styles.stepDemo}>
          <StepProgressBar 
            steps={recruitmentSteps} 
            currentStep={currentStep}
          />
          <div className={styles.stepControls}>
            <button onClick={handleStepPrev} disabled={currentStep === 0}>
              Previous Step
            </button>
            <button onClick={handleStepNext} disabled={currentStep === recruitmentSteps.length - 1}>
              Next Step
            </button>
          </div>
        </div>
      </section>

      {/* Step Progress Bar - Vertical */}
      <section className={styles.section}>
        <h2>Step Progress Bar - Vertical Layout</h2>
        <div className={styles.verticalDemo}>
          <div className={styles.verticalLeft}>
            <StepProgressBar 
              steps={jobPostingSteps} 
              currentStep={2}
              orientation="vertical"
            />
          </div>
          <div className={styles.verticalRight}>
            <h3>Job Posting Workflow</h3>
            <p>This vertical progress bar is perfect for sidebar workflows or multi-step forms.</p>
            <ul>
              <li>✓ Create Job - Complete</li>
              <li>✓ Review - Complete</li>
              <li>→ Approve - In Progress</li>
              <li>⚬ Published - Pending</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Real-world Examples */}
      <section className={styles.section}>
        <h2>Real-world Usage Examples</h2>
        
        <div className={styles.exampleCard}>
          <h3>Candidate Application Progress</h3>
          <div className={styles.exampleContent}>
            <div className={styles.exampleRow}>
              <span>Profile Completion</span>
              <ProgressBar percentage={80} color="blue" showPercentage />
            </div>
            <div className={styles.exampleRow}>
              <span>Document Upload</span>
              <ProgressBar percentage={100} color="green" showPercentage />
            </div>
            <div className={styles.exampleRow}>
              <span>Assessment</span>
              <ProgressBar percentage={45} color="orange" showPercentage animate />
            </div>
          </div>
        </div>

        <div className={styles.exampleCard}>
          <h3>Job Posting Analytics</h3>
          <div className={styles.exampleContent}>
            <div className={styles.exampleRow}>
              <span>Views Target (1500/2000)</span>
              <ProgressBar percentage={75} color="green" showPercentage />
            </div>
            <div className={styles.exampleRow}>
              <span>Applications Target (45/100)</span>
              <ProgressBar percentage={45} color="orange" showPercentage />
            </div>
            <div className={styles.exampleRow}>
              <span>Conversion Rate (12%)</span>
              <ProgressBar percentage={12} color="red" showPercentage />
            </div>
          </div>
        </div>
      </section>

      {/* Usage Instructions */}
      <section className={styles.section}>
        <h2>Usage Instructions</h2>
        <div className={styles.codeBlock}>
          <h4>Basic ProgressBar</h4>
          <pre>{`import ProgressBar from '@/components/ProgressBar';

<ProgressBar 
  percentage={75} 
  color="green" 
  animate={false}
  showPercentage={true}
  height={20}
  animationDuration={1200}
/>`}</pre>
        </div>

        <div className={styles.codeBlock}>
          <h4>StepProgressBar</h4>
          <pre>{`import StepProgressBar from '@/components/StepProgressBar';

const steps = [
  { label: 'Application' },
  { label: 'Interview' },
  { label: 'Offer' }
];

<StepProgressBar 
  steps={steps}
  currentStep={1}
  showLabels={true}
  orientation="horizontal"
/>`}</pre>
        </div>
      </section>
    </div>
  );
};

export default ProgressBarDemo;
