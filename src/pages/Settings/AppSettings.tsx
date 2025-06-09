
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useAuth } from '@/contexts/AuthContext';
import { Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Currency } from '@/types/models';
import EmailSettings from '@/components/Settings/EmailSettings';
import SubscriptionSettings from '@/components/Settings/SubscriptionSettings';

const profileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
});

const artistSchema = z.object({
  artistName: z.string().optional(),
  logo: z.string().url().optional(),
});

const appSchema = z.object({
  currency: z.enum(['USD', 'EUR', 'CRC', 'MXN', 'COP']),
});

const AppSettings = () => {
  const { userProfile, updateUserProfile } = useUserProfile();
  const { defaultCurrency, updateDefaultCurrency, logoUrl, updateAppLogo } = useAppConfig();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userProfile?.name || '',
      email: userProfile?.email || '',
      phone: userProfile?.phone || '',
    },
  });

  const artistForm = useForm({
    resolver: zodResolver(artistSchema),
    defaultValues: {
      artistName: userProfile?.artistName || '',
      logo: logoUrl || '',
    },
  });

  const appForm = useForm({
    resolver: zodResolver(appSchema),
    defaultValues: {
      currency: defaultCurrency,
    },
  });

  const handleCopyBookingLink = () => {
    if (currentUser) {
      const bookingUrl = `${window.location.origin}/booking/${currentUser.uid}`;
      navigator.clipboard.writeText(bookingUrl);
      toast({
        title: "Link copiado",
        description: "El link para bookings ha sido copiado al portapapeles",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3 h-auto' : 'grid-cols-5'}`}>
          <TabsTrigger value="profile" className={`${isMobile ? 'text-xs px-2 py-3' : ''}`}>
            {isMobile ? 'Perfil' : 'Perfil'}
          </TabsTrigger>
          <TabsTrigger value="artist" className={`${isMobile ? 'text-xs px-2 py-3' : ''}`}>
            {isMobile ? 'Artista' : 'Datos Artísticos'}
          </TabsTrigger>
          <TabsTrigger value="app" className={`${isMobile ? 'text-xs px-2 py-3' : ''}`}>
            {isMobile ? 'App' : 'Aplicación'}
          </TabsTrigger>
          {!isMobile && (
            <>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="subscription">Suscripción</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Mobile-specific tabs for Email and Subscription */}
        {isMobile && (
          <TabsList className="grid w-full grid-cols-2 mt-2">
            <TabsTrigger value="email" className="text-xs px-2 py-3">
              Email
            </TabsTrigger>
            <TabsTrigger value="subscription" className="text-xs px-2 py-3">
              Suscripción
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={`${isMobile ? 'text-sm' : ''}`}>Nombre Completo</Label>
                <Input
                  id="name"
                  value={userProfile?.name || ''}
                  onChange={(e) => updateUserProfile({ name: e.target.value })}
                  placeholder="Tu nombre completo"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className={`${isMobile ? 'text-sm' : ''}`}>Email</Label>
                <Input
                  id="email"
                  value={userProfile?.email || ''}
                  onChange={(e) => updateUserProfile({ email: e.target.value })}
                  placeholder="tu@email.com"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className={`${isMobile ? 'text-sm' : ''}`}>Teléfono</Label>
                <Input
                  id="phone"
                  value={userProfile?.phone || ''}
                  onChange={(e) => updateUserProfile({ phone: e.target.value })}
                  placeholder="+506 0000-0000"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="artist" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Datos Artísticos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="artistName" className={`${isMobile ? 'text-sm' : ''}`}>Nombre Artístico</Label>
                <Input
                  id="artistName"
                  value={userProfile?.artistName || ''}
                  onChange={(e) => updateUserProfile({ artistName: e.target.value })}
                  placeholder="Tu nombre artístico"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className={`${isMobile ? 'text-sm' : ''}`}>Logo URL</Label>
                <Input
                  id="logo"
                  value={logoUrl || ''}
                  onChange={(e) => updateAppLogo(e.target.value)}
                  placeholder="https://ejemplo.com/mi-logo.png"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
                {logoUrl && (
                  <div className="mt-2">
                    <img 
                      src={logoUrl} 
                      alt="Logo preview" 
                      className={`border rounded ${isMobile ? 'h-12 w-auto' : 'h-16 w-auto'}`}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="app" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Configuración de la Aplicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency" className={`${isMobile ? 'text-sm' : ''}`}>Moneda por Defecto</Label>
                <select
                  id="currency"
                  value={defaultCurrency}
                  onChange={(e) => updateDefaultCurrency(e.target.value as Currency)}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-sm' : ''}`}
                >
                  <option value="USD">USD - Dólar Estadounidense</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="CRC">CRC - Colón Costarricense</option>
                  <option value="MXN">MXN - Peso Mexicano</option>
                  <option value="COP">COP - Peso Colombiano</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label className={`${isMobile ? 'text-sm' : ''}`}>Link para Bookings</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentUser ? `${window.location.origin}/booking/${currentUser.uid}` : ''}
                    readOnly
                    className={`bg-gray-50 ${isMobile ? 'text-xs' : ''}`}
                  />
                  <Button onClick={handleCopyBookingLink} variant="outline" size="icon">
                    <Copy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  </Button>
                </div>
                <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Comparte este link con tus clientes para que puedan solicitar cotizaciones
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="mt-6">
          <EmailSettings />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppSettings;
