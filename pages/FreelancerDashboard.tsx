// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../hooks/useAppContext';
import { useTheme } from '../hooks/useTheme';
import { 
  TrendingUp, 
  DollarSign, 
  FileText, 
  LogOut, 
  Home,
  Upload,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  X,
  Activity,
  Target,
  Paperclip,
  Download,
  Sun,
  Moon
} from 'lucide-react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { notifyFinanceTaskCompleted } from '../services/notificationService';
import NotificationBell from '../components/admin/NotificationBell';

type TabType = 'progression' | 'commissions' | 'details';

interface TaskFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: Date;
}

interface TaskProgress {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  progress: number;
  deadline: Date;
  priority: 'low' | 'medium' | 'high';
  assignedBy: string;
  attachments?: TaskFile[];
  submissionNotes?: string;
}

interface Commission {
  projectTitle: string;
  budget: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'paid';
  paymentDate?: Date;
  projectStatus: string;
}

const FreelancerDashboard: React.FC = () => {
  const { user, logout, tasks: contextTasks, commissions: contextCommissions } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('progression');

  // State
  const [tasks, setTasks] = useState<TaskProgress[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskProgress | null>(null);
  const [progressUpdate, setProgressUpdate] = useState(0);
  const [progressNotes, setProgressNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<TaskFile[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Redirect if not freelancer
  useEffect(() => {
    if (user && user.role !== 'freelancer') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Load tasks
  useEffect(() => {
    if (!user) return;

    const freelancerTasks = (Array.isArray(contextTasks) ? contextTasks : []).filter(
      task => task.assignedTo === user.email || task.assignedTo === user.uniqueId || task.employeeId === user.id
    );

    setTasks(freelancerTasks.map(t => ({
      ...t,
      deadline: t.deadline instanceof Date ? t.deadline : new Date(t.deadline),
      progress: t.progress || 0
    })) as TaskProgress[]);
  }, [user, contextTasks]);

  const handleLogout = () => {
    logout();
  };

  const handleProgressUpdate = async () => {
    if (!selectedTask || !user) return;

    setIsUpdating(true);
    try {
      const newStatus = progressUpdate >= 100 ? 'completed' : progressUpdate > 0 ? 'in-progress' : 'pending';
      
      // Update task in Firebase
      const taskRef = doc(db, 'tasks', selectedTask.id);
      await updateDoc(taskRef, {
        progress: progressUpdate,
        progressNotes: progressNotes,
        lastUpdated: serverTimestamp(),
        status: newStatus,
        submittedAt: progressUpdate >= 100 ? serverTimestamp() : null
      });

      // If task is completed (100%), create commission and notify finance
      if (progressUpdate >= 100) {
        const commissionAmount = (selectedTask as any).commissionAmount || 0;
        const commissionRate = (selectedTask as any).commissionRate || 0;
        const taskBudget = (selectedTask as any).budget || 0;
        
        if (commissionAmount > 0) {
          const commissionData = {
            taskId: selectedTask.id,
            taskTitle: selectedTask.title,
            freelancerEmail: user.email,
            freelancerId: user.id,
            freelancerName: user.name || user.email,
            commissionAmount: commissionAmount,
            commissionRate: commissionRate,
            taskBudget: taskBudget,
            status: 'pending',
            completedDate: serverTimestamp(),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          await addDoc(collection(db, 'commissions'), commissionData);
          
          // Notify finance team
          await notifyFinanceTaskCompleted(
            selectedTask.id,
            selectedTask.title,
            user.email,
            user.name || user.email,
            commissionAmount
          );
          
          alert('✅ Task completed! Commission created and Finance team has been notified. They will process your payment soon.');
        } else {
          alert('✅ Task marked as completed!');
        }
      } else {
        alert('✅ Progress updated successfully!');
      }

      // Update local state
      setTasks(tasks.map(t => 
        t.id === selectedTask.id 
          ? { ...t, progress: progressUpdate, submissionNotes: progressNotes, status: newStatus }
          : t
      ));

      setSelectedTask(null);
      setProgressUpdate(0);
      setProgressNotes('');
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      alert('❌ Failed to update progress. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newFiles: TaskFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        newFiles.push({
          fileName: file.name,
          fileUrl: e.target?.result as string,
          fileSize: file.size,
          uploadedAt: new Date()
        });

        if (newFiles.length === files.length) {
          setUploadedFiles([...uploadedFiles, ...newFiles]);
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedTask || !user) return;

    if (uploadedFiles.length === 0) {
      alert('Please upload at least one file before submitting.');
      return;
    }

    setIsUpdating(true);
    try {
      const taskRef = doc(db, 'tasks', selectedTask.id);
      await updateDoc(taskRef, {
        freelancerSubmissions: uploadedFiles,
        submissionNotes: progressNotes,
        status: 'completed',
        progress: 100,
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });

      // Create commission record for finance to process
      const commissionAmount = (selectedTask as any).commissionAmount || 0;
      const commissionRate = (selectedTask as any).commissionRate || 0;
      const taskBudget = (selectedTask as any).budget || 0;
      
      if (commissionAmount > 0) {
        const commissionData = {
          taskId: selectedTask.id,
          taskTitle: selectedTask.title,
          freelancerEmail: user.email,
          freelancerId: user.id,
          freelancerName: user.name || user.email,
          commissionAmount: commissionAmount,
          commissionRate: commissionRate,
          taskBudget: taskBudget,
          status: 'pending',
          completedDate: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        await addDoc(collection(db, 'commissions'), commissionData);
        
        // Notify finance team
        await notifyFinanceTaskCompleted(
          selectedTask.id,
          selectedTask.title,
          user.email,
          user.name || user.email,
          commissionAmount
        );
      }

      alert('✅ Task submitted successfully! Admin can now download your files. Finance has been notified and will process your commission payment.');
      setSelectedTask(null);
      setUploadedFiles([]);
      setProgressNotes('');
      
      // Refresh tasks
      window.location.reload();
    } catch (error) {
      console.error('❌ Error submitting task:', error);
      alert('❌ Failed to submit task. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get commissions for this freelancer
  const myCommissions = (contextCommissions || []).filter(c => 
    c.freelancerEmail === user?.email || c.freelancerId === user?.id
  );

  const getTotalCommissions = () => {
    return myCommissions.reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  const getPaidCommissions = () => {
    return myCommissions
      .filter(c => c.status === 'paid')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  const getPendingCommissions = () => {
    return myCommissions
      .filter(c => c.status === 'pending' || c.status === 'processing')
      .reduce((sum, c) => sum + c.commissionAmount, 0);
  };

  if (!user || user.role !== 'freelancer') {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Access Denied</h1>
          <p className="text-gray-400 mb-6">You need freelancer privileges to access this page.</p>
        </div>
      </div>
    );
  }

  const renderTaskProgression = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white">Task Progression</h2>
        <div className="text-sm text-gray-400">
          {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Tasks Completed
        </div>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Total Tasks</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tasks.length}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
                <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>In Progress</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tasks.filter(t => t.status === 'in-progress').length}</p>
                    </div>
            <Activity className="h-10 w-10 text-yellow-500" />
                </div>
              </div>
              
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Completed</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tasks.filter(t => t.status === 'completed').length}</p>
                  </div>
            <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
              </div>
              
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
              <p className={`text-3xl font-bold mt-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{tasks.filter(t => t.status === 'overdue').length}</p>
                  </div>
            <AlertCircle className="h-10 w-10 text-red-500" />
                  </div>
                </div>
              </div>
              
      {/* Tasks List */}
      <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg p-6`}>
        <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Your Tasks</h3>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No tasks assigned yet</p>
            <p className="text-gray-500 text-sm mt-2">Check back later for new assignments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
            {tasks.map(task => (
              <div key={task.id} className="bg-gray-700 border border-gray-600 rounded-lg p-4 hover:border-purple-500 transition-colors">
                <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">{task.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                              </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                    task.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                    task.status === 'in-progress' ? 'bg-blue-900/30 text-blue-300' :
                    task.status === 'overdue' ? 'bg-red-900/30 text-red-300' :
                    'bg-gray-900/30 text-gray-300'
                  }`}>
                    {task.status}
                                  </span>
                          </div>
                          
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-semibold text-white">{task.progress}%</span>
                          </div>
                  <div className="w-full h-3 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        task.progress >= 100 ? 'bg-green-500' :
                        task.progress >= 75 ? 'bg-blue-500' :
                        task.progress >= 50 ? 'bg-yellow-500' :
                        'bg-orange-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                        </div>
                          </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{task.deadline.toLocaleDateString()}</span>
                  </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <Target className="h-4 w-4" />
                      <span className={`capitalize ${
                        task.priority === 'high' ? 'text-red-400' :
                        task.priority === 'medium' ? 'text-yellow-400' :
                        'text-green-400'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>

                        <button
                    onClick={() => {
                            setSelectedTask(task);
                      setProgressUpdate(task.progress);
                      setProgressNotes(task.submissionNotes || '');
                          }}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                    <TrendingUp className="h-4 w-4" />
                    Update Progress
                        </button>
                      </div>
                    </div>
            ))}
              </div>
        )}
      </div>

      {/* Progress Update Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Update Task Progress</h3>
                <button
                  onClick={() => setSelectedTask(null)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{selectedTask.title}</h4>
                  <p className="text-gray-400">{selectedTask.description}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Progress Percentage: {progressUpdate}%
                  </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                    value={progressUpdate}
                    onChange={(e) => setProgressUpdate(parseInt(e.target.value))}
                    className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>

                  <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Progress Notes
                  </label>
                  <textarea
                    value={progressNotes}
                    onChange={(e) => setProgressNotes(e.target.value)}
                    rows={4}
                    placeholder="Describe what you've completed and any blockers..."
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  </div>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProgressUpdate}
                    disabled={isUpdating}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isUpdating ? (
                      <>
                        <Clock className="h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        Update Progress
                      </>
                    )}
                  </button>
                          </div>
                    </div>
              </div>
            </div>
          </div>
        )}
                  </div>
  );

  const renderCommissions = () => {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Commission Tracking</h2>

        {/* Commission Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">Total Earned</p>
                <p className="text-3xl font-bold text-white mt-2">RM {getTotalCommissions().toFixed(2)}</p>
                  </div>
              <DollarSign className="h-12 w-12 text-green-400" />
              </div>
            </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 border border-blue-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-300 text-sm">Paid</p>
                <p className="text-3xl font-bold text-white mt-2">RM {getPaidCommissions().toFixed(2)}</p>
                </div>
              <CheckCircle className="h-12 w-12 text-blue-400" />
                </div>
              </div>
              
          <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 border border-orange-700 rounded-lg p-6">
                  <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-300 text-sm">Pending</p>
                <p className="text-3xl font-bold text-white mt-2">RM {getPendingCommissions().toFixed(2)}</p>
                    </div>
              <Clock className="h-12 w-12 text-orange-400" />
                  </div>
              </div>
            </div>

            {/* Commission History */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Commission History</h3>

          {myCommissions.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No commissions yet</p>
              <p className="text-gray-500 text-sm mt-2">Complete tasks to earn commissions</p>
              </div>
          ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Task</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase">Completed</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Budget</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Rate</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-300 uppercase">Commission</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Payment Status</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-300 uppercase">Receipt</th>
                      </tr>
                    </thead>
                <tbody className="divide-y divide-gray-700">
                  {myCommissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 text-sm text-white">{commission.taskTitle}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {commission.completedDate ? new Date(commission.completedDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-white">
                        RM {(commission.taskBudget || 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-center text-purple-400">
                        {commission.commissionRate ? `${commission.commissionRate}%` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-green-400">
                        RM {commission.commissionAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          commission.status === 'paid' ? 'bg-green-900/30 text-green-300 border border-green-500' :
                          commission.status === 'processing' ? 'bg-blue-900/30 text-blue-300 border border-blue-500' :
                          commission.status === 'rejected' ? 'bg-red-900/30 text-red-300 border border-red-500' :
                          'bg-orange-900/30 text-orange-300 border border-orange-500'
                        }`}>
                          {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
                        </span>
                        {commission.paymentDate && commission.status === 'paid' && (
                          <div className="text-xs text-gray-400 mt-1">
                            Paid: {new Date(commission.paymentDate).toLocaleDateString()}
                          </div>
                        )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {(commission as any).paymentReceipt?.fileUrl ? (
                              <a
                                href={(commission as any).paymentReceipt.fileUrl}
                                download={(commission as any).paymentReceipt.fileName || 'receipt.pdf'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                              >
                                <Download className="h-4 w-4" />
                                Download Receipt
                              </a>
                            ) : commission.status === 'paid' ? (
                              <span className="text-gray-500 text-xs">Receipt uploading...</span>
                            ) : (
                              <span className="text-gray-600 text-xs">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
          )}
              </div>
              
        {/* Commission Info */}
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-300 text-sm font-medium">Your Commission Rate: {user.commissionRate || 10}%</p>
              <p className="text-blue-400 text-xs mt-1">
                You earn {user.commissionRate || 10}% of the project budget upon completion. Payments are processed within 7-14 business days after project delivery.
                    </p>
                  </div>
                </div>
              </div>
                  </div>
    );
  };

  const renderTaskDetails = () => {
    return (
            <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white">Task Details & Submission</h2>

      <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 min-h-[calc(100vh-12rem)]">
        <h3 className="text-xl font-semibold text-white mb-4">Select a Task</h3>
              
              {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-20rem)]">
            <FileText className="h-24 w-24 text-gray-600 mb-6" />
            <p className="text-gray-400 text-2xl font-semibold mb-2">No tasks available</p>
            <p className="text-gray-500 text-sm">Tasks assigned by admin will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
                  {tasks.map(task => (
                    <button
                      key={task.id}
                      onClick={() => {
                  setSelectedTask(task);
                  setProgressNotes(task.submissionNotes || '');
                  setUploadedFiles(task.attachments || []);
                }}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  selectedTask?.id === task.id
                    ? 'bg-purple-900/30 border-purple-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-semibold">{task.title}</h4>
                    <p className="text-gray-400 text-sm mt-1">{task.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                    task.status === 'completed' ? 'bg-green-900/30 text-green-300' :
                    task.status === 'in-progress' ? 'bg-blue-900/30 text-blue-300' :
                    'bg-gray-900/30 text-gray-300'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

        {selectedTask && (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Task Submission</h3>

            {/* Info Banner */}
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                  <p className="text-blue-300 text-sm font-medium">How Task Submission Works:</p>
                  <ol className="text-blue-400 text-xs mt-2 space-y-1 list-decimal list-inside">
                    <li>Download task files from admin (if provided)</li>
                    <li>Complete your work</li>
                    <li>Upload your completed files below</li>
                    <li>Click "Submit Task" - Admin will be able to download your work</li>
                  </ol>
                    </div>
                    </div>
                      </div>

            <div className="space-y-6">
              {/* Task Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Deadline</p>
                  <p className="text-white font-semibold mt-1">{selectedTask.deadline.toLocaleDateString()}</p>
                      </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <p className="text-gray-400 text-sm">Priority</p>
                  <p className={`font-semibold mt-1 capitalize ${
                    selectedTask.priority === 'high' ? 'text-red-400' :
                    selectedTask.priority === 'medium' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {selectedTask.priority}
                  </p>
                  </div>
                </div>

              {/* Admin Files - Download Section */}
              {(selectedTask as any).adminFiles && (selectedTask as any).adminFiles.length > 0 && (
                <div className="bg-gray-800 border-2 border-gray-600 rounded-lg p-4">
                  <h4 className="text-gray-200 font-semibold mb-3 flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Task Files from Admin - Download These:
                  </h4>
                  <div className="space-y-2">
                    {(selectedTask as any).adminFiles.map((file: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                            <div>
                            <p className="text-white text-sm font-medium">{file.fileName}</p>
                            <p className="text-gray-400 text-xs">{(file.fileSize / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.fileUrl;
                              link.download = file.fileName;
                              link.click();
                            }}
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Download className="h-4 w-4" />
                          Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* File Upload - Freelancer's Completed Work */}
              <div className="bg-green-900/20 border-2 border-green-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-green-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload Your Completed Work
                  </div>
                      </label>
                <div className="border-2 border-dashed border-green-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors bg-gray-700/30">
                  <Upload className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-300 mb-2 font-medium">Upload your finished files here</p>
                  <p className="text-gray-400 text-sm mb-3">Admin will be able to download these</p>
                      <input
                        type="file"
                        multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg cursor-pointer transition-colors"
                  >
                    Choose Files
                  </label>
                    </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-5 w-5 text-gray-400" />
                      <div>
                            <p className="text-white text-sm font-medium">{file.fileName}</p>
                            <p className="text-gray-400 text-xs">{(file.fileSize / 1024).toFixed(2)} KB</p>
                          </div>
                              </div>
                              <button
                          onClick={() => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx))}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          <X className="h-4 w-4 text-gray-400" />
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                </div>

              {/* Submission Notes */}
                    <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Submission Notes
                      </label>
                      <textarea
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                        rows={4}
                  placeholder="Add notes about your submission..."
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                    </div>

              {/* Submit Button */}
                      <button
                onClick={handleSubmitTask}
                disabled={isUpdating || uploadedFiles.length === 0}
                className="w-full px-6 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? (
                  <>
                    <Clock className="h-6 w-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-6 w-6" />
                    Submit Task
                  </>
                )}
                  </button>
                  </div>
                </div>
        )}
                </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'progression':
        return renderTaskProgression();
      case 'commissions':
        return renderCommissions();
      case 'details':
        return renderTaskDetails();
      default:
        return null;
    }
  };
                      
                      return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className={`w-64 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col`}>
          <div className={`p-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>🎯 Freelancer Portal</h1>
            <p className={`text-sm mt-1 font-semibold ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</p>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{user.uniqueId}</p>
          </div>

          <nav className="px-4 space-y-2 flex-1">
            <button
              onClick={() => setActiveTab('progression')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'progression'
                  ? 'bg-purple-600 text-white'
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Task Progression</span>
            </button>

            <button
              onClick={() => setActiveTab('commissions')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'commissions'
                  ? 'bg-purple-600 text-white'
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <DollarSign className="h-5 w-5" />
              <span className="font-medium">Commissions</span>
            </button>

            <button
              onClick={() => setActiveTab('details')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'details'
                  ? 'bg-purple-600 text-white'
                  : theme === 'dark' 
                    ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <FileText className="h-5 w-5" />
              <span className="font-medium">Task Details</span>
            </button>
          </nav>

          {/* Bottom Actions */}
          <div className={`p-4 space-y-2 border-t mt-auto ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <button
              onClick={() => navigate('/')}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </button>

            <button
              onClick={toggleTheme}
              className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

                  <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
                  </button>
                </div>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-8 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
          {/* Notification Bell - Top Right */}
          <div className="flex justify-end mb-4">
            <NotificationBell />
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default FreelancerDashboard;
