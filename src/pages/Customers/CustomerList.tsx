
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { useCrm } from '@/contexts/CrmContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Plus, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import dataService from '@/services/DataService';

const CustomerList = () => {
  const navigate = useNavigate();
  const { customers, refreshCustomers, setSelectedCustomer } = useCrm();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );
  
  const handleViewCustomer = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      navigate(`/customers/${customerId}`);
    }
  };
  
  const handleEditCustomer = (customerId: string) => {
    navigate(`/customers/${customerId}/edit`);
  };
  
  const handleDeleteCustomer = () => {
    if (customerToDelete) {
      dataService.deleteCustomer(customerToDelete);
      refreshCustomers();
      setCustomerToDelete(null);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Header with search and add button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-2.5 left-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={t('search_customers')}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button 
          className="bg-crm-primary hover:bg-crm-primary/90"
          onClick={() => navigate('/customers/new')}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('new_customer')}
        </Button>
      </div>
      
      {/* Customers Table */}
      <div className="bg-white rounded-md shadow-sm border overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('email')}</TableHead>
                  <TableHead className="hidden md:table-cell">{t('phone')}</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.phone}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewCustomer(customer.id)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalle
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditCustomer(customer.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => setCustomerToDelete(customer.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">{t('no_customers_found')}</p>
            <Button 
              variant="outline"
              onClick={() => navigate('/customers/new')}
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('create_new_customer')}
            </Button>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!customerToDelete} onOpenChange={() => setCustomerToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerToDelete(null)}>
              {t('cancel')}
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteCustomer}
            >
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerList;
