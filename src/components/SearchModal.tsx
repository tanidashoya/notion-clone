import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Note } from '@/modules/notes/note.entity';

interface SearchModalProps {
  isOpen: boolean;
  notes: Note[];
  onItemSelect: (noteId: number) => void;
  onKeywordChanged: (keyword: string) => void;
  onClose: () => void;
}

export function SearchModal({
  isOpen,
  notes,
  onItemSelect,
  onKeywordChanged,
  onClose,
}: SearchModalProps) {

  //commandDialogのopenプロパティがtrueの時にモーダルが開くしfalseの時に閉じている状態を管理している
  //onOpenChange:ユーザーがモーダルを閉じようとした時に実行される関数(モーダル内の閉じるボタン、モーダル外の背景をクリックした時、ESCキーを押した時など)
  //これらの閉じる行為をCommandDialogのコンポーネント内部で定義している
  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command shouldFilter={false}>
        <CommandInput
          placeholder={'キーワードで検索'}
          onValueChange={onKeywordChanged}
        />
        <CommandList>
          <CommandEmpty>条件に一致するノートがありません</CommandEmpty>
          <CommandGroup>
            {notes?.map((note) => (
              <CommandItem
                key={note.id}
                title={note.title ?? '無題'}
                onSelect={() => onItemSelect(note.id)}
              >
                <span>{note.title ?? '無題'}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
