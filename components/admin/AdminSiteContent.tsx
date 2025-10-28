
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { SiteContent } from '../../types';

const AdminSiteContent: React.FC = () => {
  const { siteContent, updateSiteContent } = useAppContext();
  const [formData, setFormData] = useState<SiteContent>(siteContent);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setFormData(siteContent);
  }, [siteContent]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData({
      ...formData,
      socialMedia: {
        ...formData.socialMedia,
        [platform]: value
      }
    });
  };
  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (event) => {
              if (event.target?.result) {
                  setFormData({ ...formData, logoUrl: event.target.result as string });
              }
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSiteContent(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral mb-6">Manage Site Content</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-6">
        
        {/* Text Content */}
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Page Content</h3>
          <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">Hero Title</label>
                <input name="heroTitle" value={formData.heroTitle} onChange={handleChange} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">Hero Subtitle</label>
                <textarea name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} className="w-full p-2 border rounded-md" rows={3}></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">About Title</label>
                <input name="aboutTitle" value={formData.aboutTitle} onChange={handleChange} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">About Text</label>
                <textarea name="aboutText" value={formData.aboutText} onChange={handleChange} className="w-full p-2 border rounded-md" rows={5}></textarea>
              </div>
          </div>
        </div>
        
        {/* Logo Management */}
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Branding</h3>
           <div>
              <label className="block text-sm font-medium text-neutral-light mb-1">Website Logo</label>
              <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm text-neutral-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              {formData.logoUrl && (
                  <div className="mt-4 p-4 border rounded-md bg-gray-50 inline-block">
                      <p className="text-xs text-neutral-light mb-2">Logo Preview:</p>
                      <img src={formData.logoUrl} alt="Logo Preview" className="h-12 w-auto rounded-md border bg-white" />
                  </div>
              )}
          </div>
        </div>

        {/* Social Media Management */}
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-4">Social Media Links</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">Facebook URL</label>
                <input 
                  type="url" 
                  value={formData.socialMedia.facebook || ''} 
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  className="w-full p-2 border rounded-md" 
                  placeholder="https://facebook.com/yourpage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">Twitter URL</label>
                <input 
                  type="url" 
                  value={formData.socialMedia.twitter || ''} 
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  className="w-full p-2 border rounded-md" 
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">LinkedIn URL</label>
                <input 
                  type="url" 
                  value={formData.socialMedia.linkedin || ''} 
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  className="w-full p-2 border rounded-md" 
                  placeholder="https://linkedin.com/company/yourcompany"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">Instagram URL</label>
                <input 
                  type="url" 
                  value={formData.socialMedia.instagram || ''} 
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  className="w-full p-2 border rounded-md" 
                  placeholder="https://instagram.com/yourhandle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-light mb-1">TikTok URL</label>
                <input 
                  type="url" 
                  value={formData.socialMedia.tiktok || ''} 
                  onChange={(e) => handleSocialMediaChange('tiktok', e.target.value)}
                  className="w-full p-2 border rounded-md" 
                  placeholder="https://tiktok.com/@yourhandle"
                />
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Leave fields empty to hide social media icons from the website footer. 
                Only filled URLs will be displayed as clickable icons.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 pt-4 border-t">
          <button type="submit" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-lg transition-colors">
            Save Changes
          </button>
          {isSaved && <span className="text-green-600">Saved!</span>}
        </div>
      </form>
    </div>
  );
};

export default AdminSiteContent;
