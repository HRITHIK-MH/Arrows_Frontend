import React, { useState } from 'react';
import './DataTable.css';

const DataTable = ({ data, columns }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const handleSort = (columnKey) => {
    let newDirection = 'asc';
    if (sortConfig.key === columnKey && sortConfig.direction === 'asc') {
      newDirection = 'desc';
    }
    setSortConfig({ key: columnKey, direction: newDirection });
  };

  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle array values
        const aStr = Array.isArray(aValue) ? aValue.join(', ') : String(aValue || '');
        const bStr = Array.isArray(bValue) ? bValue.join(', ') : String(bValue || '');

        if (aStr < bStr) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aStr > bStr) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);

  const getSortArrow = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <span style={{ marginLeft: '6px', fontSize: '12px', verticalAlign: 'middle' }}>
          <span style={{ display: 'inline-block', lineHeight: '0.8' }}>
            <div style={{ fontSize: '10px' }}>▲</div>
            <div style={{ fontSize: '10px' }}>▼</div>
          </span>
        </span>
      );
    }
    return sortConfig.direction === 'asc' ? (
      <span style={{ marginLeft: '6px', fontSize: '12px', verticalAlign: 'middle' }}>▲</span>
    ) : (
      <span style={{ marginLeft: '6px', fontSize: '12px', verticalAlign: 'middle' }}>▼</span>
    );
  };

  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{ cursor: 'pointer', userSelect: 'none', position: 'relative' }}
              >
                {col.label}
                <span style={{ marginLeft: '8px', float: 'right' }}>
                  {getSortArrow(col.key)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.key}>
                  {Array.isArray(row[col.key]) 
                    ? row[col.key].join(', ') 
                    : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;