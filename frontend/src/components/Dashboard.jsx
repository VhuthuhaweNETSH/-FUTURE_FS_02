import React, { useState, useEffect } from 'react';
import { getLeads } from '../services/api';

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads();
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Loading analytics...</div>;
  }

  // ========== STATISTICS ==========
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const contactedLeads = leads.filter(l => l.status === 'contacted').length;
  const convertedLeads = leads.filter(l => l.status === 'converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;
  
  // Lead source breakdown
  const sourceStats = {};
  leads.forEach(lead => {
    sourceStats[lead.source] = (sourceStats[lead.source] || 0) + 1;
  });
  
  // Monthly trends (last 6 months)
  const monthlyTrends = {};
  leads.forEach(lead => {
    const date = new Date(lead.createdAt);
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    if (!monthlyTrends[monthYear]) {
      monthlyTrends[monthYear] = { total: 0, converted: 0 };
    }
    monthlyTrends[monthYear].total++;
    if (lead.status === 'converted') monthlyTrends[monthYear].converted++;
  });
  
  const last6Months = Object.entries(monthlyTrends).slice(-6);
  
  // Weekly trend (last 7 days)
  const weeklyTrend = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const count = leads.filter(lead => {
      const leadDate = new Date(lead.createdAt);
      return leadDate.toDateString() === date.toDateString();
    }).length;
    weeklyTrend.push({ date: dayName, fullDate: dateStr, count });
  }
  
  // Average response time (mock calculation - time from new to contacted)
  const contactedLeadsList = leads.filter(l => l.status === 'contacted' || l.status === 'converted');
  let avgResponseDays = 0;
  if (contactedLeadsList.length > 0) {
    const totalDays = contactedLeadsList.reduce((sum, lead) => {
      const days = Math.floor((new Date(lead.updatedAt) - new Date(lead.createdAt)) / (1000 * 60 * 60 * 24));
      return sum + Math.max(days, 0);
    }, 0);
    avgResponseDays = (totalDays / contactedLeadsList.length).toFixed(1);
  }
  
  // Performance by source (conversion rate per source)
  const sourcePerformance = {};
  Object.keys(sourceStats).forEach(source => {
    const sourceLeads = leads.filter(l => l.source === source);
    const sourceConverted = sourceLeads.filter(l => l.status === 'converted').length;
    sourcePerformance[source] = {
      total: sourceLeads.length,
      converted: sourceConverted,
      rate: ((sourceConverted / sourceLeads.length) * 100).toFixed(1)
    };
  });
  
  // Weekly comparison (this week vs last week)
  const thisWeekCount = weeklyTrend.slice(-7).reduce((sum, day) => sum + day.count, 0);
  const lastWeekCount = leads.filter(lead => {
    const leadDate = new Date(lead.createdAt);
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const lastWeekEnd = new Date();
    lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
    return leadDate >= lastWeekStart && leadDate < lastWeekEnd;
  }).length;
  const weeklyChange = lastWeekCount > 0 ? (((thisWeekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(1) : 0;
  
  // Lead velocity (today's leads vs average)
  const todayCount = weeklyTrend[weeklyTrend.length - 1].count;
  const avgDailyLeads = (totalLeads / 30).toFixed(1);
  
  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      converted: 'bg-green-100 text-green-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time lead performance and insights</p>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-100 text-sm">Total Leads</p>
              <p className="text-3xl font-bold">{totalLeads}</p>
              <p className="text-blue-100 text-xs mt-2">All time</p>
            </div>
            <span className="text-3xl">📊</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-green-100 text-sm">Conversion Rate</p>
              <p className="text-3xl font-bold">{conversionRate}%</p>
              <p className="text-green-100 text-xs mt-2">{convertedLeads} converted</p>
            </div>
            <span className="text-3xl">🎯</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-purple-100 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold">{avgResponseDays} days</p>
              <p className="text-purple-100 text-xs mt-2">To contact leads</p>
            </div>
            <span className="text-3xl">⏱️</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow p-4 text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-orange-100 text-sm">Weekly Change</p>
              <p className="text-3xl font-bold">{weeklyChange >= 0 ? '+' : ''}{weeklyChange}%</p>
              <p className="text-orange-100 text-xs mt-2">vs last week</p>
            </div>
            <span className="text-3xl">📈</span>
          </div>
        </div>
      </div>

      {/* Second Row KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Today's Leads</p>
              <p className="text-2xl font-bold text-gray-800">{todayCount}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 text-sm">Daily Avg</p>
              <p className="text-lg font-semibold text-gray-600">{avgDailyLeads}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 rounded-full h-2" style={{ width: `${Math.min((todayCount / avgDailyLeads) * 100, 100)}%` }} />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {todayCount > avgDailyLeads ? 'Above' : 'Below'} daily average
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Active Leads</p>
              <p className="text-2xl font-bold text-gray-800">{newLeads + contactedLeads}</p>
            </div>
            <span className="text-2xl">🔄</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{newLeads} new, {contactedLeads} in progress</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-500 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-gray-800">{conversionRate}%</p>
            </div>
            <span className="text-2xl">🏆</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">{convertedLeads} out of {totalLeads} leads</p>
        </div>
      </div>

      {/* Status Distribution & Source Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Lead Funnel</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-yellow-600 font-medium">🟡 New</span>
                <span className="text-gray-600">{newLeads} leads ({((newLeads / totalLeads) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-yellow-500 rounded-full h-3 transition-all duration-500" style={{ width: `${(newLeads / totalLeads) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-600 font-medium">🔵 Contacted</span>
                <span className="text-gray-600">{contactedLeads} leads ({((contactedLeads / totalLeads) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-blue-500 rounded-full h-3 transition-all duration-500" style={{ width: `${(contactedLeads / totalLeads) * 100}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 font-medium">🟢 Converted</span>
                <span className="text-gray-600">{convertedLeads} leads ({((convertedLeads / totalLeads) * 100).toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 rounded-full h-3 transition-all duration-500" style={{ width: `${(convertedLeads / totalLeads) * 100}%` }} />
              </div>
            </div>
          </div>
          
          {/* Funnel visualization */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between text-center text-xs">
              <div className="flex-1">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-yellow-600 font-bold">{newLeads}</span>
                </div>
                <span className="text-gray-500">New</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex-1">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-blue-600 font-bold">{contactedLeads}</span>
                </div>
                <span className="text-gray-500">Contacted</span>
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex-1">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                  <span className="text-green-600 font-bold">{convertedLeads}</span>
                </div>
                <span className="text-gray-500">Converted</span>
              </div>
            </div>
          </div>
        </div>

        {/* Source Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Channel Performance</h2>
          <div className="space-y-3">
            {Object.entries(sourcePerformance).map(([source, data]) => (
              <div key={source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{source}</span>
                  <span className="text-gray-500">{data.rate}% conversion ({data.converted}/{data.total})</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2 transition-all duration-500" style={{ width: `${data.rate}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 Best performing channel: {
                Object.entries(sourcePerformance).sort((a, b) => parseFloat(b[1].rate) - parseFloat(a[1].rate))[0]?.[0]
              } with {
                Object.entries(sourcePerformance).sort((a, b) => parseFloat(b[1].rate) - parseFloat(a[1].rate))[0]?.[1].rate
              }% conversion rate
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Weekly Lead Trend</h2>
          <div className="text-sm text-gray-500">
            <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span> This week: {thisWeekCount} leads
            <span className="ml-3 inline-block w-3 h-3 bg-gray-300 rounded-full mr-1"></span> Avg: {avgDailyLeads}/day
          </div>
        </div>
        <div className="flex items-end justify-between h-64 gap-2">
          {weeklyTrend.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div className="relative w-full">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${(day.count / Math.max(...weeklyTrend.map(d => d.count), 1)) * 200}px` }}
                />
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                  {day.count} leads
                </div>
              </div>
              <span className="text-xs text-gray-500 mt-2">{day.date}</span>
              <span className="text-sm font-semibold text-gray-700">{day.count}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">📈 Trend direction: {weeklyChange >= 0 ? 'Increasing' : 'Decreasing'}</span>
            <span className={`font-semibold ${weeklyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weeklyChange >= 0 ? '+' : ''}{weeklyChange}% vs last week
            </span>
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Performance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-600">Month</th>
                <th className="text-left py-2 text-gray-600">Total Leads</th>
                <th className="text-left py-2 text-gray-600">Converted</th>
                <th className="text-left py-2 text-gray-600">Conversion Rate</th>
                <th className="text-left py-2 text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {last6Months.map(([month, data], index) => {
                const rate = ((data.converted / data.total) * 100).toFixed(1);
                const prevMonth = index > 0 ? ((last6Months[index - 1][1].converted / last6Months[index - 1][1].total) * 100).toFixed(1) : null;
                const trend = prevMonth ? (rate - prevMonth).toFixed(1) : 0;
                return (
                  <tr key={month} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-medium">{month}</td>
                    <td className="py-2">{data.total}</td>
                    <td className="py-2">{data.converted}</td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rate >= 30 ? 'bg-green-100 text-green-800' : rate >= 15 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {rate}%
                      </span>
                    </td>
                    <td className="py-2">
                      {trend !== 0 && (
                        <span className={trend > 0 ? 'text-green-600' : 'text-red-600'}>
                          {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Leads with Notes Preview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          <button 
            onClick={() => window.location.href = '/leads'} 
            className="text-blue-600 text-sm hover:underline"
          >
            View All Leads →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lead</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...leads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((lead) => (
                <tr key={lead._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lead.name}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{lead.source}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    💬 {lead.notes?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;