import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { BarChart, LineChart, PieChart } from '../charts';

interface Campaign {
  id: string;
  name: string;
  channel: string;
  budget: number;
  spend: number;
  revenue: number;
  conversions: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'paused' | 'completed';
}

export function MarketingROIDashboard() {
  const [campaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Sale 2025',
      channel: 'Facebook Ads',
      budget: 5000,
      spend: 3200,
      revenue: 12500,
      conversions: 245,
      startDate: '2025-06-01',
      endDate: '2025-07-31',
      status: 'active',
    },
    {
      id: '2',
      name: 'Google Search Campaign',
      channel: 'Google Ads',
      budget: 3000,
      spend: 2800,
      revenue: 8900,
      conversions: 156,
      startDate: '2025-06-15',
      endDate: '2025-08-15',
      status: 'active',
    },
    {
      id: '3',
      name: 'Email Marketing',
      channel: 'Email',
      budget: 500,
      spend: 450,
      revenue: 3200,
      conversions: 89,
      startDate: '2025-06-01',
      endDate: '2025-12-31',
      status: 'active',
    },
  ]);

  const calculateROI = (revenue: number, spend: number) => {
    if (spend === 0) return 0;
    return ((revenue - spend) / spend) * 100;
  };

  const calculateCPA = (spend: number, conversions: number) => {
    if (conversions === 0) return 0;
    return spend / conversions;
  };

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const averageROI = calculateROI(totalRevenue, totalSpend);

  const roiByChannel = campaigns.map(c => ({
    name: c.channel,
    roi: calculateROI(c.revenue, c.spend),
    spend: c.spend,
    revenue: c.revenue,
  }));

  const spendByChannel = campaigns.map(c => ({
    name: c.channel,
    value: c.spend,
    color: ['#3b82f6', '#10b981', '#f59e0b'][campaigns.indexOf(c) % 3],
  }));

  const performanceOverTime = [
    { month: 'Jan', roi: 145, conversions: 45 },
    { month: 'Feb', roi: 167, conversions: 58 },
    { month: 'Mar', roi: 189, conversions: 67 },
    { month: 'Apr', roi: 203, conversions: 78 },
    { month: 'May', roi: 221, conversions: 89 },
    { month: 'Jun', roi: 248, conversions: 102 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              ${totalSpend.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Spend</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${totalRevenue.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {averageROI.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Average ROI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {totalConversions}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Conversions</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ROI by Channel</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={roiByChannel}
              bars={[{ dataKey: 'roi', name: 'ROI %', color: '#3b82f6' }]}
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spend Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={spendByChannel}
              formatValue={(value) => `$${value.toLocaleString()}`}
              showPercentage
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={performanceOverTime}
            lines={[
              { dataKey: 'roi', name: 'ROI %', color: '#3b82f6' },
              { dataKey: 'conversions', name: 'Conversions', color: '#10b981' },
            ]}
            height={300}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign) => {
              const roi = calculateROI(campaign.revenue, campaign.spend);
              const cpa = calculateCPA(campaign.spend, campaign.conversions);

              return (
                <div key={campaign.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{campaign.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{campaign.channel}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      campaign.status === 'active'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : campaign.status === 'paused'
                        ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Budget</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${campaign.budget.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Spend</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${campaign.spend.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">Revenue</div>
                      <div className="font-semibold text-green-600 dark:text-green-400">
                        ${campaign.revenue.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">ROI</div>
                      <div className={`font-semibold ${roi >= 100 ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                        {roi.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 dark:text-gray-400">CPA</div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ${cpa.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Budget Used</span>
                      <span>{((campaign.spend / campaign.budget) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((campaign.spend / campaign.budget) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
