import { Card } from '@/components/ui/card';

interface EmptyColumnCardProps {
  message: string;
}

export function EmptyColumnCard({ message }: EmptyColumnCardProps) {
  return (
    <Card className="p-4 flex items-center justify-center text-gray-400 text-sm h-24 border-dashed">
      {message}
    </Card>
  );
}
