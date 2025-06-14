
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
};

interface CustomerFinderProps {
  onSelect: (customer: CustomerProfile) => void;
}

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

    // Recherche par téléphone si 100% numérique, sinon par nom/prénom
    if (search.match(/^\d{6,}$/)) {
      // Recherche par téléphone
      const { data, error } = await supabase
        .from("profiles")
        .select("id,first_name,last_name,phone,email")
        .eq("phone", search.trim());
      if (error) setError("Erreur lors de la recherche.");
      else if (data && data.length > 0) setResults(data);
      else setError("Aucun client trouvé avec ce numéro.");
    } else {
      // Recherche par nom ou prénom (insensible à la casse, partielle)
      const cleaned = search.trim();
      if (!cleaned) {
        setError("Veuillez saisir un nom/prénom ou un téléphone.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("id,first_name,last_name,phone,email")
        .ilike("first_name", `%${cleaned}%`)
        .order("last_name");
      // Recherche supplémentaire sur le nom si aucun résultat pour le prénom
      let mergeResults = data || [];
      if ((!data || data.length === 0) && cleaned.split(" ").length === 1) {
        const { data: lname, error: err2 } = await supabase
          .from("profiles")
          .select("id,first_name,last_name,phone,email")
          .ilike("last_name", `%${cleaned}%`)
          .order("first_name");
        if (!err2 && lname) mergeResults = lname;
      }
      if (error) setError("Erreur lors de la recherche.");
      else if (mergeResults && mergeResults.length > 0) setResults(mergeResults);
      else setError("Aucun client trouvé.");
    }
    setLoading(false);
  };

  return (
    <div>
      <form className="flex gap-2 mb-2" onSubmit={handleSearch}>
        <Input
          placeholder="Nom, prénom ou téléphone"
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
                  <span>Tél: {profile.phone || "-"}</span> &nbsp; | &nbsp;
                  <span>Email: {profile.email || "-"}</span>
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
