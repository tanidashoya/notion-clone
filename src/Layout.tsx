import { Outlet, Navigate } from 'react-router-dom';
import SideBar from './components/SideBar';
import { SearchModal } from './components/SearchModal';
import { useCurrentUserStore } from './modules/auth/current-user.state';
import { useNoteStore } from './modules/notes/note.state';
import { useEffect, useState } from 'react';
import { noteRepository } from './modules/notes/note.repository';

const Layout = () => {

  //{currentUser}のように{}で囲むことで、useCurrentUserStore() が返す オブジェクトの currentUser プロパティだけを変数として取り出している
  //set は取り出していないので、その変数はこのスコープでは使えません
  const {currentUser} = useCurrentUserStore();
  const noteStore = useNoteStore();
  const [isLoading, setIsLoading] = useState(true);

  // この時点ではnoteRepository.findメソッドにparentDocumentIDが渡されていないので、ルートドキュメントのノートを取得
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
      {!isLoading && <SideBar onSearchButtonClicked={() => {}} />}
      <main className="flex-1 h-full overflow-y-auto">
        <Outlet />
        <SearchModal
          isOpen={false}
          notes={[]}
          onItemSelect={() => {}}
          onKeywordChanged={() => {}}
          onClose={() => {}}
        />
      </main>
    </div>
  );
};

export default Layout;
