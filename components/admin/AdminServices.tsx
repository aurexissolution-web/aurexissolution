import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Service } from '../../types';
import { Plus, Edit, Trash2, Upload, X, PlusCircle, XCircle } from 'lucide-react';

const AdminServices: React.FC = () => {
    const { services, addService, updateService, deleteService } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentService, setCurrentService] = useState<Service | Omit<Service, 'id'> | null>(null);
    const [customIconUrl, setCustomIconUrl] = useState('');
    const [showCustomIconInput, setShowCustomIconInput] = useState(false);
    const [newKeyFeature, setNewKeyFeature] = useState('');
    const [newTechnology, setNewTechnology] = useState('');

    // Extended list of available icons
    const availableIcons = [
        'Cloud', 'Shield', 'Code', 'Database', 'Smartphone', 'Globe', 'Users', 'Headphones',
        'Monitor', 'Server', 'Cpu', 'HardDrive', 'Wifi', 'Lock', 'Key', 'Settings',
        'Zap', 'Target', 'TrendingUp', 'BarChart', 'PieChart', 'FileText', 'Mail',
        'Phone', 'MessageCircle', 'Video', 'Camera', 'Image', 'File', 'Folder',
        'Search', 'Filter', 'Download', 'Upload', 'Share', 'Link', 'ExternalLink',
        'CheckCircle', 'AlertCircle', 'Info', 'HelpCircle', 'Star', 'Heart',
        'ThumbsUp', 'Award', 'Trophy', 'Medal', 'Crown', 'Gem', 'Diamond'
    ];

    const openModal = (service: Service | null = null) => {
        setCurrentService(service ? { ...service } : { 
            icon: 'Code', 
            title: '', 
            description: '', 
            detailedDescription: [], 
            keyFeatures: [], 
            technologies: [] 
        });
        setCustomIconUrl('');
        setShowCustomIconInput(false);
        setNewKeyFeature('');
        setNewTechnology('');
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentService(null);
        setCustomIconUrl('');
        setShowCustomIconInput(false);
        setNewKeyFeature('');
        setNewTechnology('');
    };

    const handleSave = () => {
        if (!currentService) return;
        
        // If custom icon URL is provided, use it
        const serviceToSave = showCustomIconInput && customIconUrl 
            ? { ...currentService, icon: customIconUrl }
            : currentService;
            
        if ('id' in serviceToSave) {
            updateService(serviceToSave as Service);
        } else {
            addService(serviceToSave);
        }
        closeModal();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!currentService) return;
        setCurrentService({ ...currentService, [e.target.name]: e.target.value });
    };

    const handleCustomIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCustomIconUrl(e.target.value);
    };

    const toggleCustomIconInput = () => {
        setShowCustomIconInput(!showCustomIconInput);
        if (!showCustomIconInput) {
            setCustomIconUrl('');
        }
    };

    const addKeyFeature = () => {
        if (!newKeyFeature.trim() || !currentService) return;
        setCurrentService({
            ...currentService,
            keyFeatures: [...currentService.keyFeatures, newKeyFeature.trim()]
        });
        setNewKeyFeature('');
    };

    const removeKeyFeature = (index: number) => {
        if (!currentService) return;
        setCurrentService({
            ...currentService,
            keyFeatures: currentService.keyFeatures.filter((_, i) => i !== index)
        });
    };

    const addTechnology = () => {
        if (!newTechnology.trim() || !currentService) return;
        setCurrentService({
            ...currentService,
            technologies: [...currentService.technologies, newTechnology.trim()]
        });
        setNewTechnology('');
    };

    const removeTechnology = (index: number) => {
        if (!currentService) return;
        setCurrentService({
            ...currentService,
            technologies: currentService.technologies.filter((_, i) => i !== index)
        });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Manage Services</h2>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <Plus size={18} className="mr-2" /> Add Service
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md">
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left p-3">Icon</th>
                            <th className="text-left p-3">Title</th>
                            <th className="text-left p-3">Description</th>
                            <th className="text-left p-3">Key Features</th>
                            <th className="text-left p-3">Technologies</th>
                            <th className="text-right p-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(service => (
                            <tr key={service.id} className="border-b hover:bg-gray-50">
                                <td className="p-3">
                                    {service.icon.startsWith('http') ? (
                                        <img src={service.icon} alt="Custom icon" className="w-6 h-6" />
                                    ) : (
                                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">{service.icon}</span>
                                    )}
                                </td>
                                <td className="p-3 font-medium">{service.title}</td>
                                <td className="p-3 text-neutral-light truncate" style={{ maxWidth: '200px' }}>{service.description}</td>
                                <td className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                        {service.keyFeatures.slice(0, 2).map((feature, index) => (
                                            <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                                {feature}
                                            </span>
                                        ))}
                                        {service.keyFeatures.length > 2 && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                +{service.keyFeatures.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3">
                                    <div className="flex flex-wrap gap-1">
                                        {service.technologies.slice(0, 2).map((tech, index) => (
                                            <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {service.technologies.length > 2 && (
                                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                                +{service.technologies.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 text-right">
                                    <button onClick={() => openModal(service)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                                    <button onClick={() => deleteService(service.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && currentService && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{'id' in currentService ? 'Edit' : 'Add'} Service</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Title</label>
                                <input id="service-title" name="title" 
                                    value={currentService.title} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded-md" 
                                    placeholder="Enter service title"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Icon</label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <button
                                            type="button"
                                            onClick={toggleCustomIconInput}
                                            className={`px-3 py-1 rounded text-sm ${
                                                showCustomIconInput 
                                                    ? 'bg-primary text-white' 
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                            }`}
                                        >
                                            {showCustomIconInput ? 'Use Preset Icons' : 'Use Custom Icon'}
                                        </button>
                                    </div>
                                    
                                    {showCustomIconInput ? (
                                        <div className="space-y-2">
                                            <input id="service-icon-url" type="url"
                                                value={customIconUrl}
                                                onChange={handleCustomIconChange}
                                                className="w-full p-2 border rounded-md"
                                                placeholder="Enter icon URL (e.g., https://example.com/icon.png)"
                                            />
                                            {customIconUrl && (
                                                <div className="flex items-center space-x-2">
                                                    <img src={customIconUrl} alt="Preview" className="w-6 h-6" onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }} />
                                                    <span className="text-xs text-gray-500">Preview</span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <select 
                                                name="icon" 
                                                value={currentService.icon} 
                                                onChange={handleChange} 
                                                className="w-full p-2 border rounded-md"
                                            >
                                                {availableIcons.map(icon => (
                                                    <option key={icon} value={icon}>{icon}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500">
                                                Choose from {availableIcons.length} available icons
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Description</label>
                                <textarea 
                                    name="description" 
                                    value={currentService.description} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border rounded-md" 
                                    rows={4}
                                    placeholder="Enter service description"
                                ></textarea>
                            </div>

                            {/* Key Features Section */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-2">Key Features</label>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input id="new-key-feature" name="newKeyFeature" type="text" value={newKeyFeature}
                                            onChange={(e) => setNewKeyFeature(e.target.value)}
                                            className="flex-1 p-2 border rounded-md"
                                            placeholder="Add a key feature..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyFeature())}
                                        />
                                        <button 
                                            type="button"
                                            onClick={addKeyFeature}
                                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md flex items-center"
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {currentService.keyFeatures.map((feature, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                <span className="text-sm">{feature}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeKeyFeature(index)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Technologies Section */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-2">Technologies</label>
                                <div className="space-y-2">
                                    <div className="flex space-x-2">
                                        <input id="new-technology" name="newTechnology" type="text" value={newTechnology}
                                            onChange={(e) => setNewTechnology(e.target.value)}
                                            className="flex-1 p-2 border rounded-md"
                                            placeholder="Add a technology..."
                                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                        />
                                        <button 
                                            type="button"
                                            onClick={addTechnology}
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md flex items-center"
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>
                                    <div className="space-y-1">
                                        {currentService.technologies.map((tech, index) => (
                                            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                                                <span className="text-sm">{tech}</span>
                                                <button 
                                                    type="button"
                                                    onClick={() => removeTechnology(index)}
                                                    className="text-red-500 hover:text-red-700 p-1"
                                                >
                                                    <XCircle size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;
