/* eslint-disable @typescript-eslint/no-unused-vars */
import { TableCell, TableRow } from '@/components/ui/table';
import { PosterRotator } from '@/renderer/components/media/PosterRotator';
import { InfoBlock } from '@/renderer/components/ui/InfoBlock';
import {
	ArrowLeftIcon,
	CalendarIcon,
	ClockIcon,
	IdCardIcon,
	StarIcon,
} from '@radix-ui/react-icons';
import Logger from 'electron-log/renderer';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useLibraryContext } from '@/renderer/context/library-context';
import styles from '@/renderer/styles/effects.module.scss';
import { getUUID } from '@/utils/getUUID';

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
					<div className="container mx-auto py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8">
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
								{ratings && ratings.length > 0 && (
									<div className="flex items-center gap-4 mb-6">
										<div className="flex items-center gap-1">
											{[...Array(5)].map((_, index) => (
												<StarIcon
													key={getUUID()}
													className={`w-5 h-5 ${index < Math.round(parseFloat(ratings[0].Value) / 2) ? 'fill-primary' : 'fill-muted stroke-muted-foreground'}`}
												/>
											))}
										</div>
										<span className="text-muted-foreground">
											{ratings[0].Value}/10
										</span>
									</div>
								)}

								<div className="grid gap-6">
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
									<div className="grid grid-cols-2 gap-4 mb-6">
										{omdb?.director && (
											<div>
												<h3 className="text-lg font-medium mb-2">Director</h3>
												<p className="text-muted-foreground">
													{Object.values(omdb.director).join(', ')}
												</p>
											</div>
										)}
										{omdb?.actors && (
											<div>
												<h3 className="text-lg font-medium mb-2">Cast</h3>
												<p className="text-muted-foreground">
													{Object.values(omdb.actors).join(', ')}
												</p>
											</div>
										)}
									</div>
								</div>
								<div className="flex flex-col gap-4">
									{trailer && (
										<Button size="lg" onClick={() => handleUrl(trailerUrl)}>
											Watch Trailer
										</Button>
									)}
									<Button size="lg" variant="outline" onClick={handlePlay}>
										Play Movie
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>

				<section className="w-full">
					<div className="container px-4 md:px-6">
						<div className="space-y-6">
							<div>
								<h2 className="text-2xl font-bold tracking-tighter">Plot</h2>
								<div className="mt-4 text-muted-foreground">
									<p>{plot}</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				<div className="p-6">
					{ratings?.length && (
						<div className="space-y-4">
							<h2 className="text-lg font-semibold tracking-tight">Ratings</h2>
							<div className="grid grid-cols-2 gap-4">
								{ratings.map((rating: any) => {
									return (
										<div key={rating.Source}>
											<p>{JSON.stringify(rating)}</p>
										</div>
									);
								})}
							</div>
						</div>
					)}

					{/* <iframe
						src="https://www.youtube-nocookie.com/embed/skK9CGLrpWY?rel=0&controls=0"
						width="560"
						height="315"
						title="YTTV TrueView NewUsers NFL 23 V1 DR None US EN 10s MP4 VIDEO"
						frameBorder="0"
						allowFullScreen
					/> */}

					{trailerUrl && <p>{trailerUrl}</p>}
					{rest.trailers && (
						<div className="grid grid-cols-2 gap-4">
							{Array.isArray(rest.trailers)
								? rest.trailers.join(', ')
								: JSON.stringify(rest.trailers)}
						</div>
					)}
					<div className="flex flex-col gap-4">
						<div className="flex flex-wrap gap-4">
							{omdb?.director && (
								<InfoBlock
									title="Director"
									value={Object.values(omdb.director).join(', ')}
								/>
							)}
							{omdb?.actors && (
								<InfoBlock
									title="Actors"
									value={Object.values(omdb.actors).join(', ')}
								/>
							)}

							{omdb?.writer && (
								<InfoBlock
									title="Writer"
									value={Object.values(omdb.writer).join(', ')}
								/>
							)}
						</div>
						<div className="flex flex-wrap gap-4">
							{omdb?.awards && (
								<InfoBlock title="Awards" value={omdb?.awards} />
							)}

							{omdb?.boxoffice && (
								<InfoBlock title="Box Office" value={omdb?.boxoffice} />
							)}
						</div>
						{tmdb?.overview && plot && <InfoBlock title="Plot" value={plot} />}

						<Separator />
						<div className="flex flex-wrap gap-4">
							{omdb?.language && (
								<InfoBlock title="Language" value={omdb?.language} />
							)}

							{omdb?.country && (
								<InfoBlock title="Country" value={omdb?.country} />
							)}
						</div>
						<div className="flex flex-wrap gap-4">
							{omdb?.released && (
								<InfoBlock title="Released" value={omdb?.released} />
							)}

							{omdb?.dvd && <InfoBlock title="DVD Release" value={omdb?.dvd} />}
						</div>
						<div className="flex flex-wrap gap-4">
							{omdb?.production && (
								<InfoBlock title="Production" value={omdb?.production} />
							)}

							{omdb?.website && (
								<InfoBlock title="Website" value={omdb?.website} />
							)}

							{omdb?.imdbvotes && (
								<InfoBlock title="IMDB Votes" value={omdb?.imdbvotes} />
							)}

							{omdb?.imdbrating && (
								<InfoBlock title="IMDB Rating" value={omdb?.imdbrating} />
							)}

							{omdb?.metascore && (
								<InfoBlock title="Metascore" value={omdb?.metascore} />
							)}

							{tmdb?.popularity && (
								<InfoBlock title="Popularity" value={tmdb?.popularity} />
							)}

							{tmdb?.vote_count && (
								<InfoBlock title="TMDB Vote Count" value={tmdb.vote_count} />
							)}

							{tmdb?.vote_average && (
								<InfoBlock
									title="TMDB Vote Average"
									value={tmdb.vote_average}
								/>
							)}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
