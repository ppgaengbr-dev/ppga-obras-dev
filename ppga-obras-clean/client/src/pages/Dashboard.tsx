import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { FileText, Users, Briefcase, DollarSign } from "lucide-react";

/**
 * Dashboard Page
 * 
 * Design Philosophy: Minimalismo Corporativo Moderno
 * - Cards de resumo com ícones brancos
 * - Gráfico de custo por obra
 * - Lista de alocações recentes
 * - Dados fictícios para a Fase 1
 * - Fundo com padrão pontilhado
 */

// Dados fictícios para o gráfico
const chartData = [
  { name: "Obra 01", value: 1200 },
  { name: "Obra 02", value: 1800 },
];

// Dados fictícios para alocações recentes
const recentAllocations = [
  {
    id: 1,
    provider: "Prestador 01",
    work: "Obra 01",
    dates: "23/02/2026 ao 27/02/2026",
    responsible: "Renato Araújo",
    email: "renatoaraujo90@gmail.com",
  },
  {
    id: 2,
    provider: "Prestador 02",
    work: "Obra 02",
    dates: "23/02/2026 ao 27/02/2026",
    responsible: "Rodrigo Silva",
    email: "rodrigo@ppga.eng.br",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card: Orçamentos em Aberto */}
        <Card className="p-5 border border-border hover:shadow-md transition-shadow duration-200 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Orçamentos em aberto</p>
              <p className="text-3xl font-bold text-foreground mt-2">1</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <FileText className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Card: Prestadores em Alocação */}
        <Card className="p-5 border border-border hover:shadow-md transition-shadow duration-200 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Prestadores em alocação</p>
              <p className="text-3xl font-bold text-foreground mt-2">2</p>
            </div>
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
              <Users className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Card: Obras em Andamento */}
        <Card className="p-5 border border-border hover:shadow-md transition-shadow duration-200 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Obras em andamento</p>
              <p className="text-3xl font-bold text-foreground mt-2">2</p>
            </div>
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <Briefcase className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Card: Pagamentos em Processamento */}
        <Card className="p-5 border border-border hover:shadow-md transition-shadow duration-200 rounded-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Pagamentos em processamento</p>
              <p className="text-3xl font-bold text-foreground mt-2">R$ 3.700,00</p>
            </div>
            <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
              <DollarSign className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Gráfico de Custo por Obra */}
      <Card className="p-6 bg-white border border-border rounded-2xl">
        <h2 className="text-lg font-bold text-foreground mb-4">Custo por obra</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
            <XAxis dataKey="name" stroke="#666666" />
            <YAxis stroke="#666666" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E5E5",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="value" fill="#666666" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Lista de Alocações Recentes */}
      <Card className="p-6 bg-white border border-border rounded-2xl">
        <h2 className="text-lg font-bold text-foreground mb-4">Alocações recentes</h2>
        <p className="text-xs text-muted-foreground mb-4">Últimas 5 locações criadas</p>
        <div className="space-y-4">
          {recentAllocations.map((allocation) => (
            <div
              key={allocation.id}
              className="flex items-start justify-between p-4 bg-background rounded-lg border border-border hover:bg-secondary/5 transition-colors duration-200"
            >
              <div className="flex-1">
                <p className="font-semibold text-foreground">{allocation.provider}</p>
                <p className="text-sm text-muted-foreground">{allocation.work} - Do dia {allocation.dates}</p>
                <p className="text-xs text-muted-foreground mt-1">{allocation.responsible}</p>
                <p className="text-xs text-muted-foreground">{allocation.email}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
