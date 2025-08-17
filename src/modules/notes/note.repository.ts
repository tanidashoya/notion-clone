//supabaseのnotes テーブルに新しいノート（行）を追加する処理」insert:データを追加する、挿入する、差し込む
import { supabase } from "../../lib/supabase";

export const noteRepository = {
    //.insert() に渡すオブジェクトのキーは、Supabase の該当テーブルのカラム名と完全に一致している必要がある
    //今回の例だと notes テーブルのカラム名は以下の通り。
    // user_id, title, parent_document（ほかに id, content, created_at などもある）
    //.select():挿入したノートの情報を取得（selectだけでは挿入したレコードが1件でも、配列で返ってくるので、single()で1件だけ取得）
    //.single():挿入したノートの情報を1件だけ取得
    //.single()がない場合は下記のようにリスト付きで返ってくる。（.singleがあればリストのないオブジェクト）
    //[
    //   {
    //     id: 42,
    //     title: "テスト",
    //     user_id: "abc123",
    //     parent_document: 1,
    //     content: null,
    //     created_at: "2025-08-14T12:34:56.789Z"
    //   }
    // ]
    async create(
        userID:string,
        //title,parentIdは仮に引数として渡さなくても大丈夫なようにオプショナル
        params:{title?:string,parentId?:number}
    ){
        const {data,error} = await supabase.from("notes").insert([
            {
                //ノートを作成したユーザーID
                user_id:userID,
                //ノートのタイトル
                title:params.title,
                //ノートの親ドキュメントID
                parent_document:params.parentId
            },
        ]).select().single();

        if (error != null) throw new Error(error?.message);
        return data;
    },

    //userIDを渡すことでログインしているユーザーのノートを取得
    //parentDcumentIDを渡すことで親ドキュメントIDを指定してノートを取得
    //.eq():Notesのuser_idカラム（第一引数）がuserID（第二引数）と一致するデータを取得
    //{ascending:false}:降順に並び替え
    //.select() の戻り値:基本的に 配列（リスト）で返ってくる
    // 1. クエリビルダーを作成（まだ実行されない）:const query = supabase.from("notes").select()
    // 2. フィルターや並び替えを追加してクエリを組み立てる
    // 3. await を付けて初めて実行 → データが返る
    async find(userID:string,parentDocumentID?:number) {
        const query = supabase
            .from("notes")
            .select()
            .eq("user_id",userID)
            .order("created_at",{ascending:false});
            //parentDocumentIDがnullでない場合は、parent_documentカラムがparentDocumentIDと一致するデータを取得。nullの場合はそのままdataがqueryとなる
            const {data} = 
                parentDocumentID != null
                //parent_document カラムが parentDocumentID と一致するデータだけを取得する
                // ノートをクリックしたときにその id が parentDocumentID として渡される
                // parent_document = parentDocumentID の子ノートを取得し、UI 上で展開する
                //.eq:通常の値（数値・文字列など）を比較するときに使う
                //.is: null や undefined を含むような値（主に null）を比較するときに使う
                 ? await query.eq("parent_document",parentDocumentID)
                 // parent_document カラムが null のデータだけを取得
                // (parentDocumentID が渡されていなければルートドキュメントのノートを取得する)⇒最初の子ノートを展開していないときの親ノート一覧を取得
                //notesテーブルのparent_dosumentカラムの値がnullということはそれが最も親のノートとなるため
                  : await query.is("parent_document",null);
            return data
    }
}


