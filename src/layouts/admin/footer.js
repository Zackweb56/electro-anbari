export default function AdminFooter() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © 2024 Electro Anbari. Tous droits réservés.
          </p>
          <p className="text-sm text-muted-foreground">
            Système de Gestion de Magasin d&apos;Ordinateurs
          </p>
        </div>
      </div>
    </footer>
  );
}