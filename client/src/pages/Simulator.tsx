import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import InConstruction from './InConstruction';

export default function Simulator() {
  const { canAccessPage } = usePermission();

  if (!canAccessPage('simulador')) {
    return <AccessDenied />;
  }

  return <InConstruction />;
}
