import { useState } from 'react';
import { LeadEnrichmentForm } from '@/components/LeadEnrichmentForm';
import { Dashboard } from '@/components/Dashboard';

const Index = () => {
  const [showDashboard, setShowDashboard] = useState(false);
  const [submissionData, setSubmissionData] = useState(null);

  const handleSubmissionSuccess = (data: any) => {
    setSubmissionData(data);
    setShowDashboard(true);
  };

  if (showDashboard) {
    return <Dashboard submissionData={submissionData} />;
  }

  return <LeadEnrichmentForm onSubmissionSuccess={handleSubmissionSuccess} />;
};

export default Index;
