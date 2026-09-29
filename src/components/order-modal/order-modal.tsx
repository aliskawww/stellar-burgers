import { Modal, OrderInfo } from '@components';
import { useParams } from 'react-router-dom';

type OrderModalProps = { onClose: () => void };

export const OrderModal = ({ onClose }: OrderModalProps): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <Modal title={`#${number}`} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};
