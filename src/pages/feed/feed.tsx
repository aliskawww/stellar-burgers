import { Preloader } from '@ui';
import { FeedUI } from '@ui-pages';
import { fetchFeed } from '@slices/feedSlice';
import { useOrderPolling } from '../../hooks/use-order-polling';
import { useDispatch, useSelector } from '../../services/store';
import { RequestError } from '../../components/request-error/request-error';
import { IngredientsBoundary } from '../../components/ingredients-boundary/ingredients-boundary';

export const Feed = (): React.JSX.Element => {
  const dispatch = useDispatch();
  const feed = useSelector((state) => state.feed);
  useOrderPolling();
  const refresh = (): void => { void dispatch(fetchFeed()); };
  if (!feed.loaded && !feed.error) return <Preloader />;
  return <>
    {feed.error && <RequestError message={feed.error} onRetry={refresh} />}
    {feed.loaded && <IngredientsBoundary><FeedUI orders={feed.orders} handleGetFeeds={refresh} /></IngredientsBoundary>}
  </>;
};
