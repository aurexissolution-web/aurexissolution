import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { 
  subscribeToTickets, 
  createTicket, 
  updateTicket, 
  deleteTicket,
  Ticket 
} from '../../services/database';
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  Filter, 
  Search,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Tag,
  X,
  RefreshCw
} from 'lucide-react';

// Ticket interface is now imported from database service

const TicketTracking: React.FC = () => {
  const { user } = useAppContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: ''
  });

  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  
  // Form state for new ticket
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    priority: 'Medium',
    assignee: 'Support Team',
    dueDate: '',
    tags: [] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    try {
      if (!user?.email) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      // For now, use email as userId since that's what we have
      const userId = user.email;

      console.log('Setting up ticket listener for user:', userId);

      // Set up real-time listener for tickets
      const unsubscribe = subscribeToTickets(userId, (ticketsData) => {
        console.log('TicketTracking received tickets:', ticketsData);
        console.log('Number of tickets:', ticketsData.length);
        setTickets(ticketsData);
        setIsLoading(false);
      });

      // Cleanup listener on unmount
      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Error in TicketTracking useEffect:', err);
      setError('Failed to load tickets: ' + (err as Error).message);
      setIsLoading(false);
    }
  }, [user?.email, refreshKey]);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      alert('Please fill in title and description');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Creating ticket with data:', newTicketForm);
      
      // Prepare ticket data, filtering out undefined values
      const ticketData: Omit<Ticket, 'id' | 'created' | 'updated'> = {
        title: newTicketForm.title,
        description: newTicketForm.description,
        status: 'Open',
        priority: newTicketForm.priority as 'Low' | 'Medium' | 'High' | 'Critical',
        category: newTicketForm.category,
        assignee: newTicketForm.assignee,
        tags: newTicketForm.tags,
        userId: user?.email || ''
      };
      
      // Only add dueDate if it's not empty
      if (newTicketForm.dueDate && newTicketForm.dueDate.trim()) {
        ticketData.dueDate = newTicketForm.dueDate;
      }
      
      await createTicket(ticketData);
      
      // Reset form and close modal
      setNewTicketForm({
        title: '',
        description: '',
        category: 'Technical',
        priority: 'Medium',
        assignee: 'Support Team',
        dueDate: '',
        tags: []
      });
      setShowNewTicketForm(false);
      
      console.log('Ticket created successfully');
      alert('Ticket created successfully!');
    } catch (error) {
      console.error('Error creating ticket:', error);
      alert('Error creating ticket: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateTicket = async (ticketData: Ticket) => {
    try {
      await updateTicket(ticketData.id, ticketData);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await deleteTicket(ticketId);
      setSelectedTicket(null);
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved':
      case 'Closed':
        return 'text-green-600 bg-green-100';
      case 'In Progress':
        return 'text-blue-600 bg-blue-100';
      case 'Open':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'text-red-600 bg-red-100';
      case 'High':
        return 'text-orange-600 bg-orange-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'High':
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case 'Medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'Low':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filters.status === 'all' || ticket.status === filters.status;
    const matchesPriority = filters.priority === 'all' || ticket.priority === filters.priority;
    const matchesCategory = filters.category === 'all' || ticket.category === filters.category;
    const matchesSearch = ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(filters.search.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesCategory && matchesSearch;
  });

  const statusCounts = {
    Open: tickets.filter(t => t.status === 'Open').length,
    'In Progress': tickets.filter(t => t.status === 'In Progress').length,
    Resolved: tickets.filter(t => t.status === 'Resolved').length,
    Closed: tickets.filter(t => t.status === 'Closed').length
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Loading Tickets</h2>
          <p className="text-text-secondary">Fetching your support tickets...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle size={48} className="mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">Error Loading Tickets</h2>
          <p className="text-text-secondary mb-4">{error}</p>
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Support Tickets</h2>
          <p className="text-text-secondary">Track and manage your support requests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRefreshKey(prev => prev + 1)}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowNewTicketForm(true)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center"
          >
            <Plus size={16} className="mr-2" />
            New Ticket
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
              <div className={`p-2 rounded-full ${getStatusColor(status)}`}>
                {status === 'Open' && <Clock className="w-5 h-5" />}
                {status === 'In Progress' && <Clock className="w-5 h-5" />}
                {status === 'Resolved' && <CheckCircle className="w-5 h-5" />}
                {status === 'Closed' && <CheckCircle className="w-5 h-5" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-surface p-4 rounded-lg border border-neutral">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
              />
            </div>
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
          >
            <option value="all">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
          >
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
          >
            <option value="all">All Categories</option>
            <option value="Technical">Technical</option>
            <option value="Bug">Bug</option>
            <option value="Enhancement">Enhancement</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-surface rounded-lg border border-neutral overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-text-secondary">Loading tickets...</p>
          </div>
        ) : filteredTickets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-light">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral">
                {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-text-primary">{ticket.id}</div>
                      <div className="text-sm text-text-secondary max-w-xs truncate">{ticket.title}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {ticket.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-light text-text-secondary">
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getPriorityIcon(ticket.priority)}
                      <span className="ml-2 text-sm text-text-primary">{ticket.priority}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-text-secondary mr-2" />
                      <span className="text-sm text-text-primary">{ticket.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-text-secondary">
                      <Calendar className="w-4 h-4 mr-2" />
                      {ticket.created}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-primary hover:text-secondary transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="text-primary hover:text-secondary transition-colors"
                        title="Add Comment"
                      >
                        <MessageSquare size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-light rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-text-secondary" />
            </div>
            <p className="text-text-secondary">No tickets found</p>
            <p className="text-sm text-text-secondary mt-1">Create your first support ticket to get started</p>
          </div>
        )}
      </div>

      {/* New Ticket Form Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-text-primary">Create New Ticket</h3>
                <button
                  onClick={() => setShowNewTicketForm(false)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Title *</label>
                  <input
                    type="text"
                    value={newTicketForm.title}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Category</label>
                  <select 
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Bug">Bug</option>
                    <option value="Enhancement">Enhancement</option>
                    <option value="General">General</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Priority</label>
                  <select 
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Description *</label>
                  <textarea
                    rows={4}
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-text-primary"
                    placeholder="Detailed description of the issue or request"
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowNewTicketForm(false)}
                    className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Ticket'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">{selectedTicket.id}</h3>
                  <p className="text-text-secondary">{selectedTicket.title}</p>
                </div>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="text-text-secondary hover:text-text-primary"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Priority</h4>
                  <div className="flex items-center">
                    {getPriorityIcon(selectedTicket.priority)}
                    <span className="ml-2">{selectedTicket.priority}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Assignee</h4>
                  <p className="text-text-secondary">{selectedTicket.assignee}</p>
                </div>
                <div>
                  <h4 className="font-medium text-text-primary mb-2">Created</h4>
                  <p className="text-text-secondary">{selectedTicket.created}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-text-primary mb-2">Description</h4>
                <p className="text-text-secondary">{selectedTicket.description}</p>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium text-text-primary mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTicket.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-light text-text-secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
                  Add Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTracking;
