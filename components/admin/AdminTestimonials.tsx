
import React, { useState } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { Testimonial } from '../../types';
import { Plus, Edit, Trash2 } from 'lucide-react';

const AdminTestimonials: React.FC = () => {
    const { testimonials, addTestimonial, updateTestimonial, deleteTestimonial } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | Omit<Testimonial, 'id'> | null>(null);

    const openModal = (testimonial: Testimonial | null = null) => {
        setCurrentTestimonial(testimonial ? { ...testimonial } : { quote: '', author: '', company: '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTestimonial(null);
    };

    const handleSave = () => {
        if (!currentTestimonial) return;
        if ('id' in currentTestimonial) {
            updateTestimonial(currentTestimonial as Testimonial);
        } else {
            addTestimonial(currentTestimonial);
        }
        closeModal();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!currentTestimonial) return;
        setCurrentTestimonial({ ...currentTestimonial, [e.target.name]: e.target.value });
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-neutral">Manage Testimonials</h2>
                <button onClick={() => openModal()} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg flex items-center">
                    <Plus size={18} className="mr-2" /> Add Testimonial
                </button>
            </div>

            <div className="space-y-4">
                {testimonials.map(testimonial => (
                    <div key={testimonial.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-start">
                        <div>
                            <p className="italic text-neutral-light">"{testimonial.quote}"</p>
                            <p className="mt-2 font-semibold text-neutral">- {testimonial.author}, <span className="text-primary">{testimonial.company}</span></p>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                            <button onClick={() => openModal(testimonial)} className="text-blue-600 hover:text-blue-800 p-2"><Edit size={18} /></button>
                            <button onClick={() => deleteTestimonial(testimonial.id)} className="text-red-600 hover:text-red-800 p-2"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && currentTestimonial && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                        <h3 className="text-xl font-bold mb-6">{'id' in currentTestimonial ? 'Edit' : 'Add'} Testimonial</h3>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Quote</label>
                                <textarea name="quote" value={currentTestimonial.quote} onChange={handleChange} className="w-full p-2 border rounded-md" rows={4}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Author</label>
                                <input name="author" value={currentTestimonial.author} onChange={handleChange} className="w-full p-2 border rounded-md" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-neutral-light mb-1">Company</label>
                                <input name="company" value={currentTestimonial.company} onChange={handleChange} className="w-full p-2 border rounded-md" />
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

export default AdminTestimonials;
