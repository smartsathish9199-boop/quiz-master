import { v4 as uuidv4 } from 'uuid';

export interface Competition {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  entryFee: number;
  prizeMoney: number;
  maxParticipants: number;
  questions: string[]; // Array of question IDs
  createdAt: string;
  status: 'upcoming' | 'active' | 'completed';
}

export interface Participant {
  id: string;
  competitionId: string;
  userId: string;
  paid: boolean;
  score?: number;
  completedAt?: string;
  createdAt: string;
}

// Initialize competitions in localStorage if not exists
const initializeCompetitions = (): void => {
  if (!localStorage.getItem('quizCompetitions')) {
    localStorage.setItem('quizCompetitions', JSON.stringify([]));
  }
  if (!localStorage.getItem('quizCompetitionParticipants')) {
    localStorage.setItem('quizCompetitionParticipants', JSON.stringify([]));
  }
};

// Get all competitions
export const getCompetitions = (): Competition[] => {
  const competitions = localStorage.getItem('quizCompetitions');
  return competitions ? JSON.parse(competitions) : [];
};

// Get competition by ID
export const getCompetitionById = (id: string): Competition | null => {
  const competitions = getCompetitions();
  return competitions.find(comp => comp.id === id) || null;
};

// Create new competition
export const createCompetition = (data: Omit<Competition, 'id' | 'createdAt' | 'status'>): Competition => {
  const competitions = getCompetitions();
  
  const newCompetition: Competition = {
    id: uuidv4(),
    ...data,
    createdAt: new Date().toISOString(),
    status: 'upcoming'
  };
  
  competitions.push(newCompetition);
  localStorage.setItem('quizCompetitions', JSON.stringify(competitions));
  
  return newCompetition;
};

// Update competition
export const updateCompetition = (id: string, data: Partial<Competition>): Competition | null => {
  const competitions = getCompetitions();
  const index = competitions.findIndex(comp => comp.id === id);
  
  if (index === -1) return null;
  
  competitions[index] = {
    ...competitions[index],
    ...data
  };
  
  localStorage.setItem('quizCompetitions', JSON.stringify(competitions));
  return competitions[index];
};

// Delete competition
export const deleteCompetition = (id: string): boolean => {
  const competitions = getCompetitions();
  const filteredCompetitions = competitions.filter(comp => comp.id !== id);
  
  if (filteredCompetitions.length === competitions.length) {
    return false;
  }
  
  localStorage.setItem('quizCompetitions', JSON.stringify(filteredCompetitions));
  return true;
};

// Update competition status
export const updateCompetitionStatus = (id: string, status: Competition['status']): void => {
  const competitions = getCompetitions();
  const index = competitions.findIndex(comp => comp.id === id);
  
  if (index !== -1) {
    competitions[index].status = status;
    localStorage.setItem('quizCompetitions', JSON.stringify(competitions));
  }
};

// Get all participants
export const getParticipants = (): Participant[] => {
  const participants = localStorage.getItem('quizCompetitionParticipants');
  return participants ? JSON.parse(participants) : [];
};

// Get participants for a competition
export const getCompetitionParticipants = (competitionId: string): Participant[] => {
  const participants = getParticipants();
  return participants.filter(p => p.competitionId === competitionId);
};

// Register participant
export const registerParticipant = (competitionId: string, userId: string): Participant => {
  const participants = getParticipants();
  
  const newParticipant: Participant = {
    id: uuidv4(),
    competitionId,
    userId,
    paid: false,
    createdAt: new Date().toISOString()
  };
  
  participants.push(newParticipant);
  localStorage.setItem('quizCompetitionParticipants', JSON.stringify(participants));
  
  return newParticipant;
};

// Update participant payment status
export const updateParticipantPayment = (participantId: string, paid: boolean): void => {
  const participants = getParticipants();
  const index = participants.findIndex(p => p.id === participantId);
  
  if (index !== -1) {
    participants[index].paid = paid;
    localStorage.setItem('quizCompetitionParticipants', JSON.stringify(participants));
  }
};

// Save participant score
export const saveParticipantScore = (participantId: string, score: number): void => {
  const participants = getParticipants();
  const index = participants.findIndex(p => p.id === participantId);
  
  if (index !== -1) {
    participants[index].score = score;
    participants[index].completedAt = new Date().toISOString();
    localStorage.setItem('quizCompetitionParticipants', JSON.stringify(participants));
  }
};

// Check if competition is active
export const isCompetitionActive = (competition: Competition): boolean => {
  const now = new Date();
  const start = new Date(competition.startTime);
  const end = new Date(competition.endTime);
  return now >= start && now <= end;
};

// Initialize on load
initializeCompetitions();