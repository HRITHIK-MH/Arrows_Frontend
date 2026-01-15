

import * as React from "react";
import styles from "./JobOpenings.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { jobOpeningConfig } from "../../components/forms/formConfigs";


export default function JobOpenings() {
  const [showJobOpeningForm, setShowJobOpeningForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);

  const handleCreateJobOpening = () => {
    setShowJobOpeningForm(true);
    setShowDataTable(false);
  };

  const handleViewData = () => {
    setShowDataTable(true);
    setShowJobOpeningForm(false);
  };

  const handleJobOpeningSubmit = (data) => {
    console.log('Job opening created:', data);
    setSubmittedData(prev => [...prev, data]);
    setShowJobOpeningForm(false);
    setShowDataTable(true);
    setShowSuccessMessage(true);
    // Auto-hide success message after 3 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
    // Here you would typically send the data to your backend API
  };

  return (
    <div className={styles.card}>
        {showSuccessMessage && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            fontSize: '14px'
          }}>
            ✓ Job opening created successfully
          </div>
        )}
        <div className="row">
            <div className="col-8">
                {!showJobOpeningForm && (
                    <p className={styles.p}>
                        View and manage all applicants with key details like experience, education, and current company Track their progress through stages such as Added, Sourced, Pre-screening, and Assessment.
                    </p>
                )}
             </div>
            <div className="col-4" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                {!showJobOpeningForm && (
                  <button className="button" data-icon="add-circle" onClick={handleCreateJobOpening}>
                    Create Job Opening
                  </button>
                )}
            </div>
        </div>

        {showJobOpeningForm && (
          <div style={{ marginTop: '30px' }}>
            <ReusableForm
              config={jobOpeningConfig}
              onSubmit={handleJobOpeningSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div style={{ marginTop: '30px' }}>
            <h2>Job Openings Data</h2>
            <DataTable data={submittedData} columns={jobOpeningConfig.columns} />
          </div>
        )}
    </div>
  );
}
 

