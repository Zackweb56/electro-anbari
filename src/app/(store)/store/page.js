// src/app/(store)/store/page.js
import ClientWrapper from '@/components/store/ClientWrapper';
import StoreContent from '@/components/store/StoreContent';

export default function StorePage() {
  return (
    <ClientWrapper>
      <StoreContent />
    </ClientWrapper>
  );
}
