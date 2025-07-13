
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Types
type Customer = Tables<'customers'>;
type Event = Tables<'events'>;
type Payment = Tables<'payments'>;
type Proposal = Tables<'proposals'>;

type CustomerInsert = TablesInsert<'customers'>;
type EventInsert = TablesInsert<'events'>;
type PaymentInsert = TablesInsert<'payments'>;
type ProposalInsert = TablesInsert<'proposals'>;

type CustomerUpdate = TablesUpdate<'customers'>;
type EventUpdate = TablesUpdate<'events'>;
type PaymentUpdate = TablesUpdate<'payments'>;

// Customers
export const useCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useUpsertCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customer: CustomerInsert & Partial<CustomerUpdate> & { id?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      if (customer.id) {
        // Update
        const { data, error } = await supabase
          .from('customers')
          .update({
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            notes: customer.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customer.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('customers')
          .insert({
            ...customer,
            user_id: user.user.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

// Events
export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          customers (
            id,
            name,
            email
          )
        `)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useEvent = (id: string) => {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useUpsertEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: EventInsert & Partial<EventUpdate> & { id?: string }) => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      if (event.id) {
        // Update
        const { data, error } = await supabase
          .from('events')
          .update({
            customer_id: event.customer_id,
            title: event.title,
            date: event.date,
            start_time: event.start_time,
            end_time: event.end_time,
            currency: event.currency,
            total: event.total,
            status: event.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', event.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from('events')
          .insert({
            ...event,
            user_id: user.user.id,
          })
          .select()
          .single();
        
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
};

// Payments
export const usePayments = (eventId?: string) => {
  return useQuery({
    queryKey: ['payments', eventId],
    queryFn: async () => {
      let query = supabase
        .from('payments')
        .select(`
          *,
          events (
            id,
            title,
            customers (
              name
            )
          )
        `)
        .order('paid_at', { ascending: false });

      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUpsertPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payment: PaymentInsert) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(payment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
};

// Proposals
export const useProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProposal = () => {
  return useMutation({
    mutationFn: async (proposal: ProposalInsert) => {
      const { data, error } = await supabase
        .from('proposals')
        .insert(proposal)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });
};

// Dashboard stats with multi-currency support
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('*');
      
      if (eventsError) throw eventsError;

      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id');
      
      if (customersError) throw customersError;

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*');
      
      if (paymentsError) throw paymentsError;

      // Group totals by currency
      const totalsByCurrency = events.reduce((acc, event) => {
        const currency = event.currency || 'USD';
        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += parseFloat(event.total.toString());
        return acc;
      }, {} as Record<string, number>);

      // Group payments by currency
      const paidByCurrency = payments.reduce((acc, payment) => {
        const currency = payment.currency || 'USD';
        if (!acc[currency]) {
          acc[currency] = 0;
        }
        acc[currency] += parseFloat(payment.amount.toString());
        return acc;
      }, {} as Record<string, number>);

      return {
        totalCustomers: customers.length,
        totalEvents: events.length,
        totalsByCurrency,
        paidByCurrency,
        events,
        hasMultipleCurrencies: Object.keys(totalsByCurrency).length > 1,
      };
    },
  });
};
