/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Link2Icon, PlayIcon } from '@radix-ui/react-icons';
import React, { useEffect } from 'react';
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
    console.error('cinematic: Navigated to invalid media id', id);
    return handleBack();
  }

  const currentMedia = library[id];

  const handlePlay = () => {
    window.electron.openPath(currentMedia.filepath);
  };

  const handleImdb = () => {
    if (currentMedia?.omdb?.imdbid) {
      window.electron.openUrl(
        `https://www.imdb.com/title/${currentMedia.omdb.imdbid}/`,
      );
    }
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
    ...rest
  } = currentMedia;

  return (
    <>
      <div className="h-full w-full overflow-y-auto">
        {currentMedia.backdrop && (
          <div className="w-full relative">
            <div>
              <img
                src={currentMedia.backdrop}
                alt={currentMedia.title}
                className="w-full"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t bg-gradi from-black to-black/10" />
            {/* <div className="top-full -scale-y-100 absolute -z-10">
              <img src={currentMedia.backdrop} alt={currentMedia.title} />
            </div> */}
          </div>
        )}

        <PageHeader>
          <PageHeaderHeading>
            {title} <span className="lighter">({year})</span>
          </PageHeaderHeading>
          <PageHeaderDescription />
        </PageHeader>

        <div className="m-6">
          <Button onClick={handleBack}>BACK</Button>
          <Button onClick={handlePlay}>
            Play <PlayIcon className="ml-2" />
          </Button>
          {currentMedia?.omdb?.imdbid && (
            <Button onClick={handleImdb}>
              IMDB <Link2Icon className="ml-2" />
            </Button>
          )}

          <img src={currentMedia.poster} alt={currentMedia.title} />
          <SectionHeader
            title={currentMedia.title}
            tagline={`${currentMedia.year}${
              currentMedia.omdb?.genre &&
              ` • ${Object.values(currentMedia.omdb.genre).join(', ')}`
            }`}
          />

          <Table>
            <TableBody>
              {MediaTable(rest)}

              {MediaTable(omdb)}
              {MediaTable(tmdb)}
            </TableBody>
          </Table>
        </div>
        {/* <pre>{JSON.stringify(currentMedia, null, 2)}</pre> */}
      </div>
    </>
  );
}
