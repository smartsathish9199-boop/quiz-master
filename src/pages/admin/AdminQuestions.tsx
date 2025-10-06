import { useState, useEffect } from 'react';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Search, 
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  Question
} from '../../services/quizService';
import toast from 'react-hot-toast';

const difficultyOptions = [
  { value: 'easy', label: 'Easy', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hard', label: 'Hard', color: 'bg-red-100 text-red-800' }
];

const categoryOptions = [
  'General Knowledge',
  'Science',
  'History',
  'Geography',
  'Art',
  'Sports',
  'Movies',
  'Music',
  'Technology'
];

const AdminQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit' | 'delete'>('add');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  // Form state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOption, setCorrectOption] = useState<number>(0);
  const [category, setCategory] = useState('General Knowledge');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  
  // Load questions on component mount
  useEffect(() => {
    loadQuestions();
  }, []);
  
  // Filter questions when search term changes
  useEffect(() => {
    if (searchTerm) {
      const filtered = questions.filter(question => 
        question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (question.category && question.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredQuestions(filtered);
    } else {
      setFilteredQuestions(questions);
    }
  }, [searchTerm, questions]);
  
  const loadQuestions = () => {
    const allQuestions = getQuestions();
    setQuestions(allQuestions);
    setFilteredQuestions(allQuestions);
  };
  
  const openAddModal = () => {
    setModalMode('add');
    
    // Reset form
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectOption(0);
    setCategory('General Knowledge');
    setDifficulty('easy');
    
    setCurrentQuestion(null);
    setIsModalOpen(true);
  };
  
  const openEditModal = (question: Question) => {
    setModalMode('edit');
    setCurrentQuestion(question);
    
    // Set form values
    setQuestionText(question.text);
    setOptions([...question.options]);
    setCorrectOption(question.correctOption);
    setCategory(question.category || 'General Knowledge');
    setDifficulty(question.difficulty || 'easy');
    
    setIsModalOpen(true);
  };
  
  const openDeleteModal = (question: Question) => {
    setModalMode('delete');
    setCurrentQuestion(question);
    setIsModalOpen(true);
  };
  
  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!questionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    
    if (options.some(option => !option.trim())) {
      toast.error('All options are required');
      return;
    }
    
    // Create/update question
    if (modalMode === 'add') {
      addQuestion({
        text: questionText,
        options,
        correctOption,
        category,
        difficulty
      });
      
      toast.success('Question added successfully');
    } else if (modalMode === 'edit' && currentQuestion) {
      updateQuestion(currentQuestion.id, {
        text: questionText,
        options,
        correctOption,
        category,
        difficulty
      });
      
      toast.success('Question updated successfully');
    }
    
    // Close modal and refresh questions
    setIsModalOpen(false);
    loadQuestions();
  };
  
  const handleDeleteQuestion = () => {
    if (!currentQuestion) return;
    
    deleteQuestion(currentQuestion.id);
    toast.success('Question deleted successfully');
    
    setIsModalOpen(false);
    loadQuestions();
  };
  
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quiz Questions</h1>
            <p className="text-gray-600">Manage your quiz question bank</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            
            <button
              onClick={openAddModal}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={18} />
              <span>Add Question</span>
            </button>
          </div>
        </div>
        
        {/* Questions List */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {filteredQuestions.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="p-6 hover:bg-gray-50">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-grow mb-4 md:mb-0 md:mr-6">
                      <div className="flex items-start">
                        {question.difficulty && (
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                            difficultyOptions.find(d => d.value === question.difficulty)?.color || 'bg-gray-100 text-gray-800'
                          }`}>
                            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                          </span>
                        )}
                        {question.category && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {question.category}
                          </span>
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-800 mt-2 mb-3">{question.text}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {question.options.map((option, index) => (
                          <div 
                            key={index} 
                            className={`p-2 rounded-lg text-sm ${
                              index === question.correctOption
                                ? 'bg-green-100 border border-green-300'
                                : 'bg-gray-100 border border-gray-200'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 text-xs ${
                                index === question.correctOption
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-700'
                              }`}>
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className={index === question.correctOption ? 'font-medium' : ''}>
                                {option}
                              </span>
                              {index === question.correctOption && (
                                <CheckCircle size={16} className="ml-2 text-green-500" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex md:flex-col space-x-2 md:space-x-0 md:space-y-2">
                      <button
                        onClick={() => openEditModal(question)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => openDeleteModal(question)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <RefreshCw size={32} className="text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">
                {searchTerm ? `No questions found matching "${searchTerm}"` : 'No questions available'}
              </p>
              <button
                onClick={openAddModal}
                className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
                <span>Add Your First Question</span>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            {/* Add/Edit Question Form */}
            {(modalMode === 'add' || modalMode === 'edit') && (
              <form onSubmit={handleFormSubmit}>
                <div className={`px-6 py-4 text-white ${modalMode === 'add' ? 'bg-blue-600' : 'bg-purple-600'}`}>
                  <h3 className="text-lg font-bold">
                    {modalMode === 'add' ? 'Add New Question' : 'Edit Question'}
                  </h3>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Question Text */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text
                    </label>
                    <textarea
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>
                  
                  {/* Options */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Answer Options
                    </label>
                    {options.map((option, index) => (
                      <div key={index} className="mb-3 flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              id={`option-${index}`}
                              name="correctOption"
                              checked={correctOption === index}
                              onChange={() => setCorrectOption(index)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <label
                              htmlFor={`option-${index}`}
                              className="ml-2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-700"
                            >
                              {String.fromCharCode(65 + index)}
                            </label>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleUpdateOption(index, e.target.value)}
                          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          required
                        />
                      </div>
                    ))}
                    <p className="text-sm text-gray-500 mt-2">
                      Select the radio button next to the correct answer.
                    </p>
                  </div>
                  
                  {/* Category and Difficulty */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {difficultyOptions.map((diff) => (
                          <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-white rounded-lg transition-colors ${
                      modalMode === 'add'
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {modalMode === 'add' ? 'Add Question' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}
            
            {/* Delete Confirmation */}
            {modalMode === 'delete' && currentQuestion && (
              <>
                <div className="bg-red-600 px-6 py-4 text-white">
                  <h3 className="text-lg font-bold">Confirm Deletion</h3>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-6 text-red-600">
                    <AlertCircle size={24} className="mr-3" />
                    <p className="font-medium">Are you sure you want to delete this question?</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg mb-6">
                    <p className="font-medium text-gray-800">{currentQuestion.text}</p>
                  </div>
                  
                  <p className="text-gray-600 mb-6">
                    This action cannot be undone. This question will be permanently removed from the quiz database.
                  </p>
                  
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteQuestion}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminQuestions;