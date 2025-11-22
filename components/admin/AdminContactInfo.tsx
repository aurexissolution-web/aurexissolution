import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import type { ContactInfo, ContactPerson, SiteContent } from '../../types';

const emptyContact = (): ContactPerson => ({
  id: `contact-${Date.now()}`,
  name: '',
  phone: '',
  role: '',
});

const AdminContactInfo: React.FC = () => {
  const { siteContent, updateSiteContent } = useAppContext();
  const [formData, setFormData] = useState<ContactInfo>(siteContent.contactInfo);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(siteContent.contactInfo);
  }, [siteContent]);

  const handleFieldChange = (
    field: keyof Omit<ContactInfo, 'contacts' | 'office'>,
    value: string,
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOfficeChange = (field: keyof ContactInfo['office'], value: string) => {
    setFormData(prev => ({
      ...prev,
      office: {
        ...prev.office,
        [field]: value,
      },
    }));
  };

  const handleContactChange = (id: string, field: keyof ContactPerson, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map(contact =>
        contact.id === id ? { ...contact, [field]: value } : contact,
      ),
    }));
  };

  const handleAddContact = () => {
    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, emptyContact()],
    }));
  };

  const handleRemoveContact = (id: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.filter(contact => contact.id !== id),
    }));
  };

  const sanitizedContacts = useMemo(() => {
    return formData.contacts.map((contact, index) => ({
      ...contact,
      id: contact.id || `contact-${index + 1}`,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      role: contact.role?.trim(),
    }));
  }, [formData.contacts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedContent: SiteContent = {
      ...siteContent,
      contactInfo: {
        ...formData,
        contacts: sanitizedContacts.filter(contact => contact.name || contact.phone),
      },
    };

    try {
      await updateSiteContent(updatedContent);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="text-text-primary">
      <h2 className="text-2xl font-bold text-text-primary mb-6">Contact Details</h2>
      <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl shadow-lg shadow-neutral/10 border border-neutral space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-text-primary border-b border-neutral pb-2 mb-4">Page Copy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Section Heading</label>
              <input
                value={formData.heading}
                onChange={e => handleFieldChange('heading', e.target.value)}
                className="w-full p-3 rounded-lg border border-neutral bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Get in touch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                rows={4}
                className="w-full p-3 rounded-lg border border-neutral bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Let visitors know how best to reach you"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-primary border-b border-neutral pb-2 mb-4 flex items-center justify-between">
            Contact Persons
            <button
              type="button"
              onClick={handleAddContact}
              className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:opacity-90"
            >
              <Plus size={16} /> Add Contact
            </button>
          </h3>
          {formData.contacts.length === 0 && (
            <p className="text-sm text-text-secondary mb-4">No contacts added yet.</p>
          )}
          <div className="space-y-4">
            {formData.contacts.map(contact => (
              <div key={contact.id} className="border border-neutral rounded-lg p-4 space-y-3 bg-background/60">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-text-primary">Contact</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveContact(contact.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                    aria-label="Remove contact"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Name</label>
                    <input
                      value={contact.name}
                      onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
                      className="w-full p-2.5 border border-neutral rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Person's name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Role / Label</label>
                    <input
                      value={contact.role || ''}
                      onChange={e => handleContactChange(contact.id, 'role', e.target.value)}
                      className="w-full p-2.5 border border-neutral rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="e.g. Business Inquiries"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-secondary mb-1">Phone Number</label>
                    <input
                      value={contact.phone}
                      onChange={e => handleContactChange(contact.id, 'phone', e.target.value)}
                      className="w-full p-2.5 border border-neutral rounded-md bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="+60 xx-xxxx xxx"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-primary border-b border-neutral pb-2 mb-4">Office Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Office Label</label>
              <input
                value={formData.office?.label || ''}
                onChange={e => handleOfficeChange('label', e.target.value)}
                className="w-full p-3 border border-neutral rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Our Office"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Office Address</label>
              <textarea
                value={formData.office?.address || ''}
                onChange={e => handleOfficeChange('address', e.target.value)}
                rows={3}
                className="w-full p-3 border border-neutral rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Full address"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-neutral">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:opacity-90 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Contact Info'}
          </button>
          {saved && <span className="text-green-500 text-sm">Saved!</span>}
        </div>
      </form>
    </div>
  );
};

export default AdminContactInfo;
