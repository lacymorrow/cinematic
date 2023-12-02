/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Link2Icon, PlayIcon } from '@radix-ui/react-icons';
import React, { useEffect } from 'react';
import ReactPlayer from 'react-player/youtube';
import { useNavigate, useParams } from 'react-router-dom';
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '../components/layout/PageHeader';
import { SectionHeader } from '../components/layout/SectionHeader';
import { GlobalContext } from '../context/global-context';

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
  const { library } = React.useContext(GlobalContext);
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
    console.error('cinematic: Navigated to invalid media id', id);
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

  const trailerUrl = `https://www.youtube.com/watch?v=${trailer}`;

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
          <img src={poster} alt={title} />
          <img src={`${tmdb?.imageBase}${tmdb?.poster_path}`} alt={title} />
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
          Actors
          {JSON.stringify(omdb?.actors, null, 2)}
          <br />
          Director
          {JSON.stringify(omdb?.director, null, 2)}
          <br />
          Genre
          {JSON.stringify(omdb?.genre, null, 2)}
          <br />
          Writer
          {JSON.stringify(omdb?.writer, null, 2)}
          {tmdb?.popularity && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                Popularity
              </h2>
              <p>{tmdb.popularity}</p>
            </div>
          )}
          {tmdb?.vote_count && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">
                TMDB Vote Count
              </h2>
              <p>{tmdb.vote_count}</p>
            </div>
          )}
          {tmdb?.overview && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
              <p>{tmdb.overview}</p>
            </div>
          )}
          <ReactPlayer url={trailerUrl} />
          <Table className="max-w-full break-all">
            <TableBody>
              <TableRow>
                <TableCell className="px-0 min-w-[100px]">File</TableCell>
                <TableCell className="px-0 text-right">{filepath}</TableCell>
              </TableRow>
              {MediaTable(rest)}
              <h2>OMDB</h2>
              {MediaTable(omdb)}
            </TableBody>
          </Table>
        </div>
        {/* <pre>{JSON.stringify(currentMedia, null, 2)}</pre> */}
      </div>
    </>
  );
}
