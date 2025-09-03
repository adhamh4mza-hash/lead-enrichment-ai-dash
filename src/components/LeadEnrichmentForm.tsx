import { useState } from 'react';
import { Upload, Zap, Mail, Target, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface FormData {
  leadSource: 'apollo' | 'csv' | '';
  apolloUrl: string;
  csvFile: File | null;
  leadCount: number;
  outputFormats: {
    instantly: boolean;
    email: boolean;
  };
  campaignId: string;
  email: string;
}

interface LeadEnrichmentFormProps {
  onSubmissionSuccess: (data: any) => void;
}

export function LeadEnrichmentForm({ onSubmissionSuccess }: LeadEnrichmentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    leadSource: '',
    apolloUrl: '',
    csvFile: null,
    leadCount: 500,
    outputFormats: {
      instantly: false,
      email: false,
    },
    campaignId: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, csvFile: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      
      submissionData.append('leadSource', formData.leadSource);
      
      if (formData.leadSource === 'apollo') {
        submissionData.append('apolloUrl', formData.apolloUrl);
        submissionData.append('leadCount', formData.leadCount.toString());
      } else if (formData.leadSource === 'csv' && formData.csvFile) {
        submissionData.append('csvFile', formData.csvFile);
      }
      
      submissionData.append('outputInstantly', formData.outputFormats.instantly.toString());
      submissionData.append('outputEmail', formData.outputFormats.email.toString());
      
      if (formData.outputFormats.instantly) {
        submissionData.append('campaignId', formData.campaignId);
      }
      
      if (formData.outputFormats.email) {
        submissionData.append('email', formData.email);
      }

      // Trigger webhook (fire and forget)
      fetch('https://adham131.app.n8n.cloud/webhook-test/paytrust-demo', {
        method: 'POST',
        body: submissionData,
      });
      
      toast({
        title: "Success!",
        description: "Your lead enrichment has been submitted successfully.",
      });

      // Go straight to dashboard with form data
      const dashboardData = {
        leadSource: formData.leadSource,
        leadCount: formData.leadSource === 'apollo' ? formData.leadCount : (formData.csvFile ? 1000 : 0), // Estimate for CSV
        timestamp: new Date(),
      };

      onSubmissionSuccess(dashboardData);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = () => {
    if (!formData.leadSource) return false;
    if (formData.leadSource === 'apollo' && !formData.apolloUrl) return false;
    if (formData.leadSource === 'csv' && !formData.csvFile) return false;
    if (!formData.outputFormats.instantly && !formData.outputFormats.email) return false;
    if (formData.outputFormats.instantly && !formData.campaignId) return false;
    if (formData.outputFormats.email && !formData.email) return false;
    return true;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="mb-8">
          <p 
            className="framer-text" 
            style={{
              fontFamily: '"Clash Display", "Clash Display Placeholder", sans-serif',
              fontSize: '30px',
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--extracted-r6o4lv, rgb(171, 82, 197))'
            }}
          >
            13 AI
          </p>
        </div>

        <Card className="p-8 bg-gradient-surface border-border shadow-elevated">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Lead Enrichment & Personalization
            </h1>
            <p className="text-muted-foreground">
              Upload your leads and let our AI generate personalized messages that convert
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Lead Source Selection */}
            <div className="space-y-3">
              <Label htmlFor="leadSource" className="text-foreground font-medium">
                Lead Information Source
              </Label>
              <Select 
                value={formData.leadSource} 
                onValueChange={(value: 'apollo' | 'csv') => 
                  setFormData(prev => ({ ...prev, leadSource: value }))
                }
              >
                <SelectTrigger className="bg-input border-border">
                  <SelectValue placeholder="Select your lead source" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="apollo">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Apollo URL
                    </div>
                  </SelectItem>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      CSV Upload
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apollo URL Input */}
            {formData.leadSource === 'apollo' && (
              <div className="space-y-3">
                <Label htmlFor="apolloUrl" className="text-foreground font-medium">
                  Apollo URL
                </Label>
                <Input
                  id="apolloUrl"
                  type="url"
                  placeholder="https://app.apollo.io/..."
                  value={formData.apolloUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, apolloUrl: e.target.value }))}
                  className="bg-input border-border"
                />
              </div>
            )}

            {/* CSV Upload */}
            {formData.leadSource === 'csv' && (
              <div className="space-y-3">
                <Label htmlFor="csvFile" className="text-foreground font-medium">
                  Upload CSV File
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <Input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Label htmlFor="csvFile" className="cursor-pointer">
                    {formData.csvFile ? (
                      <span className="text-primary">{formData.csvFile.name}</span>
                    ) : (
                      <span className="text-muted-foreground">
                        Click to upload CSV file or drag and drop
                      </span>
                    )}
                  </Label>
                </div>
              </div>
            )}

            {/* Lead Count (only for Apollo) */}
            {formData.leadSource === 'apollo' && (
              <div className="space-y-3">
                <Label htmlFor="leadCount" className="text-foreground font-medium">
                  Number of Leads to Personalize
                </Label>
                <Input
                  id="leadCount"
                  type="number"
                  min="500"
                  value={formData.leadCount}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadCount: parseInt(e.target.value) || 500 }))}
                  className="bg-input border-border"
                />
              </div>
            )}

            {/* Output Format */}
            <div className="space-y-4">
              <Label className="text-foreground font-medium">Desired Output Format</Label>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="instantly"
                    checked={formData.outputFormats.instantly}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        outputFormats: { ...prev.outputFormats, instantly: !!checked }
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="instantly" className="text-foreground cursor-pointer">
                      Send to Instantly Campaign
                    </Label>
                    {formData.outputFormats.instantly && (
                      <div className="mt-2">
                        <Input
                          placeholder="Campaign ID"
                          value={formData.campaignId}
                          onChange={(e) => setFormData(prev => ({ ...prev, campaignId: e.target.value }))}
                          className="bg-input border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="email"
                    checked={formData.outputFormats.email}
                    onCheckedChange={(checked) =>
                      setFormData(prev => ({
                        ...prev,
                        outputFormats: { ...prev.outputFormats, email: !!checked }
                      }))
                    }
                  />
                  <div className="flex-1">
                    <Label htmlFor="email" className="text-foreground cursor-pointer">
                      Email CSV
                    </Label>
                    {formData.outputFormats.email && (
                      <div className="mt-2">
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          className="bg-input border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={!isFormValid() || isSubmitting}
              className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Start Lead Enrichment
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}