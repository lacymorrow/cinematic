/* eslint-disable @typescript-eslint/no-unused-vars */
import { TableCell, TableRow } from '@/components/ui/table';
import { PosterRotator } from '@/renderer/components/media/PosterRotator';
import { InfoBlock } from '@/renderer/components/ui/InfoBlock';
import {
	ArrowLeftIcon,
	CalendarIcon,
	ClockIcon,
	IdCardIcon
} from '@radix-ui/react-icons';
import Logger from 'electron-log/renderer';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import RatingsRotator, { Rating } from '@/renderer/components/media/RatingsRotator';
import TrailerRotator from '@/renderer/components/media/TrailerRotator';
import { useLibraryContext } from '@/renderer/context/library-context';
import styles from '@/renderer/styles/effects.module.scss';
import { Link2Icon } from 'lucide-react';

type Props = {};

export function MediaTable(data: any) {
	if (!data) return;
	return (
		<>
			{Object.entries(data).map(([k, v]) => {
				if (!v) return;
				return (
					<TableRow key={k}>
						<TableCell className="px-0">{k}</TableCell>
						<TableCell className="px-0 text-right">{String(v)}</TableCell>
					</TableRow>
				);
			})}
		</>
	);
}

export function Media(_props: Props) {
	const { id } = useParams();
	const { library } = useLibraryContext();
	const navigate = useNavigate();

	useEffect(() => {
		if (id && library[id]) {
			// add to recently viewed
			window.electron.addRecentlyViewed(id);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [id, library]);

	const handleBack = () => {
		navigate(-1);
		return null;
	};

	if (!id || !library[id]) {
		// this shouldn't be possible
		Logger.error('renderer/pages/Media.tsx: Navigated to invalid media id', id);
		return handleBack();
	}

	const currentMedia = library[id];

	const handlePlay = () => {
		window.electron.openPath(currentMedia.filepath);
	};

	const handleUrl = (url: string | undefined) => {
		if (!url) return;
		window.electron.openUrl(url);
	};

	const {
		id: mediaId,
		filepath,
		title,
		year,
		runtime,
		poster,
		backdrop,
		omdb,
		tmdb,
		liked,
		dateAdded,
		dateUpdated,
		dateViewed,
		dateWatched,
		plot,
		ratings,
		trailer,

		// unused
		...rest
	} = currentMedia;

	const description = omdb?.plot || tmdb?.overview || '';

	const trailerUrl = `https://www.youtube.com/watch?v=${trailer}`;

	const posters = [
		...(tmdb?.poster ? [tmdb.poster] : []),
		...(omdb?.poster ? [omdb.poster] : []),
	];

	const backgroundImage = <img src={backdrop} alt={title} className="w-full" />;

	const starRatings: Rating[] = [
		...(omdb?.imdbrating ? [{
			name: 'IMDB',
			score: parseFloat(omdb.imdbrating),
			votes: omdb?.imdbvotes ? parseInt(omdb.imdbvotes) : undefined,
		}] : []),
		...(omdb?.metascore ? [{
			name: 'Metascore',
			score: parseFloat(omdb.metascore),
		}] : []),
		...(tmdb?.vote_average ? [{
			name: 'TMDB',
			score: tmdb?.vote_average,
			votes: tmdb?.vote_count,
		}] : [])
	]

	// Extract trailer video IDs from rest.trailers
	const trailerVideoIds: string[] = Array.isArray(rest.trailers)
		? rest.trailers
		: rest.trailers
			? [rest.trailers]
			: [];

	const writer = omdb?.writer ? Object.values(omdb.writer) : [];

	return (
		<>
			<div className="h-full w-full overflow-y-auto relative">
				<div className="relative">
					<section className="w-full absolute inset-0 bottom-10 -z-10">
						<div className={cn(styles.vignette)}>
							<img
								src={backdrop}
								alt={`${title} Hero`}
								width={1920}
								height={1080}
								className={cn('w-full h-full object-cover')}
								style={{ aspectRatio: '1920/1080', objectFit: 'cover' }}
							/>
						</div>
						<div className="absolute inset-0 bg-gradient-to-t from-background via-background to-transparent" />
					</section>
					<div className="absolute top-4 left-4 md:top-6 md:left-8">
						<Button
							variant="outline"
							className="bg-background/50"
							onClick={handleBack}
						>
							<ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
						</Button>
					</div>
					<div className="container mx-auto py-12 md:pt-16 lg:pt-20 px-4 md:px-6 lg:px-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 mt-16">
							<div className="col-span-1 md:col-span-1">
								<PosterRotator images={posters} />
							</div>
							<div className="col-span-1 md:col-span-2">
								<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
									{title}
								</h1>
								<p className="text-muted-foreground text-lg mb-4">{year}</p>
								<p className="text-muted-foreground mb-6">{description}</p>

								<div className="grid grid-cols-2 gap-6">
									<div className="grid gap-2">
										<div className="flex items-center gap-2">
											<CalendarIcon className="w-5 h-5 fill-muted-foreground" />
											<span className="text-muted-foreground">{year}</span>
										</div>
										<div className="flex items-center gap-2">
											<ClockIcon className="w-5 h-5 fill-muted-foreground" />
											<span className="text-muted-foreground">{runtime}</span>
										</div>
										{omdb?.genre && (
											<div className="flex items-center gap-2">
												<IdCardIcon className="w-5 h-5 fill-muted-foreground" />
												<span className="text-muted-foreground">
													{Object.values(omdb?.genre).join(', ')}
												</span>
											</div>
										)}
									</div>
									{ratings && ratings.length > 0 && (
										<div className="flex items-center gap-4">
											<RatingsRotator ratings={starRatings} />
										</div>
									)}

								</div>
								<div className="flex flex-col gap-4 mt-6">
									<Button size="lg" onClick={handlePlay}>
										Play Movie
									</Button>
									<div className="flex gap-4">
										{trailer && (
											<Button className="flex-1" size="lg" variant="outline" onClick={() => handleUrl(trailerUrl)}>
											Watch Trailer
										</Button>
									)}
									{omdb?.imdbid && (
											<Button className={trailer ? "" : "flex-1"} size="lg" variant="outline" onClick={() => handleUrl(`https://www.imdb.com/title/${omdb?.imdbid}`)}>
											<Link2Icon className="mr-2 h-4 w-4" /> IMDB
											</Button>
										)}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="container flex flex-col gap-6 pb-12">
					<Separator />


					{/* Trailer Rotator */}
					{trailerVideoIds.length > 0 && (<>
						<div className="container max-w-screen-sm mx-auto py-6">
							<TrailerRotator videoIds={trailerVideoIds} />
						</div>
						<Separator />
					</>
					)}

					{tmdb?.overview && plot && (
						<>
							<section className="flex flex-col md:flex-row flex-wrap items-center justify-center gap-4">
								<div className='md:flex-1'>
									<h2 className="text-2xl font-bold tracking-tighter">Plot</h2>
									<div className="mt-4 text-muted-foreground">
										<p>{tmdb?.overview}</p>
									</div>
								</div>


							</section>
							<Separator />
						</>
					)}

					<div className='flex flex-col md:flex-row flex-wrap justify-between gap-6'>
						<div className="flex flex-col gap-4 md:flex-1">
							<div className="flex flex-wrap gap-4">
								{omdb?.actors && (
									<InfoBlock
										title="Cast"
										value={Object.values(omdb.actors).join(', ')}
									/>
								)}



								{writer && (
									<InfoBlock
										title={`Writer${writer.length > 1 ? 's' : ''}`}
										value={writer.join(', ')}
									/>
								)}



								{omdb?.awards && (
									<InfoBlock title="Awards" value={omdb?.awards} />
								)}

								{omdb?.dvd && <InfoBlock title="DVD Release" value={omdb?.dvd} />}
								{omdb?.production && (
									<InfoBlock title="Production" value={omdb?.production} />
								)}


								{omdb?.website && (
									<InfoBlock title="Website" value={omdb?.website} />
								)}
							</div>
						</div>

						<div className="relative">
							<Separator orientation="vertical" className="absolute inset-0 h-full" />
						</div>

						<div className="flex flex-col gap-4">

							{omdb?.country && (
								<InfoBlock title="Country" value={omdb?.country} />
							)}
							{omdb?.language && (
								<InfoBlock title="Languages" value={omdb?.language} />
							)}
							{tmdb?.popularity && (
								<InfoBlock title="Popularity" value={tmdb?.popularity} />
							)}


						</div>

						<div className="relative">
							<Separator orientation="vertical" className="absolute inset-0 h-full" />
						</div>

						<div className="flex flex-col gap-4  md:flex-1">

							{omdb?.director && (
								<InfoBlock
									title="Directed By"
									value={Object.values(omdb.director).join(', ')}
								/>
							)}
							{omdb?.released && (
								<InfoBlock title="Released" value={omdb?.released} />
							)}
							{omdb?.boxoffice && (
								<InfoBlock title="Box Office" value={omdb?.boxoffice} />
							)}


						</div>
					</div>
				</div>
			</div>
		</>
	);
}
