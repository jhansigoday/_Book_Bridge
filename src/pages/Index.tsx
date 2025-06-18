
import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { DonateBook } from '@/components/DonateBook';
import { MyRequests } from '@/components/MyRequests';
import { MyDonations } from '@/components/MyDonations';
import { Notifications } from '@/components/Notifications';
import { FreeBooks } from '@/components/FreeBooks';
import { BrowseBooks } from '@/components/BrowseBooks';

const Index = () => {
  const [currentPage, setCurrentPage] = useState('free-books');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'free-books':
        return <FreeBooks />;
      case 'browse':
        return <BrowseBooks />;
      case 'donate':
        return <DonateBook />;
      case 'requests':
        return <MyRequests />;
      case 'donated':
        return <MyDonations />;
      case 'notifications':
        return <Notifications />;
      default:
        return <FreeBooks />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderCurrentPage()}
    </div>
  );
};

export default Index;
