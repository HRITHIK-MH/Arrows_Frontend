import * as React from "react";
import { FiPlus, FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import styles from "./UserRoles.module.scss";
import DataTable from "../../components/forms/DataTable";

export default function UserRoles() {
  const [users, setUsers] = React.useState([]);
  const [showForm, setShowForm] = React.useState(false);
  const [editingId, setEditingId] = React.useState(null);
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    userRole: ""
  });

  const userRoles = ["Admin", "Manager", "Recruiter", "Interviewer", "Coordinator"];

  // Generate username from first and last name
  const generateUsername = (firstName, lastName) => {
    if (!firstName || !lastName) return "";
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  };

  const handleFirstNameChange = (e) => {
    const firstName = e.target.value;
    setFormData(prev => ({
      ...prev,
      firstName,
      username: generateUsername(firstName, prev.lastName)
    }));
  };

  const handleLastNameChange = (e) => {
    const lastName = e.target.value;
    setFormData(prev => ({
      ...prev,
      lastName,
      username: generateUsername(prev.firstName, lastName)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = () => {
    setEditingId(null);
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      userRole: ""
    });
    setShowForm(true);
  };

  const handleEditUser = (user) => {
    setEditingId(user.id);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      userRole: user.userRole
    });
    setShowForm(true);
  };

  const handleDeleteUser = (id) => {
    setUsers(prev => prev.filter(user => user.id !== id));
  };

  const handleViewUser = (user) => {
    console.log("View user:", user);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.userRole) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      // Edit existing user
      setUsers(prev => prev.map(user => 
        user.id === editingId 
          ? { ...formData, id: editingId }
          : user
      ));
    } else {
      // Add new user
      const newUser = {
        ...formData,
        id: `U${Date.now()}`
      };
      setUsers(prev => [...prev, newUser]);
    }

    setShowForm(false);
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      userRole: ""
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      phone: "",
      userRole: ""
    });
  };

  // Define table columns
  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "username", label: "Username" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "userRole", label: "User Role" }
  ];

  return (
    <div className={styles.userRolesContainer}>
      {/* Header Section */}
      <div className={styles.headerSection}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>User Roles</h1>
          <button className={styles.addButton} onClick={handleAddUser}>
            <FiPlus aria-hidden="true" />
            Add User
          </button>
        </div>
        <p className={styles.pageDescription}>
          Manage user roles and permissions. Create, view, edit, and delete user accounts with different role assignments.
        </p>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {users.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No Users Found</h2>
            <p>Create your first user to get started.</p>
          </div>
        ) : (
          <DataTable
            data={users}
            columns={columns}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteUser}
          />
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className={styles.modalOverlay} onClick={handleCancel}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {editingId ? "Edit User" : "Add User"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>First Name *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter first name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFirstNameChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Last Name *</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter last name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleLastNameChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Username</label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Auto-generated from name"
                  name="username"
                  value={formData.username}
                  disabled
                  readOnly
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Email *</label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="Enter email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Phone *</label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="Enter phone number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>User Role *</label>
                <select
                  className={styles.formSelect}
                  name="userRole"
                  value={formData.userRole}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a role</option>
                  {userRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formFooter}>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? "Update" : "Create"}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
