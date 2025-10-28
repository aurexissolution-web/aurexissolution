import React from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import { Trash2 } from 'lucide-react';

const AdminMessages: React.FC = () => {
    const { messages, deleteMessage } = useAppContext();

    const formatTimestamp = (timestamp: any) => {
        if (!timestamp || !timestamp.seconds) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString();
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-neutral mb-6">Contact Messages</h2>
            <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
                {messages.length > 0 ? (
                    messages.map(msg => (
                        <div key={msg.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-semibold text-text-primary">{msg.name} <span className="text-sm font-normal text-primary">&lt;{msg.email}&gt;</span></p>
                                    <p className="text-xs text-text-secondary mt-1">{formatTimestamp(msg.timestamp)}</p>
                                </div>
                                <button onClick={() => deleteMessage(msg.id)} className="text-red-600 hover:text-red-800 p-2">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <p className="mt-3 text-text-secondary whitespace-pre-wrap">{msg.message}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-text-secondary text-center py-8">No messages yet.</p>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;