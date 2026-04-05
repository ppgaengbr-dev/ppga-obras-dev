import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import InConstruction from './InConstruction';

export default function Contracts() {
  const { canAccessPage } = usePermission();

  if (!canAccessPage('contratos')) {
    return <AccessDenied />;
  }

  return <InConstruction />;
}
