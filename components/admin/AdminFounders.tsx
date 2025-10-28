
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Founder } from '../../types';
import { Edit } from 'lucide-react';

const AdminFounders: React.FC = () => {
    const { founders, updateFounder, seedFounders, checkFoundersInDatabase } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentFounder, setCurrentFounder] = useState<Founder | null>(null);

    const openModal = (founder: Founder) => {
        setCurrentFounder({ ...founder });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentFounder(null);
    };

    const handleSave = () => {
        if (!currentFounder) return;
        updateFounder(currentFounder);
        closeModal();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentFounder) return;
        setCurrentFounder({ ...currentFounder, [e.target.name]: e.target.value });
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && currentFounder) {
            const file = e.target.files[0];
            
            // Check file size (limit to 5MB for original file)
            const maxFileSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxFileSize) {
                alert('Image file is too large. Please choose an image smaller than 5MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const img = new Image();
                    img.onload = () => {
                        // Compress and resize image
                        const canvas = document.createElement('canvas');
                        let width = img.width;
                        let height = img.height;
                        
                        // Resize if too large (max 800x800)
                        const maxSize = 800;
                        if (width > maxSize || height > maxSize) {
                            if (width > height) {
                                height = (height / width) * maxSize;
                                width = maxSize;
                            } else {
                                width = (width / height) * maxSize;
                                height = maxSize;
                            }
                        }
                        
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.drawImage(img, 0, 0, width, height);
                            
                            // Convert to base64 with compression (0.7 quality for JPEG)
                            let compressedData = canvas.toDataURL('image/jpeg', 0.7);
                            
                            // Check if still too large (Firestore limit is ~1MB, we'll aim for 800KB)
                            const maxBase64Size = 800 * 1024; // 800KB
                            let quality = 0.7;
                            
                            while (compressedData.length > maxBase64Size && quality > 0.1) {
                                quality -= 0.1;
                                compressedData = canvas.toDataURL('image/jpeg', quality);
                            }
                            
                            if (compressedData.length > maxBase64Size) {
                                alert('Image is too large even after compression. Please use a smaller image or lower resolution.');
                                return;
                            }
                            
                            setCurrentFounder({ ...currentFounder, imageData: compressedData });
                        }
                    };
                    img.src = event.target.result as string;
                }
            };
            reader.readAsDataURL(file);
        }
    };


    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Manage Founder Profiles</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={checkFoundersInDatabase}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Check Database
                    </button>
                    <button 
                        onClick={seedFounders}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                        Seed Founders to Database
                    </button>
                    <div className="text-sm text-gray-600 flex items-center">
                        Founders in state: {founders.length}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {founders.map(founder => (
                    <div key={founder.id} className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-4">
                                <img src={founder.imageData} alt={founder.name} className="w-20 h-20 rounded-full object-cover border-2 border-primary" />
                                <div>
                                    <h3 className="text-xl font-bold text-text-primary">{founder.name}</h3>
                                    <p className="text-primary">{founder.title}</p>
                                </div>
                            </div>
                            <button onClick={() => openModal(founder)} className="text-blue-600 hover:text-blue-800 p-2">
                                <Edit size={18} />
                            </button>
                        </div>
                        <p className="text-text-secondary mt-4 text-sm">{founder.bio}</p>
                    </div>
                ))}
            </div>

            {isModalOpen && currentFounder && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">Edit Founder Profile: {currentFounder.name}</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Profile Image</label>
                                <input id="founder-image" name="image" type="file" accept="image/*" onChange={handleImageChange} className="w-full text-sm text-neutral-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                <p className="mt-1 text-xs text-gray-500">
                                    Image will be automatically resized to 800x800px and compressed. Max file size: 5MB.
                                </p>
                                {currentFounder.imageData && (
                                    <div className="mt-4">
                                        <img src={currentFounder.imageData} alt="Preview" className="w-24 h-24 rounded-full object-cover border" />
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Full Name</label>
                                    <input id="founder-name" name="name" value={currentFounder.name} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Title</label>
                                    <input id="founder-title" name="title" value={currentFounder.title} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Handle (e.g., @javicodes)</label>
                                    <input id="founder-handle" name="handle" value={currentFounder.handle} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-light mb-1">Status (e.g., Online)</label>
                                    <input id="founder-status" name="status" value={currentFounder.status} onChange={handleChange} className="w-full p-2 border rounded-md" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Biography</label>
                                <textarea name="bio" value={currentFounder.bio} onChange={handleChange} className="w-full p-2 border rounded-md" rows={4}></textarea>
                            </div>
                            <div>
                               <h4 className="text-md font-semibold text-text-primary mb-2 mt-4 border-t pt-4">Links</h4>
                               <div className="space-y-2">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-light mb-1">Profile URL (for 'View Profile' button)</label>
                                        <input id="founder-profile-url" name="profileUrl" value={currentFounder.profileUrl} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-light mb-1">LinkedIn URL</label>
                                        <input id="founder-linkedin-url" name="linkedinUrl" value={currentFounder.linkedinUrl} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="https://linkedin.com/in/..." />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-light mb-1">Twitter URL</label>
                                        <input id="founder-twitter-url" name="twitterUrl" value={currentFounder.twitterUrl} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="https://twitter.com/..." />
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-neutral-light mb-1">GitHub URL</label>
                                        <input id="founder-github-url" name="githubUrl" value={currentFounder.githubUrl} onChange={handleChange} className="w-full p-2 border rounded-md" placeholder="https://github.com/..." />
                                    </div>
                               </div>
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end space-x-3 border-t pt-6">
                            <button onClick={closeModal} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                            <button onClick={handleSave} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg">Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFounders;
