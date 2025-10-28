// components/dashboard/TicketTrackingSimple.tsx
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { subscribeToTickets, Ticket } from '../../services/database';
import { MessageSquare, Plus, AlertCircle, RefreshCw } from 'lucide-react';

const TicketTrackingSimple: React.FC = () => {
  const { user } = useAppContext();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userId = user.email;
      console.log('Simple TicketTracking: Setting up listener for user:', userId);

      const unsubscribe = subscribeToTickets(userId, (ticketsData) => {
        console.log('Simple TicketTracking: Received tickets:', ticketsData.length);
        setTickets(ticketsData);
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      console.error('Simple TicketTracking: Error:', err);
      setError('Failed to load tickets: ' + (err as Error).message);
      setIsLoading(false);
    }
  }, [user?.email]);

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
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            Reload Page
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
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center"
        >
          <Plus size={16} className="mr-2" />
          New Ticket
        </button>
      </div>

      {/* Tickets Count */}
      <div className="bg-surface p-6 rounded-lg border border-neutral">
        <div className="flex items-center">
          <MessageSquare size={24} className="text-primary mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Total Tickets</h3>
            <p className="text-2xl font-bold text-primary">{tickets.length}</p>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="text-center py-12">
          <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text-primary mb-2">No Tickets Yet</h3>
          <p className="text-text-secondary">You haven't created any support tickets yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="bg-surface p-4 rounded-lg border border-neutral">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-text-primary">{ticket.title}</h4>
                  <p className="text-text-secondary text-sm mt-1">{ticket.description}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  ticket.status === 'Open' ? 'bg-green-100 text-green-800' :
                  ticket.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  ticket.status === 'Resolved' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {ticket.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketTrackingSimple;
