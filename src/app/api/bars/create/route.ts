import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

async function geocodeAddress(address: string, city: string, state: string, zipCode: string): Promise<{ latitude: number; longitude: number } | null> {
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  const encoded = encodeURIComponent(fullAddress);
  
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}&limit=1`
    );
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [longitude, latitude] = data.features[0].center;
      return { latitude, longitude };
    }
  } catch (error) {
    console.error('Geocoding error:', error);
  }
  
  return null;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function normalizeCity(city: string): string {
  return city.toLowerCase().trim();
}

export async function POST(req: Request) {
  try {
    const { ownerId, name, address, city, state, zipCode, phone, website, description } = await req.json();

    if (!ownerId || !name || !address || !city || !state || !zipCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Geocode address
    const coords = await geocodeAddress(address, city, state, zipCode);
    if (!coords) {
      return NextResponse.json({ error: 'Could not geocode address' }, { status: 400 });
    }

    // Create unique slug
    let slug = slugify(name);
    let counter = 1;
    while (await prisma.bar.findUnique({ where: { slug } })) {
      slug = `${slugify(name)}-${counter}`;
      counter++;
    }

    const bar = await prisma.bar.create({
      data: {
        ownerId,
        name,
        slug,
        address,
        city,
        cityNormalized: normalizeCity(city),
        state,
        zipCode,
        latitude: coords.latitude,
        longitude: coords.longitude,
        phone: phone || null,
        website: website || null,
        description: description || null,
      },
    });

    return NextResponse.json({ barId: bar.id, slug: bar.slug });
  } catch (error) {
    console.error('Bar creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
