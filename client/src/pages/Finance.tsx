import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import InConstruction from './InConstruction';

export default function Finance() {
  const { canAccessPage } = usePermission();

  if (!canAccessPage('financeiro')) {
    return <AccessDenied />;
  }

  return <InConstruction />;
}
