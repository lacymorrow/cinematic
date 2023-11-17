import { Button } from '@/components/ui/button';
import { ViewNoneIcon } from '@radix-ui/react-icons';

export function MediaEmptyPlaceholder() {
  const handleClick = () => {
    window.electron.openMediaPath();
  };

  return (
    <div className="flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <ViewNoneIcon className="w-16 h-16 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No media added</h3>
        <p className="mb-4 mt-2 text-sm text-muted-foreground">
          You have not added any media directories or files. Select a directory
          to scan for media files.
        </p>
        <Button size="sm" className="relative" onClick={handleClick}>
          Add media files
        </Button>
      </div>
    </div>
  );
}
