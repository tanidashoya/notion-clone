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
}


