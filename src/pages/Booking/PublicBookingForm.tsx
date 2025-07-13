
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, Music } from 'lucide-react';
import { useCreateProposal } from '@/hooks/useSupabaseQueries';

const PublicBookingForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  
  const createProposal = useCreateProposal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProposal.mutateAsync({
        name: formData.name,
        email: formData.email,
        message: formData.message,
      });
      
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting proposal:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-700">¡Gracias!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Hemos recibido tu solicitud de propuesta.
            </p>
            <p className="text-sm text-gray-500">
              Revisaremos tu información y nos pondremos en contacto contigo pronto.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSubmitted(false);
                setFormData({ name: '', email: '', message: '' });
              }}
              className="w-full"
            >
              Enviar otra solicitud
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Solicitar Propuesta DJ</CardTitle>
          <p className="text-gray-600">Cuéntanos sobre tu evento y te enviaremos una propuesta personalizada</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={createProposal.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={createProposal.isPending}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Detalles del evento</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Cuéntanos sobre tu evento: fecha, lugar, tipo de celebración, número de invitados, preferencias musicales, etc."
                value={formData.message}
                onChange={handleChange}
                rows={5}
                disabled={createProposal.isPending}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={createProposal.isPending || !formData.name.trim() || !formData.email.trim()}
            >
              {createProposal.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando solicitud...
                </>
              ) : (
                'Enviar solicitud'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Nos pondremos en contacto contigo dentro de 24 horas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicBookingForm;
