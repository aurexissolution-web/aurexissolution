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
    <div>
      <h2 className="text-2xl font-bold text-neutral mb-6">Contact Details</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Page Copy</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-light mb-1">Section Heading</label>
              <input
                value={formData.heading}
                onChange={e => handleFieldChange('heading', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Get in touch"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-light mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={e => handleFieldChange('description', e.target.value)}
                rows={4}
                className="w-full p-2 border rounded-md"
                placeholder="Let visitors know how best to reach you"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center justify-between">
            Contact Persons
            <button
              type="button"
              onClick={handleAddContact}
              className="flex items-center gap-2 text-sm bg-primary text-white px-3 py-1.5 rounded-md hover:bg-primary-dark"
            >
              <Plus size={16} /> Add Contact
            </button>
          </h3>
          {formData.contacts.length === 0 && (
            <p className="text-sm text-neutral-light mb-4">No contacts added yet.</p>
          )}
          <div className="space-y-4">
            {formData.contacts.map(contact => (
              <div key={contact.id} className="border rounded-lg p-4 space-y-3">
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
                    <label className="block text-xs font-medium text-neutral-light mb-1">Name</label>
                    <input
                      value={contact.name}
                      onChange={e => handleContactChange(contact.id, 'name', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="Person's name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-light mb-1">Role / Label</label>
                    <input
                      value={contact.role || ''}
                      onChange={e => handleContactChange(contact.id, 'role', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="e.g. Business Inquiries"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-light mb-1">Phone Number</label>
                    <input
                      value={contact.phone}
                      onChange={e => handleContactChange(contact.id, 'phone', e.target.value)}
                      className="w-full p-2 border rounded-md"
                      placeholder="+60 xx-xxxx xxx"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Office Details</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-light mb-1">Office Label</label>
              <input
                value={formData.office?.label || ''}
                onChange={e => handleOfficeChange('label', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Our Office"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-light mb-1">Office Address</label>
              <textarea
                value={formData.office?.address || ''}
                onChange={e => handleOfficeChange('address', e.target.value)}
                rows={3}
                className="w-full p-2 border rounded-md"
                placeholder="Full address"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Contact Info'}
          </button>
          {saved && <span className="text-green-600 text-sm">Saved!</span>}
        </div>
      </form>
    </div>
  );
};

export default AdminContactInfo;
