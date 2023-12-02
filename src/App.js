import React, { useState, useEffect } from 'react';
import {

  IconButton,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';
import './App.css';

const API_ENDPOINT = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';

const App = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [editableRows, setEditableRows] = useState({});
  const [editedRows, setEditedRows] = useState({});

  useEffect(() => {
    fetch(API_ENDPOINT)
      .then(response => response.json())
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const filteredUsers = users.filter(user =>
    Object.values(user).some(value =>
      value.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  const handleDelete = id => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    setSelectedRows(selectedRows.filter(rowId => rowId !== id));
  };

  const handleBulkDelete = () => {
    const updatedUsers = users.filter(user => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]);
  };

  const handleRowSelect = id => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  const handleEdit = id => {
    setEditableRows({ ...editableRows, [id]: true });
    setEditedRows({
      ...editedRows,
      [id]: { ...users.find(user => user.id === id) },
    });
  };

  const handleSave = id => {
    const updatedUsers = users.map(user => {
      if (user.id === id) {
        return { ...user, ...editedRows[id] };
      }
      return user;
    });

    setUsers(updatedUsers);
    setEditableRows({ ...editableRows, [id]: false });
    setEditedRows({ ...editedRows, [id]: {} });
  };

 

  return (
    <div className="container">
    <div className="search-container">
  <TextField
    label="Search..."
    variant="outlined"
    fullWidth
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
  <IconButton
    color="error"
    onClick={() => handleBulkDelete()} // Replace with the correct function if needed
  >
    <DeleteIcon />
  </IconButton>
</div>

      <TableContainer component={Paper} className="user-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  checked={selectedRows.length === currentUsers.length}
                  onChange={() => {
                    if (selectedRows.length === currentUsers.length) {
                      setSelectedRows([]);
                    } else {
                      const newSelectedRows = currentUsers.map(user => user.id);
                      setSelectedRows(newSelectedRows);
                    }
                  }}
                />
              </TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {currentUsers.map(user => (
              <TableRow key={user.id} className={selectedRows.includes(user.id) ? 'selected' : ''}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleRowSelect(user.id)}
                  />
                </TableCell>
                <TableCell>{user.id}</TableCell>
                <TableCell>
                  {editableRows[user.id] ? (
                    <TextField
                      value={editedRows[user.id]?.name || user.name}
                      onChange={(e) => setEditedRows({ ...editedRows, [user.id]: { ...editedRows[user.id], name: e.target.value } })}
                    />
                  ) : (
                    user.name
                  )}
                </TableCell>
                <TableCell>
                  {editableRows[user.id] ? (
                    <TextField
                      value={editedRows[user.id]?.email || user.email}
                      onChange={(e) => setEditedRows({ ...editedRows, [user.id]: { ...editedRows[user.id], email: e.target.value } })}
                    />
                  ) : (
                    user.email
                  )}
                </TableCell>
                <TableCell>
                  {editableRows[user.id] ? (
                    <TextField
                      value={editedRows[user.id]?.role || user.role}
                      onChange={(e) => setEditedRows({ ...editedRows, [user.id]: { ...editedRows[user.id], role: e.target.value } })}
                    />
                  ) : (
                    user.role
                  )}
                </TableCell>
                <TableCell>
                  {editableRows[user.id] ? (
                    <IconButton size="small" color="primary" onClick={() => handleSave(user.id)}>
                      <SaveIcon />
                    </IconButton>
                  ) : (
                    <IconButton size="small" color="primary" onClick={() => handleEdit(user.id)}>
                      <EditIcon />
                    </IconButton>
                  )}
                  <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div className="pagination">
        <IconButton size="small" onClick={() => paginate(1)} disabled={currentPage === 1}>
          <FirstPageIcon />
        </IconButton>
        <IconButton size="small" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          <KeyboardArrowLeftIcon />
        </IconButton>
        <IconButton size="small" onClick={() => paginate(currentPage + 1)} disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}>
          <KeyboardArrowRightIcon />
        </IconButton>
        <IconButton size="small" onClick={() => paginate(Math.ceil(filteredUsers.length / usersPerPage))} disabled={currentPage === Math.ceil(filteredUsers.length / usersPerPage)}>
          <LastPageIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default App;