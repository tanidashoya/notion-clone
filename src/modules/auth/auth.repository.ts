//ユーザー登録
//Supabase を使ったサインアップ（新規ユーザー登録）処理
import { supabase } from "../../lib/supabase";


//呼び出し元から渡された3つの値(name,email,password)を使う。
//Supabaseのauth.signUp()メソッドにメール・パスワード・名前を渡す。
//結果が返ってくると、data に成功時の情報、error に失敗時の情報が入る
export const authRepository = {
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
