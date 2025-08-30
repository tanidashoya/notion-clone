// noteの詳細ページを表示するコンポーネント
//タイトルの入力コンポーネントとエディターコンポーネントを表示する

import { TitleInput } from '@/components/TitleInput';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { noteRepository } from '@/modules/notes/note.repository';
import { useCurrentUserStore } from '@/modules/auth/current-user.state';
import { useNoteStore } from '@/modules/notes/note.state';
import Editor from '@/components/Editor';

const NoteDetail = () => {

  //useParams():URLのパラメータを取得するためのフック
  //useParams()の戻り値は、URLのパラメータをキーと値のペアのオブジェクトとして返す
  //例：URL: /users/100/posts/200 → params = { userId: "100", postId: "200" }
  // parseInt は 文字列を整数に変換するための関数
  const params = useParams();
  const id = parseInt(params.id!);
  const {currentUser} = useCurrentUserStore();
  const [isLoading,setIsLoading] = useState(false);
  const noteStore = useNoteStore(); 
  //最初の段階ではnoteはundefinedになる⇒fetchoneが実行されてグローバルステートにURLに対応するノートが入る
  //再レンダリング後に、noteStore.getOneメソッドによって、URLに対応したノートのみnoteとして取得される（）
  const note = noteStore.getOne(id);

  //特定のノートを1件取得してグローバルステートに設定する機能
  //このメソッドの役割は最終的にこのメソッドによってグローバルステートに渡したURLのIDと一致するノートをnoteStore.getOneによって取得するため（上記のnote）
  const fetchOne = async() => {
    setIsLoading(true);
    // 「TypeScriptに対してこの値はnullやundefinedではないことを断言する」演算子:!
    //idはurlのidから渡されている
    const note = await noteRepository.findOne(currentUser!.id,id);
    if (note == null) {
      setIsLoading(false);
      return;
    }
    noteStore.set([note]);
    setIsLoading(false);
  }

  // URLのパラメータが変わったら、fetchOneが実行されてデータを取得する
  //fetchOneによってグローバルステートが更新されると自動的に再レンダリングが実行される
  useEffect(() => {
    fetchOne();
  },[id]);

  if (isLoading) return <div/>
  if (note == null) return <div>ノートが見つかりません</div>
  //コンソールに４つのデータを出力される理由
  //1回目: 初回レンダリング（note = undefined）
  // 2回目: setIsLoading(true)による再レンダリング
  // 3回目: noteStore.set([note])による再レンダリング
  // 4回目: setIsLoading(false)による再レンダリング
  // このようにレンダリングされるたびに実行されるため
  console.log(note);

  // supabase上のnotesテーブルのデータを更新・グローバルステートの更新を行う
  const updateNote = async(
    id:number,note:{title?:string, content?:string}
  )=> {
    const updateNote = await noteRepository.update(id,note);
    //データベースの更新処理が失敗した場合return（失敗したら何もしませんよ）
    if (updateNote == null) return;
    //更新したノートをグローバルステートに追加している
    //グローバルステートに既存の同じidを持つオブジェクトは更新される
    noteStore.set([updateNote]);
    return updateNote;
  }

  return (
    <div className="pb-40 pt-20">
      <div className="md:max-w-3xl lg:md-max-w-4xl mx-auto">
        {/* titleにはinputが変更された値が入ってくる */}
        {/* ノートのタイトルを更新するために、onTitleChangeを渡している */}
        {/*  */}
        <TitleInput
          initialData={note}
          onTitleChange={(title) => updateNote(id,{title})}
        />
        {/*ノートの内容を入力のたびにJSON.stringify(editor.document)がcontentに入る  */}
        <Editor
          initialContent={note.content}
          onChange={(content)=>updateNote(id,{content})}
        />
      </div>
    </div>
  );
};

export default NoteDetail;
