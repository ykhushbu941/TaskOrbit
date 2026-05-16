const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '../server/db.json');

const seed = async () => {
  const password = await bcrypt.hash('password123', 12);
  
  const users = [
    {
      id: 'admin_1',
      name: 'Khushbu Yadav',
      email: 'khushbu@admin.com',
      password,
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khushbu',
      status: 'Active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'member_1',
      name: 'Roopak',
      email: 'roopak@member.com',
      password,
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roopak',
      status: 'Active',
      assignedProjectId: 'p_1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'member_2',
      name: 'Ansh',
      email: 'ansh@member.com',
      password,
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ansh',
      status: 'Active',
      assignedProjectId: 'p_2',
      createdAt: new Date().toISOString()
    },
    {
      id: 'member_3',
      name: 'Vansh',
      email: 'vansh@member.com',
      password,
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vansh',
      status: 'Active',
      assignedProjectId: 'p_3',
      createdAt: new Date().toISOString()
    },
    {
      id: 'member_4',
      name: 'Sanskriti',
      email: 'sanskriti@member.com',
      password,
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanskriti',
      status: 'Active',
      assignedProjectId: 'p_1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'member_5',
      name: 'Aarav',
      email: 'aarav@member.com',
      password,
      role: 'member',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav',
      status: 'Active',
      assignedProjectId: 'p_4',
      createdAt: new Date().toISOString()
    }
  ];

  const projects = [
    {
      id: 'p_1',
      name: 'TaskOrbit SaaS',
      description: 'Building the ultimate task management platform with real-time features and premium glassmorphic UI.',
      startDate: '2026-05-01',
      deadline: '2026-06-30',
      status: 'Active',
      progress: 45,
      color: '#5B6BF9',
      createdAt: new Date().toISOString()
    },
    {
      id: 'p_2',
      name: 'QuickBites App',
      description: 'A short-video based food discovery and delivery application.',
      startDate: '2026-05-10',
      deadline: '2026-06-15',
      status: 'Active',
      progress: 20,
      color: '#E05C5C',
      createdAt: new Date().toISOString()
    },
    {
      id: 'p_3',
      name: 'AI RAG Chatbot',
      description: 'Advanced Retrieval-Augmented Generation chatbot for enterprise documentation.',
      startDate: '2026-05-15',
      deadline: '2026-07-10',
      status: 'Planning',
      progress: 10,
      color: '#4CAF7D',
      createdAt: new Date().toISOString()
    },
    {
      id: 'p_4',
      name: 'Marketing Campaign Q3',
      description: 'Global marketing push for the new product launch including social media and influencer outreach.',
      startDate: '2026-06-01',
      deadline: '2026-09-30',
      status: 'Planning',
      progress: 0,
      color: '#E8A838',
      createdAt: new Date().toISOString()
    },
    {
      id: 'p_5',
      name: 'Internal Audit 2026',
      description: 'Complete security and compliance audit for the entire cloud infrastructure.',
      startDate: '2026-05-20',
      deadline: '2026-06-20',
      status: 'Active',
      progress: 15,
      color: '#9B51E0',
      createdAt: new Date().toISOString()
    }
  ];

  const tasks = [
    {
      id: 't_1',
      name: 'Design System Architecture',
      description: 'Define the core design tokens and components for the new platform.',
      projectId: 'p_1',
      status: 'Done',
      dueDate: '2026-05-15',
      urgency: 'Critical',
      assigneeId: 'admin_1',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_2',
      name: 'API Authentication Flow',
      description: 'Implement JWT based auth and refresh token logic.',
      projectId: 'p_1',
      status: 'In Progress',
      dueDate: '2026-05-25',
      urgency: 'High',
      assigneeId: 'member_1',
      assigneeIds: ['member_1', 'member_4'],
      createdAt: new Date().toISOString()
    },
    {
      id: 't_3',
      name: 'Short Video Player Component',
      description: 'Build a high-performance video player with auto-play and loop.',
      projectId: 'p_2',
      status: 'In Progress',
      dueDate: '2026-06-01',
      urgency: 'Medium',
      assigneeId: 'member_2',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_4',
      name: 'Vector Database Integration',
      description: 'Setup Pinecone or Weaviate for document embeddings.',
      projectId: 'p_3',
      status: 'To Do',
      dueDate: '2026-06-10',
      urgency: 'High',
      assigneeId: 'member_3',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_5',
      name: 'Onboarding Screens UI',
      description: 'Design and implement the initial user welcome flow.',
      projectId: 'p_1',
      status: 'Done',
      dueDate: '2026-05-12',
      urgency: 'Medium',
      assigneeId: 'member_4',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_6',
      name: 'Social Media Assets',
      description: 'Create banners and posts for Instagram and Twitter.',
      projectId: 'p_4',
      status: 'To Do',
      dueDate: '2026-06-15',
      urgency: 'Low',
      assigneeId: 'member_5',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_7',
      name: 'Infrastructure Penetration Test',
      description: 'Coordinate with security team for the scheduled pentest.',
      projectId: 'p_5',
      status: 'In Review',
      dueDate: '2026-05-28',
      urgency: 'Critical',
      assigneeId: 'admin_1',
      createdAt: new Date().toISOString()
    },
    {
      id: 't_8',
      name: 'Real-time Messaging Engine',
      description: 'Implement Socket.io for instant chat functionality.',
      projectId: 'p_1',
      status: 'To Do',
      dueDate: '2026-06-05',
      urgency: 'High',
      assigneeId: 'member_1',
      createdAt: new Date().toISOString()
    }
  ];

  const notifications = [
    {
      id: 'n_1',
      userId: 'admin_1',
      title: 'New Task Assigned',
      message: 'Roopak completed the API Authentication Flow.',
      type: 'task',
      read: false,
      taskId: 't_2',
      createdAt: new Date().toISOString()
    },
    {
      id: 'n_2',
      userId: 'member_1',
      title: 'Project Update',
      message: 'Admin updated the deadline for TaskOrbit SaaS.',
      type: 'project',
      read: true,
      projectId: 'p_1',
      createdAt: new Date().toISOString()
    }
  ];

  const activityLog = [
    {
      id: 'a_1',
      userId: 'admin_1',
      userName: 'Khushbu Yadav',
      action: 'launched project',
      targetName: 'TaskOrbit SaaS',
      projectId: 'p_1',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'a_2',
      userId: 'admin_1',
      userName: 'Khushbu Yadav',
      action: 'created task',
      targetName: 'Design System Architecture',
      projectId: 'p_1',
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }
  ];

  const data = {
    users,
    projects,
    tasks,
    issues: [],
    messages: [],
    notifications,
    activityLog,
    tags: [
      { id: '1', name: 'Design', color: '#E8D5B7' },
      { id: '2', name: 'Bug', color: '#E05C5C' },
      { id: '3', name: 'Urgent', color: '#E8A838' }
    ]
  };

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  console.log('Database seeded successfully!');
};

seed().catch(console.error);
