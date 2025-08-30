import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import { SearchModal } from './components/SearchModal';
import { useCurrentUserStore } from './modules/auth/current-user.state';
import { useNoteStore } from './modules/notes/note.state';
import { useEffect, useState } from 'react';
import { noteRepository } from './modules/notes/note.repository';
import { Note } from './modules/notes/note.entity';
import { subscribe, unsubscribe } from './lib/supabase';

const Layout = () => {

  //{currentUser}のように{}で囲むことで、useCurrentUserStore() が返す オブジェクトの currentUser プロパティだけを変数として取り出している
  //set は取り出していないので、その変数はこのスコープでは使えません
  const {currentUser} = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isShowModal,setIsShowModal] = useState(false);
  const [searchResult,setSearchResult] = useState<Note[]>([]);  
  const navigate = useNavigate();


  // この時点ではnoteRepository.findメソッドにparentDocumentIDが渡されていないので、ルートドキュメントのノートを取得
  //このルート親ノートは常に表示されている
  //なぜならノートをつかさどるグローバルステートを更新する関数が古いものに新しいものを足す構造であるため
  //const combinedNotes = [...oldNotes,...newNotes];
  const fetchNotes = async () => {
    setIsLoading(true);
    const notes = await noteRepository.find(currentUser!.id);
    if (notes == null) {
      setIsLoading(false); 
      return;
    }
    noteStore.set(notes);
    setIsLoading(false);
  }

  const searchNotes = async (keyword:string) => {
    setIsLoading(true);
    const notes = await noteRepository.findByKeyword(currentUser!.id,keyword);
    if (notes == null) {
      setIsLoading(false); 
      return;
    }
    noteStore.set(notes);
    setSearchResult(notes);
    setIsLoading(false);
    // if (searchResult.length > 0) {
    //   setSearchResult(notes);
    // }
  }

  const moveToDetail = (noteId:number) => {
    navigate(`/notes/${noteId}`);
    setIsShowModal(false);
  }

  //payload:payloadはRealtimePostgresChangesPayload<Note>型のオブジェクトで、データベースの変更情報が入っている
  //payloadは「どのように変更されるかを定義している」のではなく、「実際に変更が起きた後の結果情報」
  //データベースが変更されたときに変更情報を接続されているアプリにpayloadとして送っている
  const subscribeNote = () => {
     if (currentUser == null) return; // null と undefined の両方をチェック
     // callback関数:(payload) => { console.log(payload) }
     // → 親が「データが来たらこうしてね」と子に渡した処理。
     // → 子はイベントを受け取ったら必ずこの関数を実行する。
     //リアルタイム通信でsupabaseから送られてくる情報の構造はこのページの下記に記している
     return subscribe(currentUser!.id, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          noteStore.set([payload.new]);
        }else if (payload.eventType === 'DELETE') {
          noteStore.delete(payload.old.id!);
        }
     });

   };
  
  
  //初回マウント時にノートを取得
  //udemy講座では第二引数（依存配列）に渡しているのは[]だったが
  //そうするとsubscribeNote関数がcurrentUser==undifinedで条件一致してしまい、処理が実行されないため、currentUserにしている
  useEffect(() => {
    fetchNotes();
    const channel = subscribeNote(); //RealtimeChannnelオブジェクトを解除操作に渡すための変数channelに格納している
    // コンポーネントがアンマウントされる時に、チャンネルを削除する
    // チャンネルを削除することで、リアルタイム通信を停止する
    //クリーンアップ関数：useEffect内のreturnで返される関数は、コンポーネントがアンマウントされる時に実行される
    //
    return () =>{
      unsubscribe(channel!);
    }
  }, [currentUser]);



  //const currentUserAtom = atom<User>();で初期値なしの場合、currentUserはundefinedになる
  // if (currentUser == null){ が == nullの場合(緩い比較)ではtrueに貼るが、 === nullの場合(厳密な比較)ではfalseになる
  // <Navigate to="/signin" />　 → React Router のコンポーネント。指定したパスに画面遷移（リダイレクト）させる。
  //Link → ユーザーがクリックしたら、指定したパスに遷移する。
  //Navigate → ユーザーがログインしていない場合、指定したパスに遷移する。（レンダリングの時点でプログラム的に強制的に遷移させる）
  //レンダリング → コンポーネント関数を実行して 仮想DOM を作る（まだブラウザには出ていない）
  // マウント → 作られた仮想DOMをもとに 実DOMに反映 してブラウザに表示する （ブラウザに表示される）
  // replace → 履歴を残さずに /signin に移動
  if (currentUser == null){
    return <Navigate replace to="/signin" />;
  }

  return (
    <div className="h-full flex">
      {/* ローディング中はSideBarを表示しない(notesの取得が終わっていないため) */}
      {/* 検索モーダルを表示するための関数を渡す(propsにはonSearchButtonClickedという名前で渡す) */}
      {!isLoading && <SideBar onSearchButtonClicked={() => setIsShowModal(true)} />}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
        <SearchModal
          isOpen={isShowModal}
          notes={searchResult}
          onItemSelect={moveToDetail}
          onKeywordChanged={searchNotes}
          onClose={() => setIsShowModal(false)}
        />
      </main>
    </div>
  );
};

export default Layout;



/*
リアルタイム通信でsupabaseのデータベースが変更された時に、payloadとして送られてくるデータベースの変更情報

{schema: 'public', table: 'notes', commit_timestamp: '2025-08-25T12:43:24.340Z', eventType: 'INSERT', new: {…}, …}
commit_timestamp
: "2025-08-25T12:43:24.340Z"
errors: null
eventType: "INSERT"

更新・追加される情報の場合はこちら
new: 
content: null
created_at: "2025-08-25T12:43:24.337313+00:00"
id: 134
parent_document: null
title: null
user_id: "33747583-bc95-41d6-ba50-92ee7c758618"
[[Prototype]]: Object

削除される情報の場合はこちら
old: {
content: null
created_at: "2025-08-25T12:43:24.337313+00:00"
id: 134
parent_document: null
title: null
user_id: "33747583-bc95-41d6-ba50-92ee7c758618"
[[Prototype]]: Object
}


schema: "public"
table: "notes"
[[Prototype]]: Object

*/