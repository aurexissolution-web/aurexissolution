import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../hooks/useAppContext';
import type { ProjectFeedback } from '../../types';
import { Star, Send, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const CustomerProjectFeedback: React.FC = () => {
  const { user, projects } = useAppContext();
  const [completedProjects, setCompletedProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    overallRating: 0,
    qualityRating: 0,
    timelinessRating: 0,
    communicationRating: 0,
    whatWentWell: '',
    whatCouldImprove: '',
    additionalComments: '',
    wouldRecommend: true
  });

  // Get completed customer projects without feedback
  useEffect(() => {
    const fetchProjectsWithoutFeedback = async () => {
      if (!user) return;

      const customerProjects = (Array.isArray(projects) ? projects : []).filter(
        p => ((p.assignedTo === user.uniqueId && p.assignedType === 'customer') || 
              p.customerUniqueId === user.uniqueId) && // Include requested projects
            p.status === 'completed'
      );

      // Check which projects already have feedback
      const projectsWithoutFeedback: any[] = [];
      for (const project of customerProjects) {
        const q = query(
          collection(db, 'projectFeedback'),
          where('projectId', '==', project.id),
          where('customerEmail', '==', user.email)
        );
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
          projectsWithoutFeedback.push(project);
        }
      }

      setCompletedProjects(projectsWithoutFeedback);
    };

    fetchProjectsWithoutFeedback();
  }, [user, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProject || !user) {
      alert('❌ Please select a project');
      return;
    }

    if (feedbackData.overallRating === 0) {
      alert('❌ Please provide an overall rating');
      return;
    }

    setIsSubmitting(true);

    try {
      const project = completedProjects.find(p => p.id === selectedProject);
      
      const feedback: Omit<ProjectFeedback, 'id'> = {
        projectId: selectedProject,
        projectTitle: project?.title || 'Unknown Project',
        customerEmail: String(user.email || ''),
        customerUniqueId: String(user.uniqueId || ''),
        customerName: String(user.name || user.email || 'Customer'),
        overallRating: feedbackData.overallRating,
        qualityRating: feedbackData.qualityRating || feedbackData.overallRating,
        timelinessRating: feedbackData.timelinessRating || feedbackData.overallRating,
        communicationRating: feedbackData.communicationRating || feedbackData.overallRating,
        whatWentWell: feedbackData.whatWentWell.trim(),
        whatCouldImprove: feedbackData.whatCouldImprove.trim(),
        additionalComments: feedbackData.additionalComments.trim(),
        wouldRecommend: feedbackData.wouldRecommend,
        submittedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projectFeedback'), feedback);

      alert('✅ Thank you for your feedback! We appreciate your input and will use it to improve our services.');

      // Reset form
      setSelectedProject(null);
      setFeedbackData({
        overallRating: 0,
        qualityRating: 0,
        timelinessRating: 0,
        communicationRating: 0,
        whatWentWell: '',
        whatCouldImprove: '',
        additionalComments: '',
        wouldRecommend: true
      });

      // Remove submitted project from list
      setCompletedProjects(prev => prev.filter(p => p.id !== selectedProject));
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      alert(`❌ Failed to submit feedback: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating: React.FC<{ rating: number; onChange: (rating: number) => void }> = ({ rating, onChange }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                star <= rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (completedProjects.length === 0) {
    return (
      <div className="p-8 text-center bg-surface rounded-lg border border-neutral">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-text-secondary opacity-50" />
        <h3 className="text-xl font-semibold text-text-primary mb-2">No Feedback Needed</h3>
        <p className="text-text-secondary">
          You don't have any completed projects that need feedback at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <MessageSquare size={28} />
          Project Feedback
        </h2>
        <p className="text-text-secondary mt-1">
          Help us improve by sharing your experience with completed projects
        </p>
      </div>

      <div className="bg-surface rounded-lg border border-neutral p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Project *
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
              required
            >
              <option value="">Choose a completed project...</option>
              {completedProjects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </div>

          {selectedProject && (
            <>
              {/* Overall Rating */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Overall Experience *
                </label>
                <StarRating
                  rating={feedbackData.overallRating}
                  onChange={(rating) => setFeedbackData({ ...feedbackData, overallRating: rating })}
                />
                {feedbackData.overallRating > 0 && (
                  <p className="text-sm text-text-secondary mt-1">
                    {feedbackData.overallRating === 5 ? 'Excellent!' :
                     feedbackData.overallRating === 4 ? 'Very Good' :
                     feedbackData.overallRating === 3 ? 'Good' :
                     feedbackData.overallRating === 2 ? 'Fair' : 'Needs Improvement'}
                  </p>
                )}
              </div>

              {/* Detailed Ratings (Optional) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Quality of Work
                  </label>
                  <StarRating
                    rating={feedbackData.qualityRating}
                    onChange={(rating) => setFeedbackData({ ...feedbackData, qualityRating: rating })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Timeliness
                  </label>
                  <StarRating
                    rating={feedbackData.timelinessRating}
                    onChange={(rating) => setFeedbackData({ ...feedbackData, timelinessRating: rating })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Communication
                  </label>
                  <StarRating
                    rating={feedbackData.communicationRating}
                    onChange={(rating) => setFeedbackData({ ...feedbackData, communicationRating: rating })}
                  />
                </div>
              </div>

              {/* What Went Well */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  What went well?
                </label>
                <textarea
                  value={feedbackData.whatWentWell}
                  onChange={(e) => setFeedbackData({ ...feedbackData, whatWentWell: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                  rows={3}
                  placeholder="Tell us what you liked about the project..."
                />
              </div>

              {/* What Could Improve */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  What could we improve?
                </label>
                <textarea
                  value={feedbackData.whatCouldImprove}
                  onChange={(e) => setFeedbackData({ ...feedbackData, whatCouldImprove: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                  rows={3}
                  placeholder="Share areas where we can improve..."
                />
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Additional Comments
                </label>
                <textarea
                  value={feedbackData.additionalComments}
                  onChange={(e) => setFeedbackData({ ...feedbackData, additionalComments: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-neutral bg-background text-text-primary"
                  rows={3}
                  placeholder="Any other feedback you'd like to share..."
                />
              </div>

              {/* Would Recommend */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-text-primary">
                  Would you recommend our services?
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, wouldRecommend: true })}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      feedbackData.wouldRecommend
                        ? 'bg-green-500 text-white'
                        : 'bg-neutral text-text-secondary hover:bg-neutral/60'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, wouldRecommend: false })}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                      !feedbackData.wouldRecommend
                        ? 'bg-red-500 text-white'
                        : 'bg-neutral text-text-secondary hover:bg-neutral/60'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    No
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4 border-t border-neutral">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default CustomerProjectFeedback;

