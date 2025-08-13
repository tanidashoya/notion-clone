//@supabase/supabase-js は Supabase の公式 JavaScript SDK（クライアントライブラリ）
import { createClient } from "@supabase/supabase-js";


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
export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_API_KEY
);


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