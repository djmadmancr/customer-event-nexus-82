
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUserProfile } from '@/contexts/UserProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Save, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

const ProfilePage = () => {
  const { userProfile, updateUserProfile } = useUserProfile();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    phone: userProfile?.phone || '',
  });

  const handleSaveProfile = () => {
    updateUserProfile(profileData);
    toast({
      title: t("profile_updated"),
      description: t("profile_updated"),
    });
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) {
      toast({
        title: "Error",
        description: "No se encontró un email asociado a la cuenta",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(currentUser.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo enviar el email de restablecimiento",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado",
          description: "Se ha enviado un email con instrucciones para restablecer tu contraseña",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al procesar la solicitud",
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>
            {t("personal_info")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className={`${isMobile ? 'text-sm' : ''}`}>
              {t("full_name")}
            </Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
              placeholder={t("full_name")}
              className={`${isMobile ? 'text-sm' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className={`${isMobile ? 'text-sm' : ''}`}>
              {t("email")}
            </Label>
            <Input
              id="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              placeholder="tu@email.com"
              className={`${isMobile ? 'text-sm' : ''}`}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className={`${isMobile ? 'text-sm' : ''}`}>
              {t("phone")}
            </Label>
            <Input
              id="phone"
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              placeholder="+506 0000-0000"
              className={`${isMobile ? 'text-sm' : ''}`}
            />
          </div>

          <div className="border-t pt-4">
            <Label className={`${isMobile ? 'text-sm' : ''} mb-3 block`}>
              {t("security")}
            </Label>
            <Button 
              onClick={handlePasswordReset}
              disabled={isResettingPassword}
              variant="outline"
              className="w-full sm:w-auto"
              size={isMobile ? "sm" : "default"}
            >
              {isResettingPassword ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4 mr-2" />
                  {t("reset_password")}
                </>
              )}
            </Button>
            <p className={`text-gray-500 mt-2 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Se enviará un email con instrucciones para cambiar tu contraseña
            </p>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleSaveProfile} 
              className="bg-crm-primary hover:bg-crm-primary/90 w-full sm:w-auto"
              size={isMobile ? "sm" : "default"}
            >
              <Save className="h-4 w-4 mr-2" />
              {t("save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
