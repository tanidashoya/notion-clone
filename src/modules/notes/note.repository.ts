//supabaseのnotes テーブルに新しいノート（行）を追加する処理」insert:データを追加する、挿入する、差し込む
import { supabase } from "../../lib/supabase";

export const noteRepository = {
    //.insert() に渡すオブジェクトのキーは、Supabase の該当テーブルのカラム名と完全に一致している必要がある
    //今回の例だと notes テーブルのカラム名は以下の通り。
    //user_idには現在ログイン中のuserのidが入る
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
    //insertでデータを追加する場合は引数に渡されるのは現在のテーブルのculumn名に対応する引数
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
                //ノートの親ドキュメントID（引数に渡された親のidがparentIdになる）
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
            //Layoutの初めの状態で呼び出されるときにはparentDocumentIDはnull（特に渡されず）parent_IDがnullのノート（ルート親ノート）を取得
            const {data} = 
                parentDocumentID != null
                //parent_document カラムが parentDocumentID と一致するデータだけを取得する
                // ノートをクリックしたときにその id が parentDocumentID として渡される
                // parent_document = parentDocumentID の子ノートを取得し、UI 上で展開する
                //.eq:通常の値（数値・文字列など）を比較するときに使う
                //.is: null や undefined を含むような値（主にnull）を比較するときに使う
                 ? await query.eq("parent_document",parentDocumentID)
     
                 // parent_document カラムが null のデータだけを取得
                // (parentDocumentID が渡されていなければルートドキュメントのノートを取得する)⇒最初の子ノートを展開していないときの親ノート一覧を取得
                //notesテーブルのparent_dosumentカラムの値がnullということはそれが最も親のノートとなるため
                  : await query.is("parent_document",null);
            return data
    },

    //textSearch:テキスト検索を行う
    //.textSearch("title",keyword):notesテーブルのtitleカラムにkeywordが含まれるデータを取得
    //.eq("user_id",userID):notesテーブルのuser_idカラムがuserIDと一致するデータを取得
    async findByKeyword(userID:string,keyword:string){
        const {data} = await supabase
            .from("notes")
            .select()
            .eq("user_id",userID)
            //or:OR条件を指定する
            //.ilike:完全一致を検索する（大文字小文字を区別せずに検索するメソッド）
            //%${keyword}%:keywordの前後に%を付けることで部分一致を検索する
            //.orをつけることで（）内の,で区切ることでOR条件を指定する
            //or:少なくともどちらかを満たすレコードを取得する
            .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
            .order("created_at",{ascending:false});
        return data;
    },

    //ノートの詳細を取得する関数
    async findOne(userId:string, id:number) {
        const {data} = await supabase.from("notes").select().eq("id",id).eq("user_id",userId).single();
        return data;
    },

    //noteの内容を更新するメソッド
    // updateの引数にはnotesテーブルにおいて更新したいclolumについてオブジェクトで渡す
    //database.type.tsで定義されているオブジェクトの型を渡す（Update）
    //updateは引数に渡されたオブジェクトのキー名と一致するカラム名の部分のデータを更新する
    async update(id:number,note:{title?:string, content?:string}){    
        const {data} = await supabase
            .from("notes")
            .update(note)
            .eq("id",id)
            .select()
            .single();
        return data;
    },

    //RPC（Remote Procedure Call）とは:データベース側に作成したカスタム関数を、JavaScriptから呼び出す機能
    //delete_children_notes_recursively:データベース側で定義されたカスタム関数でありその関数の引数はnote_idにidを渡している
    //delete_children_notes_recursively":notesテーブルに関して、引数に渡されたidのnoteの子ノート（全子孫のノート）を再帰的に削除する
    async delete(id:number){
        const {error} = await supabase.rpc("delete_children_notes_recursively",{note_id:id});
        if (error !== null) throw new Error(error?.message);
        return true;
    }

}
