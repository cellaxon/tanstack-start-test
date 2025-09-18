import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface WeatherData {
  temperature: number;
  humidity: number;
  description: string;
  city: string;
  country: string;
  icon: string;
}

interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  language: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
}

export function useWeatherData(city: string) {
  return useQuery({
    queryKey: ['weather', city],
    queryFn: async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) {
        return {
          temperature: 22,
          humidity: 65,
          description: 'Clear sky',
          city: city,
          country: 'US',
          icon: '01d',
        } as WeatherData;
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
      );
      const data = await response.json();

      return {
        temperature: data.main.temp,
        humidity: data.main.humidity,
        description: data.weather[0].description,
        city: data.name,
        country: data.sys.country,
        icon: data.weather[0].icon,
      } as WeatherData;
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!city,
  });
}

export function useGithubRepos(username: string) {
  return useQuery({
    queryKey: ['github-repos', username],
    queryFn: async () => {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=10`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch GitHub repositories');
      }

      return response.json() as Promise<GithubRepo[]>;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!username,
  });
}

export function useNewsHeadlines(category: string = 'technology') {
  return useQuery({
    queryKey: ['news', category],
    queryFn: async () => {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) {
        return [
          {
            title: 'Sample News Article',
            description: 'This is a sample news article for demonstration',
            url: '#',
            urlToImage: 'https://via.placeholder.com/300x200',
            publishedAt: new Date().toISOString(),
            source: { name: 'Demo News' },
          },
        ] as NewsArticle[];
      }

      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${apiKey}`
      );
      const data = await response.json();
      return data.articles as NewsArticle[];
    },
    staleTime: 15 * 60 * 1000,
  });
}

export function useCryptoPrices(currency: string = 'usd') {
  return useQuery({
    queryKey: ['crypto-prices', currency],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch cryptocurrency prices');
      }

      return response.json() as Promise<CryptoPrice[]>;
    },
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useProxyApiCall<T>(endpoint: string, options?: RequestInit) {
  return useQuery({
    queryKey: ['proxy', endpoint],
    queryFn: async () => {
      const response = await apiClient.post<T>('/api/proxy', {
        url: endpoint,
        options,
      });
      return response;
    },
  });
}

export function useWebhookTrigger() {
  return useMutation({
    mutationFn: async (data: {
      url: string;
      payload: any;
      headers?: Record<string, string>;
    }) => {
      const response = await fetch(data.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...data.headers,
        },
        body: JSON.stringify(data.payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      return response.json();
    },
  });
}

export function useGraphQLQuery<T>(query: string, variables?: Record<string, any>) {
  return useQuery({
    queryKey: ['graphql', query, variables],
    queryFn: async () => {
      const endpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql';
      const response = await apiClient.post<{ data: T }>(endpoint, {
        query,
        variables,
      });
      return response.data;
    },
  });
}

export function useIPGeolocation(ip?: string) {
  return useQuery({
    queryKey: ['ip-geolocation', ip],
    queryFn: async () => {
      const url = ip
        ? `https://ipapi.co/${ip}/json/`
        : 'https://ipapi.co/json/';

      const response = await fetch(url);
      return response.json();
    },
    staleTime: 60 * 60 * 1000,
  });
}