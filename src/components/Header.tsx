
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

const Header = () => {
  return (
    <header className="py-6 px-4 md:px-8 lg:px-16 flex items-center justify-between bg-background border-b">
      <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
        <Store className="h-7 w-7" />
        <span>Fidélio</span>
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
  );
};

export default Header;
