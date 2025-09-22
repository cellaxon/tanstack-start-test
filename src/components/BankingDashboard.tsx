import { useState } from 'react';
import { BusinessMetrics } from './charts/BusinessMetrics';
import { ErrorTracking } from './charts/ErrorTracking';
import { GeographicAnalysis } from './charts/GeographicAnalysis';
import { ResourceMetrics } from './charts/ResourceMetrics';
import { SecurityMonitoring } from './charts/SecurityMonitoring';
import { TrafficMonitoring } from './charts/TrafficMonitoring';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BankingDashboard() {
  const [activeTab, setActiveTab] = useState('traffic');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">은행권 API Gateway 모니터링</h1>
        <p className="text-gray-600">실시간 시스템 성능 및 보안 현황을 모니터링합니다</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="traffic">트래픽</TabsTrigger>
          <TabsTrigger value="errors">에러/가용성</TabsTrigger>
          <TabsTrigger value="resources">리소스</TabsTrigger>
          <TabsTrigger value="security">보안</TabsTrigger>
          <TabsTrigger value="business">비즈니스/SLA</TabsTrigger>
          <TabsTrigger value="geographic">지리적 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic" className="mt-0">
          <TrafficMonitoring />
        </TabsContent>

        <TabsContent value="errors" className="mt-0">
          <ErrorTracking />
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <ResourceMetrics />
        </TabsContent>

        <TabsContent value="security" className="mt-0">
          <SecurityMonitoring />
        </TabsContent>

        <TabsContent value="business" className="mt-0">
          <BusinessMetrics />
        </TabsContent>

        <TabsContent value="geographic" className="mt-0">
          <GeographicAnalysis />
        </TabsContent>
      </Tabs>
    </div>
  );
}