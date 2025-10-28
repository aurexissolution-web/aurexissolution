
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Project } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminPortfolio: React.FC = () => {
    const { projects, createProject, updateProject, deleteProject } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState<Project | Omit<Project, 'id'> | null>(null);
    
    // Filter: Only show portfolio items (NOT internal projects)
    const portfolioItems = projects.filter(p => p.isPortfolioItem === true);

    const openModal = (project: Project | null = null) => {
        setCurrentProject(project ? { ...project } : { 
            title: '', 
            category: '', 
            description: '', 
            imageData: '',
            isPortfolioItem: true // Mark as portfolio item
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProject(null);
    };

    const handleSave = async () => {
        if (!currentProject) return;
        try {
            if ('id' in currentProject) {
                await updateProject(currentProject as Project);
            } else {
                await createProject(currentProject);
            }
            closeModal();
        } catch (error) {
            console.error('Error saving portfolio item:', error);
            alert('Failed to save portfolio item. Please try again.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentProject) return;
        setCurrentProject({ ...currentProject, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result && currentProject) {
                    setCurrentProject({ ...currentProject, imageData: event.target.result as string });
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Manage Portfolio</h2>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <Plus size={18} className="mr-2" /> Add Project
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioItems.map(project => (
                    <div key={project.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <img src={project.imageData} alt={project.title} className="w-full h-40 object-cover" />
                        <div className="p-4">
                            <h3 className="font-bold text-lg">{project.title}</h3>
                            <p className="text-sm text-primary">{project.category}</p>
                            <p className="text-sm text-neutral-light mt-2 truncate">{project.description}</p>
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-end space-x-2">
                             <button onClick={() => openModal(project)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                             <button onClick={() => deleteProject(project.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && currentProject && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-6">{'id' in currentProject ? 'Edit' : 'Add'} Project</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Title</label>
                                <input name="title" value={currentProject.title} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Category</label>
                                <input name="category" value={currentProject.category} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Project Image</label>
                                <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-neutral-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                {currentProject.imageData && (
                                    <div className="mt-4">
                                        <img src={currentProject.imageData} alt="Preview" className="w-full h-auto rounded-md border" />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Description</label>
                                <textarea name="description" value={currentProject.description} onChange={handleChange} className="w-full p-2 border rounded-md" rows={4}></textarea>
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

export default AdminPortfolio;