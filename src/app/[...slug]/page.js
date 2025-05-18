'use client';

import { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';

export default function PokepasteBrowserSource() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [pokemon, setPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [layout, setLayout] = useState('vertical');
  const containerRef = useRef(null);

  // Track window resize directly
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        const newLayout = width > height ? 'horizontal' : 'vertical';
        console.log('Detected layout change:', newLayout, width, height);
        setLayout(newLayout);
      }
    };

    // Run once on mount
    handleResize();

    // Add window resize listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!params?.slug) {
      console.error('No slug provided in URL');
      return;
    }

    const slugPath = Array.isArray(params.slug) ? params.slug.join('/') : params.slug;

    console.log('Slug path:', slugPath);

    let pasteUrl;
    const pokepasteIndex = slugPath.indexOf('pokepast.es/');

    if (pokepasteIndex !== -1) {
      // Extract everything from "pokepast.es" onwards
      const extractedPath = slugPath.substring(pokepasteIndex);

      // Ensure it has proper http(s) prefix
      pasteUrl = `https://${extractedPath}`;
    } else {
      // Check if it's just a paste ID (hexadecimal string)
      if (/^[a-f0-9]+$/.test(slugPath)) {
        pasteUrl = `https://pokepast.es/${slugPath}`;
      } else {
        setError('Invalid URL format. Must contain "pokepast.es" or be a valid paste ID.');
        setLoading(false);
        return;
      }
    }

    fetchPokepaste(pasteUrl);
  }, [params]);

  async function fetchPokepaste(url) {
    try {
      const response = await fetch(`/api/fetch-pokepaste?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data = await response.json();
      setPokemon(data.pokemon.slice(0, 6));
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pokepaste:', err);
      setError('Failed to load pokepaste data');
      setLoading(false);
    }
  }

  // Render loading/error states
  if (loading) {
    return <div className="text-white p-5 bg-black/50 rounded">Loading...</div>;
  }

  if (error) {
    return <div className="text-white p-5 bg-black/50 rounded">{error}</div>;
  }

  console.log('Current layout:', layout);
  console.log('Container dimensions:', containerRef.current?.clientWidth, containerRef.current?.clientHeight);

  return (
    <div ref={containerRef} style={{
      display: 'flex',
      flexDirection: layout === 'vertical' ? 'column' : 'row',
      flexWrap: 'nowrap',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100vh',
      gap: '0.5rem',
      margin: 0,
      padding: '0.5rem',
      background: 'transparent',
      overflow: 'hidden',
    }}>
      {pokemon.map((mon, index) => (
        <div
          key={index}
          style={{
            position: 'relative',
            flex: '1 1 0',
            minHeight: 0,
            minWidth: 0,
            aspectRatio: '1/1',
            width: 'auto',
            height: 'auto'
          }}
        >
          <PokemonImage
            pokemon={mon}
            alt={mon.name}
          />
        </div>
      ))}
    </div>
  );
}

// Component to handle image fallbacks
function PokemonImage({ pokemon, alt }) {
  const [currentSrc, setCurrentSrc] = useState(pokemon.spriteUrl);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);

    // Try the next fallback URL if available
    if (pokemon.fallbackUrls && fallbackIndex < pokemon.fallbackUrls.length) {
      setCurrentSrc(pokemon.fallbackUrls[fallbackIndex]);
      setFallbackIndex(fallbackIndex + 1);
    } else {
      // If all fallbacks fail, show a placeholder
      setCurrentSrc('/placeholder.png'); // Create a simple placeholder image in your public folder
    }
  };

  // Reset error state when src changes successfully
  useEffect(() => {
    setImageError(false);
  }, [currentSrc]);

  return (
    <>
      <img
        src={currentSrc}
        alt={alt}
        title={alt}
        onError={handleImageError}
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: imageError ? 0.5 : 1, // Dim the image if it's a fallback
        }}
      />
      {pokemon.item && (
        <img
          className="item-sprite"
          src={pokemon.itemUrl}
          alt="Item"
          style={{
            position: 'absolute',
            bottom: '-5%',
            right: '-5%',
            width: '33%',
            height: '33%',
            objectFit: 'contain'
          }}
        />
      )}
    </>
  );
}