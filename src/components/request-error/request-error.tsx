import { Button } from '@krgaa/react-developer-burger-ui-components';

export const RequestError = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}): React.JSX.Element => (
  <section className="p-6" aria-label="Ошибка запроса">
    <p role="alert" className="text text_type_main-default mb-4">
      {message}
    </p>
    {onRetry && (
      <Button htmlType="button" type="primary" size="small" onClick={onRetry}>
        Повторить
      </Button>
    )}
  </section>
);
