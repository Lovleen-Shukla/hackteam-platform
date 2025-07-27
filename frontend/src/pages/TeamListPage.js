// src/pages/TeamListPage.js (NEW FILE)
import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { teamsAPI } from '../services/api';
import TeamCard from '../components/Teams/TeamCard'; // Import TeamCard
import Loader from '../components/Common/Loader';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, XCircle } from 'lucide-react'; // Icons for search/filters
import toast from 'react-hot-toast';

const TeamListPage = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    skills: '',
    experienceLevel: '',
    hackathon: '',
    status: 'recruiting', // Default to recruiting
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });
  const [showFilters, setShowFilters] = useState(false); // State to toggle filter sidebar/modal

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery,
        ...filters,
      };

      const response = await teamsAPI.getTeams(params);
      setTeams(response.data.teams);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError('Failed to load teams. Please try again.');
      toast.error('Failed to load teams.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery, filters]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on search
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1 on filter change
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      skills: '',
      experienceLevel: '',
      hackathon: '',
      status: 'recruiting',
    });
    setPagination(prev => ({ ...prev, page: 1 }));
    toast.success('Filters cleared!');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="min-h-screen bg-darkbg pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold text-white mb-8 font-heading text-center md:text-left"
        >
          Explore Teams
        </motion.h1>

        {/* Search and Filter Controls */}
        <div className="bg-gray-800/60 rounded-xl p-6 mb-8 shadow-lg border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-grow">
              <Input
                id="search"
                type="text"
                placeholder="Search by team name, description, or project idea..."
                value={searchQuery}
                onChange={handleSearchChange}
                icon={Search}
                className="w-full"
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex-shrink-0"
              icon={SlidersHorizontal}
            >
              Filters
            </Button>
            <div className="hidden md:flex gap-4 items-center">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="recruiting">Recruiting</option>
                <option value="full">Full</option>
                <option value="">All Statuses</option>
              </select>
              <select
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
                className="bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">All Experience Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mixed">Mixed</option>
              </select>
              <Input
                id="skills"
                type="text"
                name="skills"
                placeholder="Skills (comma-separated)"
                value={filters.skills}
                onChange={handleFilterChange}
                className="w-48"
              />
              <Input
                id="hackathon"
                type="text"
                name="hackathon"
                placeholder="Hackathon Name"
                value={filters.hackathon}
                onChange={handleFilterChange}
                className="w-48"
              />
            </div>
            {(searchQuery || Object.values(filters).some(val => val && val !== 'recruiting')) && (
              <Button variant="outline" icon={XCircle} onClick={clearFilters} className="mt-4 md:mt-0 flex-shrink-0">
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Filter Modal/Sidebar */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-darkbg/95 backdrop-blur-md z-50 p-6 md:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-white">Filters</h2>
              <Button variant="secondary" onClick={() => setShowFilters(false)} icon={XCircle}>
                Close
              </Button>
            </div>
            <div className="space-y-6 flex-grow">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="recruiting">Recruiting</option>
                <option value="full">Full</option>
                <option value="">All Statuses</option>
              </select>
              <select
                name="experienceLevel"
                value={filters.experienceLevel}
                onChange={handleFilterChange}
                className="bg-white/10 border border-white/20 rounded-lg text-lighttext p-3 w-full focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="">All Experience Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="mixed">Mixed</option>
              </select>
              <Input
                id="skills-mobile"
                type="text"
                name="skills"
                placeholder="Skills (comma-separated)"
                value={filters.skills}
                onChange={handleFilterChange}
                className="w-full"
              />
              <Input
                id="hackathon-mobile"
                type="text"
                name="hackathon"
                placeholder="Hackathon Name"
                value={filters.hackathon}
                onChange={handleFilterChange}
                className="w-full"
              />
            </div>
            <div className="mt-auto pt-6 border-t border-gray-700/50">
              <Button onClick={() => { fetchTeams(); setShowFilters(false); }} className="w-full">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={() => { clearFilters(); setShowFilters(false); }} className="w-full mt-3">
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}


        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader size={48} color="text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 text-xl py-10">
            {error}
            <Button onClick={fetchTeams} className="mt-4">Reload Teams</Button>
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center text-lighttext text-xl py-10">
            No teams found matching your criteria. Try adjusting your filters.
            <Button onClick={clearFilters} className="mt-4">Clear All Filters</Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teams.map(team => (
                <TeamCard key={team._id} team={team} />
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex justify-center items-center space-x-4 mt-12">
                <Button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  variant="secondary"
                  icon={ChevronLeft}
                >
                  Previous
                </Button>
                <span className="text-lighttext text-lg">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  variant="secondary"
                  icon={ChevronRight}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeamListPage;