
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type CustomerProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  email: string | null;
  client_code: string | null;
};

interface CustomerFinderProps {
  onSelect: (customer: CustomerProfile) => void;
}

// Fonctions pour masquer les informations
const obfuscatePhone = (phone: string | null): string => {
  if (!phone) return '-';
  if (phone.length <= 4) return phone;
  return `••••••${phone.slice(-4)}`;
};

const obfuscateEmail = (email: string | null): string => {
  if (!email || !email.includes('@')) return email ?? '-';
  const [local, domain] = email.split('@');
  const obfuscatePart = (part: string, visibleStart: number, visibleEnd: number) => {
    if (part.length <= visibleStart + visibleEnd) {
      return part;
    }
    return `${part.slice(0, visibleStart)}...${part.slice(-visibleEnd)}`;
  };
  return `${obfuscatePart(local, 2, 1)}@${obfuscatePart(domain, 2, 3)}`;
};

export default function CustomerFinder({ onSelect }: CustomerFinderProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults([]);

    const cleaned = search.trim();
    if (!cleaned) {
      setError("Veuillez saisir un code client, nom/prénom ou téléphone.");
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("profiles")
        .select("id,first_name,last_name,phone,email,client_code");

      // Recherche par code client (format AB277564)
      if (cleaned.match(/^[A-Z]{2}\d{6}$/)) {
        query = query.eq("client_code", cleaned.toUpperCase());
      }
      // Recherche par téléphone si 100% numérique
      else if (cleaned.match(/^\d{6,}$/)) {
        query = query.eq("phone", cleaned);
      }
      // Recherche par nom ou prénom
      else {
        query = query.or(`first_name.ilike.%${cleaned}%,last_name.ilike.%${cleaned}%`);
      }

      const { data, error } = await query.order("last_name").limit(10);

      if (error) {
        setError("Erreur lors de la recherche.");
      } else if (data && data.length > 0) {
        setResults(data);
      } else {
        setError("Aucun client trouvé.");
      }
    } catch (err) {
      setError("Erreur lors de la recherche.");
    }
    
    setLoading(false);
  };

  return (
    <div>
      <form className="flex gap-2 mb-2" onSubmit={handleSearch}>
        <Input
          placeholder="Code client, nom, prénom ou téléphone"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Button type="submit" disabled={loading || !search.trim()}>
          {loading ? "Recherche..." : "Rechercher"}
        </Button>
      </form>
      {error && <p className="text-destructive text-sm mb-2">{error}</p>}
      {results.length > 0 && (
        <div className="mb-2">
          {results.map(profile => (
            <div
              key={profile.id}
              className="flex items-center justify-between border rounded p-2 mb-1 bg-accent cursor-pointer hover:bg-muted transition"
              onClick={() => onSelect(profile)}
            >
              <div>
                <div className="font-medium">
                  {profile.first_name} {profile.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  <span>Code: {profile.client_code || "Non généré"}</span> &nbsp; | &nbsp;
                  <span>Tél: {obfuscatePhone(profile.phone)}</span> &nbsp; | &nbsp;
                  <span>Email: {obfuscateEmail(profile.email)}</span>
                </div>
              </div>
              <Button variant="outline" size="sm" type="button">Sélectionner</Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
