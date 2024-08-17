/* eslint-disable @typescript-eslint/no-unused-vars */
import { TableCell, TableRow } from '@/components/ui/table';
import { PosterRotator } from '@/renderer/components/media/PosterRotator';
import { RatingIcon } from '@/renderer/components/media/RatingIcon';
import { InfoBlock } from '@/renderer/components/ui/InfoBlock';
import {
	PageHeader,
	PageHeaderDescription,
	PageHeaderHeading,
} from '@/renderer/components/ui/PageHeader';
import {
	ArrowLeftIcon,
	Link2Icon,
	StarIcon,
	VideoIcon,
} from '@radix-ui/react-icons';
import Logger from 'electron-log/renderer';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useLibraryContext } from '@/renderer/context/library-context';
import styles from '@/renderer/styles/effects.module.scss';
import { truncate } from '@/utils/truncate';
import { ChevronLeftCircleIcon } from 'lucide-react';

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
					<section className="w-full absolute -z-10">
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
						<div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
						<div className="absolute top-4 left-4 md:top-6 md:left-6">
							<Button onClick={handleBack}>
								<ArrowLeftIcon className="mr-2 h-4 w-4" /> Back
							</Button>
						</div>
					</section>
					<div className="container mx-auto py-12 md:py-16 lg:py-20 px-4 md:px-6 lg:px-8">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16">
							<div className="col-span-1 md:col-span-1">
								<img
									src={poster}
									alt={`${title} Poster`}
									width={300}
									height={450}
									className="w-full h-auto rounded-lg shadow-lg"
									style={{ aspectRatio: '300/450', objectFit: 'cover' }}
								/>
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
													key={index}
													className={`w-5 h-5 ${index < Math.round(parseFloat(ratings[0].Value) / 2) ? 'fill-primary' : 'fill-muted stroke-muted-foreground'}`}
												/>
											))}
										</div>
										<span className="text-muted-foreground">
											{ratings[0].Value}/10
										</span>
									</div>
								)}
								<div className="grid grid-cols-2 gap-4 mb-6">
									{omdb?.director && (
										<div>
											<h3 className="text-lg font-medium mb-2">Director</h3>
											<p className="text-muted-foreground">{omdb.director}</p>
										</div>
									)}
									{omdb?.actors && (
										<div>
											<h3 className="text-lg font-medium mb-2">Cast</h3>
											<p className="text-muted-foreground">{omdb.actors}</p>
										</div>
									)}
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

				<button
					type="button"
					className="absolute z-10 p-6"
					onClick={handleBack}
				>
					<ChevronLeftCircleIcon className={cn('w-10 h-10', styles.glow)} />
					<span className="sr-only">Back</span>
				</button>
				{backdrop && (
					<div className="w-full relative flex flex-col items-center">
						<div className={styles.vignette}>{backgroundImage}</div>
						<PageHeader
							className={cn(backdrop && 'md:absolute', 'top-24 p-3 gap-4')}
						>
							{/* Play button */}
							<button
								type="button"
								onClick={handlePlay}
								className="text-foreground self-center"
							>
								<VideoIcon className={cn('w-24 h-24', styles.glow)} />
								<span className="sr-only">Play file</span>
							</button>

							<div className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
								<p>{year}</p>
								<span>•</span>
								<p>{runtime}</p>
							</div>
							<PageHeaderHeading>{title}</PageHeaderHeading>

							<PageHeaderDescription>
								{truncate(description, 200)}
								{description.length > 200 && <>&hellip;</>}
							</PageHeaderDescription>

							<div className="flex flex-wrap items-center gap-2">
								{/* {liked && <Badge className="rounded-full">Liked</Badge>}
								{dateAdded && (
									<Badge className="rounded-full">Added: {dateAdded}</Badge>
								)}
								{dateUpdated && (
									<Badge className="rounded-full">Updated: {dateUpdated}</Badge>
								)}
								{dateViewed && (
									<Badge className="rounded-full">Viewed: {dateViewed}</Badge>
								)}
								{dateWatched && (
									<Badge className="rounded-full">Watched: {dateWatched}</Badge>
								)} */}
								{omdb?.genre &&
									Object.values(omdb.genre).map((g) => (
										<Badge className="rounded-full" key={g}>
											{g}
										</Badge>
									))}
							</div>

							<div className="flex flex-wrap items-center gap-2">
								{omdb?.imdbid && (
									<Badge
										className="rounded-full gap-2 cursor-pointer"
										variant="secondary"
										onClick={() => {
											if (!omdb?.imdbid) return;
											handleUrl(`https://www.imdb.com/title/${omdb.imdbid}/`);
										}}
									>
										<Link2Icon />
										IMDB
									</Badge>
								)}

								{tmdb?.id && (
									<Badge
										className="rounded-full gap-2 cursor-pointer"
										variant="secondary"
										onClick={() => {
											if (!tmdb?.id) return;
											handleUrl(`https://www.themoviedb.org/movie/${tmdb.id}`);
										}}
									>
										<Link2Icon />
										TMDB
									</Badge>
								)}
								{omdb?.tomatourl && (
									<Badge
										className="rounded-full gap-2 cursor-pointer"
										variant="secondary"
										onClick={() => {
											handleUrl(omdb?.tomatourl);
										}}
									>
										<Link2Icon />
										Tomatoes
									</Badge>
								)}
							</div>
						</PageHeader>

						{/* Rating */}
						{omdb?.rated && (
							<div className="absolute top-0 right-0 p-6 xl:p-12">
								<RatingIcon rated={omdb.rated} />
							</div>
						)}

						{/* Upside down image reflection */}
						<div
							className={cn(
								'top-full -scale-y-100  -z-10',
								styles.vignette,
								styles.fade,
							)}
						>
							{backgroundImage}
						</div>
					</div>
				)}

				<div className="p-6">
					{filepath && <pre className="italic text-xs">{filepath}</pre>}

					{/* {ratings?.length && (
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
          )} */}
					<div className="">
						<PosterRotator images={posters} />
					</div>

					<iframe
						src="https://www.youtube-nocookie.com/embed/skK9CGLrpWY?rel=0&controls=0"
						width="560"
						height="315"
						title="YTTV TrueView NewUsers NFL 23 V1 DR None US EN 10s MP4 VIDEO"
						frameBorder="0"
						allowFullScreen
					/>

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
						{/* <ReactPlayer url={trailerUrl} /> */}
						{/* <Table className="max-w-full break-all">
						<TableBody>
							<TableRow>
								<TableCell className="px-0 min-w-[100px]">File</TableCell>
								<TableCell className="px-0 text-right">{filepath}</TableCell>
							</TableRow>
							{MediaTable(rest)}
							<h2>OMDB</h2>
							{MediaTable(omdb)}
						</TableBody>
					</Table> */}
					</div>
				</div>
			</div>
		</>
	);
}
