import React, { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import {
  marketingService,
  MarketingCampaign,
  ContentCalendarItem,
  CampaignPlatform,
  CampaignType,
  CampaignStatus,
  ContentType,
  ContentStatus,
} from '../services/marketingService';
import { useAuth } from '../contexts/AuthContext';

interface MarketingPlanGeneratorCardProps {
  ventureId: string;
}

export function MarketingPlanGeneratorCard({ ventureId }: MarketingPlanGeneratorCardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'campaigns' | 'calendar'>('campaigns');
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [contentItems, setContentItems] = useState<ContentCalendarItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    platform: 'facebook' as CampaignPlatform,
    type: 'awareness' as CampaignType,
    budget: '',
    startDate: '',
    endDate: '',
    status: 'planned' as CampaignStatus,
    goals: '',
  });

  const [contentForm, setContentForm] = useState({
    campaignId: '',
    type: 'post' as ContentType,
    title: '',
    description: '',
    platform: '',
    scheduledDate: '',
    status: 'draft' as ContentStatus,
  });

  useEffect(() => {
    if (ventureId && user) {
      loadData();
    }
  }, [ventureId, user]);

  const loadData = async () => {
    if (!ventureId || !user) return;

    try {
      setLoading(true);
      const [campaignsData, calendarData] = await Promise.all([
        marketingService.getCampaigns(ventureId),
        marketingService.getContentCalendar(ventureId),
      ]);
      setCampaigns(campaignsData);
      setContentItems(calendarData);
    } catch (err) {
      setError('Failed to load marketing data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!user || !campaignForm.name || !campaignForm.startDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await marketingService.createCampaign({
        venture_id: ventureId,
        user_id: user.id,
        campaign_name: campaignForm.name,
        platform: campaignForm.platform,
        campaign_type: campaignForm.type,
        budget: parseFloat(campaignForm.budget || '0'),
        spent: 0,
        start_date: campaignForm.startDate,
        end_date: campaignForm.endDate || undefined,
        status: campaignForm.status,
        goals: campaignForm.goals || undefined,
        target_audience: {},
      });

      setCampaignForm({
        name: '',
        platform: 'facebook',
        type: 'awareness',
        budget: '',
        startDate: '',
        endDate: '',
        status: 'planned',
        goals: '',
      });

      await loadData();
    } catch (err) {
      setError('Failed to create campaign');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = async () => {
    if (!user || !contentForm.title || !contentForm.scheduledDate || !contentForm.platform) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await marketingService.createContentItem({
        venture_id: ventureId,
        user_id: user.id,
        campaign_id: contentForm.campaignId || undefined,
        content_type: contentForm.type,
        title: contentForm.title,
        description: contentForm.description || undefined,
        platform: contentForm.platform,
        scheduled_date: contentForm.scheduledDate,
        status: contentForm.status,
      });

      setContentForm({
        campaignId: '',
        type: 'post',
        title: '',
        description: '',
        platform: '',
        scheduledDate: '',
        status: 'draft',
      });

      await loadData();
    } catch (err) {
      setError('Failed to create content item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      setLoading(true);
      await marketingService.deleteCampaign(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete campaign');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    try {
      setLoading(true);
      await marketingService.deleteContentItem(id);
      await loadData();
    } catch (err) {
      setError('Failed to delete content item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCampaignStatus = async (id: string, status: CampaignStatus) => {
    try {
      setLoading(true);
      await marketingService.updateCampaign(id, { status });
      await loadData();
    } catch (err) {
      setError('Failed to update campaign');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContentStatus = async (id: string, status: ContentStatus) => {
    try {
      setLoading(true);
      const updates: Partial<ContentCalendarItem> = { status };
      if (status === 'published' && !contentItems.find((c) => c.id === id)?.published_date) {
        updates.published_date = new Date().toISOString();
      }
      await marketingService.updateContentItem(id, updates);
      await loadData();
    } catch (err) {
      setError('Failed to update content item');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card className="p-6">
        <p className="text-gray-600">Please sign in to use Marketing Plan Generator</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Marketing Plan Generator</h2>
      </div>

      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'campaigns'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'calendar'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Content Calendar ({contentItems.length})
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold mb-4">New Campaign</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="campName">Campaign Name*</Label>
                <Input
                  id="campName"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  placeholder="e.g., Summer Product Launch"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="platform">Platform*</Label>
                  <select
                    id="platform"
                    value={campaignForm.platform}
                    onChange={(e) =>
                      setCampaignForm({
                        ...campaignForm,
                        platform: e.target.value as CampaignPlatform,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="facebook">Facebook</option>
                    <option value="instagram">Instagram</option>
                    <option value="google">Google Ads</option>
                    <option value="tiktok">TikTok</option>
                    <option value="pinterest">Pinterest</option>
                    <option value="email">Email</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="type">Campaign Type*</Label>
                  <select
                    id="type"
                    value={campaignForm.type}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, type: e.target.value as CampaignType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="awareness">Awareness</option>
                    <option value="consideration">Consideration</option>
                    <option value="conversion">Conversion</option>
                    <option value="retention">Retention</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  step="0.01"
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  placeholder="1000.00"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="startDate">Start Date*</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={campaignForm.startDate}
                    onChange={(e) =>
                      setCampaignForm({ ...campaignForm, startDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={campaignForm.endDate}
                    onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="goals">Campaign Goals</Label>
                <textarea
                  id="goals"
                  value={campaignForm.goals}
                  onChange={(e) => setCampaignForm({ ...campaignForm, goals: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="What do you want to achieve with this campaign?"
                />
              </div>

              <Button onClick={handleCreateCampaign} disabled={loading} className="w-full">
                {loading ? 'Creating...' : 'Create Campaign'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Active Campaigns</h3>
            {campaigns.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No campaigns yet</p>
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={`p-4 border rounded-lg ${
                    campaign.status === 'active'
                      ? 'border-green-300 bg-green-50'
                      : campaign.status === 'completed'
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-blue-300 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">{campaign.campaign_name}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            campaign.status === 'active'
                              ? 'bg-green-600 text-white'
                              : campaign.status === 'completed'
                              ? 'bg-gray-600 text-white'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                        <div>
                          <p className="text-gray-600">Platform:</p>
                          <p className="font-medium capitalize">{campaign.platform}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Type:</p>
                          <p className="font-medium capitalize">{campaign.campaign_type}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Budget:</p>
                          <p className="font-medium">${campaign.budget.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Spent:</p>
                          <p className="font-medium">${campaign.spent.toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>
                          {new Date(campaign.start_date).toLocaleDateString()} -{' '}
                          {campaign.end_date
                            ? new Date(campaign.end_date).toLocaleDateString()
                            : 'Ongoing'}
                        </p>
                      </div>
                      {campaign.goals && (
                        <p className="mt-2 text-sm text-gray-700">{campaign.goals}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {campaign.status === 'planned' && (
                        <Button
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'active')}
                          size="sm"
                          disabled={loading}
                        >
                          Start
                        </Button>
                      )}
                      {campaign.status === 'active' && (
                        <Button
                          onClick={() => handleUpdateCampaignStatus(campaign.id, 'paused')}
                          variant="outline"
                          size="sm"
                          disabled={loading}
                        >
                          Pause
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteCampaign(campaign.id)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-semibold mb-4">New Content</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="contentCampaign">Campaign (Optional)</Label>
                <select
                  id="contentCampaign"
                  value={contentForm.campaignId}
                  onChange={(e) => setContentForm({ ...contentForm, campaignId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No campaign</option>
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.campaign_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="contentType">Content Type*</Label>
                  <select
                    id="contentType"
                    value={contentForm.type}
                    onChange={(e) =>
                      setContentForm({ ...contentForm, type: e.target.value as ContentType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="post">Post</option>
                    <option value="story">Story</option>
                    <option value="video">Video</option>
                    <option value="blog">Blog</option>
                    <option value="email">Email</option>
                    <option value="ad">Ad</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="contentPlatform">Platform*</Label>
                  <Input
                    id="contentPlatform"
                    value={contentForm.platform}
                    onChange={(e) => setContentForm({ ...contentForm, platform: e.target.value })}
                    placeholder="e.g., Instagram, Facebook"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contentTitle">Title*</Label>
                <Input
                  id="contentTitle"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  placeholder="Content title or headline"
                />
              </div>

              <div>
                <Label htmlFor="contentDesc">Description</Label>
                <textarea
                  id="contentDesc"
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="Content description or caption"
                />
              </div>

              <div>
                <Label htmlFor="scheduledDate">Scheduled Date*</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={contentForm.scheduledDate}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, scheduledDate: e.target.value })
                  }
                />
              </div>

              <Button onClick={handleCreateContent} disabled={loading} className="w-full">
                {loading ? 'Adding...' : 'Add to Calendar'}
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Scheduled Content</h3>
            {contentItems.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No content scheduled</p>
            ) : (
              contentItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg ${
                    item.status === 'published'
                      ? 'border-green-300 bg-green-50'
                      : item.status === 'scheduled'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{item.title}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === 'published'
                              ? 'bg-green-600 text-white'
                              : item.status === 'scheduled'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-600 text-white'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-600">
                          <span className="font-medium capitalize">{item.content_type}</span> on{' '}
                          {item.platform}
                        </p>
                        <p className="text-gray-600">
                          Scheduled: {new Date(item.scheduled_date).toLocaleString()}
                        </p>
                        {item.description && (
                          <p className="text-gray-700 mt-1">{item.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {item.status === 'draft' && (
                        <Button
                          onClick={() => handleUpdateContentStatus(item.id, 'scheduled')}
                          size="sm"
                          disabled={loading}
                        >
                          Schedule
                        </Button>
                      )}
                      {item.status === 'scheduled' && (
                        <Button
                          onClick={() => handleUpdateContentStatus(item.id, 'published')}
                          size="sm"
                          disabled={loading}
                        >
                          Publish
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDeleteContent(item.id)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
