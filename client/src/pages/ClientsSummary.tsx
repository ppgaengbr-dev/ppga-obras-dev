'use client';

import { useMemo } from 'react';
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { trpc } from "@/lib/trpc";
import { Loader2, Users, TrendingUp, Target, CheckCircle } from "lucide-react";

export default function ClientsSummary() {
  const { data: clients = [], isLoading } = trpc.clients.list.useQuery();

  // Calcular estatísticas
  const stats = useMemo(() => {
    const total = clients.length;
    const byStatus = {
      prospect: clients.filter((c: any) => c.status === 'prospect').length,
      budget: clients.filter((c: any) => c.status === 'budget').length,
      client: clients.filter((c: any) => c.status === 'client').length,
      remarketing: clients.filter((c: any) => c.status === 'remarketing').length,
      lost: clients.filter((c: any) => c.status === 'lost').length,
    };

    const conversionRate = total > 0 ? ((byStatus.client / total) * 100).toFixed(1) : '0';
    const successRate = total > 0 ? (((byStatus.client + byStatus.budget) / total) * 100).toFixed(1) : '0';

    return {
      total,
      byStatus,
      conversionRate,
      successRate,
    };
  }, [clients]);

  // Dados para gráfico de pizza
  const pieData = useMemo(() => [
    { name: 'Prospecção', value: stats.byStatus.prospect, fill: '#3B82F6' },
    { name: 'Orçamento', value: stats.byStatus.budget, fill: '#8B5CF6' },
    { name: 'Cliente', value: stats.byStatus.client, fill: '#10B981' },
    { name: 'Remarketing', value: stats.byStatus.remarketing, fill: '#F59E0B' },
    { name: 'Perdido', value: stats.byStatus.lost, fill: '#EF4444' },
  ], [stats]);

  // Dados para gráfico de barras
  const barChartData = useMemo(() => {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
    return months.map((month, index) => ({
      name: month,
      clientes: Math.floor(Math.random() * 10) + 1,
      orçamentos: Math.floor(Math.random() * 8) + 1,
      conversões: Math.floor(Math.random() * 5) + 1,
    }));
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin" size={32} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Resumo de Clientes</h1>
          <p className="text-sm text-muted-foreground">Análise e estatísticas de clientes</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Clientes */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total de Clientes</p>
                <p className="text-3xl font-bold text-foreground">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Taxa de Conversão */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-3xl font-bold text-foreground">{stats.conversionRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp size={24} className="text-green-600" />
              </div>
            </div>
          </Card>

          {/* Prospecções Ativas */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Prospecções Ativas</p>
                <p className="text-3xl font-bold text-foreground">{stats.byStatus.prospect}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target size={24} className="text-purple-600" />
              </div>
            </div>
          </Card>

          {/* Clientes Confirmados */}
          <Card className="p-6 border border-border">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Clientes Confirmados</p>
                <p className="text-3xl font-bold text-foreground">{stats.byStatus.client}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle size={24} className="text-green-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Pizza */}
          <Card className="p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Distribuição por Status</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Gráfico de Barras */}
          <Card className="p-6 border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Evolução Mensal</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="clientes" fill="#3B82F6" name="Clientes" />
                <Bar dataKey="orçamentos" fill="#8B5CF6" name="Orçamentos" />
                <Bar dataKey="conversões" fill="#10B981" name="Conversões" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Detalhamento por Status */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Detalhamento por Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Prospecção</p>
              <p className="text-2xl font-bold text-blue-600">{stats.byStatus.prospect}</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Orçamento</p>
              <p className="text-2xl font-bold text-purple-600">{stats.byStatus.budget}</p>
            </div>
            <div className="p-4 rounded-lg bg-green-50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Cliente</p>
              <p className="text-2xl font-bold text-green-600">{stats.byStatus.client}</p>
            </div>
            <div className="p-4 rounded-lg bg-amber-50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Remarketing</p>
              <p className="text-2xl font-bold text-amber-600">{stats.byStatus.remarketing}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-50 text-center">
              <p className="text-sm text-muted-foreground mb-2">Perdido</p>
              <p className="text-2xl font-bold text-red-600">{stats.byStatus.lost}</p>
            </div>
          </div>
        </Card>

        {/* Informações Adicionais */}
        <Card className="p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Informações Adicionais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Orçamentos Enviados</p>
              <p className="text-2xl font-bold text-foreground">{stats.byStatus.budget}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.byStatus.budget > 0 ? `${((stats.byStatus.budget / stats.total) * 100).toFixed(1)}% do total` : "0%"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-foreground">{stats.successRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.byStatus.client + stats.byStatus.budget} de {stats.total} clientes
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Clientes em Remarketing</p>
              <p className="text-2xl font-bold text-foreground">{stats.byStatus.remarketing}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.byStatus.remarketing > 0 ? `${((stats.byStatus.remarketing / stats.total) * 100).toFixed(1)}% do total` : "0%"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
