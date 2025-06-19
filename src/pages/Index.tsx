
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, Users, Gift, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import { useDeviceType } from '@/hooks/useDeviceType';

const Index = () => {
  const { isMobile, isNative } = useDeviceType();

  return (
    <>
      <Helmet>
        <title>FastFide - Votre fidélité récompensée</title>
        <meta name="description" content="FastFide est la solution de fidélité digitale qui connecte commerçants et clients. Gagnez des points, obtenez des récompenses!" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        {/* Header - masqué sur mobile/app native */}
        {!isMobile && !isNative && (
          <header className="py-6 px-4 md:px-8 lg:px-16 flex items-center justify-between bg-background border-b">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <Store className="h-7 w-7" />
              <span>FastFide</span>
            </Link>
            <nav className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link to="/connexion-commercant">Espace Commerçant</Link>
              </Button>
              <Button asChild>
                <Link to="/connexion-client">Espace Client</Link>
              </Button>
            </nav>
          </header>
        )}
        
        <main className={`${isMobile ? 'px-4' : 'px-4 md:px-8 lg:px-16'}`}>
          {/* Hero Section */}
          <section className={`py-12 ${isMobile ? 'md:py-20' : 'md:py-20'} text-center`}>
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-center mb-8">
                <img 
                  src="/lovable-uploads/9c24c620-d700-43f2-bb91-b498726fd2ff.png" 
                  alt="FastFide" 
                  className={`${isMobile ? 'h-20' : 'h-32'} w-auto`}
                />
              </div>
              <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl md:text-6xl'} font-bold text-gray-900 mb-6`}>
                Votre fidélité,
                <span className="text-primary block">récompensée</span>
              </h1>
              <p className={`${isMobile ? 'text-lg' : 'text-xl'} text-gray-600 mb-8 max-w-2xl mx-auto`}>
                FastFide connecte les commerçants et leurs clients grâce à un système de fidélité digital simple et efficace.
              </p>
              <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col sm:flex-row'} gap-4 justify-center`}>
                <Button asChild size={isMobile ? "lg" : "lg"} className={`${isMobile ? 'w-full' : ''}`}>
                  <Link to="/connexion-client">
                    <Users className="mr-2 h-5 w-5" />
                    Je suis un client
                  </Link>
                </Button>
                <Button asChild variant="outline" size={isMobile ? "lg" : "lg"} className={`${isMobile ? 'w-full' : ''}`}>
                  <Link to="/connexion-commercant">
                    <Store className="mr-2 h-5 w-5" />
                    Je suis un commerçant
                  </Link>
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className={`py-16 ${isMobile ? 'md:py-24' : 'md:py-24'}`}>
            <div className="max-w-6xl mx-auto">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-center mb-12`}>
                Pourquoi choisir FastFide ?
              </h2>
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-6' : 'md:grid-cols-3 gap-8'}`}>
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Gift className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>Récompenses attractives</CardTitle>
                    <CardDescription className={isMobile ? 'text-sm' : ''}>
                      Gagnez des points à chaque achat et échangez-les contre des récompenses exclusives
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Smartphone className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>100% Digital</CardTitle>
                    <CardDescription className={isMobile ? 'text-sm' : ''}>
                      Fini les cartes physiques ! Tout se passe sur votre smartphone
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <Card className="text-center">
                  <CardHeader>
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                      <Store className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className={isMobile ? 'text-lg' : 'text-xl'}>Réseau partenaire</CardTitle>
                    <CardDescription className={isMobile ? 'text-sm' : ''}>
                      Découvrez et soutenez les commerçants locaux de votre région
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className={`py-16 ${isMobile ? 'md:py-24' : 'md:py-24'} bg-primary/5 rounded-2xl`}>
            <div className="max-w-4xl mx-auto text-center px-6">
              <h2 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold mb-6`}>
                Prêt à commencer ?
              </h2>
              <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-600 mb-8`}>
                Rejoignez FastFide dès aujourd'hui et découvrez une nouvelle façon de fidéliser vos clients ou d'être récompensé pour votre fidélité.
              </p>
              <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'flex-col sm:flex-row'} gap-4 justify-center`}>
                <Button asChild size="lg" className={`${isMobile ? 'w-full' : ''}`}>
                  <Link to="/inscription">Créer mon compte client</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className={`${isMobile ? 'w-full' : ''}`}>
                  <Link to="/connexion-commercant">Devenir partenaire</Link>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <footer className={`py-8 text-center text-gray-500 ${isMobile ? 'px-4' : 'px-4 md:px-8'}`}>
          <p>&copy; 2024 FastFide. Tous droits réservés.</p>
        </footer>
      </div>
    </>
  );
};

export default Index;
