
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCrm } from '@/contexts/CrmContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Edit, Trash2 } from 'lucide-react';

interface CustomerEventListProps {
  customerId: string;
}

const CustomerEventList: React.FC<CustomerEventListProps> = ({ customerId }) => {
  const { events, removeEvent } = useCrm();
  const { defaultCurrency } = useAppConfig();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const customerEvents = events.filter(event => event.customerId === customerId);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      prospect: { label: t('quotation'), className: 'bg-yellow-100 text-yellow-800' },
      confirmed: { label: t('confirmed'), className: 'bg-blue-100 text-blue-800' },
      show_completed: { label: t('show_completed'), className: 'bg-purple-100 text-purple-800' },
      paid: { label: t('paid'), className: 'bg-green-100 text-green-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
      { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    const categoryConfig = {
      wedding: { label: t('wedding'), className: 'bg-pink-100 text-pink-800' },
      birthday: { label: t('birthday'), className: 'bg-orange-100 text-orange-800' },
      corporate: { label: t('corporate'), className: 'bg-blue-100 text-blue-800' },
      club: { label: t('club'), className: 'bg-purple-100 text-purple-800' },
      other: { label: t('other'), className: 'bg-gray-100 text-gray-800' },
    };
    
    const config = categoryConfig[category as keyof typeof categoryConfig] || 
      { label: category || t('uncategorized'), className: 'bg-gray-100 text-gray-800' };
    
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      try {
        await removeEvent(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  if (customerEvents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Este cliente no tiene eventos registrados.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('title')}</TableHead>
            <TableHead>{t('date')}</TableHead>
            <TableHead>{t('category')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead>{t('total')} ({defaultCurrency})</TableHead>
            <TableHead>{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customerEvents.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>
                {format(new Date(event.date), 'dd/MM/yyyy', { locale: es })}
              </TableCell>
              <TableCell>{getCategoryBadge(event.category)}</TableCell>
              <TableCell>{getStatusBadge(event.status)}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(event.totalWithTax || event.cost)}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/events/${event.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/events/${event.id}/edit`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CustomerEventList;
