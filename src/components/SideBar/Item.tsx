/*
Item.tsx (Itemコンポーネント)の詳細構成
役割
サイドバーの基本的なリストアイテムUIを提供する再利用可能なコンポーネントです。NoteItemコンポーネントの表示部分を担当しています。
*/

import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

//iconはLucideIcon型であると宣言している
interface ItemProps {
  label: string;
  icon: LucideIcon;
  onClick?: () => void;
  onIconClick?: (event: React.MouseEvent) => void;
  isActive?: boolean;
  trailingItem?: React.ReactElement;
}

export function Item({
  label,
  onClick,
  onIconClick,
  //リネーム構文：icon:Icon → というように、iconという名前をIconという名前にリネームしている
  //コンポーネントの引数内でpropsを受け取るときに、propsの名前を変更したい場合に使う
  icon: Icon,
  isActive = false,
  trailingItem,
}: ItemProps) {
  return (
    <div
      className={cn(
        'group min-h-[27px] text-sm py-1 pr-3 w-full flex items-center text-muted-foreground font-medium',
        isActive && 'bg-neutral-200'
      )}
      onClick={onClick}
      role="button"
      style={{ paddingLeft: '12px' }}
    >
      {/* Iconに{}がないのは中身がコンポーネントだから。{}は値を埋め込むときに使う */}
      <Icon
        onClick={onIconClick}
        className="shrink-0 w-[18px] h-[18px] mr-2 text-muted-foreground"
      />
      <span className="truncate">{label}</span>
      {trailingItem}
    </div>
  );
}
