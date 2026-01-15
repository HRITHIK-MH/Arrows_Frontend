

import * as React from "react";
import styles from "./JobOpenings.module.scss";
import ReusableForm from "../../components/forms/ReusableForm";
import DataTable from "../../components/forms/DataTable";
import { clientConfig } from "../../components/forms/formConfigs";


export default function Clients() {
  const [showClientForm, setShowClientForm] = React.useState(false);
  const [showDataTable, setShowDataTable] = React.useState(true);
  const [submittedData, setSubmittedData] = React.useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterClientIndustry, setFilterClientIndustry] = React.useState('');
  const [filterClientStatus, setFilterClientStatus] = React.useState('');
  const [filterClientLocation, setFilterClientLocation] = React.useState('');

  // Get unique values for filter dropdowns
  const uniqueClientIndustries = [...new Set(submittedData.map(item => item.clientIndustry).filter(Boolean))];
  const uniqueClientStatuses = [...new Set(submittedData.map(item => item.clientStatus).filter(Boolean))];
  const uniqueClientLocations = [...new Set(submittedData.map(item => item.clientLocation).filter(Boolean))];

  // Filter data based on search and filter criteria
  const filteredData = submittedData.filter(item => {
    const matchesSearch = 
      !searchTerm || 
      Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesClientIndustry = !filterClientIndustry || item.clientIndustry === filterClientIndustry;
    const matchesClientStatus = !filterClientStatus || item.clientStatus === filterClientStatus;
    const matchesClientLocation = !filterClientLocation || item.clientLocation === filterClientLocation;

    return matchesSearch && matchesClientIndustry && matchesClientStatus && matchesClientLocation;
  });

  const handleAddClient = () => {
    setShowClientForm(true);
    setShowDataTable(false);
  };

  const handleViewClient = (row, index) => {
    console.log('View client:', row);
    alert('View client: ' + JSON.stringify(row, null, 2));
  };

  const handleEditClient = (row, index) => {
    console.log('Edit client:', row);
    alert('Edit functionality coming soon!');
  };

  const handleDeleteClient = (row, index) => {
    console.log('Delete client:', row);
    if (window.confirm('Are you sure you want to delete this client?')) {
      setSubmittedData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleClientSubmit = (data) => {
    console.log('Client added:', data);
    setSubmittedData(prev => [...prev, data]);
    setShowClientForm(false);
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
            ✓ Client added successfully
          </div>
        )}
        <div className="row">
            <div className="col-8" style={{ marginBottom: '16px' }}>
                {!showClientForm && (
                    <p className={styles.p} style={{ wordWrap: 'break-word' }}>
                        View and manage all clients with key details like company information, location, budget, and industry Track their status as Active, Inactive, Prospect, or Archived.
                    </p>
                )}
             </div>
            <div className="col-4" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {!showClientForm && (
                  <button className="button" data-icon="add-circle" onClick={handleAddClient} style={{ whiteSpace: 'nowrap' }}>
                    Add Client
                  </button>
                )}
            </div>
        </div>

        {showClientForm && (
          <div style={{ marginTop: '30px' }}>
            <ReusableForm
              config={clientConfig}
              onSubmit={handleClientSubmit}
            />
          </div>
        )}

        {showDataTable && (
          <div style={{ marginTop: '30px' }}>
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px',
              alignItems: 'center',
              flexWrap: 'wrap',
              justifyContent: 'space-between'
            }}>
              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  minWidth: '150px',
                  flex: '1 1 150px',
                  fontSize: '14px',
                  maxWidth: '100%'
                }}
              />

              {/* Industry Filter */}
              <select
                value={filterClientIndustry}
                onChange={(e) => setFilterClientIndustry(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  flex: '1 1 140px',
                  minWidth: '140px'
                }}
              >
                <option value="">Industry</option>
                {uniqueClientIndustries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>

              {/* Client Status Filter */}
              <select
                value={filterClientStatus}
                onChange={(e) => setFilterClientStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  flex: '1 1 140px',
                  minWidth: '140px'
                }}
              >
                <option value="">Client Status</option>
                {uniqueClientStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              {/* Client Location Filter */}
              <select
                value={filterClientLocation}
                onChange={(e) => setFilterClientLocation(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  cursor: 'pointer',
                  flex: '1 1 140px',
                  minWidth: '140px'
                }}
              >
                <option value="">Location</option>
                {uniqueClientLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {/* More Options Button */}
              <button style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0
              }}>
                ⋯
              </button>
            </div>

            <h2>Clients Data</h2>
            <DataTable 
              data={filteredData} 
              columns={clientConfig.columns}
              onView={handleViewClient}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
            />
          </div>
        )}
    </div>
  );
}
