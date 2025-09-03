import { LeadEnrichmentForm } from '@/components/LeadEnrichmentForm';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  const handleSubmissionSuccess = () => {
    navigate('/dashboard');
  };

  return <LeadEnrichmentForm onSubmissionSuccess={handleSubmissionSuccess} />;
};

export default Index;
