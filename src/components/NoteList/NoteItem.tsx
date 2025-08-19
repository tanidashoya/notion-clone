/*
NoteItem.tsx (NoteItemコンポーネント)
このコンポーネントは個別のノートアイテムを表示するUIコンポーネントです：
ノートタイトル表示: ノートのタイトル（無題の場合は「無題」と表示）
インタラクティブなアイコン:
通常時：ファイルアイコン (FileIcon)
ホバー時：展開アイコン (ChevronRight)
ホバーメニュー: マウスオーバー時に表示される操作メニュー
削除ボタン (Trashアイコン): ノートを削除
追加ボタン (Plusアイコン): 子ノートを作成
階層インデント: layerに基づいた左パディングで階層構造を視覚的に表現
ドロップダウンメニュー: 3点ドット(MoreHorizontal)から削除機能にアクセス
*/


import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { FileIcon, MoreHorizontal, Plus, Trash } from 'lucide-react';
import { Item } from '../SideBar/Item';
import { cn } from '@/lib/utils';
import { Note } from '@/modules/notes/note.entity';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface Props {
  note:Note;
  expanded?: boolean;
  layer?: number;
  isSelected?: boolean;
  onExpand?: (event: React.MouseEvent) => void;
  onCreate?: (event: React.MouseEvent) => void;
  onDelete?: (event: React.MouseEvent) => void;
  onClick?: () => void;
}

export function NoteItem({
  note,
  onClick,
  layer = 0,
  expanded = false,
  isSelected = false,
  onCreate,
  onDelete,
  onExpand,
}: Props) {
  const [isHovered,setIsHovered] = useState(false);

  // ファイルのアイコンを返す関数：マウスが乗ったらChevronRightを返す
  const getIcon = () => {
    return isHovered ? ChevronRight : FileIcon;
  }

  // メニューを返す関数
  // マウスが乗っていない場合はメニューを非表示にする:!isHovered && "opacity-0"
  const menu = (
    <div className={cn('ml-auto flex items-center gap-x-2',
      !isHovered && "opacity-0"
    )}>
      <DropdownMenu>
        <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
          <div
            className="h-full ml-auto rounded-sm hover:bg-neutral-300"
            role="button"
          >
            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-60"
          align="start"
          side="right"
          forceMount
        >
          <DropdownMenuItem onClick={onDelete}>
            <Trash className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <div
        className="h-full ml-auto rounded-sm hover:bg-neutral-300"
        role="button"
        onClick={onCreate}
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );

  return (
    <div
      // マウスカーソルが要素に入った瞬間に発火するイベント：マウスが乗ったらisHoveredをtrueにする
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}     
      onClick={onClick}
      role="button"
      style={{ paddingLeft: layer != null ? `${layer * 12 + 12}px` : '12px' }}
    >
      <Item
        label={note.title ?? '無題'}
        // ノートのアイコン
        icon={getIcon()}
        onIconClick={onExpand}
        trailingItem={menu}
        isActive={isHovered}
      />
    </div>
  );
}
