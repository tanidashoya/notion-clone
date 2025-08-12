//ユーザー登録
//Supabase を使ったサインアップ（新規ユーザー登録）処理
import { supabase } from "../../lib/supabase";


//呼び出し元から渡された3つの値(name,email,password)を使う。
//Supabaseのauth.signUp()メソッドにメール・パスワード・名前を渡す。(ここでのsignUPはsupabase.auth.signUp() は 
// @supabase/supabase-js という公式 JavaScript クライアントライブラリに含まれている 認証用の関数)
//結果が返ってくると、data に成功時の情報、error に失敗時の情報が入る
//※authRepositoryはオブジェクト（authRepository というオブジェクトの“中に” signUp メソッドを定義）
//signUp() を呼ぶと結果は呼び出し元に返るだけで、authRepository 自体は何も覚えていない（＝ステートレス）


export const authRepository = {
    //signUp メソッドを呼び出すと、内部で supabase.auth.signUp() が実行される
    //supabase.auth.signUp() 関数は Promise を返し、その中に「成功時のデータ」と「エラー情報」がセットになったオブジェクトが入っている。
    //このメソッドの流れ：
    //引数（name, email, password）は Supabase Auth サーバーに送信され、Authのユーザーテーブルに登録される
    //登録成功後、Supabaseから返ってきた data.user（ユーザー情報）を加工して呼び出し元に返している
    //そのため、呼び出し元では登録直後のユーザーID・メール・name などがすぐ使える
    async signUp(name: string, email: string, password: string) {
        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {data: {name},},
        });

        //エラーハンドリング
        //エラーがnullでない、または、ユーザーがnullである場合エラーを投げる
        //throwは 例外を発生させるためのキーワード
        //呼び出し元にエラーを投げる → 呼び出しもとでエラーをtry-catchして処理する
        //new Error(error?.message)⇒この新しく生成されたエラーオブジェクトが呼び出し元のcatchブロックにeとして渡される
        if (error !== null || data.user === null) {
            throw new Error(error?.message);
        }

        //data.user は Supabase の signUp() が返す ユーザー情報オブジェクト
        //data.user には Supabaseが新規登録時に作ったユーザー情報 が格納されていて、
        // その中に「渡した email」と「渡した name（metadata経由）」は入っていますが、password は含まれていない。
        //実際の data.user の例
        // サインアップ直後の data.user は例えばこんな形になります👇
        // {
        //   id: "uuid-xxxx",                       // ユーザーID（自動生成）
        //   email: "test@example.com",              // ← 渡した email
        //   user_metadata: { name: "Taro" },        // ← 渡した name
        //   created_at: "2025-08-10T12:34:56Z",    // ユーザー作成日時(今回は渡していないので入っていない)
        //   ・
        //   ・
        //   ・
        // }

        //...data.user → 元のオブジェクトを展開してすべてのプロパティを残す
        // userName → user_metadata.name の値を直接参照できるように、新しいプロパティとして追加
        return {
            ...data.user,
            userName:data.user.user_metadata.name,
        }
    },

    //ログイン
    //signInWithPassword() は Auth のユーザーデータベースを直接SELECTするのではなく、
    //Supabase Auth サーバーに「このメールとパスワードでログインしていいか」を問い合わせ、
    // 成功すれば data.user にユーザー情報＋data.session にトークンを返します。
    async signIn(email: string, password:string) {
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        //オプショナルチュイニング演算子?.⇒ 左側 (error) が null または undefined の場合 → undefined を返す
        //左側がオブジェクトの場合 → その中の message プロパティを返す
        if (error !== null || data.user === null) {
          throw new Error(error?.message);
        }
        
        return {
          ...data.user,
          userName:data.user.user_metadata.name,
        }
    }
}


/*
・エラーハンドリング
function divide(a: number, b: number) {
  if (b === 0) {
    throw new Error("0で割ることはできません");
  }
  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (e) {
  console.error("エラーが発生:", e);
}
b が 0 のときに throw でエラーを発生

try 内の処理はそこで中断され、catch に処理が移る
*/

//非同期処理とSPA
//SPAなら戻るボタンを押してもサインアップ処理は進む。
// ただし、登録後に行うフロント側の処理はキャンセルされることがある。
// ページ再読み込みが伴う場合は途中で中断される可能性がある。


/*
signUp() の返り値のデータ構造(signInWithPassword() ではsessionも返るが基本的な構造は同じ)

1. 成功時

{
  "data": {
    "user": { "id": "uuid-xxxx", "email": "test@example.com" },
    "session": null
  },
  "error": null
}

data.user → ユーザー情報（null ではない）
error → null

2. 失敗時

{
  "data": {
    "user": null,
    "session": null
  },
  "error": {
    "message": "User already registered",
    "status": 400
  }
}

data.user → null
error → エラーオブジェクト

*/