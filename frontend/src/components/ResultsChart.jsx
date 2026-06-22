import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';

const colors = {
  blue: '#3b82f6',
  red: '#ef4444',
  green: '#22c55e',
  yellow: '#eab308',
  purple: '#a78bfa',
  gray: '#94a3b8'
};

const getPartyColor = (party = '') => {
  const p = party.toLowerCase();
  if (p.includes('democrat') || p.includes('blue') || p.includes('lib')) return colors.blue;
  if (p.includes('republican') || p.includes('red') || p.includes('con')) return colors.red;
  if (p.includes('green') || p.includes('env')) return colors.green;
  if (p.includes('ind') || p.includes('yellow') || p.includes('gold')) return colors.yellow;
  return colors.purple;
};

// Custom tooltip renderer for a sleek dark mode look
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{data.name}</p>
        <p className="tooltip-party">{data.party}</p>
        <p className="tooltip-votes">
          Votes: <span className="votes-highlight">{data.votes}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const ResultsChart = ({ candidates }) => {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="chart-empty-state">
        <p>No candidates registered yet. Election charts will appear here.</p>
      </div>
    );
  }

  // Calculate total votes cast to check if we have any data
  const totalVotes = candidates.reduce((sum, c) => sum + (c.voteCount || 0), 0);

  const chartData = candidates.map(c => ({
    name: c.name,
    votes: c.voteCount || 0,
    party: c.party,
  }));

  if (totalVotes === 0) {
    return (
      <div className="chart-empty-state">
        <p>Awaiting first ballot. Cast your vote to initialize the results tracker!</p>
      </div>
    );
  }

  return (
    <div className="results-chart-wrapper">
      <div className="chart-info">
        <h3>Electoral Count Tracker</h3>
        <span className="total-badge">Total Votes Cast: {totalVotes}</span>
      </div>

      <div style={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2f42" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              axisLine={{ stroke: '#2a2f42' }}
              tickLine={false}
            />
            <YAxis 
              allowDecimals={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              axisLine={{ stroke: '#2a2f42' }}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
            <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getPartyColor(entry.party)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
