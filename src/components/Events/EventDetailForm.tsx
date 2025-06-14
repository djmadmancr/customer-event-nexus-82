
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';
import dataService from '@/services/DataService';

const detailSchema = z.object({
  description: z.string().min(2, { message: 'La descripción debe tener al menos 2 caracteres' }),
  quantity: z.coerce.number().int().positive({ message: 'La cantidad debe ser un número positivo' }),
  notes: z.string().optional(),
});

type DetailFormValues = z.infer<typeof detailSchema>;

interface EventDetailFormProps {
  eventId: string;
  detailId?: string;
  onComplete: () => void;
}

const EventDetailForm: React.FC<EventDetailFormProps> = ({
  eventId,
  detailId,
  onComplete,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  const form = useForm<DetailFormValues>({
    resolver: zodResolver(detailSchema),
    defaultValues: {
      description: '',
      quantity: 1,
      notes: '',
    },
  });

  // Load detail data if editing existing detail
  React.useEffect(() => {
    if (detailId) {
      const detail = dataService.getEventDetailById(detailId);
      if (detail) {
        form.reset({
          description: detail.description,
          quantity: detail.quantity,
          notes: detail.notes || '',
        });
      }
    }
  }, [detailId, form]);

  const onSubmit = (data: DetailFormValues) => {
    setIsSubmitting(true);

    try {
      if (detailId) {
        dataService.updateEventDetail(detailId, data);
      } else {
        dataService.addEventDetail({
          eventId,
          description: data.description,
          quantity: data.quantity,
          notes: data.notes,
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Error saving event detail:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('description')}</FormLabel>
              <FormControl>
                <Input placeholder={t('description_placeholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('quantity')}</FormLabel>
              <FormControl>
                <Input type="number" min={1} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('notes')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('additional_notes_placeholder')} rows={3} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onComplete}>
            {t('cancel')}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-crm-primary hover:bg-crm-primary/90"
          >
            {detailId ? t('update') : t('add')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EventDetailForm;
