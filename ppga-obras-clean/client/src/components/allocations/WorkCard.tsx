interface WorkCardProps {
  name: string;
  origin: string;
  contact: string;
  responsibleName: string;
}

export default function WorkCard({
  name,
  origin,
  contact,
  responsibleName,
}: WorkCardProps) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 hover:bg-gray-100 transition-colors flex flex-col justify-center">
      <h3 className="font-semibold text-gray-900 text-xs leading-tight">{name}</h3>
      <p className="text-xs text-gray-600 mt-0.5 leading-tight">Origem: {origin || 'N/A'}</p>
      <p className="text-xs text-gray-600 leading-tight">Contato: {contact || 'N/A'}</p>
      <p className="text-xs text-gray-600 leading-tight">Responsavel: {responsibleName}</p>
    </div>
  );
}
