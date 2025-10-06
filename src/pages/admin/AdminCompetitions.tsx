import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Calendar,
  Clock,
  Users,
  DollarSign,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { Competition, createCompetition, getCompetitions, updateCompetition, deleteCompetition } from '../../services/competitionService';
import { getQuestions } from '../../services/quizService';
import toast from 'react-hot-toast';

const AdminCompetitions = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<Competition | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    entryFee: 10,
    prizeMoney: 100,
    maxParticipants: 50,
    selectedQuestions: [] as string[]
  });

  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = () => {
    const allCompetitions = getCompetitions();
    setCompetitions(allCompetitions);
  };

  const handleOpenEditModal = (competition: Competition) => {
    setEditingCompetition(competition);
    setFormData({
      title: competition.title,
      description: competition.description,
      startTime: new Date(competition.startTime).toISOString().slice(0, 16),
      endTime: new Date(competition.endTime).toISOString().slice(0, 16),
      entryFee: competition.entryFee,
      prizeMoney: competition.prizeMoney,
      maxParticipants: competition.maxParticipants,
      selectedQuestions: competition.questions
    });
    setIsModalOpen(true);
  };

  const handleDeleteCompetition = (competition: Competition) => {
    if (window.confirm('Are you sure you want to delete this competition?')) {
      deleteCompetition(competition.id);
      toast.success('Competition deleted successfully');
      loadCompetitions();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.selectedQuestions.length === 0) {
      toast.error('Please select at least one question');
      return;
    }

    try {
      if (editingCompetition) {
        updateCompetition(editingCompetition.id, {
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          entryFee: formData.entryFee,
          prizeMoney: formData.prizeMoney,
          maxParticipants: formData.maxParticipants,
          questions: formData.selectedQuestions
        });
        toast.success('Competition updated successfully');
      } else {
        createCompetition({
          title: formData.title,
          description: formData.description,
          startTime: formData.startTime,
          endTime: formData.endTime,
          entryFee: formData.entryFee,
          prizeMoney: formData.prizeMoney,
          maxParticipants: formData.maxParticipants,
          questions: formData.selectedQuestions
        });
        toast.success('Competition created successfully');
      }

      setIsModalOpen(false);
      setEditingCompetition(null);
      loadCompetitions();
    } catch (error) {
      toast.error(editingCompetition ? 'Failed to update competition' : 'Failed to create competition');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getCompetitionStatus = (competition: Competition): string => {
    const now = new Date();
    const start = new Date(competition.startTime);
    const end = new Date(competition.endTime);

    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quiz Competitions</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage scheduled quiz competitions</p>
          </div>

          <button
            onClick={() => {
              setEditingCompetition(null);
              setFormData({
                title: '',
                description: '',
                startTime: '',
                endTime: '',
                entryFee: 10,
                prizeMoney: 100,
                maxParticipants: 50,
                selectedQuestions: []
              });
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Competition</span>
          </button>
        </div>

        {/* Competitions List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {competitions.map((competition) => (
            <div
              key={competition.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                      {competition.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                      {competition.description}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    getCompetitionStatus(competition) === 'upcoming'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : getCompetitionStatus(competition) === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {getCompetitionStatus(competition).charAt(0).toUpperCase() + getCompetitionStatus(competition).slice(1)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Calendar size={16} className="mr-2" />
                    <span className="text-sm">Starts: {formatDateTime(competition.startTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Clock size={16} className="mr-2" />
                    <span className="text-sm">Ends: {formatDateTime(competition.endTime)}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <Users size={16} className="mr-2" />
                    <span className="text-sm">Max Participants: {competition.maxParticipants}</span>
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-gray-300">
                    <DollarSign size={16} className="mr-2" />
                    <span className="text-sm">Entry Fee: ${competition.entryFee}</span>
                  </div>
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <Trophy size={16} className="mr-2" />
                    <span className="text-sm">Prize: ${competition.prizeMoney}</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(competition)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteCompetition(competition)}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Create/Edit Competition Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {editingCompetition ? 'Edit Competition' : 'Create Competition'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Entry Fee ($)
                      </label>
                      <input
                        type="number"
                        value={formData.entryFee}
                        onChange={(e) => setFormData({ ...formData, entryFee: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Prize Money ($)
                      </label>
                      <input
                        type="number"
                        value={formData.prizeMoney}
                        onChange={(e) => setFormData({ ...formData, prizeMoney: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        value={formData.maxParticipants}
                        onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Select Questions
                    </label>
                    <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg">
                      {getQuestions().map((question) => (
                        <label
                          key={question.id}
                          className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedQuestions.includes(question.id)}
                            onChange={(e) => {
                              const questions = e.target.checked
                                ? [...formData.selectedQuestions, question.id]
                                : formData.selectedQuestions.filter(id => id !== question.id);
                              setFormData({ ...formData, selectedQuestions: questions });
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-3 text-gray-700 dark:text-gray-300">{question.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingCompetition(null);
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCompetition ? 'Update Competition' : 'Create Competition'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCompetitions;