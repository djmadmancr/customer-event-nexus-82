
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';

interface NoCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCustomer: () => void;
}

const NoCustomerDialog: React.FC<NoCustomerDialogProps> = ({
  open,
  onOpenChange,
  onCreateCustomer,
}) => {
  const { t } = useLanguage();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('no_customers_available')}</DialogTitle>
          <DialogDescription>
            {t('no_customers_description')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={onCreateCustomer}>
            {t('new_customer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NoCustomerDialog;
