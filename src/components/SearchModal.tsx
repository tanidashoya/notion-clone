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
import { useDebouncedCallback } from 'use-debounce';

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

  //第一引数に渡されたコールバック関数の実行を連続入力時に最後の入力から500ms後に実行するようにする
  //debounced変数には関数が格納されている
  const debounced = useDebouncedCallback(onKeywordChanged,100)

  //commandDialogのopenプロパティがtrueの時にモーダルが開くしfalseの時に閉じている状態を管理している
  //onOpenChange:ユーザーがモーダルを閉じようとした時に実行される関数(モーダル内の閉じるボタン、モーダル外の背景をクリックした時、ESCキーを押した時など)
  //これらの閉じる行為をCommandDialogのコンポーネント内部で定義している
  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <Command shouldFilter={false}>
        {/* キーワードを入力するとonValueChangeが実行される(普通のコンポーネントのonChangeと同じ) */}
        {/* CommandItemコンポーネントのonSelectプロパティはユーザーがマウスクリック、Enterキー、方向キー + Enterキー（キーボードナビゲーション）で実行される */}
        <CommandInput
          placeholder={'キーワードで検索'}
          onValueChange={debounced}
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
