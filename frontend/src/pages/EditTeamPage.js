// src/pages/EditTeamPage.js (NEW FILE - COMPLETE AND FUNCTIONAL)
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom'; // Import useParams and useNavigate
import {
  Edit, Info, Hash, Calendar, Layers, Users, Star, MessageSquare, Plus, Trash2, Code, Lightbulb, MapPin, Award
} from 'lucide-react'; // Icons
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import Loader from '../components/Common/Loader';
import { teamsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext'; // To check if current user is leader
import toast from 'react-hot-toast';

const EditTeamPage = () => {
  const { id } = useParams(); // Get team ID from URL
  const navigate = useNavigate();
  const { user: currentUser, loading: authLoading } = useAuth(); // Get current authenticated user

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [team, setTeam] = useState(null); // State to hold the fetched team data

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset, // For pre-populating the form
    watch // For conditional rendering (e.g., project idea fields)
  } = useForm({
    // Default values will be overridden by reset() after fetching data
    defaultValues: {
      name: '',
      description: '',
      hackathon: {
        name: '',
        date: '',
        location: '',
        website: '',
        prize: ''
      },
      skillsNeeded: [{ skill: '' }],
      rolesNeeded: [{ role: '' }],
      maxMembers: 4,
      experienceLevel: 'mixed',
      projectIdea: {
        title: '',
        description: '',
        techStack: [{ tech: '' }],
        features: [{ feature: '' }]
      },
      requirements: {
        commitment: '',
        timezone: '',
        communication: '',
        meetingFrequency: ''
      },
      tags: [{ tag: '' }],
      isPublic: true
    }
  });

  // UseFieldArray for dynamic lists
  const { fields: skillsFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control, name: "skillsNeeded"
  });
  const { fields: rolesFields, append: appendRole, remove: removeRole } = useFieldArray({
    control, name: "rolesNeeded"
  });
  const { fields: techStackFields, append: appendTechStack, remove: removeTechStack } = useFieldArray({
    control, name: "projectIdea.techStack"
  });
  const { fields: featuresFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control, name: "projectIdea.features"
  });
  const { fields: tagsFields, append: appendTag, remove: removeTag } = useFieldArray({
    control, name: "tags"
  });

  const projectIdeaTitle = watch('projectIdea.title'); // Watch for conditional rendering

  // --- Fetch Team Data on Load ---
  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      setError(null);
      if (authLoading) return; // Wait for auth state to settle

      if (!id) {
        setError('No team ID provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await teamsAPI.getTeam(id);
        const fetchedTeam = response.data;
        setTeam(fetchedTeam);

        // Check if current user is the leader
        if (!currentUser || fetchedTeam.leader._id !== currentUser.id) {
          toast.error('You are not authorized to edit this team.');
          navigate(`/teams/${id}`); // Redirect to team detail page
          return;
        }

        // Prepare data for react-hook-form: flatten arrays of objects into arrays of values
        const formValues = {
          ...fetchedTeam,
          skillsNeeded: fetchedTeam.skillsNeeded?.map(skill => ({ skill })) || [{ skill: '' }],
          rolesNeeded: fetchedTeam.rolesNeeded?.map(role => ({ role })) || [{ role: '' }],
          projectIdea: {
            ...fetchedTeam.projectIdea,
            techStack: fetchedTeam.projectIdea?.techStack?.map(tech => ({ tech })) || [{ tech: '' }],
            features: fetchedTeam.projectIdea?.features?.map(feature => ({ feature })) || [{ feature: '' }]
          },
          tags: fetchedTeam.tags?.map(tag => ({ tag })) || [{ tag: '' }],
          // Handle date format for input[type="date"]
          hackathon: {
            ...fetchedTeam.hackathon,
            date: fetchedTeam.hackathon?.date ? new Date(fetchedTeam.hackathon.date).toISOString().split('T')[0] : ''
          }
        };

        reset(formValues); // Pre-populate the form

      } catch (err) {
        console.error('Failed to fetch team for editing:', err);
        setError(err.response?.data?.error || 'Failed to load team for editing.');
        toast.error('Failed to load team details for editing.');
        navigate('/teams'); // Redirect if team not found or error
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [id, currentUser, authLoading, navigate, reset]); // Dependencies

  // --- Handle Form Submission (Update Team) ---
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Flatten the arrays back to simple string arrays
      const formattedData = {
        ...data,
        skillsNeeded: data.skillsNeeded.map(s => s.skill).filter(Boolean),
        rolesNeeded: data.rolesNeeded.map(r => r.role).filter(Boolean),
        tags: data.tags.map(t => t.tag).filter(Boolean),
        projectIdea: {
          ...data.projectIdea,
          techStack: data.projectIdea.techStack.map(t => t.tech).filter(Boolean),
          features: data.projectIdea.features.map(f => f.feature).filter(Boolean),
        }
      };

      // Clean up empty objects if no data
      if (!formattedData.projectIdea?.title) { // Check if title exists, otherwise delete whole object
        delete formattedData.projectIdea;
      }
      if (!formattedData.hackathon?.name) { // Check if name exists, otherwise delete whole object
        delete formattedData.hackathon;
      }
      if (!Object.values(formattedData.requirements || {}).some(Boolean)) { // Check if any requirement field has data
        delete formattedData.requirements;
      }

      await teamsAPI.updateTeam(id, formattedData); // Call updateTeam API
      toast.success('Team updated successfully! 🎉');
      navigate(`/teams/${id}`); // Redirect back to team's detail page

    } catch (err) {
      console.error('Failed to update team:', err);
      toast.error(err.response?.data?.error || 'Failed to update team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Logic ---
  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-darkbg">
        <Loader size={64} color="text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-darkbg text-red-400">
        <h2 className="text-3xl font-bold mb-4">Error</h2>
        <p>{error}</p>
        <Button onClick={() => navigate(`/teams/${id}`)} className="mt-6">Go Back to Team</Button>
      </div>
    );
  }

  if (!team) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-lighttext text-xl">Team not found or unauthorized access.</div>;
  }

  // Double check authorization on client-side render (though backend handles it too)
  if (currentUser && team.leader._id !== currentUser.id) {
    return (
      <div className="min-h-screen pt-20 flex flex-col items-center justify-center bg-darkbg text-red-400">
        <h2 className="text-3xl font-bold mb-4">Access Denied</h2>
        <p>You are not authorized to edit this team.</p>
        <Button onClick={() => navigate(`/teams/${id}`)} className="mt-6">Go Back to Team</Button>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 font-heading text-center"
        >
          <Edit className="inline-block h-10 w-10 mr-3 text-primary" />
          Edit Team: {team.name}
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gray-800/60 rounded-xl p-8 shadow-lg border border-gray-700/50 space-y-8"
        >
          {/* Basic Team Info */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2">
            <Info className="h-7 w-7 text-secondary" /> Team Details
          </h2>
          <Input
            label="Team Name"
            id="name"
            placeholder="e.g., Code Crusaders"
            {...register('name', { required: 'Team name is required' })}
            error={errors.name?.message}
          />
          <div className="space-y-2">
            <label htmlFor="description" className="block text-lighttext text-sm font-medium mb-2">
              Team Description
            </label>
            <textarea
              id="description"
              placeholder="A brief description of your team's goals and vibe..."
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 p-4 focus:outline-none focus:ring-2 focus:ring-secondary resize-y"
              {...register('description', { required: 'Description is required' })}
            ></textarea>
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Hackathon Details (Optional) */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <Calendar className="h-7 w-7 text-accent" /> Hackathon Details (Optional)
          </h2>
          <Input
            label="Hackathon Name"
            id="hackathonName"
            placeholder="e.g., HackUCI 2024"
            {...register('hackathon.name')}
          />
          <Input
            label="Hackathon Date"
            id="hackathonDate"
            type="date"
            {...register('hackathon.date')}
          />
          <Input
            label="Hackathon Location"
            id="hackathonLocation"
            placeholder="e.g., Irvine, CA or Online"
            {...register('hackathon.location')}
          />
          <Input
            label="Hackathon Website"
            id="hackathonWebsite"
            type="url"
            placeholder="https://hackathon.com"
            {...register('hackathon.website')}
          />
          <Input
            label="Potential Prize (Optional)"
            id="hackathonPrize"
            placeholder="e.g., Best Blockchain Hack"
            {...register('hackathon.prize')}
          />

          {/* Skills Needed */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <Layers className="h-7 w-7 text-primary" /> Skills Needed
          </h2>
          {skillsFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3">
              <Input
                label={index === 0 ? "Skill" : null}
                id={`skill-${index}`}
                placeholder="e.g., React, Python, ML"
                className="flex-grow"
                {...register(`skillsNeeded.${index}.skill`)}
              />
              {skillsFields.length > 1 && (
                <Button type="button" variant="secondary" onClick={() => removeSkill(index)} className="px-3 py-2">
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendSkill({ skill: '' })} className="mt-2">
            Add Another Skill
          </Button>

          {/* Roles Needed */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <Users className="h-7 w-7 text-secondary" /> Roles Needed
          </h2>
          {rolesFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3">
              <Input
                label={index === 0 ? "Role" : null}
                id={`role-${index}`}
                placeholder="e.g., Frontend Dev, Designer"
                className="flex-grow"
                {...register(`rolesNeeded.${index}.role`)}
              />
              {rolesFields.length > 1 && (
                <Button type="button" variant="secondary" onClick={() => removeRole(index)} className="px-3 py-2">
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendRole({ role: '' })} className="mt-2">
            Add Another Role
          </Button>

          {/* Team Settings */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <Star className="h-7 w-7 text-accent" /> Team Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxMembers" className="block text-lighttext text-sm font-medium mb-2">
                Max Members
              </label>
              <select
                id="maxMembers"
                className="w-full bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                {...register('maxMembers', { valueAsNumber: true })}
              >
                {[2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="experienceLevel" className="block text-lighttext text-sm font-medium mb-2">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                className="w-full bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                {...register('experienceLevel')}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>
          <div className="flex items-center mt-4">
            <input
              type="checkbox"
              id="isPublic"
              className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary bg-gray-700"
              {...register('isPublic')}
            />
            <label htmlFor="isPublic" className="ml-2 text-lighttext">
              Make team public (visible to others)
            </label>
          </div>

          {/* Project Idea (Conditional) */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <Lightbulb className="h-7 w-7 text-primary" /> Project Idea (Optional)
          </h2>
          <Input
            label="Project Title"
            id="projectTitle"
            placeholder="e.g., AI-Powered Study Buddy"
            {...register('projectIdea.title')}
          />
          {projectIdeaTitle && ( // Only show description and tech stack if title is entered
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="projectDescription" className="block text-lighttext text-sm font-medium mb-2">
                  Project Description
                </label>
                <textarea
                  id="projectDescription"
                  placeholder="Describe your project idea in detail..."
                  className="w-full h-32 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 p-4 focus:outline-none focus:ring-2 focus:ring-secondary resize-y"
                  {...register('projectIdea.description')}
                ></textarea>
              </div>

              {/* Project Tech Stack */}
              <h3 className="text-xl font-semibold text-white mt-6 mb-2">Tech Stack:</h3>
              {techStackFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <Input
                    label={index === 0 ? "Technology" : null}
                    id={`tech-${index}`}
                    placeholder="e.g., Node.js, React, MongoDB"
                    className="flex-grow"
                    {...register(`projectIdea.techStack.${index}.tech`)}
                  />
                  {techStackFields.length > 1 && (
                    <Button type="button" variant="secondary" onClick={() => removeTechStack(index)} className="px-3 py-2">
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendTechStack({ tech: '' })} className="mt-2">
                Add Another Technology
              </Button>

              {/* Project Features */}
              <h3 className="text-xl font-semibold text-white mt-6 mb-2">Key Features:</h3>
              {featuresFields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3">
                  <Input
                    label={index === 0 ? "Feature" : null}
                    id={`feature-${index}`}
                    placeholder="e.g., Real-time collaboration, User authentication"
                    className="flex-grow"
                    {...register(`projectIdea.features.${index}.feature`)}
                  />
                  {featuresFields.length > 1 && (
                    <Button type="button" variant="secondary" onClick={() => removeFeature(index)} className="px-3 py-2">
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendFeature({ feature: '' })} className="mt-2">
                Add Another Feature
              </Button>
            </motion.div>
          )}

          {/* Team Requirements (Optional) */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <MessageSquare className="h-7 w-7 text-primary" /> Team Requirements (Optional)
          </h2>
          <Input
            label="Commitment Level"
            id="commitment"
            placeholder="e.g., Full-time during hackathon, part-time leading up to it"
            {...register('requirements.commitment')}
          />
          <Input
            label="Preferred Timezone"
            id="timezone"
            placeholder="e.g., PST, EST, UTC+5:30"
            {...register('requirements.timezone')}
          />
          <Input
            label="Communication Style"
            id="communication"
            placeholder="e.g., Daily stand-ups, asynchronous"
            {...register('requirements.communication')}
          />
          <Input
            label="Meeting Frequency"
            id="meetingFrequency"
            placeholder="e.g., Twice a day, once a week"
            {...register('requirements.meetingFrequency')}
          />

          {/* Tags (Optional) */}
          <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 pt-6 border-t border-gray-700/50">
            <Hash className="h-7 w-7 text-accent" /> Tags (Optional)
          </h2>
          {tagsFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3">
              <Input
                label={index === 0 ? "Tag" : null}
                id={`tag-${index}`}
                placeholder="e.g., beginner-friendly, hardware, social-impact"
                className="flex-grow"
                {...register(`tags.${index}.tag`)}
              />
              {tagsFields.length > 1 && (
                <Button type="button" variant="secondary" onClick={() => removeTag(index)} className="px-3 py-2">
                  Remove
                </Button>
              )}
            </div>
          ))}
          <Button type="button" variant="outline" onClick={() => appendTag({ tag: '' })} className="mt-2">
            Add Another Tag
          </Button>

          {/* Submit Button */}
          <Button type="submit" className="w-full text-lg h-12 mt-8" disabled={loading}>
            {loading ? <Loader size={20} color="text-white" /> : 'Save Changes'}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default EditTeamPage;