import { useParams } from 'react-router-dom';
import { Modal, OrderInfo } from '@components';

type OrderModalProps = { onClose: () => void };

export const OrderModal = ({ onClose }: OrderModalProps): React.JSX.Element => {
  const { number } = useParams<{ number: string }>();

  return (
    <Modal title={`#${number}`} onClose={onClose}>
      <OrderInfo />
    </Modal>
  );
};