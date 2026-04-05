import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import InConstruction from './InConstruction';

export default function Schedule() {
  const { canAccessPage } = usePermission();

  if (!canAccessPage('cronogramas')) {
    return <AccessDenied />;
  }

  return <InConstruction />;
}
