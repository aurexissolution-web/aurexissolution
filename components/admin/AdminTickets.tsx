// components/admin/AdminTickets.tsx
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Calendar, 
  Tag,
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { 
  subscribeToTickets, 
  updateTicket, 
  deleteTicket,
  Ticket 
} from '../../services/database';

const AdminTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });

  useEffect(() => {
    setIsLoading(true);
    
    // Subscribe to ALL tickets (admin can see all customer tickets)
    const unsubscribe = subscribeToTickets('all', (ticketsData) => {
      console.log('Admin received tickets:', ticketsData.length);
      setTickets(ticketsData);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUpdateTicket = async (ticketData: Ticket) => {
    try {
      await updateTicket(ticketData.id, ticketData);
      setSelectedTicket(null);
      console.log('Ticket updated successfully');
    } catch (error) {
      console.error('Error updating ticket:', error);
      alert('Error updating ticket: ' + error.message);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteTicket(ticketId);
        setSelectedTicket(null);
        console.log('Ticket deleted successfully');
      } catch (error) {
        console.error('Error deleting ticket:', error);
        alert('Error deleting ticket: ' + error.message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-yellow-100 text-yellow-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
    const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
    const matchesSearch = filters.search === '' || 
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const statusCounts = {
    Open: tickets.filter(t => t.status === 'Open').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length,
    Closed: tickets.filter(t => t.status === 'Closed').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Loading Tickets</h2>
          <p className="text-text-secondary">Fetching customer support tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Customer Support Tickets</h2>
          <p className="text-text-secondary">Manage and resolve customer support requests</p>
        </div>
        <div className="flex gap-2 mt-4 sm:mt-0">
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-surface p-4 rounded-lg border border-neutral">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary">{status}</p>
                <p className="text-2xl font-bold text-text-primary">{count}</p>
              </div>
              <div className={`p-2 rounded-lg ${getStatusColor(status)}`}>
                {status === 'Open' && <AlertCircle size={20} />}
                {status === 'In Progress' && <Clock size={20} />}
                {status === 'Resolved' && <CheckCircle size={20} />}
                {status === 'Closed' && <CheckCircle size={20} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface p-4 rounded-lg border border-neutral">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
            >
              <option value="all">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Search</label>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-surface rounded-lg border border-neutral">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text-primary mb-2">No Tickets Found</h3>
            <p className="text-text-secondary">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                ? 'No tickets match your current filters.'
                : 'No customer tickets have been created yet.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral">
            {filteredTickets.map((ticket) => (
              <div key={ticket.id} className="p-6 hover:bg-neutral-light transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">{ticket.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <p className="text-text-secondary mb-3">{ticket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-text-secondary">
                      <div className="flex items-center">
                        <User size={14} className="mr-1" />
                        <span>{ticket.userId}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-1" />
                        <span>{ticket.created?.toDate?.()?.toLocaleDateString() || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center">
                        <Tag size={14} className="mr-1" />
                        <span>{ticket.category}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-text-secondary hover:text-primary transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => setSelectedTicket(ticket)}
                      className="p-2 text-text-secondary hover:text-primary transition-colors"
                      title="Edit Ticket"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTicket(ticket.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      title="Delete Ticket"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary">Ticket Details</h3>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Title</label>
                  <input
                    type="text"
                    value={selectedTicket.title}
                    onChange={(e) => setSelectedTicket(prev => prev ? { ...prev, title: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Status</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => setSelectedTicket(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Priority</label>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => setSelectedTicket(prev => prev ? { ...prev, priority: e.target.value as any } : null)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Description</label>
                  <textarea
                    rows={4}
                    value={selectedTicket.description}
                    onChange={(e) => setSelectedTicket(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Assignee</label>
                  <input
                    type="text"
                    value={selectedTicket.assignee}
                    onChange={(e) => setSelectedTicket(prev => prev ? { ...prev, assignee: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateTicket(selectedTicket)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTickets;
