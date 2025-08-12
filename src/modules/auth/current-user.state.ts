//アプリ全体で「現在ログインしているユーザー情報（User 型）」を管理・取得・更新できるようにする仕組み

//atom ⇒　Jotaiの基本単位。「状態（値）」をグローバルに保存するためのオブジェクトを作る関数
//useAtom ⇒　Reactのコンポーネント内で atom の値を使用（読み書き）するためのフック。
import { atom, useAtom } from "jotai";
//User は Supabase が定義している「ユーザー情報の型」 。
// Supabase でログインやサインアップを行うと、レスポンスとして ユーザー情報のオブジェクト が返ってくる。
//"@supabase/supabase-js" は Supabaseが公式で提供しているJavaScriptクライアントライブラリのパッケージ名 
import { User } from "@supabase/supabase-js";

//atom の作成
//currentUserAtom は アプリ全体で共有できる「現在のユーザー」用のグローバル状態。
// <User> という型を付けているので、このatomには User 型のオブジェクトだけ を入れられる。
//User型のデータを入れるグローバルな状態を作っている(「User 型の値を入れる箱」を作成)
const currentUserAtom = atom<User>();


//ユーザー情報を持ったグローバルな状態（currentUserAtom）」 を
// Reactコンポーネント内で読み書きできるようにするためのカスタムHook
//オブジェクトを返している（useAtom は配列 [state, setState] を返しますが、
// そのまま配列で返すと「どっちが値でどっちが更新関数なのか」が分かりづらいため）
export const useCurrentUserStore = () => {
    //useAtom は 「今の atom の状態」 と 「その状態を更新する関数」 の 2つを配列で返す（React の useState と同じ形）
    const [currentUser,setCurrentUser] = useAtom(currentUserAtom);
    //オブジェクトのキー名を明示的に指定している書き方(状態更新関数を呼び出すときに簡潔に書けるから)
    //指定しなければ、 { currentUser : currentUser, setCurrentUser : setCurrentUser }のようにキーと値が同じ
    return {currentUser,set:setCurrentUser}
}



// const currentUserStore = useCurrentUserStore();
// //オブジェクトの値を取り出している
// currentUserStore.set(userData);
// currentUserStore.currentUser;




/*

・useAtomの基本的な書き方

const [value, setValue] = useAtom(myAtom);

value → 今の myAtom の中身（状態の値）
setValue → その値を更新する関数
これだけで、myAtom が持っている値を読み書きできます。
*/






/*
ユーザー情報のオブジェクトは、以下のような構造を持っている。

{
  id: "12345678-aaaa-bbbb-cccc-1234567890ab",
  email: "test@example.com",
  user_metadata: {
    name: "Taro"
  },
  created_at: "2025-08-12T12:34:56Z"
}

*/