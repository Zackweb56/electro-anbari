// src/app/(store)/order/success/page.js
import ClientWrapper from '@/components/store/ClientWrapper';
import OrderSuccessContent from '@/components/store/OrderSuccessContent';

export default function OrderSuccessPage() {
  return (
    <ClientWrapper>
      <OrderSuccessContent />
    </ClientWrapper>
  );
}
