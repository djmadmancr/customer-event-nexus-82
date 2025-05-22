
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Plus, ArrowLeft } from 'lucide-react';
import { useCrm } from '@/contexts/CrmContext';
import dataService from '@/services/DataService';
import EventList from '../Events/EventList';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedCustomer, setSelectedCustomer } = useCrm();
  const [activeTab, setActiveTab] = useState('info');
  
  useEffect(() => {
    if (id) {
      const customer = dataService.getCustomerById(id);
      if (customer) {
        setSelectedCustomer(customer);
      } else {
        // Customer not found, redirect to list
        navigate('/customers');
      }
    }
    
    return () => {
      // Clear selected customer on unmount
      setSelectedCustomer(null);
    };
  }, [id, navigate, setSelectedCustomer]);
  
  if (!selectedCustomer) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">{selectedCustomer.name}</h1>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline"
          onClick={() => navigate(`/customers/${selectedCustomer.id}/edit`)}
        >
          <Pencil className="h-4 w-4 mr-2" />
          Editar Cliente
        </Button>
        <Button 
          className="bg-crm-primary hover:bg-crm-primary/90"
          onClick={() => navigate(`/events/new?customerId=${selectedCustomer.id}`)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Evento
        </Button>
      </div>
      
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 w-[300px]">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                  <p className="mt-1">{selectedCustomer.name}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{selectedCustomer.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                  <p className="mt-1">{selectedCustomer.phone}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Cliente desde</h3>
                  <p className="mt-1">
                    {selectedCustomer.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Notas</h3>
                <p className="mt-1 whitespace-pre-line">
                  {selectedCustomer.notes || "Sin notas"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="events" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Eventos del cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <EventList filterByCustomerId={selectedCustomer.id} showAddButton={false} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerDetail;
