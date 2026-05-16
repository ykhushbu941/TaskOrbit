import React from 'react';
import { 
  BarChart3, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Download, 
  Filter,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts';

const taskData = [
  { name: 'Week 1', completed: 45, assigned: 50 },
  { name: 'Week 2', completed: 52, assigned: 55 },
  { name: 'Week 3', completed: 38, assigned: 60 },
  { name: 'Week 4', completed: 65, assigned: 70 },
  { name: 'Week 5', completed: 48, assigned: 50 },
  { name: 'Week 6', completed: 70, assigned: 75 },
];

const statusData = [
  { name: 'Done', value: 65, color: '#4CAF7D' },
  { name: 'In Progress', value: 20, color: '#E8A838' },
  { name: 'In Review', value: 10, color: '#C9A96E' },
  { name: 'Blocked', value: 5, color: '#E05C5C' },
];

const memberPerformance = [
  { name: 'Sarah Wilson', completed: 42, efficiency: '94%', trend: '+5%' },
  { name: 'Alex Chen', completed: 38, efficiency: '88%', trend: '+2%' },
  { name: 'Mike Johnson', completed: 35, efficiency: '91%', trend: '-1%' },
  { name: 'Elena Rodriguez', completed: 28, efficiency: '96%', trend: '+8%' },
];

const ReportsAnalytics = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-sans font-bold">Reports & Analytics</h2>
          <p className="text-text-secondary-light dark:text-text-secondary-dark mt-1">Detailed insights into team productivity and project health.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-surface-light-muted transition-all">
            <Calendar className="w-4 h-4" />
          </button>
          <button className="p-2 border border-border-light dark:border-border-dark rounded-lg hover:bg-surface-light-muted transition-all">
            <Filter className="w-4 h-4" />
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Productivity Chart */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-sans font-bold">Task Completion Velocity</h3>
            <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-text-secondary-light">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary-light dark:bg-primary-dark"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-border-light dark:bg-border-dark"></div>
                <span>Assigned</span>
              </div>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', borderRadius: '12px' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={4} dot={{ r: 4, fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="assigned" stroke="var(--border)" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="card p-8">
          <h3 className="text-xl font-sans font-bold mb-8">Tasks by Status</h3>
          <div className="h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-sans font-bold">100</span>
               <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Total Tasks</span>
            </div>
          </div>
          <div className="mt-8 space-y-3">
             {statusData.map((item, i) => (
               <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-text-secondary-light font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Member Performance Table */}
        <div className="card p-8">
           <h3 className="text-xl font-sans font-bold mb-8">Member Performance</h3>
           <div className="space-y-6">
              {memberPerformance.map((member, i) => (
                <div key={i} className="flex items-center justify-between group">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-surface-light-muted dark:bg-surface-dark-muted flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{member.name}</p>
                        <p className="text-[10px] text-text-secondary-light uppercase font-bold tracking-widest">{member.completed} tasks completed</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-bold">{member.efficiency}</span>
                        {member.trend.startsWith('+') ? (
                          <ArrowUpRight className="w-3 h-3 text-success" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-danger" />
                        )}
                      </div>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${member.trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                        {member.trend} vs last month
                      </p>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Project Health Bar Chart */}
        <div className="card p-8">
           <h3 className="text-xl font-sans font-bold mb-8">Project Health Over Time</h3>
           <div className="h-[250px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={taskData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                 <Tooltip contentStyle={{ backgroundColor: 'var(--surface)', borderRadius: '12px' }} />
                 <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
               </BarChart>
             </ResponsiveContainer>
           </div>
           <div className="mt-8 flex items-center justify-center gap-8">
              <div className="text-center">
                 <p className="text-2xl font-sans font-bold">8.4/10</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">Team Morale</p>
              </div>
              <div className="w-[1px] h-8 bg-border-light dark:bg-border-dark"></div>
              <div className="text-center">
                 <p className="text-2xl font-sans font-bold">92%</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary-light">On-Time Rate</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
