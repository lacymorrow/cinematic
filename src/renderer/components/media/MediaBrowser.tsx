// todo: list view of media (vs grid view)
// todo: no items placeholder
import React from 'react';
import { MediaArtwork } from '@/renderer/components/media/MediaArtwork';
import { MediaType } from '@/types/file';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MediaEmptyPlaceholder } from '@/renderer/components/media/MediaEmptyPlaceholder';
import {
  BookmarkIcon,
  DashboardIcon,
  ListBulletIcon,
} from '@radix-ui/react-icons';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ViewModeType } from '@/main/store';
import { GlobalContext } from '@/renderer/context/global-context';
import { SectionHeader } from '../layout/SectionHeader';
import { ScrollContainer } from '../layout/ScrollContainer';
import { ButtonAddMedia } from './ButtonAddMedia';

type Props = {
  items: MediaType[];
  title: string;
  tagline?: string;
  addMediaButton?: boolean;
  NotFound?: React.FC;
};

export function MediaBrowser({
  items,
  title,
  tagline,
  addMediaButton = true,
  NotFound = MediaEmptyPlaceholder,
}: Props) {
  const { settings } = React.useContext(GlobalContext);

  const handleViewChange = (value: string) => {
    console.log('handleViewChange', value);
    window.electron.setSettings({
      viewMode: value as ViewModeType,
    });
  };
  return (
    <ScrollContainer>
      {items.length === 0 ? (
        <>
          <SectionHeader title={title} tagline={tagline}>
            {addMediaButton && <ButtonAddMedia />}
          </SectionHeader>
          <NotFound />
        </>
      ) : (
        <Tabs
          defaultValue={settings.viewMode}
          className="space-y-6 h-full min-h-0 flex flex-col select-none"
          onValueChange={handleViewChange}
        >
          <div className="space-between flex items-center">
            <TabsList>
              <TabsTrigger value="grid" className="relative">
                <DashboardIcon className="mr-2" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list">
                <ListBulletIcon className="mr-2" />
                List
              </TabsTrigger>
            </TabsList>
            <ButtonAddMedia />
          </div>
          <SectionHeader title={title} tagline={tagline} />

          <TabsContent value="grid" className="border-none p-0 outline-none">
            <div className="flex gap-6 pb-6 flex-wrap">
              {items.map((media: MediaType) => (
                <MediaArtwork
                  key={crypto.randomUUID()}
                  media={media}
                  className="w-[250px]"
                  aspectRatio="portrait"
                  width={250}
                  height={375}
                />
              ))}
            </div>
          </TabsContent>
          <TabsContent
            value="list"
            className="h-full flex-col border-none p-0 data-[state=active]:flex"
          >
            <Table>
              <TableCaption>{tagline}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="">Title</TableHead>
                  <TableHead>Released</TableHead>
                  <TableHead>Runtime</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((media: MediaType) => (
                  <TableRow key={media.id}>
                    <TableCell className="font-medium">{media.title}</TableCell>
                    <TableCell>{media.year}</TableCell>
                    <TableCell>{media.runtime}</TableCell>
                    <TableCell className="text-right">
                      <BookmarkIcon />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      )}
    </ScrollContainer>
  );
}
