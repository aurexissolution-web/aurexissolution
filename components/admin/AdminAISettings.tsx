import React, { useState, useEffect } from 'react';
import { Key, Bot, Save, Eye, EyeOff, CheckCircle, AlertCircle, Info, Sparkles, FileText, Image, Brain } from 'lucide-react';
import { useAppContext } from '../../hooks/useAppContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface AISettings {
  geminiApiKey: string;
  openaiApiKey: string;
  anthropicApiKey: string;
  stabilityApiKey: string;
  huggingfaceApiKey: string;
  cohereApiKey: string;
  replicateApiKey: string;
  perplexityApiKey: string;
}

const AdminAISettings: React.FC = () => {
  const { user } = useAppContext();
  const [settings, setSettings] = useState<AISettings>({
    geminiApiKey: '',
    openaiApiKey: '',
    anthropicApiKey: '',
    stabilityApiKey: '',
    huggingfaceApiKey: '',
    cohereApiKey: '',
    replicateApiKey: '',
    perplexityApiKey: ''
  });
  
  const [showKeys, setShowKeys] = useState<Record<keyof AISettings, boolean>>({
    geminiApiKey: false,
    openaiApiKey: false,
    anthropicApiKey: false,
    stabilityApiKey: false,
    huggingfaceApiKey: false,
    cohereApiKey: false,
    replicateApiKey: false,
    perplexityApiKey: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Load from Firebase Firestore
      const settingsDoc = doc(db, 'aiSettings', 'main');
      const settingsSnap = await getDoc(settingsDoc);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
            setSettings({
              geminiApiKey: data.geminiApiKey || '',
              openaiApiKey: data.openaiApiKey || '',
              anthropicApiKey: data.anthropicApiKey || '',
              stabilityApiKey: data.stabilityApiKey || '',
              huggingfaceApiKey: data.huggingfaceApiKey || '',
              cohereApiKey: data.cohereApiKey || '',
              replicateApiKey: data.replicateApiKey || '',
              perplexityApiKey: data.perplexityApiKey || ''
            });
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to load AI settings from server' });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);

    try {
      // Validate API keys (basic validation)
      const validationResults = validateApiKeys(settings);
      
      if (!validationResults.isValid) {
        setMessage({ type: 'error', text: validationResults.message });
        setLoading(false);
        return;
      }

      // Save to Firebase Firestore
      const settingsDoc = doc(db, 'aiSettings', 'main');
          await setDoc(settingsDoc, {
            geminiApiKey: settings.geminiApiKey,
            openaiApiKey: settings.openaiApiKey,
            anthropicApiKey: settings.anthropicApiKey,
            stabilityApiKey: settings.stabilityApiKey,
            huggingfaceApiKey: settings.huggingfaceApiKey,
            cohereApiKey: settings.cohereApiKey,
            replicateApiKey: settings.replicateApiKey,
            perplexityApiKey: settings.perplexityApiKey,
            lastUpdated: new Date().toISOString(),
            updatedBy: user?.email || 'admin'
          }, { merge: true });
      
      setMessage({ type: 'success', text: 'AI settings saved successfully to server!' });
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Error saving AI settings:', error);
      setMessage({ type: 'error', text: 'Failed to save AI settings to server' });
    } finally {
      setLoading(false);
    }
  };

  const validateApiKeys = (settings: AISettings) => {
    const errors: string[] = [];

    // Basic format validation
    if (settings.geminiApiKey && !settings.geminiApiKey.startsWith('AIza')) {
      errors.push('Gemini API key should start with "AIza"');
    }

    if (settings.openaiApiKey && !settings.openaiApiKey.startsWith('sk-')) {
      errors.push('OpenAI API key should start with "sk-"');
    }

    if (settings.anthropicApiKey && !settings.anthropicApiKey.startsWith('sk-ant-')) {
      errors.push('Anthropic API key should start with "sk-ant-"');
    }

    if (settings.stabilityApiKey && !settings.stabilityApiKey.startsWith('sk-')) {
      errors.push('Stability AI API key should start with "sk-"');
    }

    if (settings.perplexityApiKey && !settings.perplexityApiKey.startsWith('pplx-')) {
      errors.push('Perplexity API key should start with "pplx-"');
    }

    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(', ') : 'All API keys are valid'
    };
  };

  const toggleKeyVisibility = (keyName: string) => {
    setShowKeys(prev => ({
      ...prev,
      [keyName]: !prev[keyName]
    }));
  };

  const handleInputChange = (key: keyof AISettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const aiProviders = [
    {
      key: 'geminiApiKey',
      name: 'Google Gemini',
      description: 'For blog generation, content creation, and text analysis',
      icon: <Brain className="w-5 h-5" />,
      placeholder: 'AIza...',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      key: 'openaiApiKey',
      name: 'OpenAI GPT',
      description: 'For advanced text generation and chat functionality',
      icon: <Bot className="w-5 h-5" />,
      placeholder: 'sk-...',
      color: 'bg-green-100 text-green-800'
    },
    {
      key: 'anthropicApiKey',
      name: 'Anthropic Claude',
      description: 'For conversational AI and content moderation',
      icon: <Sparkles className="w-5 h-5" />,
      placeholder: 'sk-ant-...',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      key: 'stabilityApiKey',
      name: 'Stability AI',
      description: 'For image generation and visual content',
      icon: <Image className="w-5 h-5" />,
      placeholder: 'sk-...',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      key: 'huggingfaceApiKey',
      name: 'Hugging Face',
      description: 'For open-source AI models and embeddings',
      icon: <FileText className="w-5 h-5" />,
      placeholder: 'hf_...',
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      key: 'cohereApiKey',
      name: 'Cohere',
      description: 'For text classification and language understanding',
      icon: <Key className="w-5 h-5" />,
      placeholder: 'co-...',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      key: 'replicateApiKey',
      name: 'Replicate',
      description: 'For running open-source AI models',
      icon: <Bot className="w-5 h-5" />,
      placeholder: 'r8_...',
      color: 'bg-pink-100 text-pink-800'
    },
    {
      key: 'perplexityApiKey',
      name: 'Perplexity AI',
      description: 'Sonar model for cost-effective blog generation',
      icon: <Sparkles className="w-5 h-5" />,
      placeholder: 'pplx-...',
      color: 'bg-cyan-100 text-cyan-800'
    }
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI API Keys Management</h1>
        <p className="text-gray-600">
          Configure AI service API keys for blog generation, content creation, and other AI-powered features.
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-green-800 mb-1">Secure Storage</h3>
            <p className="text-sm text-green-700">
              API keys are stored securely in Firebase Firestore. Only admin users can access and modify these settings.
              Never share your API keys or commit them to version control.
            </p>
          </div>
        </div>
      </div>

      {/* AI Providers */}
      <div className="space-y-6">
        {aiProviders.map((provider) => (
          <div key={provider.key} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${provider.color}`}>
                  {provider.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{provider.name}</h3>
                  <p className="text-sm text-gray-600">{provider.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-500">
                  {settings[provider.key as keyof AISettings] ? 'Configured' : 'Not configured'}
                </span>
                {settings[provider.key as keyof AISettings] && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>

            <div className="relative">
              <input
                type={showKeys[provider.key] ? 'text' : 'password'}
                value={settings[provider.key as keyof AISettings]}
                onChange={(e) => handleInputChange(provider.key as keyof AISettings, e.target.value)}
                placeholder={provider.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
              />
              <button
                type="button"
                onClick={() => toggleKeyVisibility(provider.key)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showKeys[provider.key] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mt-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-3" />
          ) : message.type === 'error' ? (
            <AlertCircle className="w-5 h-5 mr-3" />
          ) : (
            <Info className="w-5 h-5 mr-3" />
          )}
          {message.text}
        </div>
      )}

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save AI Settings
            </>
          )}
        </button>
      </div>

      {/* Usage Guidelines */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Guidelines</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Blog Generation</h4>
            <ul className="space-y-1">
              <li>• Use Gemini or OpenAI for content creation</li>
              <li>• Configure at least one text generation API</li>
              <li>• Test API keys before saving</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Image Generation</h4>
            <ul className="space-y-1">
              <li>• Use Stability AI for image creation</li>
              <li>• Configure image generation APIs</li>
              <li>• Monitor API usage and costs</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAISettings;
