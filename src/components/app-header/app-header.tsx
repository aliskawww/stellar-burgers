import { AppHeaderUI } from '@ui';
import { useSelector } from '../../services/store';

export const AppHeader = (): React.JSX.Element => {
  const userName = useSelector((state) => state.auth.user?.name);

  return <AppHeaderUI userName={userName} />;
};
