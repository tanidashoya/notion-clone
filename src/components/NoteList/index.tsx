/*
index.tsx (NoteListコンポーネント)
このコンポーネントはノート一覧を表示する親コンテナとして機能しています：
階層的なノート表示: layerパラメータによって、ノートの階層構造を視覚的に表現
空状態の処理: ノートがない場合に「ページがありません」メッセージを表示
子ノート作成機能: 新しい子ノートを作成するcreateChild関数を提供
グローバル状態管理: useNoteStoreを使用してノート一覧の状態を管理
*/

import { cn } from '@/lib/utils';
import { NoteItem } from './NoteItem';
import { useNoteStore } from '@/modules/notes/note.state';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { noteRepository } from '@/modules/notes/note.repository';
import { Note } from '@/modules/notes/note.entity';
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

//最初にNoteListコンポーネントが呼ばれた時はlayer=0,parentId=null
export function NoteList({ layer = 0, parentId }: NoteListProps) {
  //noteStore.getAll() は noteStore の状態を取得するためのメソッド
  //useNoteStore() でグローバルステートからノート一覧を取得
  //notesはグローバルステートのノート一覧を取得している（変更があれば
  // 自動で更新される）
  const noteStore = useNoteStore();
  const notes = noteStore.getAll();
  const {currentUser} = useCurrentUserStore();
  //状態は「キーが Number、値が boolean の Map 型」であると宣言している
  //Map型は、キーと値のペアを管理するデータ構造で、キーの一意性を保証しながら値を管理できる
  const [expanded, setExpanded] = useState<Map<Number, boolean>>(new Map());

  // currentUser!.id:currentUserがnullでないことを確認してからidを取得

  // 子ノートを作成する関数
  //e:クリックイベントオブジェクト
  //e.stopPropagation(); を呼ぶと、イベントのバブリング（親要素への伝播）を止めることができる
  const createChild = async(e:React.MouseEvent,parentId:number) => {
    e.stopPropagation();
    const newNote = await noteRepository.create(currentUser!.id,{parentId})
    //setはNote型の配列を受け取るため、newNoteを配列に入れている
    noteStore.set([newNote])
    //ローカル状態も更新して画面に即座に反映
    //ここでのsetはMap型のsetメソッドを呼び出している（キー,値のペアを追加する）
    //子ノートを追加すると親ノートが展開されるようにする
    setExpanded((prev)=>prev.set(parentId,true));
  };

  //子ノートを取得する関数
  //この関数かcreateChild関数が実行されて初めて子ノートが取得されてグローバルステートに渡されて表示される
  const fetchChildren = async(e:React.MouseEvent, note:Note) => {
    e.stopPropagation();
    const children = await noteRepository.find(currentUser!.id,note.id)
    if (children == null) return;
    //子ノートが取得できたら、子ノートをグローバルステートに更新
    noteStore.set(children);
    // Reactの不変性原則に従い、新しいMapを作成して展開状態を更新
    setExpanded((prev)=>{
      const newExpanded = new Map(prev); // 既存Mapのコピーを作成
      //オブシェクトではobj.nameやobj["name"]でアクセスできるが、Mapではgetメソッドを使う
      newExpanded.set(note.id,!prev.get(note.id));
      return newExpanded;
    })
  } 
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
      {/* 最初の画面ではparentIdがundefinedなので、filterではnullがフィルタリングされる */}
      {/* 親ノートのIDがparentId（）【初期状態ではundefined】と一致するノートをフィルタリング */}
      {/* 最初の呼び出しNoteList（SideBar/index.tsx 45行目）ではparentIdがundefinedなので、filterではnullがフィルタリングされる */}
      {/* グローバルステートにも最初にparent_documentがnullのノート(ルートノート)が入っている */}
      {notes
      .filter((note)=>note.parent_document == parentId)
      .map((note) => {
        return (
          <div key={note.id}>
            {/* createChild関数にクリックイベントeと親ノートのidを渡す（親ノートのidがparentIdになる） */}
            <NoteItem 
              note={note} 
              layer={layer} 
              onCreate={(e)=>createChild(e,note.id)} 
              expanded={expanded.get(note.id)}
              onExpand={(e:React.MouseEvent)=>fetchChildren(e,note)}
            />
            {/* 
            再帰コンポーネントは生成されるが次のグローバルステートの更新まで空のまま待機している状態
            全てのNoteListコンポーネント（再帰含む）が同じグローバルステートを監視しているため、
            fetchChildrenでグローバルステートが更新されると、該当するparentIdを持つ再帰コンポーネントが
            自動的に新しいデータでフィルタリングを再実行し、子ノートの表示を開始する
            */}
            {/* note.id:親ノートのidを渡すことで、その親ノートの子ノートを取得する */}
            {expanded.get(note.id) && (
              <NoteList layer={layer + 1} parentId={note.id} />
            )}
          </div>
        );
      })}
    </>
  );
}


/*
再帰コンポーネントの動作

親ノート(parent_document=null,parentId=undefined) の表示
↓
onExpand → fetchChildren(e, note) → 子ノート取得（parent_document=1）
↓
グローバルステート更新
↓
<NoteList parentId={1} /> → filter(parent_document == 1) → 子ノート表示
*/



/*
各親ノートが独立した再帰ツリーを持つ
 {notes
      .filter((note)=>note.parent_document == parentId)
      .map((note) => {
        return (
          <div key={note.id}>
            <NoteItem 
              note={note} 
              layer={layer} 
              onCreate={(e)=>createChild(e,note.id)} 
              onExpand={(e:React.MouseEvent)=>fetchChildren(e,note)}
            />
            <NoteList layer={layer + 1} parentId={note.id} />
          </div>
        );
      })}
    </>
  );
}

このコードの.mapによって各ノートごとに独立した処理が実行されるから、
各親ノートが独立した再帰ツリーを持つ

*/