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
import { Copy, Upload, Save } from 'lucide-react';
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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Form states for each tab
  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
  });

  const [artistData, setArtistData] = useState({
    artistName: userProfile?.artistName || '',
  });

  const [appData, setAppData] = useState({
    currency: defaultCurrency,
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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen válido",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es muy grande. Máximo 2MB permitido",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingLogo(true);
    try {
      // Convert file to base64 data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        updateAppLogo(dataUrl);
        toast({
          title: "Logo actualizado",
          description: "El logo ha sido actualizado correctamente",
        });
        setIsUploadingLogo(false);
      };
      reader.onerror = () => {
        toast({
          title: "Error",
          description: "Error al procesar la imagen",
          variant: "destructive",
        });
        setIsUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      });
      setIsUploadingLogo(false);
    }
  };

  const handleSaveProfile = () => {
    updateUserProfile(profileData);
    toast({
      title: "Perfil actualizado",
      description: "La información personal ha sido guardada correctamente",
    });
  };

  const handleSaveArtist = () => {
    updateUserProfile(artistData);
    toast({
      title: "Datos artísticos actualizados",
      description: "Los datos artísticos han sido guardados correctamente",
    });
  };

  const handleSaveApp = () => {
    updateDefaultCurrency(appData.currency);
    toast({
      title: "Configuración actualizada",
      description: "La configuración de la aplicación ha sido guardada correctamente",
    });
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
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  placeholder="Tu nombre completo"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className={`${isMobile ? 'text-sm' : ''}`}>Email</Label>
                <Input
                  id="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  placeholder="tu@email.com"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone" className={`${isMobile ? 'text-sm' : ''}`}>Teléfono</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  placeholder="+506 0000-0000"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveProfile} className="bg-crm-primary hover:bg-crm-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Perfil
                </Button>
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
                  value={artistData.artistName}
                  onChange={(e) => setArtistData({ ...artistData, artistName: e.target.value })}
                  placeholder="Tu nombre artístico"
                  className={`${isMobile ? 'text-sm' : ''}`}
                />
              </div>

              <div className="space-y-2">
                <Label className={`${isMobile ? 'text-sm' : ''}`}>Logo</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                      disabled={isUploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('logo-upload')?.click()}
                      disabled={isUploadingLogo}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingLogo ? 'Subiendo...' : 'Subir Logo'}
                    </Button>
                    {logoUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => updateAppLogo(null)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Eliminar
                      </Button>
                    )}
                  </div>
                  
                  <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Formatos soportados: JPG, PNG, GIF. Tamaño máximo: 2MB
                  </p>
                  
                  {logoUrl && (
                    <div className="mt-2">
                      <img 
                        src={logoUrl} 
                        alt="Logo preview" 
                        className={`border rounded max-w-[200px] ${isMobile ? 'h-12 w-auto' : 'h-16 w-auto'}`}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveArtist} className="bg-crm-primary hover:bg-crm-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Datos Artísticos
                </Button>
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
                  value={appData.currency}
                  onChange={(e) => setAppData({ ...appData, currency: e.target.value as Currency })}
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

              <div className="flex justify-end pt-4">
                <Button onClick={handleSaveApp} className="bg-crm-primary hover:bg-crm-primary/90">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Configuración
                </Button>
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