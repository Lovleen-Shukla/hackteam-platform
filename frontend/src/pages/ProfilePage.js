// src/pages/ProfilePage.js (UPDATED AND CORRECTED FOR 'format' USAGE)
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { usersAPI, authAPI, reviewsAPI, teamsAPI } from '../services/api';
import Loader from '../components/Common/Loader';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import {
  User as UserIcon, MapPin, University, Award, Code, Github, Linkedin, XCircle,
  Star,
  Info,
  Calendar,
  Link as LinkIcon,
  Plus, Trash2,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { formatDistanceToNow, format } from 'date-fns'; // 'format' will now be explicitly used

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser, updateProfile: updateAuthProfile, loading: authLoading } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewPagination, setReviewPagination] = useState({ page: 1, limit: 5, total: 0, pages: 1 });
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [teamsWithReviewedUser, setTeamsWithReviewedUser] = useState([]);

  const navigate = useNavigate();

  const {
    register, handleSubmit, control, formState: { errors }, reset, setValue, watch
  } = useForm({
    defaultValues: {
      username: '', email: '',
      profile: {
        firstName: '', lastName: '', bio: '', avatar: '', location: '', university: '', yearOfStudy: '', major: '',
        skills: '', interests: '', github: '', leetcode: '', linkedin: '', portfolio: '', codeforces: '',
        hackerrank: '', kaggle: '', devpost: '',
        achievements: [], projects: [], hackathonsAttended: []
      },
      preferences: {
        teamSize: null, experienceLevel: '', communicationStyle: '', availability: '', timezone: ''
      }
    }
  });

  const { fields: achievementsFields, append: appendAchievement, remove: removeAchievement } = useFieldArray({ control, name: "profile.achievements" });
  const { fields: projectsFields, append: appendProject, remove: removeProject } = useFieldArray({ control, name: "profile.projects" });
  const { fields: hackathonsAttendedFields, append: appendHackathonAttended, remove: removeHackathonAttended } = useFieldArray({ control, name: "profile.hackathonsAttended" });

  const { register: reviewRegister, handleSubmit: handleReviewSubmit, reset: resetReviewForm, formState: { errors: reviewErrors } } = useForm();

  const onDrop = useCallback(acceptedFiles => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result);
        setValue('profile.avatarFile', file);
      };
      reader.readAsDataURL(file);
    }
  }, [setValue]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': ['.jpeg', '.png', '.jpg'] }, maxFiles: 1, noKeyboard: true
  });

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      setLoading(true);
      setError(null);

      const targetUserId = id || currentUser?.id;

      if (!authLoading && !targetUserId) {
        setError("Please log in to view your profile, or navigate to a specific user's profile.");
        setLoading(false);
        if (!id) { navigate('/login'); }
        return;
      }
      if (authLoading || !targetUserId) { return; }

      try {
        const [userDataResponse, reviewsResponse] = await Promise.all([
          id ? usersAPI.getUser(id) : authAPI.getProfile(),
          reviewsAPI.getReviewsForUser(targetUserId, { page: reviewPagination.page, limit: reviewPagination.limit })
        ]);

        const fetchedUser = userDataResponse.data;
        setProfileUser(fetchedUser);
        setReviews(reviewsResponse.data.reviews);
        setReviewPagination(reviewsResponse.data.pagination);

        if (fetchedUser.profile?.skills && Array.isArray(fetchedUser.profile.skills)) { fetchedUser.profile.skills = fetchedUser.profile.skills.join(', '); }
        if (fetchedUser.profile?.interests && Array.isArray(fetchedUser.profile.interests)) { fetchedUser.profile.interests = fetchedUser.profile.interests.join(', '); }
        if (fetchedUser.profile?.projects) {
          fetchedUser.profile.projects = fetchedUser.profile.projects.map(p => ({
            ...p, techStack: p.techStack ? p.techStack.join(', ') : ''
          }));
        }
        // Format dates for react-hook-form defaultValues if they exist
        if (fetchedUser.profile?.achievements) {
          fetchedUser.profile.achievements = fetchedUser.profile.achievements.map(a => ({
            ...a, date: a.date ? format(new Date(a.date), 'yyyy-MM-dd') : ''
          }));
        }
        if (fetchedUser.profile?.hackathonsAttended) {
          fetchedUser.profile.hackathonsAttended = fetchedUser.profile.hackathonsAttended.map(h => ({
            ...h, date: h.date ? format(new Date(h.date), 'yyyy-MM-dd') : ''
          }));
        }

        reset(fetchedUser);
        setAvatarPreview(fetchedUser.profile?.avatar || null);

        setIsEditing(!id || (currentUser && id === currentUser.id));

        if (currentUser && !isEditing) {
          const myTeams = await teamsAPI.getMyTeams();
          const sharedTeams = myTeams.data.filter(team =>
            team.members.some(member => member.user._id === fetchedUser._id)
          );
          setCanReview(sharedTeams.length > 0);
          setTeamsWithReviewedUser(sharedTeams);
        }

      } catch (err) {
        console.error('Failed to fetch profile or reviews:', err);
        setError(err.response?.data?.error || 'Failed to load user profile or reviews.');
        toast.error('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndReviews();

  }, [id, currentUser, authLoading, reviewPagination.page, reviewPagination.limit, reset, navigate, isEditing]);

  const onSubmitProfile = async (data) => {
    setLoading(true);
    try {
      const formattedData = {
        ...data,
        profile: {
          ...data.profile,
          skills: data.profile.skills ? data.profile.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          interests: data.profile.interests ? data.profile.interests.split(',').map(s => s.trim()).filter(Boolean) : [],
          achievements: data.profile.achievements.map(a => ({ title: a.title, description: a.description, date: a.date, link: a.link })).filter(a => a.title),
          projects: data.profile.projects.map(p => ({ name: p.name, description: p.description, techStack: p.techStack ? p.techStack.split(',').map(s => s.trim()).filter(Boolean) : [], github: p.github, demo: p.demo, image: p.image })).filter(p => p.name),
          hackathonsAttended: data.profile.hackathonsAttended.map(h => ({ name: h.name, position: h.position, project: h.project, date: h.date })).filter(h => h.name)
        },
        preferences: {
          ...data.preferences,
          teamSize: data.preferences.teamSize ? parseInt(data.preferences.teamSize) : null
        }
      };

      const formData = new FormData();
      formData.append('username', formattedData.username);
      formData.append('email', formattedData.email);
      formData.append('profile', JSON.stringify(formattedData.profile));
      formData.append('preferences', JSON.stringify(formattedData.preferences));

      const avatarFile = watch('profile.avatarFile');
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatarPreview === null && profileUser?.profile?.avatar) {
        formData.append('removeAvatar', 'true');
      }

      const response = await authAPI.updateProfile(formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      updateAuthProfile(response.data.user);
      setProfileUser(response.data.user);
      reset(response.data.user);
      setAvatarPreview(response.data.user.profile?.avatar || null);
      setIsEditing(false);
      toast.success('Profile updated successfully! 🎉');

    } catch (err) {
      console.error('Failed to update profile:', err);
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    if (!isEditing) { e.preventDefault(); return; }
    handleSubmit(onSubmitProfile)(e);
  };

  const onSubmitReview = async (data) => {
    setLoading(true);
    try {
      const reviewData = {
        userBeingReviewed: profileUser._id,
        team: data.teamId,
        rating: parseInt(data.rating),
        comment: data.comment,
        strengths: data.strengths ? data.strengths.split(',').map(s => s.trim()).filter(Boolean) : [],
        areasForImprovement: data.areasForImprovement ? data.areasForImprovement.split(',').map(s => s.trim()).filter(Boolean) : [],
        isPublic: data.isPublic || false,
      };

      await reviewsAPI.submitReview(reviewData);
      toast.success('Review submitted successfully! Thank you for your feedback. 🎉');
      setShowReviewForm(false);
      resetReviewForm();
      setLoading(true); // Trigger re-fetch and show loader again
      setError(null); // Clear any previous errors
      const [userDataResponse, reviewsResponse] = await Promise.all([
          id ? usersAPI.getUser(id) : authAPI.getProfile(),
          reviewsAPI.getReviewsForUser(profileUser._id, { page: reviewPagination.page, limit: reviewPagination.limit })
      ]);
      setProfileUser(userDataResponse.data);
      setReviews(reviewsResponse.data.reviews);
      setReviewPagination(reviewsResponse.data.pagination);
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= reviewPagination.pages) {
      setReviewPagination(prev => ({ ...prev, page: newPage }));
    }
  };


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
        <h2 className="text-3xl font-bold mb-4">Error Loading Profile</h2>
        <p>{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-6">Retry</Button>
      </div>
    );
  }

  if (!profileUser) {
    return <div className="min-h-screen pt-20 flex items-center justify-center text-lighttext text-xl">Profile not found.</div>;
  }

  const isOwnProfile = currentUser && (id === currentUser.id || !id);

  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800/60 rounded-xl p-8 shadow-lg border border-gray-700/50"
        >
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:justify-between mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white font-heading mb-4 md:mb-0">
              <UserIcon className="inline-block h-10 w-10 mr-3 text-primary" />
              {isOwnProfile ? 'My Profile' : `${profileUser.profile?.firstName || profileUser.username}'s Profile`}
            </h1>
            {isOwnProfile && (
              <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'secondary' : 'primary'}>
                {isEditing ? 'View Profile' : 'Edit Profile'}
              </Button>
            )}
            {/* Display Average Rating */}
            {profileUser.rating.count > 0 && (
                <div className="flex items-center text-white text-xl mt-4 md:mt-0 md:ml-4">
                    <Star className="h-6 w-6 text-yellow-400 mr-2" fill="currentColor" />
                    {profileUser.rating.average} / 5 ({profileUser.rating.count} reviews)
                </div>
            )}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-8">
            {/* Avatar Section */}
            <div className="flex flex-col items-center mb-8">
              <div
                {...getRootProps()}
                className={`w-32 h-32 rounded-full overflow-hidden border-4 ${isEditing ? 'border-primary cursor-pointer' : 'border-gray-700'} flex items-center justify-center text-center transition-all duration-200 group relative`}
              >
                <input {...getInputProps()} disabled={!isEditing} />
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-500 text-sm">
                    <UserIcon className="h-16 w-16 group-hover:text-primary transition-colors" />
                    {isEditing && <p>Upload</p>}
                  </div>
                )}
                {isEditing && avatarPreview && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAvatarPreview(null);
                      setValue('profile.avatarFile', null);
                      setValue('profile.avatar', '');
                    }}
                    className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white hover:bg-red-600 transition-colors"
                    title="Remove avatar"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
                {isEditing && !avatarPreview && (isDragActive || (!isDragActive && !avatarPreview && profileUser?.profile?.avatar === '')) && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {isDragActive ? 'Drop here...' : 'Click or drag to upload'}
                  </div>
                )}
              </div>
              {isEditing && errors.profile?.avatarFile && <p className="text-red-400 text-sm mt-2">{errors.profile.avatarFile.message}</p>}
            </div>

            {/* Basic Info */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <Info className="h-7 w-7 text-secondary" /> Basic Info
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Username" id="username" {...register('username', { required: 'Username is required' })} error={errors.username?.message} disabled={!isEditing} />
              <Input label="Email" id="email" type="email" {...register('email', { required: 'Email is required' })} error={errors.email?.message} disabled={!isEditing} />
              <Input label="First Name" id="firstName" {...register('profile.firstName')} disabled={!isEditing} />
              <Input label="Last Name" id="lastName" {...register('profile.lastName')} disabled={!isEditing} />
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="bio" className="block text-lighttext text-sm font-medium mb-2">Bio</label>
                <textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  className="w-full h-24 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 p-4 focus:outline-none focus:ring-2 focus:ring-secondary resize-y"
                  {...register('profile.bio')}
                  disabled={!isEditing}
                ></textarea>
              </div>
              <Input label="Location" id="location" {...register('profile.location')} icon={MapPin} disabled={!isEditing} />
              <Input label="University" id="university" {...register('profile.university')} icon={University} disabled={!isEditing} />
              <Input label="Year of Study" id="yearOfStudy" {...register('profile.yearOfStudy')} disabled={!isEditing} />
              <Input label="Major" id="major" {...register('profile.major')} disabled={!isEditing} />
              <Input label="Experience" id="experience" {...register('profile.experience')} disabled={!isEditing} />
            </div>

            {/* Skills and Interests */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <Code className="h-7 w-7 text-primary" /> Skills & Interests
            </h2>
            <Input label="Skills (comma-separated)" id="skills" placeholder="e.g., React, Python, ML" {...register('profile.skills')} disabled={!isEditing} />
            <Input label="Interests (comma-separated)" id="interests" placeholder="e.g., AI, Web3, Fintech" {...register('profile.interests')} disabled={!isEditing} />

            {/* Social Links */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <LinkIcon className="h-7 w-7 text-accent" /> Social Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="GitHub" id="github" placeholder="e.g., github.com/yourusername" {...register('profile.github')} icon={Github} disabled={!isEditing} />
              <Input label="LinkedIn" id="linkedin" placeholder="e.g., linkedin.com/in/yourprofile" {...register('profile.linkedin')} icon={Linkedin} disabled={!isEditing} />
              <Input label="LeetCode" id="leetcode" placeholder="e.g., leetcode.com/yourusername" {...register('profile.leetcode')} disabled={!isEditing} />
              <Input label="Portfolio" id="portfolio" placeholder="e.g., yourportfolio.com" {...register('profile.portfolio')} disabled={!isEditing} />
              <Input label="Codeforces" id="codeforces" placeholder="e.g., codeforces.com/profile/yourusername" {...register('profile.codeforces')} disabled={!isEditing} />
              <Input label="HackerRank" id="hackerrank" placeholder="e.g., hackerrank.com/yourusername" {...register('profile.hackerrank')} disabled={!isEditing} />
              <Input label="Kaggle" id="kaggle" placeholder="e.g., kaggle.com/yourusername" {...register('profile.kaggle')} disabled={!isEditing} />
              <Input label="Devpost" id="devpost" placeholder="e.g., devpost.com/yourusername" {...register('profile.devpost')} disabled={!isEditing} />
            </div>

            {/* Achievements */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <Award className="h-7 w-7 text-primary" /> Achievements
            </h2>
            {achievementsFields.map((field, index) => (
              <motion.div key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                <Input label={`Achievement Title ${index + 1}`} id={`achievementTitle-${index}`} {...register(`profile.achievements.${index}.title`)} disabled={!isEditing} />
                <div className="space-y-2">
                  <label htmlFor={`achievementDescription-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                  <textarea
                    id={`achievementDescription-${index}`}
                    placeholder="Describe this achievement"
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 p-3"
                    {...register(`profile.achievements.${index}.description`)}
                    disabled={!isEditing}
                  ></textarea>
                </div>
                {/* Use format for displaying the date in view mode, but keep as type="date" for editing */}
                {isEditing ? (
                  <Input label="Date" id={`achievementDate-${index}`} type="date" {...register(`profile.achievements.${index}.date`)} disabled={!isEditing} />
                ) : (
                  <p className="text-gray-400 text-sm">Date: <span className="text-white">{field.date ? format(new Date(field.date), 'MMM d, yyyy') : 'N/A'}</span></p>
                )}
                <Input label="Link" id={`achievementLink-${index}`} type="url" {...register(`profile.achievements.${index}.link`)} disabled={!isEditing} />
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={() => removeAchievement(index)} icon={Trash2} className="w-full">
                    Remove Achievement
                  </Button>
                )}
              </motion.div>
            ))}
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => appendAchievement({ title: '', description: '', date: '', link: '' })} icon={Plus} className="w-full mt-4">
                Add Achievement
              </Button>
            )}

            {/* Projects */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <Code className="h-7 w-7 text-secondary" /> Projects
            </h2>
            {projectsFields.map((field, index) => (
              <motion.div key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                <Input label={`Project Name ${index + 1}`} id={`projectName-${index}`} {...register(`profile.projects.${index}.name`)} disabled={!isEditing} />
                <div className="space-y-2">
                  <label htmlFor={`projectDescription-${index}`} className="block text-gray-400 text-sm font-medium mb-2">Description</label>
                  <textarea
                    id={`projectDescription-${index}`}
                    placeholder="Describe this project"
                    className="w-full bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 p-3"
                    {...register(`profile.projects.${index}.description`)}
                    disabled={!isEditing}
                  ></textarea>
                </div>
                <Input label="Tech Stack (comma-separated)" id={`projectTechStack-${index}`} placeholder="e.g., React, Node.js" {...register(`profile.projects.${index}.techStack`)} disabled={!isEditing} />
                <Input label="GitHub Link" id={`projectGithub-${index}`} type="url" {...register(`profile.projects.${index}.github`)} disabled={!isEditing} />
                <Input label="Demo Link" id={`projectDemo-${index}`} type="url" {...register(`profile.projects.${index}.demo`)} disabled={!isEditing} />
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={() => removeProject(index)} icon={Trash2} className="w-full">
                    Remove Project
                  </Button>
                )}
              </motion.div>
            ))}
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => appendProject({ name: '', description: '', techStack: [], github: '', demo: '', image: '' })} icon={Plus} className="w-full mt-4">
                Add Project
              </Button>
            )}

            {/* Hackathons Attended */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <Calendar className="h-7 w-7 text-accent" /> Hackathons Attended
            </h2>
            {hackathonsAttendedFields.map((field, index) => (
              <motion.div key={field.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-900/50 p-4 rounded-lg space-y-3">
                <Input label={`Hackathon Name ${index + 1}`} id={`hackathonAttendedName-${index}`} {...register(`profile.hackathonsAttended.${index}.name`)} disabled={!isEditing} />
                <Input label="Position/Award" id={`hackathonAttendedPosition-${index}`} {...register(`profile.hackathonsAttended.${index}.position`)} disabled={!isEditing} />
                <Input label="Project Name" id={`hackathonAttendedProject-${index}`} {...register(`profile.hackathonsAttended.${index}.project`)} disabled={!isEditing} />
                {/* Use format for displaying the date in view mode, but keep as type="date" for editing */}
                {isEditing ? (
                  <Input label="Date" id={`hackathonAttendedDate-${index}`} type="date" {...register(`profile.hackathonsAttended.${index}.date`)} disabled={!isEditing} />
                ) : (
                  <p className="text-gray-400 text-sm">Date: <span className="text-white">{field.date ? format(new Date(field.date), 'MMM d, yyyy') : 'N/A'}</span></p>
                )}
                {isEditing && (
                  <Button type="button" variant="secondary" onClick={() => removeHackathonAttended(index)} icon={Trash2} className="w-full">
                    Remove Hackathon
                  </Button>
                )}
              </motion.div>
            ))}
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => appendHackathonAttended({ name: '', position: '', project: '', date: '' })} icon={Plus} className="w-full mt-4">
                Add Hackathon
              </Button>
            )}

            {/* Preferences */}
            <h2 className="text-3xl font-semibold text-white mb-4 flex items-center gap-2 border-t border-gray-700/50 pt-6">
              <Star className="h-7 w-7 text-primary" /> Team Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="prefTeamSize" className="block text-lighttext text-sm font-medium mb-2">Preferred Team Size</label>
                <select
                  id="prefTeamSize"
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                  {...register('preferences.teamSize', { valueAsNumber: true })}
                  disabled={!isEditing}
                >
                  <option value="">Any</option>
                  {[2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="prefExperienceLevel" className="block text-lighttext text-sm font-medium mb-2">Preferred Experience Level</label>
                <select
                  id="prefExperienceLevel"
                  className="w-full bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                  {...register('preferences.experienceLevel')}
                  disabled={!isEditing}
                >
                  <option value="">Any</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <Input label="Communication Style" id="prefCommunicationStyle" placeholder="e.g., Daily stand-ups" {...register('preferences.communicationStyle')} disabled={!isEditing} />
              <Input label="Availability" id="prefAvailability" placeholder="e.g., Weekends, evenings" {...register('preferences.availability')} disabled={!isEditing} />
              <Input label="Timezone" id="prefTimezone" placeholder="e.g., EST, PST, UTC+5:30" {...register('preferences.timezone')} disabled={!isEditing} />
            </div>


            {/* Submit Button */}
            {isOwnProfile && isEditing && (
              <Button type="submit" className="w-full text-lg h-12 mt-8" disabled={loading}>
                {loading ? <Loader size={20} color="text-white" /> : 'Save Profile'}
              </Button>
            )}
          </form>

          {/* Reviews Section */}
          {!isOwnProfile && (
            <div className="mt-12 p-8 bg-gray-800/60 rounded-xl shadow-lg border border-gray-700/50">
              <h2 className="text-3xl font-semibold text-white mb-6 flex items-center gap-2">
                <Star className="h-7 w-7 text-yellow-400" /> Reviews for {profileUser.profile?.firstName || profileUser.username}
              </h2>

              {/* Display existing reviews */}
              {reviews.length === 0 ? (
                <p className="text-lighttext text-lg mb-6">No public reviews yet.</p>
              ) : (
                <div className="space-y-6 mb-6">
                  {reviews.map(review => (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-900 rounded-lg p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        {/* Use react-router-dom Link to navigate to reviewer's profile */}
                        <Link to={`/profile/${review.reviewer._id}`} className="flex items-center gap-3">
                          <img
                            src={review.reviewer.profile?.avatar || `https://ui-avatars.com/api/?name=${review.reviewer.username}&background=random`}
                            alt={review.reviewer.username}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="text-white font-semibold">
                              {review.reviewer.profile?.firstName || review.reviewer.username}
                            </p>
                            {review.team && (
                                <p className="text-gray-400 text-sm">from team <span className="font-medium">{review.team.name}</span></p>
                            )}
                          </div>
                        </Link>
                        <div className="flex items-center text-yellow-400">
                          <Star className="h-5 w-5 fill-current" />
                          <span className="ml-1 text-lg font-bold">{review.rating}</span>
                        </div>
                      </div>
                      {review.comment && <p className="text-lighttext text-base mb-2">"{review.comment}"</p>}
                      {(review.strengths && review.strengths.length > 0) && (
                        <p className="text-gray-400 text-sm">Strengths: {review.strengths.join(', ')}</p>
                      )}
                      {(review.areasForImprovement && review.areasForImprovement.length > 0) && (
                        <p className="text-gray-400 text-sm">Areas for Improvement: {review.areasForImprovement.join(', ')}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-2 text-right">
                        {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Review Pagination */}
              {reviewPagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-6">
                  <Button
                    onClick={() => handleReviewPageChange(reviewPagination.page - 1)}
                    disabled={reviewPagination.page === 1}
                    variant="secondary"
                    icon={ChevronLeft}
                  >
                    Previous
                  </Button>
                  <span className="text-lighttext text-lg">
                    Page {reviewPagination.page} of {reviewPagination.pages}
                  </span>
                  <Button
                    onClick={() => handleReviewPageChange(reviewPagination.page + 1)}
                    disabled={reviewPagination.page === reviewPagination.pages}
                    variant="secondary"
                    icon={ChevronRight}
                  >
                    Next
                  </Button>
                </div>
              )}

              {/* Submit Review Button / Form */}
              {currentUser && !isOwnProfile && canReview && (
                <div className="mt-8 pt-6 border-t border-gray-700/50 text-center">
                  <Button onClick={() => setShowReviewForm(!showReviewForm)} className="w-full md:w-auto">
                    {showReviewForm ? 'Cancel Review' : 'Submit a Review'}
                  </Button>
                </div>
              )}

              <AnimatePresence>
                {showReviewForm && currentUser && !isOwnProfile && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-6 p-6 bg-gray-900 rounded-lg border border-gray-700 space-y-4 overflow-hidden"
                  >
                    <h3 className="text-xl font-semibold text-white mb-4">Your Review for {profileUser.profile?.firstName || profileUser.username}</h3>
                    <form onSubmit={handleReviewSubmit(onSubmitReview)}>
                      <div>
                        <label htmlFor="rating" className="block text-lighttext text-sm font-medium mb-2">Rating (1-5 Stars)</label>
                        <select
                          id="rating"
                          className="w-full bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                          {...reviewRegister('rating', { required: 'Rating is required', min: { value: 1, message: 'Min rating is 1' }, max: { value: 5, message: 'Max rating is 5' } })}
                        >
                          <option value="">Select a rating</option>
                          <option value="1">1 Star - Needs work</option>
                          <option value="2">2 Stars - Fair</option>
                          <option value="3">3 Stars - Good</option>
                          <option value="4">4 Stars - Very Good</option>
                          <option value="5">5 Stars - Excellent!</option>
                        </select>
                        {reviewErrors.rating && <p className="text-red-400 text-sm mt-1">{reviewErrors.rating.message}</p>}
                      </div>

                      <div>
                        <label htmlFor="teamId" className="block text-lighttext text-sm font-medium mb-2">Team Context (Optional)</label>
                        <select
                          id="teamId"
                          className="w-full bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
                          {...reviewRegister('teamId')}
                        >
                          <option value="">No specific team</option>
                          {teamsWithReviewedUser.map(teamOption => (
                            <option key={teamOption._id} value={teamOption._id}>{teamOption.name}</option>
                          ))}
                        </select>
                        <p className="text-gray-400 text-xs mt-1">Select a team you both were members of.</p>
                      </div>

                      <div>
                        <label htmlFor="comment" className="block text-lighttext text-sm font-medium mb-2">Comment (Optional)</label>
                        <textarea
                          id="comment"
                          placeholder="Share your thoughts about this user..."
                          className="w-full h-24 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 p-4 focus:outline-none focus:ring-2 focus:ring-secondary resize-y"
                          {...reviewRegister('comment', { maxLength: { value: 500, message: 'Comment too long' } })}
                        ></textarea>
                        {reviewErrors.comment && <p className="text-red-400 text-sm mt-1">{reviewErrors.comment.message}</p>}
                      </div>

                      <Input label="Strengths (comma-separated)" id="strengths" placeholder="e.g., Problem-solving, Communication" {...reviewRegister('strengths')} />
                      <Input label="Areas for Improvement (comma-separated)" id="areasForImprovement" placeholder="e.g., Time management, Collaboration tools" {...reviewRegister('areasForImprovement')} />

                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="isPublicReview"
                          className="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary bg-gray-700"
                          {...reviewRegister('isPublic')}
                        />
                        <label htmlFor="isPublicReview" className="ml-2 text-lighttext">
                          Make this review public (visible to all)
                        </label>
                      </div>

                      <Button type="submit" className="w-full text-lg h-12 mt-6">
                        Submit Review
                      </Button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;