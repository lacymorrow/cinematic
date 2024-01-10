/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import { Link2Icon, PlayIcon } from '@radix-ui/react-icons';
import Logger from 'electron-log/renderer';
import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PosterRotator } from '../components/media/PosterRotator';
import { RatingIcon } from '../components/media/RatingIcon';
import { InfoBlock } from '../components/ui/InfoBlock';
import {
	PageHeader,
	PageHeaderDescription,
	PageHeaderHeading,
} from '../components/ui/PageHeader';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useGlobalContext } from '../context/global-context';

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
	const { library } = useGlobalContext();
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
		ratings,
		trailer,

		// unused
		...rest
	} = currentMedia;

	console.log('currentMedia', tmdb, omdb);

	const trailerUrl = `https://www.youtube.com/watch?v=${trailer}`;

	const posters = [
		...(tmdb?.poster ? [tmdb.poster] : []),
		...(omdb?.poster ? [omdb.poster] : []),
	];

	return (
		<>
			<div className="h-full w-full overflow-y-auto">
				{backdrop && (
					<div className="w-full relative">
						<div>
							<img src={backdrop} alt={title} className="w-full" />
						</div>
						<div className="absolute" />
						{/* <div className="top-full -scale-y-100 absolute -z-10">
              <img src={backdrop} alt={title} />
            </div> */}
					</div>
				)}

				<div className="">
					<PosterRotator images={posters} />
				</div>

				{/* <iframe
          src="https://www.youtube-nocookie.com/embed/skK9CGLrpWY?rel=0&controls=0"
          width="560"
          height="315"
          title="YTTV TrueView NewUsers NFL 23 V1 DR None US EN 10s MP4 VIDEO"
          frameBorder="0"
          allowFullScreen
        /> */}

				<PageHeader>
					<PageHeaderHeading>
						{title} <span className="lighter">({year})</span>
					</PageHeaderHeading>
					<PageHeaderDescription />
				</PageHeader>

				{trailerUrl}
				{rest.trailers && (
					<div className="grid grid-cols-2 gap-4">
						{rest.trailers.join(', ')}
					</div>
				)}
				<RatingIcon rated="R" />

				<div className="m-6">
					<Button onClick={handleBack}>BACK</Button>
					<Button onClick={handlePlay}>
						Play <PlayIcon className="ml-2" />
					</Button>
					{omdb?.imdbid && (
						<Button
							onClick={() => {
								if (!omdb?.imdbid) return;
								handleUrl(`https://www.imdb.com/title/${omdb.imdbid}/`);
							}}
						>
							IMDB <Link2Icon className="ml-2" />
						</Button>
					)}
					{omdb?.tomatourl && (
						<Button
							onClick={() => {
								handleUrl(omdb?.tomatourl);
							}}
						>
							Tomatoes <Link2Icon className="ml-2" />
						</Button>
					)}
					<SectionHeader
						title={title}
						tagline={`${year}${
							omdb?.genre && ` • ${Object.values(omdb.genre).join(', ')}`
						}${omdb?.runtime && ` • ${omdb.runtime}`}`}
					/>
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
					<div className="flex flex-wrap gap-4">
						{omdb?.actors && (
							<InfoBlock
								title="Actors"
								value={Object.values(omdb.actors).join(', ')}
							/>
						)}
						{omdb?.runtime && (
							<InfoBlock title="Runtime" value={omdb?.runtime} />
						)}

						{omdb?.rated && <InfoBlock title="Rated" value={omdb?.rated} />}

						{omdb?.released && (
							<InfoBlock title="Released" value={omdb?.released} />
						)}

						{omdb?.country && (
							<InfoBlock title="Country" value={omdb?.country} />
						)}

						{omdb?.language && (
							<InfoBlock title="Language" value={omdb?.language} />
						)}

						{omdb?.awards && <InfoBlock title="Awards" value={omdb?.awards} />}

						{omdb?.boxoffice && (
							<InfoBlock title="Box Office" value={omdb?.boxoffice} />
						)}

						{omdb?.dvd && <InfoBlock title="DVD Release" value={omdb?.dvd} />}

						{omdb?.production && (
							<InfoBlock title="Production" value={omdb?.production} />
						)}

						{omdb?.website && (
							<InfoBlock title="Website" value={omdb?.website} />
						)}

						{omdb?.imdbid && <InfoBlock title="IMDB ID" value={omdb?.imdbid} />}

						{omdb?.imdbvotes && (
							<InfoBlock title="IMDB Votes" value={omdb?.imdbvotes} />
						)}

						{omdb?.imdbrating && (
							<InfoBlock title="IMDB Rating" value={omdb?.imdbrating} />
						)}

						{omdb?.metascore && (
							<InfoBlock title="Metascore" value={omdb?.metascore} />
						)}

						{omdb?.director && (
							<InfoBlock
								title="Director"
								value={Object.values(omdb.director).join(', ')}
							/>
						)}

						{omdb?.writer && (
							<InfoBlock
								title="Writer"
								value={Object.values(omdb.writer).join(', ')}
							/>
						)}

						{tmdb?.popularity && (
							<InfoBlock title="Popularity" value={tmdb?.popularity} />
						)}

						{tmdb?.vote_count && (
							<InfoBlock title="TMDB Vote Count" value={tmdb.vote_count} />
						)}

						{tmdb?.vote_average && (
							<InfoBlock title="TMDB Vote Average" value={tmdb.vote_average} />
						)}

						{tmdb?.id && <InfoBlock title="TMDB ID" value={tmdb.id} />}

						{filepath && <InfoBlock title="File" value={filepath} />}

						{currentMedia.ext && (
							<InfoBlock
								title="Extension"
								value={currentMedia.ext.replaceAll('.', '')}
							/>
						)}

						{tmdb?.overview && (
							<InfoBlock title="Overview" value={tmdb?.overview} />
						)}

						{currentMedia?.plot && (
							<InfoBlock title="Plot" value={currentMedia?.plot} />
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
		</>
	);
}
