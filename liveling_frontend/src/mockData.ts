// Mock data for development
// In production, this would be fetched from the backend and news APIs

export const mockUsers = [
  {
    id: 'user_1',
    username: 'Alex',
    current_level: 12,
    total_xp: 4521,
    vitality: 850,
    essence: 1200,
    credits: 3400,
    custom_wallet: 250,
  },
  {
    id: 'user_2',
    username: 'Jordan',
    current_level: 8,
    total_xp: 2100,
    vitality: 650,
    essence: 800,
    credits: 1900,
    custom_wallet: 150,
  },
  {
    id: 'user_3',
    username: 'Casey',
    current_level: 15,
    total_xp: 6200,
    vitality: 1100,
    essence: 1600,
    credits: 4200,
    custom_wallet: 400,
  },
]

export const mockTasks = {
  user_1: [
    {
      id: 'task_1',
      title: 'Morning jog 5km',
      category: 'HEALTH' as const,
      difficulty: 2,
      is_completed: true,
      completed_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_2',
      title: 'Complete project proposal',
      category: 'WORK' as const,
      difficulty: 3,
      is_completed: false,
    },
    {
      id: 'task_3',
      title: 'Call mom',
      category: 'SOCIAL' as const,
      difficulty: 1,
      is_completed: true,
      completed_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_4',
      title: 'Read 2 chapters',
      category: 'CUSTOM' as const,
      custom_category: 'Learning',
      difficulty: 1,
      is_completed: false,
    },
    {
      id: 'task_5',
      title: 'Team standup meeting',
      category: 'WORK' as const,
      difficulty: 1,
      is_completed: true,
      completed_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    },
  ],
  user_2: [
    {
      id: 'task_10',
      title: 'Gym session - chest day',
      category: 'HEALTH' as const,
      difficulty: 2,
      is_completed: true,
      completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_11',
      title: 'Finish design mockups',
      category: 'WORK' as const,
      difficulty: 3,
      is_completed: false,
    },
    {
      id: 'task_12',
      title: 'Dinner with friends',
      category: 'SOCIAL' as const,
      difficulty: 2,
      is_completed: false,
    },
    {
      id: 'task_13',
      title: 'Meditate 20 mins',
      category: 'HEALTH' as const,
      difficulty: 1,
      is_completed: true,
      completed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
  ],
  user_3: [
    {
      id: 'task_20',
      title: 'Finish quarterly report',
      category: 'WORK' as const,
      difficulty: 3,
      is_completed: true,
      completed_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_21',
      title: 'Yoga class 1 hour',
      category: 'HEALTH' as const,
      difficulty: 2,
      is_completed: false,
    },
    {
      id: 'task_22',
      title: 'Organize team offsite',
      category: 'WORK' as const,
      difficulty: 2,
      is_completed: true,
      completed_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'task_23',
      title: 'Network at tech meetup',
      category: 'SOCIAL' as const,
      difficulty: 2,
      is_completed: false,
    },
    {
      id: 'task_24',
      title: 'Cook meal prep for week',
      category: 'CUSTOM' as const,
      custom_category: 'Self-care',
      difficulty: 2,
      is_completed: true,
      completed_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ],
}

export const mockNotes = {
  user_1: [
    {
      id: 'note_1',
      content: 'Remember to review CI/CD pipeline improvements',
      timestamp: 'Today',
    },
    {
      id: 'note_2',
      content: 'Book hiking trip for next month',
      timestamp: 'Today',
    },
    {
      id: 'note_3',
      content: 'Birthday gift ideas for Sarah',
      timestamp: 'Yesterday',
    },
    {
      id: 'note_4',
      content: 'Try the new coffee shop downtown',
      timestamp: '2 days ago',
    },
  ],
  user_2: [
    {
      id: 'note_10',
      content: 'Client feedback: needs darker color scheme',
      timestamp: 'Today',
    },
    {
      id: 'note_11',
      content: 'Research animation libraries for web',
      timestamp: 'Today',
    },
    {
      id: 'note_12',
      content: 'Fix responsive design on mobile',
      timestamp: 'Yesterday',
    },
  ],
  user_3: [
    {
      id: 'note_20',
      content: 'Q2 strategy meeting notes - focus on market expansion',
      timestamp: 'Today',
    },
    {
      id: 'note_21',
      content: 'Team feedback: need better onboarding process',
      timestamp: 'Today',
    },
    {
      id: 'note_22',
      content: 'Schedule 1:1s with all direct reports',
      timestamp: 'Yesterday',
    },
    {
      id: 'note_23',
      content: 'Follow up on budget allocation for R&D',
      timestamp: '2 days ago',
    },
    {
      id: 'note_24',
      content: 'Conference in Berlin - book flights early',
      timestamp: '3 days ago',
    },
  ],
}

export const mockReminders = {
  user_1: [
    {
      id: 'rem_1',
      title: 'Submit expense report',
      dueDate: 'Today 5 PM',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: 'rem_2',
      title: 'Dentist appointment',
      dueDate: 'Tomorrow 2 PM',
      priority: 'medium' as const,
      completed: false,
    },
    {
      id: 'rem_3',
      title: 'Car maintenance',
      dueDate: 'Next week',
      priority: 'low' as const,
      completed: false,
    },
  ],
  user_2: [
    {
      id: 'rem_10',
      title: 'Present designs to client',
      dueDate: 'Tomorrow 10 AM',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: 'rem_11',
      title: 'Review pull requests',
      dueDate: 'Today 3 PM',
      priority: 'medium' as const,
      completed: false,
    },
  ],
  user_3: [
    {
      id: 'rem_20',
      title: 'Board meeting prep',
      dueDate: 'Today 1 PM',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: 'rem_21',
      title: 'Review contracts',
      dueDate: 'Tomorrow',
      priority: 'high' as const,
      completed: false,
    },
    {
      id: 'rem_22',
      title: 'Update LinkedIn profile',
      dueDate: 'This week',
      priority: 'low' as const,
      completed: false,
    },
  ],
}

export const mockNewsItems = [
  {
    id: 'news_1',
    type: 'daily' as const,
    message: '🔥 Streak alert! You\'ve completed 5 tasks in a row!',
    timestamp: 'Today',
    icon: '🔥',
  },
  {
    id: 'news_2',
    type: 'follow' as const,
    username: 'Alex',
    message: 'Leveled up to 12!',
    timestamp: 'Today',
    icon: '⬆️',
  },
  {
    id: 'news_3',
    type: 'follow' as const,
    username: 'Jordan',
    message: 'Completed a 3-day health streak',
    timestamp: 'Today',
    icon: '💪',
  },
  {
    id: 'news_4',
    type: 'follow' as const,
    username: 'Casey',
    message: 'Earned the "Team Player" badge',
    timestamp: 'Yesterday',
    icon: '🏆',
  },
  {
    id: 'news_5',
    type: 'daily' as const,
    message: '💎 You gained 150 Essence points!',
    timestamp: 'Yesterday',
    icon: '💎',
  },
]

export const mockWeeklyStats = [
  { day: 'Mon', xp: 120, essenceGained: 50, vitalityGained: 30, creditsGained: 10 },
  { day: 'Tue', xp: 180, essenceGained: 75, vitalityGained: 45, creditsGained: 15 },
  { day: 'Wed', xp: 90, essenceGained: 30, vitalityGained: 20, creditsGained: 5 },
  { day: 'Thu', xp: 200, essenceGained: 100, vitalityGained: 50, creditsGained: 20 },
  { day: 'Fri', xp: 150, essenceGained: 60, vitalityGained: 35, creditsGained: 12 },
  { day: 'Sat', xp: 170, essenceGained: 80, vitalityGained: 40, creditsGained: 18 },
  { day: 'Sun', xp: 140, essenceGained: 55, vitalityGained: 32, creditsGained: 10 },
]
