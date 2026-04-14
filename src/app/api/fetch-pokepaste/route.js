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
        const preText   = $(el).find('pre').text();
        const name      = parsePokemonName(preText);
        const cleanName = toCleanName(name);
        const cleanItem = toCleanItemName(preText);

        const rawSprite = resolveUrl($(el).find('.img-pokemon').attr('src'), 'https://pokepast.es');
        const rawItem   = resolveUrl($(el).find('.img-item').attr('src'),    'https://pokepast.es');

        const { spriteUrl, fallbackUrls } = buildSpriteData(cleanName, rawSprite);
        const { itemUrl, itemFallbackUrl } = buildItemData(cleanItem, rawItem);

        pokemon.push({
            name,
            cleanName,
            spriteUrl,
            fallbackUrls,
            itemUrl,
            itemFallbackUrl,
            item: itemUrl ? 'Item' : null,
        });
    });

    return pokemon;
}

// --- URL helpers ---

function resolveUrl(url, base) {
    if (!url) return null;
    return url.startsWith('http') ? url : `${base}${url}`;
}

function buildSpriteData(cleanName, rawSpriteUrl) {
    const spriteUrl = `https://raw.githubusercontent.com/KevinToodlepoot/pokemon-champions-sprites/main/sprites/${cleanName}.png`;
    const fallbackUrls = [
        rawSpriteUrl,
        `https://img.pokemondb.net/sprites/home/normal/${cleanName}.png`,
        `https://img.pokemondb.net/sprites/sword-shield/normal/${cleanName}.png`,
    ].filter(Boolean);

    return { spriteUrl, fallbackUrls };
}

function buildItemData(cleanItemName, rawItemUrl) {
    if (!cleanItemName) {
        return { itemUrl: rawItemUrl, itemFallbackUrl: null };
    }

    const championsItemUrl = `https://raw.githubusercontent.com/KevinToodlepoot/pokemon-champions-sprites/main/items/${cleanItemName}.png`;
    return { itemUrl: championsItemUrl, itemFallbackUrl: rawItemUrl };
}

// --- Parsing helpers ---

function parsePokemonName(preText) {
    const match = preText.match(/^([^@]+)/);
    return match ? match[1].trim() : 'Unknown Pokémon';
}

function toCleanName(rawName) {
    return rawName
        .split('@')[0].trim()
        .split('(')[0].trim()
        .replace(/\s+/g, '-')
        .replace(/['.:]/g, '')
        .toLowerCase();
}

function toCleanItemName(preText) {
    const match = preText.split('\n')[0].match(/@\s*(.+)/);
    if (!match) return null;
    return match[1].trim().replace(/\s+/g, '-').replace(/['.:]/g, '').toLowerCase();
}
