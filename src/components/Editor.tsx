//blocknoteライブラリ
// :Notion や Block Editor（WordPress）に近い操作性 を React アプリ内で実現できる。
import { ja } from "@blocknote/core/locales";
import { useCreateBlockNote } from '@blocknote/react';
import '@blocknote/mantine/style.css';
import { BlockNoteView } from '@blocknote/mantine';

interface EditorProps {
  onChange: (value: string) => void;
  initialContent?: string | null;
}


//Notion のようなリッチテキストエディターを作るためのコンポーネント
function Editor({ onChange, initialContent }: EditorProps) {
  //useCreateBlockNoteは、React用のカスタムフックで、BlockNoteエディターのインスタンスを作成するためのもの
  //引数でデータと昨日を定義
  const editor = useCreateBlockNote({
    dictionary: ja, //日本語で表示
    initialContent: //最初に表示する内容
    //JSON.parse(initialContent) : json形式のデータをjavascriptのオブジェクトに変換する
    initialContent != null ? JSON.parse(initialContent) : undefined,
  });

  //BlockNoteView:blocknoteのエディターを表示するためのコンポーネント
  //BlockNoteViewの役割
  //editorインスタンスの状態を読み取って画面に表示
  //ユーザーの操作をeditorインスタンスに伝達
  //editorの変更を監視して自動的に画面更新

  return (
    <div>
      {/* BlockNoteViewはeditorオブジェクトからデータ構造を読み取って、見やすいUIに変換するコンポーネント */}
      {/* editorプロパティに渡しているオブジェクトのtypeキーとcontentキーによってUIと内容を表示する */}
      <BlockNoteView editor={editor}
      //editor.documentのcontentキーは入力のたびに値が変わる
      
      //元データ: JavaScriptオブジェクト（editor.document）
      //JSON.strinfy(変換処理): オブジェクト → JSON文字列
      //データベースに保存するためにJSON文字列に変換する（オブジェクトはデータベースに保存できないため）
      //onChangeイベントにpropsで渡したonChange関数を渡している
       onChange={() => onChange(JSON.stringify(editor.document))}
       />
    </div>
  );
}

export default Editor;
