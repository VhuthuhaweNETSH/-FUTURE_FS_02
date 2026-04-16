import React, { useState, useEffect } from 'react';
import { getLeads, createLead, updateLeadStatus, deleteLead, addNote } from '../services/api';

function LeadList() {
  // State variables
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  const [newLead, setNewLead] = useState({ 
    name: '', 
    email: '', 
    source: 'Website Form', 
    status: 'new' 
  });

  // Fetch leads from API
  const fetchLeads = async () => {
    try {
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Create new lead
  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await createLead(newLead);
      setShowForm(false);
      setNewLead({ name: '', email: '', source: 'Website Form', status: 'new' });
      fetchLeads();
    } catch (error) {
      console.error('Error creating lead:', error);
    }
  };

  // Update lead status
  const handleStatusUpdate = async (id, status) => {
    try {
      await updateLeadStatus(id, status);
      fetchLeads();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Delete lead
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        fetchLeads();
      } catch (error) {
        console.error('Error deleting lead:', error);
      }
    }
  };

  // Add note to lead
  const handleAddNote = async (leadId) => {
    if (!newNote.trim()) return;
    try {
      await addNote(leadId, newNote);
      setNewNote('');
      fetchLeads();
      setShowNotesModal(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  // Open notes modal
  const openNotesModal = (lead) => {
    setSelectedLead(lead);
    setShowNotesModal(true);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Source', 'Status', 'Created At', 'Notes Count'];
    const csvData = leads.map(lead => [
      lead.name,
      lead.email,
      lead.source,
      lead.status,
      new Date(lead.createdAt).toLocaleDateString(),
      lead.notes?.length || 0
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      converted: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Filter leads based on search and status
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          lead.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Calculate dashboard stats
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

  if (loading) {
    return <div className="text-center py-8">Loading leads...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm">Total Leads</h3>
          <p className="text-2xl font-bold text-blue-600">{totalLeads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-yellow-500">
          <h3 className="text-yellow-600 text-sm">New</h3>
          <p className="text-2xl font-bold text-yellow-600">{newLeads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
          <h3 className="text-blue-600 text-sm">Contacted</h3>
          <p className="text-2xl font-bold text-blue-600">{contactedLeads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
          <h3 className="text-green-600 text-sm">Converted</h3>
          <p className="text-2xl font-bold text-green-600">{convertedLeads}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
          <h3 className="text-purple-600 text-sm">Conversion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">{conversionRate}%</p>
        </div>
      </div>

      {/* Header with buttons */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
        <div>
          <button 
            onClick={exportToCSV} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 mr-2"
          >
            📥 Export CSV
          </button>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add New Lead
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Create Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Lead</h2>
            <form onSubmit={handleCreateLead}>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 border rounded-lg mb-3"
                value={newLead.name}
                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3 py-2 border rounded-lg mb-3"
                value={newLead.email}
                onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                required
              />
              <select
                className="w-full px-3 py-2 border rounded-lg mb-3"
                value={newLead.source}
                onChange={(e) => setNewLead({ ...newLead, source: e.target.value })}
              >
                <option>Website Form</option>
                <option>Landing Page</option>
                <option>Chat Widget</option>
                <option>Referral</option>
                <option>Other</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-blue-700">
                  Create Lead
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowForm(false)} 
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1 hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-2">Notes for {selectedLead.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedLead.email}</p>
            
            {/* Existing Notes */}
            <div className="mb-4 max-h-60 overflow-y-auto">
              <h3 className="font-semibold mb-2">Previous Notes:</h3>
              {selectedLead.notes && selectedLead.notes.length > 0 ? (
                selectedLead.notes.map((note, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                    <p className="text-sm">{note.text}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(note.createdAt).toLocaleString()} - 👤 {note.createdBy}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm italic">No notes yet. Add your first note below!</p>
              )}
            </div>
            
            {/* Add New Note */}
            <textarea
              placeholder="✏️ Write a follow-up note..."
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            
            <div className="flex gap-3">
              <button 
                onClick={() => handleAddNote(selectedLead._id)} 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex-1 hover:bg-blue-700"
              >
                Add Note
              </button>
              <button 
                onClick={() => {
                  setShowNotesModal(false);
                  setNewNote('');
                }} 
                className="bg-gray-500 text-white px-4 py-2 rounded-lg flex-1 hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentItems.map((lead) => (
              <tr key={lead._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                  {lead.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {lead.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                  {lead.source}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusUpdate(lead._id, e.target.value)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer ${getStatusColor(lead.status)}`}
                  >
                    <option value="new">🟡 New</option>
                    <option value="contacted">🔵 Contacted</option>
                    <option value="converted">🟢 Converted</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => openNotesModal(lead)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    💬 {lead.notes?.length || 0} note{lead.notes?.length !== 1 ? 's' : ''}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(lead._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredLeads.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No leads found. {searchTerm || statusFilter ? 'Try changing your search/filter criteria.' : 'Create your first lead!'}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredLeads.length > 0 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ◀ Previous
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages} (Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, filteredLeads.length)} of {filteredLeads.length} leads)
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default LeadList;