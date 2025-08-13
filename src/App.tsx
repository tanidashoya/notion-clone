// ---- exportの使い分け ----
// export default: ファイル内で1つだけ出す「メイン」のコンポーネント/関数用。
//   → インポート時は {} 不要、名前は自由に変更可。
// export function / export const: 名前付きエクスポート。複数の値を出すときに使う。
//   → インポート時は {} 必須、名前は一致させる（変更は as）。
import { BrowserRouter,Routes,Route } from "react-router-dom"
import Layout from "./Layout"
import { Home } from "./pages/Home"
import NoteDetail from "./pages/NoteDetail"
import Signin from "./pages/Signin"
import Signup from "./pages/Signup"
import { useState,useEffect } from "react"
import { useCurrentUserStore } from "./modules/auth/current-user.state"
import { authRepository } from "./modules/auth/auth.repository"
import { User } from "@supabase/supabase-js"

// 親ルートがマッチすると、まず親ルートの element (<Layout/>) が描画される。
// <Layout/> の中には共通UI（<Header/> や <Footer/>、<Sidebar/> など）があり、
// さらに <Outlet/> が配置されている。
// <Outlet/> の位置に、そのときマッチした子ルートの element が差し込まれる。
// 例えば URL が "/" なら <Home/>、"/notes/:id" なら <NoteDetail/> が <Outlet/> に表示される。
function App() {

  //データの読み込み流加を管理する状態
  const [isLoading,setIsLoading] = useState(true);
  //グローバルな状態を管理するためのカスタムHook
  const currentUserStore = useCurrentUserStore();
  
  //ログインしているユーザーの情報を取得するHook
  const setSession = async() => {
    const currentUser = await authRepository.getCurrentUser();
    currentUserStore.set(currentUser as User);
    setIsLoading(false);
  }

  //第二引数[]:コンポーネントが初回マウントされた直後に1回だけ実行
  //ページをリロードしたり、ブラウザを閉じて再度開いた場合は「初回マウント扱い」
  useEffect(() => {
    setSession();
  },[]);

  //データの読み込みが完了するまでは、グローバルステートのユーザー情報が入っていないのでコンポーネントを表示しないようにする
  //falseになることでメインのコンポーネントが表示される。
  if (isLoading) return <div/>;

  //path="/" が最初にレンダリング
  //現在のURLが / にマッチするから 最初にそれがレンダリング
  return (
    <BrowserRouter>
      <div className="h-full">
        <Routes>
          <Route path="/" element={<Layout />} >
            <Route index element={<Home />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
          </Route>
          <Route path="/signin" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
