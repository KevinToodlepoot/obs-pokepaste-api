export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-6">OBS Pokepaste Browser Source</h1>
      <p className="mb-4">Use this service to display Pokémon teams from pokepast.es in your OBS stream.</p>
      <p className="mb-8">
        Just add a Browser Source with the URL: <br/>
        <code className="bg-gray-800 px-2 py-1 rounded">https://your-domain.com/pokepast.es/[paste-id]</code>
      </p>
      <div className="flex gap-4">
        <a href="https://github.com/yourusername/obs-pokepaste" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          GitHub
        </a>
        <a href="https://ko-fi.com/yourusername" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded">
          Support
        </a>
      </div>
    </main>
  )
}