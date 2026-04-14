// src/app/api/fetch-pokepaste/route.js
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
        return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return NextResponse.json({
                error: `Failed to fetch pokepaste: ${response.statusText}`
            }, { status: response.status });
        }

        const html = await response.text();
        const pokemon = extractPokemonData(html);

        return NextResponse.json({ pokemon });
    } catch (error) {
        console.error('Error processing pokepaste:', error);
        return NextResponse.json({ error: 'Failed to process pokepaste' }, { status: 500 });
    }
}

function extractPokemonData(html) {
    const $ = cheerio.load(html);
    const pokemon = [];

    $('article').each((i, el) => {
        const imgPokemon = $(el).find('.img-pokemon').attr('src');
        const imgItem = $(el).find('.img-item').attr('src');

        // Extract pokémon name from the pre tag
        const preText = $(el).find('pre').text();
        const nameMatch = preText.match(/^([^@]+)/);
        let name = nameMatch ? nameMatch[1].trim() : 'Unknown Pokémon';

        // Create full URLs for the sprites
        let spriteUrl = imgPokemon;
        let itemUrl = imgItem;

        if (spriteUrl && !spriteUrl.startsWith('http')) {
            spriteUrl = `https://pokepast.es${spriteUrl}`;
        }

        if (itemUrl && !itemUrl.startsWith('http')) {
            itemUrl = `https://pokepast.es${itemUrl}`;
        }

        // Extract item name from the first line (e.g. "Pikachu @ Choice Scarf")
        const itemMatch = preText.split('\n')[0].match(/@\s*(.+)/);
        const cleanItemName = itemMatch
            ? itemMatch[1].trim().replace(/\s+/g, '-').replace(/['.:]/g, '').toLowerCase()
            : null;

        // Extract the clean Pokémon name for the fallback URL
        let cleanName = "";

        // Remove form indicators and clean up the name for the fallback URL
        if (name) {
            // Handle special forms like "Pokémon-Form"
            cleanName = name.split('@')[0].trim()        // Remove everything after @
                .split('(')[0].trim()        // Remove everything after (
                .replace(/\s+/g, '-')       // Replace spaces with hyphens
                .replace(/['.:]/g, '')      // Remove special characters
                .toLowerCase();             // Convert to lowercase
        }

        // Champions sprite is highest priority — try it first
        const championsUrl = `https://raw.githubusercontent.com/KevinToodlepoot/pokemon-champions-sprites/main/sprites/${cleanName}.png`;

        // Create an array of fallback URLs
        const fallbackUrls = [
            spriteUrl,  // original pokepaste.es sprite
            `https://img.pokemondb.net/sprites/home/normal/${cleanName}.png`,
            `https://img.pokemondb.net/sprites/sword-shield/normal/${cleanName}.png`,
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${getPokemonNumberFromName(cleanName)}.png`
        ].filter(Boolean);

        // Champions item URL is highest priority
        const championsItemUrl = cleanItemName
            ? `https://raw.githubusercontent.com/KevinToodlepoot/pokemon-champions-sprites/main/items/${cleanItemName}.png`
            : null;

        const resolvedItemUrl = championsItemUrl || itemUrl;

        pokemon.push({
            name,
            spriteUrl: championsUrl,
            fallbackUrls,
            itemUrl: resolvedItemUrl,
            itemFallbackUrl: championsItemUrl ? itemUrl : null,
            item: resolvedItemUrl ? 'Item' : null,
            cleanName
        });

        console.log(`Processing Pokémon: ${name}`);
        console.log(`Clean name: ${cleanName}`);
        console.log(`Primary URL: ${spriteUrl}`);
        console.log(`Fallback URLs: ${fallbackUrls.join(', ')}`);
        console.log(`Item name: ${cleanItemName}, Item URL: ${resolvedItemUrl}`);
    });

    return pokemon;
}

// Helper function to get Pokémon numbers for common Pokémon
// This is a simplified version - in a real app you'd want a complete mapping
function getPokemonNumberFromName(name) {
    const commonPokemon = {
        'pikachu': 25,
        'charizard': 6,
        'bulbasaur': 1,
        'squirtle': 7,
        'eevee': 133,
        'mewtwo': 150,
        'gengar': 94,
        'dragonite': 149,
        // Add more as needed
    };

    return commonPokemon[name] || 1; // Default to Bulbasaur if not found
}