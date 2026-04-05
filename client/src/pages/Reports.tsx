import { usePermission } from '../_core/hooks/usePermission';
import AccessDenied from '../components/AccessDenied';
import InConstruction from './InConstruction';

export default function Reports() {
  const { canAccessPage } = usePermission();

  if (!canAccessPage('relatorios')) {
    return <AccessDenied />;
  }

  return <InConstruction />;
}
