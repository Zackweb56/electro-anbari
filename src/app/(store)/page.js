import Link from 'next/link';

export default function HomePage() {
  return (
    <section className="container mx-auto px-4 py-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Bienvenue sur notre boutique</h1>
        <p className="text-gray-600">Découvrez nos derniers produits au meilleur prix.</p>
        <Link
          href="/store"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Aller à la boutique
        </Link>
      </div>
    </section>
  )
}
