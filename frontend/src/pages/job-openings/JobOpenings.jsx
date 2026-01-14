

import * as React from "react";
import styles from "./JobOpenings.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { jobOpeningConfig } from "../../components/forms/formConfigs";


export default function JobOpenings() {
  const [showJobOpeningForm, setShowJobOpeningForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState([]);

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
    // Here you would typically send the data to your backend API
    alert('Job opening created successfully!');
  };

  return (
    <div className={styles.card}>
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
                {submittedData.length > 0 && (
                  <button className="button" data-icon="view" onClick={handleViewData}>
                    View Job Openings
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

        {showDataTable && submittedData.length > 0 && (
          <div style={{ marginTop: '30px' }}>
            <h2>Job Openings Data</h2>
            <DataTable data={submittedData} columns={jobOpeningConfig.columns} />
          </div>
        )}
    </div>
  );
}
 

