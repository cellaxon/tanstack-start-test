import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  useWeatherData,
  useGithubRepos,
  useNewsHeadlines,
  useCryptoPrices,
  useIPGeolocation,
  useWebhookTrigger,
} from '@/hooks/useExternalApi';
import { useApiQuery, usePaginatedQuery, useApiMutation } from '@/hooks/useApi';

export const Route = createFileRoute('/dashboard/api-demo')({
  component: ApiDemoPage,
});

function ApiDemoPage() {
  const [city, setCity] = useState('Seoul');
  const [githubUser, setGithubUser] = useState('facebook');
  const [newsCategory, setNewsCategory] = useState('technology');

  const weatherQuery = useWeatherData(city);
  const githubQuery = useGithubRepos(githubUser);
  const newsQuery = useNewsHeadlines(newsCategory);
  const cryptoQuery = useCryptoPrices('usd');
  const ipQuery = useIPGeolocation();
  const webhookMutation = useWebhookTrigger();

  const handleWeatherSearch = () => {
    weatherQuery.refetch();
  };

  const handleGithubSearch = () => {
    githubQuery.refetch();
  };

  const handleWebhookTest = () => {
    webhookMutation.mutate({
      url: 'https://webhook.site/unique-url',
      payload: {
        message: 'Test webhook from TanStack Query demo',
        timestamp: new Date().toISOString(),
      },
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">External API Integration Demo</h1>
        <p className="text-gray-600 mt-2">
          Examples of integrating with various external APIs using TanStack Query
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weather API</CardTitle>
            <CardDescription>Get current weather data for any city</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
              <Button onClick={handleWeatherSearch} disabled={weatherQuery.isFetching}>
                {weatherQuery.isFetching ? 'Loading...' : 'Search'}
              </Button>
            </div>
            {weatherQuery.data && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    {weatherQuery.data.city}, {weatherQuery.data.country}
                  </span>
                  <span className="text-3xl font-bold">
                    {Math.round(weatherQuery.data.temperature)}°C
                  </span>
                </div>
                <p className="text-gray-600 capitalize">{weatherQuery.data.description}</p>
                <p className="text-sm text-gray-500">Humidity: {weatherQuery.data.humidity}%</p>
              </div>
            )}
            {weatherQuery.error && (
              <p className="text-red-500">Failed to load weather data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>GitHub API</CardTitle>
            <CardDescription>Fetch repositories for a GitHub user</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter GitHub username"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value)}
              />
              <Button onClick={handleGithubSearch} disabled={githubQuery.isFetching}>
                {githubQuery.isFetching ? 'Loading...' : 'Search'}
              </Button>
            </div>
            {githubQuery.data && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {githubQuery.data.slice(0, 5).map((repo) => (
                  <div key={repo.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:underline"
                        >
                          {repo.name}
                        </a>
                        <p className="text-sm text-gray-600 mt-1">{repo.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {repo.language && (
                          <Badge variant="secondary">{repo.language}</Badge>
                        )}
                        <span className="text-sm text-gray-500">⭐ {repo.stargazers_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {githubQuery.error && (
              <p className="text-red-500">Failed to load repositories</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>News API</CardTitle>
            <CardDescription>Get latest news headlines by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newsCategory} onValueChange={setNewsCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="business">Business</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            {newsQuery.data && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {newsQuery.data.slice(0, 3).map((article, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {article.title}
                    </a>
                    <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {article.source.name} • {new Date(article.publishedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            {newsQuery.error && (
              <p className="text-red-500">Failed to load news</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cryptocurrency Prices</CardTitle>
            <CardDescription>Live cryptocurrency market data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => cryptoQuery.refetch()}
              disabled={cryptoQuery.isFetching}
              className="w-full"
            >
              {cryptoQuery.isFetching ? 'Refreshing...' : 'Refresh Prices'}
            </Button>
            {cryptoQuery.data && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {cryptoQuery.data.slice(0, 5).map((crypto) => (
                  <div key={crypto.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <img src={crypto.image} alt={crypto.name} className="w-6 h-6" />
                        <div>
                          <span className="font-medium">{crypto.name}</span>
                          <span className="text-sm text-gray-500 ml-2">{crypto.symbol.toUpperCase()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${crypto.current_price.toLocaleString()}</p>
                        <p className={`text-sm ${crypto.price_change_percentage_24h > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {crypto.price_change_percentage_24h > 0 ? '+' : ''}
                          {crypto.price_change_percentage_24h.toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {cryptoQuery.error && (
              <p className="text-red-500">Failed to load cryptocurrency prices</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>IP Geolocation</CardTitle>
            <CardDescription>Get location information based on IP address</CardDescription>
          </CardHeader>
          <CardContent>
            {ipQuery.data && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-gray-600">IP Address</Label>
                  <p className="font-medium">{ipQuery.data.ip}</p>
                </div>
                <div>
                  <Label className="text-gray-600">City</Label>
                  <p className="font-medium">{ipQuery.data.city}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Region</Label>
                  <p className="font-medium">{ipQuery.data.region}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Country</Label>
                  <p className="font-medium">{ipQuery.data.country_name}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Timezone</Label>
                  <p className="font-medium">{ipQuery.data.timezone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">ISP</Label>
                  <p className="font-medium">{ipQuery.data.org}</p>
                </div>
              </div>
            )}
            {ipQuery.error && (
              <p className="text-red-500">Failed to load IP information</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Webhook Test</CardTitle>
            <CardDescription>Test webhook integration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleWebhookTest}
              disabled={webhookMutation.isPending}
              className="w-full"
            >
              {webhookMutation.isPending ? 'Sending...' : 'Send Test Webhook'}
            </Button>
            {webhookMutation.isSuccess && (
              <p className="text-green-600">Webhook sent successfully!</p>
            )}
            {webhookMutation.isError && (
              <p className="text-red-500">
                Failed to send webhook: {webhookMutation.error?.message}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Note: This will attempt to send a test payload to a webhook endpoint.
              Replace the URL in the code with your actual webhook endpoint.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}