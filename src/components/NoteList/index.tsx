import { cn } from '@/lib/utils';
import { NoteItem } from './NoteItem';
import { useNoteStore } from '@/modules/notes/note.state';
import { useState } from 'react';


// interface は TypeScript の型定義をするためのもの
//関数の引数の中でも渡すことができる
//型定義の種類
// interface
// 主に「オブジェクトの形」を表すのに使う
// extends で継承できる
// 再定義してマージできる（拡張しやすい）
// type
// オブジェクト以外も表現できる（ユニオン型・タプルなど）
// &（交差型）で合成できる
// 再定義はできない（拡張は不可）

interface NoteListProps {
  layer?: number;
  parentId?: number;
}

export function NoteList({ layer = 0, parentId }: NoteListProps) {
  //noteStore.getAll() は noteStore の状態を取得するためのメソッド
  //useNoteStore() でグローバルステートからノート一覧を取得
  //取得したノート一覧を useState で管理
  const noteStore = useNoteStore();
  const [notes,setNotes] = useState(noteStore.getAll());

  return (
    <>
      {/* Layerが0の場合はページがありませんと表示 */}
      {/* cn:Tailwind や shadcn/ui でよく使われる クラス名結合のユーティリティ関数。(見やすく、書きやすくするため【 , 】がなくていいから) */}
      {/* cnの方にhiddenを入れている場合はつねにページがありませんが非表示になってしまっているのでは？ */}
      <p
        className={cn(
          `hidden text-sm font-medium text-muted-foreground/80`,
          layer === 0 && 'hidden'
        )}
        // Layerの階層が深い（値が高い）ほど、ページの左側に余白を追加
        //「layer の値によって paddingLeft を動的に変える」ために style を使ってる。
        //「計算で変わる値」（layer * 12 + 25 みたいな可変値）は Tailwind だと表現しづらい
        style={{ paddingLeft: layer ? `${layer * 12 + 25}px` : undefined }}
      >
        ページがありません
      </p>
      {/* ノート一覧を表示 */}
      {/* Layerは常に0でNoteItemに渡される？ */}
      {notes.map((note) => {
        return (
          <div key={note.id}>
            <NoteItem note={note} layer={layer} />
          </div>
        );
      })}
    </>
  );
}
