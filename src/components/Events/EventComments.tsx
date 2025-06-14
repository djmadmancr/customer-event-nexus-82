
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import dataService from '@/services/DataService';
import { Event } from '@/types/models';

interface EventCommentsProps {
  event: Event;
  onCommentUpdated: (event: Event) => void;
}

const EventComments: React.FC<EventCommentsProps> = ({ event, onCommentUpdated }) => {
  const [comments, setComments] = useState(event.comments || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComments(e.target.value);
  };

  const saveComments = async () => {
    setIsSubmitting(true);
    try {
      const updatedEvent = dataService.updateEvent(event.id, { comments });
      onCommentUpdated(updatedEvent);
      toast({
        title: t('comments_saved'),
        description: t('comments_saved_successfully')
      });
    } catch (error) {
      console.error('Error saving comments:', error);
      toast({
        title: t('error'),
        description: t('comments_save_error'),
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('comments')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder={t('event_comments_placeholder')}
          rows={6}
          value={comments}
          onChange={handleCommentChange}
        />
        <div className="flex justify-end">
          <Button 
            onClick={saveComments}
            disabled={isSubmitting}
            className="bg-crm-primary hover:bg-crm-primary/90"
          >
            {isSubmitting ? t('saving') : t('save_comments')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventComments;
