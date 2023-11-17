import { Button } from '@/components/ui/button';
import { PlusCircledIcon } from '@radix-ui/react-icons';

export function ButtonAddMedia() {
  const handleClick = () => {
    window.electron.openMediaPath();
  };

  return (
    <div className="ml-auto mr-4">
      <Button onClick={handleClick}>
        <PlusCircledIcon className="mr-2 h-4 w-4" />
        Add media
      </Button>
    </div>
  );
}
