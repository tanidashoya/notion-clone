import { Outlet, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import { SearchModal } from './components/SearchModal';
import { useCurrentUserStore } from './modules/auth/current-user.state';
import { useNoteStore } from './modules/notes/note.state';
import { useEffect, useState } from 'react';
import { noteRepository } from './modules/notes/note.repository';
import { Note } from './modules/notes/note.entity';

const Layout = () => {

  //{currentUser}のように{}で囲むことで、useCurrentUserStore() が返す オブジェクトの currentUser プロパティだけを変数として取り出している
  //set は取り出していないので、その変数はこのスコープでは使えません
  const {currentUser} = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isShowModal,setIsShowModal] = useState(false);
  const [searchResult,setSearchResult] = useState<Note[]>([]);  


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

  //初回マウント時にノートを取得
  useEffect(() => {
    fetchNotes();
  }, []);

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
          onItemSelect={() => {}}
          onKeywordChanged={searchNotes}
          onClose={() => setIsShowModal(false)}
        />
      </main>
    </div>
  );
};

export default Layout;
