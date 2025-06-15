
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAppConfig } from '@/contexts/AppConfigContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Currency, Language } from '@/types/models';
import EmailSettings from '@/components/Settings/EmailSettings';
import SubscriptionSettings from '@/components/Settings/SubscriptionSettings';

const artistSchema = z.object({
  artistName: z.string().optional(),
});

const appSchema = z.object({
  currency: z.enum(['USD', 'EUR', 'CRC', 'MXN', 'COP']),
  language: z.enum(['es', 'en', 'pt']),
});

const AppSettings = () => {
  const { userProfile, updateUserProfile } = useUserProfile();
  const { defaultCurrency, updateDefaultCurrency, logoUrl, updateAppLogo } = useAppConfig();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const [artistData, setArtistData] = useState({
    artistName: userProfile?.artistName || '',
  });

  const [appData, setAppData] = useState({
    currency: defaultCurrency,
    language: currentLanguage,
  });

  // Update appData when currentLanguage changes
  React.useEffect(() => {
    setAppData(prev => ({
      ...prev,
      language: currentLanguage
    }));
  }, [currentLanguage]);

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

  const handleSaveArtist = () => {
    updateUserProfile(artistData);
    toast({
      title: t("artist_data"),
      description: t("profile_updated"),
    });
  };

  const handleSaveApp = () => {
    updateDefaultCurrency(appData.currency);
    setLanguage(appData.language);
    toast({
      title: t("config_updated"),
      description: t("config_updated"),
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      <Tabs defaultValue="artist" className="w-full">
        {/* Compact tabs design for all screen sizes */}
        <div className="w-full">
          <ScrollArea className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted">
              <TabsTrigger 
                value="artist" 
                className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <span className="hidden sm:inline">{t("artist_data")}</span>
                <span className="sm:hidden">Artista</span>
              </TabsTrigger>
              <TabsTrigger 
                value="app" 
                className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <span className="hidden sm:inline">{t("app_config")}</span>
                <span className="sm:hidden">App</span>
              </TabsTrigger>
              <TabsTrigger 
                value="email" 
                className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                Email
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="text-xs sm:text-sm px-2 py-2 whitespace-nowrap data-[state=active]:bg-background data-[state=active]:text-foreground"
              >
                <span className="hidden sm:inline">{t("subscription")}</span>
                <span className="sm:hidden">Plan</span>
              </TabsTrigger>
            </TabsList>
          </ScrollArea>
        </div>

        {/* Tab content with consistent spacing */}
        <div className="mt-6">
          <TabsContent value="artist" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>{t("artist_data")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="artistName" className={`${isMobile ? 'text-sm' : ''}`}>{t("artist_name")}</Label>
                  <Input
                    id="artistName"
                    value={artistData.artistName}
                    onChange={(e) => setArtistData({ ...artistData, artistName: e.target.value })}
                    placeholder={t("artist_name")}
                    className={`${isMobile ? 'text-sm' : ''}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label className={`${isMobile ? 'text-sm' : ''}`}>{t("logo")}</Label>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
                        className="flex items-center gap-2 w-full sm:w-auto"
                        size={isMobile ? "sm" : "default"}
                      >
                        <Upload className="h-4 w-4" />
                        {isUploadingLogo ? 'Subiendo...' : 'Subir Logo'}
                      </Button>
                      {logoUrl && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => updateAppLogo(null)}
                          className="text-red-600 hover:text-red-700 w-full sm:w-auto"
                          size={isMobile ? "sm" : "default"}
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
                  <Button 
                    onClick={handleSaveArtist} 
                    className="bg-crm-primary hover:bg-crm-primary/90 w-full sm:w-auto"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t("save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="app" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>{t("app_config")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className={`${isMobile ? 'text-sm' : ''}`}>{t("default_currency")}</Label>
                  <select
                    id="currency"
                    value={appData.currency}
                    onChange={(e) => setAppData({ ...appData, currency: e.target.value as Currency })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-sm' : ''}`}
                  >
                    <option value="USD">USD - Dólar Estadounidense</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="MXN">MXN - Peso Mexicano</option>
                    <option value="CRC">CRC - Colón Costarricense</option>
                    <option value="COP">COP - Peso Colombiano</option>
                    <option value="ARS">ARS - Peso Argentino</option>
                    <option value="PEN">PEN - Sol Peruano</option>
                    <option value="CLP">CLP - Peso Chileno</option>
                    <option value="UYU">UYU - Peso Uruguayo</option>
                    <option value="BOB">BOB - Boliviano</option>
                    <option value="PYG">PYG - Guaraní Paraguayo</option>
                    <option value="VES">VES - Bolívar Venezolano</option>
                    <option value="BRL">BRL - Real Brasileño</option>
                    <option value="GTQ">GTQ - Quetzal Guatemalteco</option>
                    <option value="HNL">HNL - Lempira Hondureño</option>
                    <option value="NIO">NIO - Córdoba Nicaragüense</option>
                    <option value="PAB">PAB - Balboa Panameño</option>
                    <option value="DOP">DOP - Peso Dominicano</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language" className={`${isMobile ? 'text-sm' : ''}`}>{t("default_language")}</Label>
                  <select
                    id="language"
                    value={appData.language}
                    onChange={(e) => setAppData({ ...appData, language: e.target.value as Language })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isMobile ? 'text-sm' : ''}`}
                  >
                    <option value="es">{t("spanish")}</option>
                    <option value="en">{t("english")}</option>
                    <option value="pt">{t("portuguese")}</option>
                  </select>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={handleSaveApp} 
                    className="bg-crm-primary hover:bg-crm-primary/90 w-full sm:w-auto"
                    size={isMobile ? "sm" : "default"}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t("save")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="mt-0">
            <EmailSettings />
          </TabsContent>

          <TabsContent value="subscription" className="mt-0">
            <SubscriptionSettings />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AppSettings;
