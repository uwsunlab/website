export interface ScholarPaper {
  title: string;
  authors: string;
  venue: string;
  year: number;
  doi: string | null;
  scholarQuery: string;
}

const ORCID = '0000-0002-6179-1390'; // no https://orcid.org/ prefix needed

export async function fetchScholarPapers(): Promise<ScholarPaper[]> {
  const url = `https://api.openalex.org/works?filter=author.orcid:${ORCID}&per-page=200&sort=publication_date:desc`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'yourlab.example.com (mailto:you@example.com)' }, // polite pool — faster, more reliable responses
  });

  if (!res.ok) {
    throw new Error(`OpenAlex fetch failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return data.results.map((work: any) => {
    const authors = work.authorships
      ?.map((a: any) => a.author?.display_name)
      .filter(Boolean)
      .join(', ') ?? '';

    const venue = work.primary_location?.source?.display_name ?? work.host_venue?.display_name ?? '';

    return {
      title: work.title ?? work.display_name ?? 'Untitled',
      authors,
      venue,
      year: work.publication_year,
      doi: work.doi ? work.doi.replace('https://doi.org/', '') : null,
      scholarQuery: `https://scholar.google.com/scholar?q=${encodeURIComponent(work.title ?? '')}`,
    };
  });
}