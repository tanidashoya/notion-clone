//@supabase/supabase-js は Supabase の公式 JavaScript SDK（クライアントライブラリ）
import { createClient } from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { Note } from "@/modules/notes/note.entity";


//supabase という定数を作って、それを外部に**エクスポート（他のファイルから使えるように）**しています。
// createClient() を呼び出すことで、Supabaseの接続情報を持ったクライアントオブジェクトが作られます。
//このクライアントオブジェクトはプロジェクトURLとプロジェクトAPIキーの二つの引数を設定できる
//プロジェクトURLはSupabaseプロジェクトのAPIエンドポイント（入り口）を指す（supabaseのダッシュボード⇒settings⇒DataAPI）
//プロジェクトURLは公開URLとは別物で、公開URLの設定はVercelやVPSなどで行う
//プロジェクトAPIはSupabaseが提供するAPIを使うための認証用キー
//anon public key（公開用キー）: anon keyはフロントで使う公開キーですが、RLS（行レベルセキュリティ）で厳密に制御され、
//ユーザーがサインインしていればそのユーザーのJWTが紐づいた操作になります。
// service_role key（管理者キー）: すべての操作が可能(サーバー側だけで使用（絶対に公開しない）)サーバー側だけで使用（絶対に公開しない）:Supabaseの管理画面 → Project Settings → API 
//プロジェクトURL → どのSupabaseサーバーに接続するか
// APIキー → 接続の認証・権限管理
//これらは環境変数から読み込むのがセキュリティ上安全（アプリのルートディレクトリに.envファイルを作成）


//import.meta.env は Vite専用の環境変数読み込み方法
//Viteでは、VITE_ プレフィックスがついた環境変数だけがブラウザ側コードから参照できる
//※※※.gitignore に .env を必ず追加して、GitHubにアップロードしないようにする※※※
//管理者用のAPIキー（service_role key）は、サーバー側でのみ使用するため、ブラウザ側では参照できないようにしている
//つまりReact側のファイルに記述することはない
//Vite の場合、プロジェクトの ルートディレクトリに .env ファイルを作成して、そこに環境変数を記述する
//Database型を指定することで、データベースの構造を型安全に利用できる(supabaseCLIでテーブルの型生成を自動生成)
export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_API_KEY
);


//Supabaseのリアルタイム機能を使って、データベースの変更をリアルタイムで監視する機能を提供する関数
//callback:(payload:RealtimePostgresChangesPayload<Note>)=>void:コールバック関数の型定義
// RealtimePostgresChangesPayload<Note>型の引数を1つ受け取り
// 何も返さない（void）関数
//.channel("notes-changes") チャンネル名を指定（任意の文字列）※複数のリアルタイム接続を識別するために設定
//.on:イベントリスナーを登録するメソッド。「〜が起きた時に、この処理を実行して」という指示を出すもの
//onの第一引数postgres_changes: PostgreSQLデータベースの変更イベント（データベースに変更があるかを監視するイベント）
//onの第二引数: データベースの変更イベントの監視条件を細かく指定する設定オブジェク
//onの第三引数: 監視対象のイベントが発生した時に実行するコールバック関数
//.subscribe():チャンネルを実際に購読（監視）開始するメソッド
export const subscribe = (userId:string, callback:(payload:RealtimePostgresChangesPayload<Note>)=>void) => {
    return supabase
        .channel("notes-changes")
        .on<Note>("postgres_changes",
            {
                event:"*"     //監視対象のイベント（*:INSERT,UPDATE,DELETE,SELECT全部を表す）
                ,schema:"public"    //監視対象のスキーマ（テーブルを目的や機能ごとにグループ化（カテゴリ分け）する仕組み）※デフォルトではpublic
                ,table:"notes"      //監視対象のテーブル名
                ,filter:`user_id=eq.${userId}` //監視対象のフィルター（ユーザーIDが一致する行のみを監視）  
            },    
            callback  // ← callback関数を登録 ⇒ データベース変更イベントが発生した時に実行される
        )
        .subscribe();
};

//上記のsubscribe関数で作成したチャンネルを削除する関数(リアルタイム監視を終了する)
//RealtimeChannel型の引数を1つ受け取り
export const unsubscribe = (channel:RealtimeChannel) => {
    supabase.removeChannel(channel)
}


/*
・ポイント
service_role key:管理者権限を持つキー
　サーバー側の環境変数だけに置く（.env など）

　React（フロントエンド側）のコードには絶対に書かない
　ブラウザからは直接参照できない場所でのみ使用
anon key:公開用のキー
　Reactなどフロント側で使ってOK（ただしRLSでアクセス範囲を制御）

ユーザーがログインしていれば、anon keyで接続しつつ、
そのユーザーのJWTが一緒に送られ、RLSのルールに従って許可された操作だけが可能になる。

JWT:JSON Web Token(ユーザーの認証情報や属性情報を安全にやり取りするための「署名付きのデータ」)
例：eyJhbGciOiJIUzI1NiIsInR5cCI6...（ヘッダー（署名方式の情報）,ペイロード（ユーザーID、メールアドレス、権限など）,署名（改ざん防止用））
・Supabaseでの使われ方
　ユーザーがログインするとSupabaseがJWTを発行
　このJWTをリクエスト時にヘッダーに付けて送信
　Supabase側は署名を確認し、ユーザーが誰かを判断

RLS:Row Level Security（行レベルセキュリティ）(PostgreSQLの機能で、行レベルでアクセス制御を行う仕組み)
・Supabaseでの使われ方
　anon keyだけでは「誰がアクセスしているか」分からない
　JWTに含まれるユーザーIDを使ってRLSの条件式を評価
　条件に合わない行は返さない／更新できない

まとめると⇒
RLS（Row Level Security）は、ログイン中のユーザー情報（JWTの内容）と
データベース内の各行の値を照らし合わせて、「どの行を返すか」「どの行を更新・削除できるか」を制御する仕組み
*/




/**
 * Supabaseリアルタイム通信の仕組み
 * 
 * Q: なぜpayloadにデータベース変更情報が入っているのか？
 * A: subscribe()実行時はcallback関数を「登録」するだけで、実際の「実行」は後で行われるため
 * 
 * 1. 登録段階（subscribe実行時）
 *    .on("postgres_changes", {...}, callback)  // callback関数をSupabaseに登録（まだ実行されない）
 * 
 * 2. 実行段階（データベース変更時）
 *    誰かがノート作成 → データベースでINSERT → Supabaseが検知
 *    → changeData = { eventType: 'INSERT', new: {...}, old: null }   ⇒ データベース変更情報をsupabaseが自動的に生成（これがのちにcallback関数の引数として渡される）
 *    → callback(payload) // この瞬間にpayloadにデータが入る
 * 
 * 注意: payloadは単なる引数名（dataでも何でもOK）
 *       Supabaseの内部処理は自動的に行われる（コードには見えない）
 */