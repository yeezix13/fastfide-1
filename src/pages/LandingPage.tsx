
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart, Gift, Heart, Users } from "lucide-react";
import Header from "@/components/Header";

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 lg:py-40 text-center bg-background">
          <div className="container px-4 md:px-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900">
              La relation client, réinventée pour les commerces de proximité.
            </h1>
            <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-600">
              Fidélio vous aide à créer un lien durable avec vos clients et à développer votre activité. Simple, intuitif et efficace.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/connexion-commercant">
                  Je suis un commerçant <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/connexion-client">
                  Je suis un client
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 bg-white">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold text-center text-gray-900">Une plateforme, deux expériences</h2>
            <p className="text-center mt-4 text-gray-600 max-w-2xl mx-auto">
              Des outils puissants pour les commerçants et une application simple pour les clients fidèles.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:gap-12">
              <div className="rounded-lg border bg-card text-card-foreground p-8">
                <h3 className="text-2xl font-bold">Pour les commerçants</h3>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Fidélisez votre clientèle</h4>
                      <p className="text-muted-foreground">Créez votre programme de fidélité personnalisé et récompensez vos clients.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-primary text-primary-foreground rounded-full p-2">
                      <BarChart className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Suivez votre activité</h4>
                      <p className="text-muted-foreground">Accédez à des statistiques claires pour mieux comprendre vos clients.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border bg-card text-card-foreground p-8">
                <h3 className="text-2xl font-bold">Pour les clients</h3>
                 <ul className="mt-6 space-y-4">
                  <li className="flex items-start gap-4">
                    <div className="bg-secondary text-secondary-foreground rounded-full p-2">
                       <Heart className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Soutenez vos commerces favoris</h4>
                      <p className="text-muted-foreground">Rejoignez facilement les programmes de fidélité de vos commerçants préférés.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-secondary text-secondary-foreground rounded-full p-2">
                      <Gift className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Profitez d'avantages exclusifs</h4>
                      <p className="text-muted-foreground">Recevez des offres spéciales et des récompenses pour votre fidélité.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;
